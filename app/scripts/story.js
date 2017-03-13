/*Global Variables*/
console.log('The newest');
var fontOptionsEle;
var fs;

var ajaxMethod;//for Recommends
var ajaxUrl;//for Recommends

var ajaxMethod_relativesData;//for Relatives
var ajaxUrl_relativesData;//for Relatives

var message = {};
var recommendLoaded = false;
var recommendInner = document.getElementById('story-recommend');
var recommendVersion;
// var thirdPartAPIUrl = 'http://120.27.47.77:8091/getRtCmd?siteId=5002&num=8&itemId=' + FTStoryid;
// var thirdPartFeedbackUrl = 'http://120.27.47.77:8091/rec/click?siteId=5002&itemId=' + FTStoryid;

var thirdPartAPIUrl = '//uluai.com.cn/rcmd/getRtCmd?siteId=5002&num=12&itemId=' + FTStoryid;//FTStoryid为'001068131'
var thirdPartFeedbackUrl = '//uluai.com.cn/rcmd/rec/click?siteId=5002&itemId=' + FTStoryid;

var thirdPartData = [];
var userId;
var recommendData = [];
var relativesData = [];


/*决定recommends的版本 */
/*
recommendVersion = GetCookie('ab001') || '';
if (recommendVersion === '') {
    recommendVersion = (Math.random() > 1)? '-001': '-002';
    SetCookie('ab001',recommendVersion,'','/');
}
*/
// MARK: 测试结束，全部使用002版本
recommendVersion = '-002';


/*决定文章内嵌文章的版本：是来自recommends还是relatives*/
var recommendVersionInstory = GetCookie('ab002') || '';
if (recommendVersionInstory === '') {
    recommendVersionInstory = (Math.random()<0.5)?'A':'B';
    SetCookie('ab002',recommendVersionInstory,'','/');
}
// MARK: 根据Cookie的A/B版本来决定变量的值
recommendVersionInstory = (recommendVersionInstory === 'A')?'from_recommends':'from_relatives';


/* Switch to local mode or remote mode.*/
if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
    ajaxMethod_relativesData = 'GET';
    ajaxUrl_relativesData = '/api/page/relatives.json';
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';//线上地址eg:http://www.ftchinese.com/eaclient/apijson.php
    ajaxMethod_relativesData = 'GET';
    ajaxUrl_relativesData = '/index.php/jsapi/related/'+FTStoryid;//线上地址为 eg: http://www.ftchinese.com/index.php/jsapi/related/001068131
}


/* The FTC API communication*/
var ftc_api = {
    server_url: '',//请求recommend.json的地址
    method: 'POST',
    call: function(message, success, failed) {
        var xhr = new XMLHttpRequest();

        try {
            if(this.server_url === '') {
                throw 'The server address is empty!';
            }

            xhr.open(this.method, encodeURI(this.server_url), true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if(xhr.readyState === 4){
                    if(xhr.status === 200){
                        if(typeof success === 'function') {
                            success(xhr.responseText);
                        }
                    } else {
                        if(typeof failed === 'function') {
                            failed(xhr.status);
                        }
                    }
                }
            };
            xhr.send(JSON.stringify(message));

        } catch (e) {
            // console.log(xhr.status);
            // console.log(e.message);
        }
    },
   
    jsonp: function(url) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = !0;
        s.src = url;
        var d = document.getElementsByTagName('script')[0];
        d.parentNode.insertBefore(s, d);
    },
    
};


// MARK: 测试结束，全部使用002版本
/*
if(recommendVersion === '-001'){
    message.head = {};
    message.head.transactiontype = '61008';
    message.head.source = 'web';
    message.body = {};
    message.body.ielement = {};
    message.body.ielement.storyid = FTStoryid;

    ga('send','event','Recommend Story API', 'Load' + recommendVersion, '', {'nonInteraction':1});
    ftc_api.call(message, getFtcRecommendSuccess, getFtcRecommendFailed);
} else {*/
    userId = GetCookie('USER_ID') || GetCookie('uniqueVisitorId');
    if (userId === null) {
        userId = guid();
        SetCookie('uniqueVisitorId',userId,'','/');
    }
    ftc_api.jsonp(thirdPartAPIUrl + '&callback=getRec&cki=' + userId + '&v=' + new Date().getTime());
    // MARK: The rest work jump to getRec
    ga('send','event','Recommend Story API', 'Load' + recommendVersion, '', {'nonInteraction':1});
    
