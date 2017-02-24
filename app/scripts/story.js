/*exported recommendVersion*/
var fontOptionsEle;
var fs;

/*待做：这四个变量待整合成一个对象*/
var ajaxMethod;//for Recommends
var ajaxUrl;//for Recommends
var ajaxMethod_relativesIdData;
var ajaxUrl_relativesIdData;
var ajaxMethod_relativesData;
var ajaxUrl_relativesData;

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
var recommendData = {};
var relativesData = {};
/*决定recommends的版本 */
recommendVersion = GetCookie('ab001') || '';
console.log(recommendVersion);
if (recommendVersion === '') {
    recommendVersion = (Math.random() > 1)? '-001': '-002';
    SetCookie('ab001',recommendVersion,'','/');
}
recommendVersion = '-002';
console.log(recommendVersion);
/*决定文章内嵌文章的版本：是来自recommends还是relatives*/
var recommendVersionInstory = (Math.random()<0.5)?'from_recommends':'from_relatives';
console.log('recommendVersionInstory:'+recommendVersionInstory);
trackGaOfRecommandInstory();
/**
 * Switch to local mode or remote mode.
 */
if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
    ajaxMethod_relativesIdData = 'GET';
    ajaxUrl_relativesIdData = '/api/page/relativesIdData.json';
    ajaxMethod_relativesData = 'GET';
    ajaxUrl_relativesData = '/api/page/relatives.json';
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';//线上地址eg:http://www.ftchinese.com/eaclient/apijson.php
    ajaxMethod_relativesIdData = 'POST';
    ajaxUrl_relativesIdData = '/jsapi/related/'+FTStoryid;//线上地址为 eg: http://www.ftchinese.com/index.php/jsapi/related/001068131
    ajaxMethod_relativesData = 'POST';
    ajaxUrl_relativesData = '/eaclient/apijson.php';
}

/**
 * The FTC API communication
 */
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
/*
ftc_api.method = ajaxMethod;
ftc_api.server_url = ajaxUrl;
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


/**
 * Global recommendation payload
 */