//}

/*set font*/
fontOptionsEle = document.getElementById('font-options');

//fontOptionsDivs = fontOptionsEle.querySelectorAll('div');

//click to change font size and set cookie (fs)
//Dom Delegate doesn't work here on iOS
fontOptionsEle.onclick = function (e) {
    var currentClass = e.target.className || '';
    var selectedClass;
    var storyContainerClass = document.querySelector('.story-container').className;
    if (currentClass.indexOf('selected') <0) {
        if (fontOptionsEle.querySelector('.selected')) {
            selectedClass = fontOptionsEle.querySelector('.selected').className || '';
        } else {
            selectedClass = '';
        }
        selectedClass = selectedClass.replace(/ selected/g, '');
        if (fontOptionsEle.querySelector('.selected')) {
            fontOptionsEle.querySelector('.selected').className = selectedClass;
        }
        e.target.className = currentClass + ' selected';
        /* jshint ignore:start */
        SetCookie('fs',currentClass,'','/');
        /* jshint ignore:end */
        storyContainerClass = storyContainerClass.replace(/ (normal|bigger|biggest|smaller|smallest)/g,'');
        document.querySelector('.story-container').className = storyContainerClass + ' ' + currentClass;
        stickyBottomPrepare();
        stickyAdsPrepare();
        setResizeClass();
    }
};



/* jshint ignore:start */
fs = GetCookie('fs');
/* jshint ignore:end */
if (typeof fs === 'string' && fs !== null && fs !== '' && document.getElementById('font-options') && document.querySelector('.story-container')) {
    document.getElementById('font-options').querySelector('.' + fs.replace(/ /g, '.')).className = fs + ' selected';
    document.querySelector('.story-container').className = document.querySelector('.story-container').className + ' ' + fs;
    setResizeClass();
} else {
    document.getElementById('font-setting').querySelector('.normal').className = 'normal selected';
} 


/*exported getRec */
function getRec(data) {
    /* The jsonP callback function for thirdPartAPIUrl(即用jsonp请求优路科技的接口后的回调函数)
    * @param data: the response data of the thirdPartAPIUrl(即jsonp请求优路科技接口后的xhr.responseText) 
    */
    if(typeof data === 'object') {
        if(data.length > 0){
            var ids = '';
            var split = '';
            for(var i = 0; i < data.length; i++){
                var tmpKey = data[i].id;
                var tmpVal = data[i].parameter;
                ids += split + tmpKey;
                split = ',';
                thirdPartData[tmpKey] = tmpVal;
            }
            
            message.head = {};
            message.head.transactiontype = '10002';
            message.head.source = 'web';
            message.body = {};
            message.body.ielement = {};
            message.body.ielement.storyid = ids;
            message.body.ielement.withpic = 1;
            ftc_api.method = ajaxMethod;
            ftc_api.server_url = ajaxUrl;
            ftc_api.call(message, getThirdPartRecommendSuccess, getThirdPartRecommendFailed);//用message（含优路科技提供的推荐文章id)来请求我们的接口，请求成功后回调函数为getThredPartRecommendSuccess，请求失败后回调函数为getThirdPartRecommendFaild
            //MARK:jump to  getThirdPartRecommendSuccess
        } else {
            ga('send','event','Recommend Story API', 'No Data1' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
    }
}


function getThirdPartRecommendSuccess(data) {//
    /* 当用优路科技接口返回的推荐文章id 来请求我们的接口/eaclient/apijson.php获取推荐文章的具体信息成功后，调用该函数，即该函数是该Ajax请求的请求成功回调函数；
       在该函数中得到了存储推荐文章数据的全局变量recommendData；
       在该函数中发起了向/jsapi/related/storyId接口获取相关文章的Ajax请求。
     * @param data:
          线上：使用优路科技接口返回的推荐文章id请求我们的接口后的xhr.responseText；
          本地：即api/page/recommend.json
    */

    data = JSON.parse(data);
    if (data.body.oelement.errorcode === '0') {
        if (data.body.odatalist && data.body.odatalist.length > 0) {
            recommendData = data.body.odatalist;//填充全局变量recommendData
            ftc_api.method = ajaxMethod_relativesData;
            ftc_api.server_url = ajaxUrl_relativesData;
            ftc_api.call('',getRelativesSuccess,getRelativesFailed);
            // MARK:jump to  getRelativesSuccess
            ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
        } else {
            ga('send','event','Recommend Story API', 'No Data2' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}

function getThirdPartRecommendFailed(){
     /* 当用优路科技接口返回的推荐文章id 来请求我们的接口获取推荐文章的具体信息失败后，调用该函数
     */
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}


function getRelativesSuccess(data) {
    /* 当请求我们的接口/jsapi/related/001068131获取相关文章的具体信息成功后，调用该函数；
       在该函数中得到了存储相关文章数据的全局变量relativesData；
       在该函数中调用了数据渲染函数recommendAndRelativesPayLoad。
     * @param data:
          线上：请求我们的接口/jsapi/related/001068131获取相关文章后的xhr.responseText；
          本地：即api/page/relatives.json
    */

    data = JSON.parse(data);
  
    for(var i=0,len=data.length;i<len;i++) {
        var dataItem = {};
        
        console.log(data[i]);
        dataItem.cheadline = data[i].cheadline;
   
        if (data[i].story_pic) {
            dataItem.piclink = data[i].story_pic.smallbutton||data[i].story_pic.other;
        } else {
            dataItem.piclink = '';
        }
      
        //dataItem.piclink = data[i].story_pic.smallbutton||data[i].story_pic.other||data[i].piclink||'';
        dataItem.storyid = data[i].id;
        dataItem.lead = data[i].clongleadbody || data[i].cshortleadbody ||data[i].lead || '';
        dataItem.tag = data[i].tag||'';
        if(dataItem.cheadline && dataItem.piclink && dataItem.storyid) {
            relativesData.push(dataItem);//填充全局变量relativesData
        }
    }
    recommendAndRelativesPayLoad(recommendData,relativesData);
}

function getRelativesFailed(){
    /* 当请求我们的接口/jsapi/related/001068131获取相关文章的具体信息失败后，调用该函数
    */
    console.log('getRelativesFailed!');
}

/*
function recommendationPayload(datalist){
    console.log ('data list for recommend pay load is: ');
    console.log (datalist);

    var maxItem = 8;
    var itemCount = 0;
    var itemHTML = '';
    var eventAction = 'Click' + recommendVersion;
    var recommendDiv = document.getElementById('in-story-recommend');


    for (var i=0; i<datalist.length; i++) {
        var itemClass = 'XL3 L3 M6 S6 P12';
        var itemHeadline = datalist[i].cheadline;
        var itemImage = datalist[i].piclink;
        var itemId = datalist[i].storyid;
        var itemT = datalist[i].t;
        var itemLead = datalist[i].lead || datalist[i].clongleadbody || datalist[i].cshortleadbody || '';
        var itemTag = datalist[i].tag || '为您推荐';
        itemTag = itemTag.replace(/[,，].*$/g,'');
        if(itemT === undefined || itemT === null) {itemT = '';}
        var itemTop = '';
        var itemTopClass = 'PT';
        if (itemCount % 4 === 0) {
            itemTopClass += ' XLT LT';
        }
        if (itemCount % 2 === 0) {
            itemTopClass += ' MT ST';
        }
        if (itemTopClass !== '' && itemCount >0) {
            itemTop = '<div class="' + itemTopClass + '"></div>';
        }

        var link = '/story/'+itemId+'?tcode=smartrecommend&ulu-rcmd=' + thirdPartData[itemId];
        var oneItem = itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead"><div class="item-inner"><h2 class="item-headline"><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'">'+itemHeadline+'</a></h2><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a><div class="item-bottom"></div></div></div>';
        var oneImage = '';



        // insert the first item into the story body
        if (i === 0 && recommendDiv) {
            link += '&position=instory';
            oneItem = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'" class="headline">'+itemHeadline+'</a><div class="lead">'+itemLead+'</div>';
            oneImage = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="recommend-image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a>';
            recommendDiv.innerHTML = '<div class="recommend-header">' + itemTag + '</div><div class="recommend-content">' + oneItem + '</div>' + oneImage;
            recommendDiv.className = 'leftPic in-story-recommend';
        } else if (itemCount<maxItem && itemImage && itemImage !== '') {
            itemHTML += oneItem;
            itemCount += 1;
        }
    }

    recommendInner.innerHTML = itemHTML;
    bindFeedbackEvent();
    document.getElementById('story-recommend-container').style.display = 'block';
    loadImages();
    try {
        stickyBottomPrepare();
    } catch(ignore) {

    }
    recommendLoaded = true;
}
*/


function recommendAndRelativesPayLoad(recommenddata,relativesdata){
    /* 成功获取到推荐文章数据和相关文章数据后，渲染story文中的推荐文章div及文后的猜你喜欢div
     * @param recommenddata:即获取的推荐文章数据，调用时实参为全局变量recommendData
     * @param relativesdata:即获取的相关文章数据，调用时实参为全局变量relativesData
    */

    var maxItem = 8;//规定下方推荐文章区域显示多少个
    var itemCount = 0;//记录某item位于下方推荐文章区域的第几个
    var itemHTML = '';//下方推荐文章区域的innerHTML
    var eventAction = 'Click' + recommendVersion + recommendVersionInstory;
    var recommendDiv = document.getElementById('in-story-recommend');//文章内部推荐的那篇文章预期的元素
    
    for (var i=0; i<recommenddata.length; i++) {
        var itemClass = 'XL3 L3 M6 S6 P12';
        var itemHeadline,itemImage,itemId,itemT,itemLead,itemTag,link,oneItem,oneImage;
        var itemBottomIndex = 0;

        var itemTop = '';
        var itemTopClass = 'PT';
      
        if (itemCount % 4 === 0) {
            itemTopClass += ' XLT LT';
        }
        if (itemCount % 2 === 0) {
            itemTopClass += ' MT ST';
        }
        if (itemTopClass !== '' && itemCount >0) {
            itemTop = '<div class="' + itemTopClass + '"></div>';
        }

        // insert the first item into the story body
        if (i === 0 && recommendDiv) {
            //处理第一个数据，这时必须满足recommendDiv存在
            if( recommendVersionInstory === 'from_relatives'){
                itemHeadline = relativesdata[0].cheadline;
                itemImage = relativesdata[0].piclink;
                itemId = relativesdata[0].storyid;
                itemT = relativesdata[0].t;//为了保持和recommenddata一致，relativesdata也没有添加t
                itemLead = relativesdata[0].lead;
                itemTag = relativesdata[0].tag || '为您推荐';
                itemTag = itemTag.replace(/[,，].*$/g,'');
                if(itemT === undefined || itemT === null) {itemT = '';}
                link = '/story/'+itemId+'?tcode=smartrecommend&';//这个link里面需要加上'tcode=smartrecommend'吗？
            } else if( recommendVersionInstory === 'from_recommends'){
                itemHeadline = recommenddata[0].cheadline;
                itemImage = recommenddata[0].piclink;
                itemId = recommenddata[0].storyid;
                itemT = recommenddata[0].t;//这个recommenddata里面没有t
                itemLead = recommenddata[0].lead || recommenddata[0].clongleadbody || recommenddata[0].cshortleadbody || '';
                itemTag = recommenddata[0].tag || '为您推荐';
                itemTag = itemTag.replace(/[,，].*$/g,'');
                if(itemT === undefined || itemT === null) {itemT = '';}
                link = '/story/'+itemId+'?tcode=smartrecommend&ulu-rcmd=' + thirdPartData[itemId];
            }
            link += '&position=instory';
            oneItem = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'" class="headline">'+itemHeadline+'</a><div class="lead">'+itemLead+'</div>';
            oneImage = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="recommend-image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a>';
            recommendDiv.innerHTML = '<div class="recommend-header">' + itemTag + '</div><div class="recommend-content">' + oneItem + '</div>' + oneImage;
            recommendDiv.className = 'leftPic in-story-recommend';
           
        } else if (itemCount<maxItem ) {
            if(recommendDiv === null) {
                //如果recommendDiv不存在，那i===0的时候和i>0的时候都会进入此分支
                //此时既然没有recommendDiv，那也不用考虑from_relatives还是from_recommends了
                itemBottomIndex = i;
            } else if(i>0) {
                //如果recommendDiv存在，进入此分支
                //为了保险起见加上i>0的条件，其实只有i>0才会进入此分支
                if( recommendVersionInstory === 'from_relatives') {
                    itemBottomIndex = i-1;
                } else if(recommendVersionInstory === 'from_recommends') {
                    itemBottomIndex = i;
                }
            }
            
            //底部文章区域
            itemHeadline = recommenddata[itemBottomIndex].cheadline;
            itemImage = recommenddata[itemBottomIndex].piclink;
            itemId = recommenddata[itemBottomIndex].storyid;
            itemT = recommenddata[itemBottomIndex].t;
            itemLead = recommenddata[itemBottomIndex].lead || recommenddata[itemBottomIndex].clongleadbody || recommenddata[itemBottomIndex].cshortleadbody || '';
            itemTag = recommenddata[itemBottomIndex].tag || '为您推荐';
            itemTag = itemTag.replace(/[,，].*$/g,'');
            if(itemT === undefined || itemT === null) {itemT = '';}
            link = '/story/'+itemId+'?tcode=smartrecommend&ulu-rcmd=' + thirdPartData[itemId];
            oneItem = itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead"><div class="item-inner"><h2 class="item-headline"><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'">'+itemHeadline+'</a></h2><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a><div class="item-bottom"></div></div></div>';
            if(itemImage && itemImage !== ''){
                itemHTML += oneItem;
                itemCount += 1;
            }
        }
    }
    recommendInner.innerHTML = itemHTML;
    bindFeedbackEvent();
    document.getElementById('story-recommend-container').style.display = 'block';
    loadImages();//from main.js
    try {
        stickyBottomPrepare();//from main.js
    } catch(ignore) {

    }
    recommendLoaded = true;
}



// MARK:The function is for 001Version,测试已结束
/* Get ftc recommend stories */
/*
function getFtcRecommendSuccess(data) {
    data = JSON.parse(data);
    if (data.body.oelement.errorcode === '0') {
        if (data.body.odatalist && data.body.odatalist.length > 0) {
            recommendationPayload(data.body.odatalist);
            ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
        } else {
            ga('send','event','Recommend Story API', 'No Data' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}
*/

// MARK:The function is for 001Version,测试已结束
/*
function getFtcRecommendFailed(){
    //console.log('Request failed!');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}
*/


function bindFeedbackEvent(){
    var delegate = new Delegate(document.getElementById('story-recommend'));
    if(recommendVersion === '-002') {
        delegate.on('click', 'a', function(event, obj){
            try {
                var link = obj.getAttribute('href');
                var recStoryId = link.replace(/^\/story\/([0-9]+)\?.*$/g,'$1');
                var recParam = link.replace(/^.*ulu-rcmd=([^&]+).*$/g,'$1');
                ftc_api.jsonp(thirdPartFeedbackUrl + '&recId=' + recStoryId + '&cki=' + userId + '&parameter=' + recParam);
            } catch (e) {
                //console.log(e);
            }
        });
    }
}


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}