function recommendationPayload(datalist){//原datalist是recommendData
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

function recommendAndRelativesPayLoad(recommenddata,relativesdata){
    console.log('recommenddata:'+recommenddata);
    console.log('relativesdata:'+relativesdata);
    var maxItem = 8;//规定下方推荐文章区域显示多少个
    var itemCount = 0;//记录某item位于下方推荐文章区域的第几个
    var itemHTML = '';//下方推荐文章区域的innerHTML
    var eventAction = 'Click' + recommendVersion;
    var recommendDiv = document.getElementById('in-story-recommend');//文章内部推荐的那篇文章预期的元素
    
    /*右侧相关文章区域*/
    var relativeStories = document.getElementById('relativeStories');//5个条目:下面每个item形如：<li class="mp1"><a target="_blank" href="/story/001065934">香港蝉联“全球房价最难负担城市”</a></li>
    var itemCount_relative = 0;
    var itemHTML_relative='';
    var maxItem_relative = 5;


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

        /*右侧相关文章区域 */
        var link_relative,itemHeadline_relative,oneItem_relative,liclass;//"相关文章区域"
        var itemRelativeIndex = 0;


        // insert the first item into the story body
        if (i === 0 && recommendDiv) {
            if( recommendVersionInstory === 'from_relatives'){
                itemHeadline = relativesdata[0].cheadline;
                itemImage = relativesdata[0].piclink;
                itemId = relativesdata[0].storyid;
                itemT = relativesdata[0].t;
                itemLead = relativesdata[0].lead || relativesdata[0].clongleadbody || relativesdata[0].cshortleadbody || '';
                itemTag = relativesdata[0].tag || '为您推荐';
                itemTag = itemTag.replace(/[,，].*$/g,'');
                if(itemT === undefined || itemT === null) {itemT = '';}
                link = '/story/'+itemId+'?tcode=smartrecommend&';
            } else if( recommendVersionInstory === 'from_recommends'){
                itemHeadline = recommenddata[0].cheadline;
                itemImage = recommenddata[0].piclink;
                itemId = recommenddata[0].storyid;
                itemT = recommenddata[0].t;
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
        } else if (itemCount<maxItem && itemImage && itemImage !== '') {
            if( recommendVersionInstory === 'from_relatives'){
                itemBottomIndex = i-1;
                itemRelativeIndex = i;
            } else if(recommendVersionInstory === 'from_recommends'){
                itemBottomIndex = i;
                itemRelativeIndex = i-1;
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

            itemHTML += oneItem;
            itemCount += 1;

            //右侧相关文章区域
            if(itemCount_relative<maxItem_relative){
                link_relative = '/story/'+relativesdata[itemRelativeIndex].storyid;
                itemHeadline_relative = relativesdata[itemRelativeIndex].cheadline;
                liclass = 'mp'+(itemRelativeIndex+1);
                oneItem_relative = '<li class="'+liclass+'"><a target="_blank" href="'+link_relative+'">'+itemHeadline_relative+'</a></li>';
                itemHTML_relative += oneItem_relative;
                itemCount_relative += 1;
            }
          
          
        }
    }

    recommendInner.innerHTML = itemHTML;
    relativeStories.innerHTML = itemHTML_relative;
    bindFeedbackEvent();
    document.getElementById('story-recommend-container').style.display = 'block';
    loadImages();
    try {
        stickyBottomPrepare();
    } catch(ignore) {

    }
    recommendLoaded = true;

}

function trackGaOfRecommandInstory(){// ga for ABtestForRecommandInstory
    var recommendDiv = document.getElementById('in-story-recommend');
    recommendDiv.addEventListener('click',function(){
        ga('send','event','ABtestForRecommandInstory','click',recommendVersionInstory);
    },false);
}
/**
 * Get ftc recommend stories
 */

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

function getFtcRecommendFailed(){
    //console.log('Request failed!');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}

/**
 * Playload thirdpart recommend stories
 */
function getThirdPartRecommendSuccess(data) {//此处data为recommend.json
    data = JSON.parse(data);
    if (data.body.oelement.errorcode === '0') {
        if (data.body.odatalist && data.body.odatalist.length > 0) {
            recommendData = data.body.odatalist;
            console.log(recommendData);
            ftc_api.method = ajaxMethod_relativesIdData;
            ftc_api.server_url = ajaxUrl_relativesIdData;
            console.log('ftc_api.server_url:'+ftc_api.server_url);
            ftc_api.call('',getRelativesIdDataSuccess,getRelativesIdDataFailed);
            //getrecommendationPayload(data.body.odatalist);
            ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
        } else {
            ga('send','event','Recommend Story API', 'No Data2' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}

function getThirdPartRecommendFailed(){
    //console.log('Request failed!');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}

function getRelativesIdDataSuccess(data) {//此处data为relativesIdData.json
    console.log('excute getRelativesIdDataSuccess');
    data = JSON.parse(data);
    if (data.length>0) {
            var messageRelativesIdData = {
                head:{
                    transactiontype:'10002',
                    source:'web'
                },
                body:{
                    ielement:{
                        storyid:'',
                        withpic:1
                    }
                }
            };
            var storyidStr = '';
            for(var i=0,len=data.length;i<len;i++){
                storyidStr += data[i].id;
            }

            messageRelativesIdData.body.ielement.storyid=storyidStr;//形如"001065443,001050880,001065868,001070945,001066342,001071409,001049318"(7个id)
            console.log('messageRelativesIdData:'+JSON.stringify(messageRelativesIdData));
            ftc_api.method= ajaxMethod_relativesData;
            ftc_api.server_url = ajaxUrl_relativesData;
            ftc_api.call(messageRelativesIdData,getRelativesSuccess,getRelativesFailed);
            //ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
    } else {
        //ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}
function getRelativesIdDataFailed(){//待做：函数内部待细写
    //console.log('Request failed!');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}
function getRelativesSuccess(data) {//此处data为relatives.json
    data = JSON.parse(data);
    if (data.body.oelement.errorcode === '0') {
        if (data.body.odatalist && data.body.odatalist.length > 0) {
            relativesData = data.body.odatalist;
            recommendAndRelativesPayLoad(recommendData,relativesData);
            ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}
function getRelativesFailed(){//待做：函数内部待细写
    //console.log('Request failed!');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}
/* jshint unused: true */
/*exported getRec */
function getRec(data) {
    console.log('excute:getRec');
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
            console.log('ftc_api.server_url:'+ftc_api.server_url);
            console.log("message:"+JSON.stringify(message));
            ftc_api.call(message, getThirdPartRecommendSuccess, getThirdPartRecommendFailed);
        } else {
            ga('send','event','Recommend Story API', 'No Data1' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
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

// A & B Test
if(recommendVersion === '-001'){
    console.log('excute:-001');
    message.head = {};
    message.head.transactiontype = '61008';
    message.head.source = 'web';
    message.body = {};
    message.body.ielement = {};
    message.body.ielement.storyid = FTStoryid;

    ga('send','event','Recommend Story API', 'Load' + recommendVersion, '', {'nonInteraction':1});
    ftc_api.call(message, getFtcRecommendSuccess, getFtcRecommendFailed);
} else {
    console.log('excute:-002');
    userId = GetCookie('USER_ID') || GetCookie('uniqueVisitorId');
    if (userId === null) {
        userId = guid();
        SetCookie('uniqueVisitorId',userId,'','/');
    }
    ftc_api.jsonp(thirdPartAPIUrl + '&callback=getRec&cki=' + userId + '&v=' + new Date().getTime());
    ga('send','event','Recommend Story API', 'Load' + recommendVersion, '', {'nonInteraction':1});
    // The rest work jump to getRec
}

//set font
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