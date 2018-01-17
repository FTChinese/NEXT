
/*Global Variables*/

var fontOptionsEle;
var fs;

var ajaxMethod;//for Recommends
var ajaxUrl;//for Recommends
/*
var ajaxMethod_relativesData;//for Relatives
var ajaxUrl_relativesData;//for Relatives
*/
var message = {};
var recommendLoaded = false;
var recommendInner = document.getElementById('story-recommend');
var recommendVersion;
var uluAdPosition = getRandomInt(1, 5);//表征底部为您推荐的第几个位置用于展示uluAd，第1个位置记为1 ,此时随机为1,2,3,4
//var uluAdPosition = 300;
// var thirdPartAPIUrl = 'http://120.27.47.77:8091/getRtCmd?siteId=5002&num=8&itemId=' + FTStoryid;
// var thirdPartFeedbackUrl = 'http://120.27.47.77:8091/rec/click?siteId=5002&itemId=' + FTStoryid;


//var ftItemId = window.FTStoryid || window.interactiveId || '';//Defined in main.js as Global Variables
var thirdPartAPIUrl = '//uluai.com.cn/rcmd/getRtCmd?siteId=5002&num=12&itemId=' + ftItemId + '&position='+uluAdPosition;//FTStoryid为'001068131'
var thirdPartFeedbackUrl = '//uluai.com.cn/rcmd/rec/click?siteId=5002&itemId=' + ftItemId + '&position='+uluAdPosition;

var thirdPartData = [];
var userId;
var recommendData =[];//存放推荐数据
var adData = {};//存放广告数据

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
// MARK: 测试结束，全部使用'from_recommends'版本,已删除相关多余代码，含对recommendVersionInstory两个版本进行测试的代码见本地backup/storyInNext/story1.js

/* Switch to local mode or remote mode.*/
if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
    /*
    ajaxMethod_relativesData = 'GET';
    ajaxUrl_relativesData = '/api/page/relatives.json';
    */
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';//线上地址eg:http://www.ftchinese.com/eaclient/apijson.php
    /*
    ajaxMethod_relativesData = 'GET';
    ajaxUrl_relativesData = '/index.php/jsapi/related/'+FTStoryid;//线上地址为 eg: http://www.ftchinese.com/index.php/jsapi/related/001068131
    */
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

function changeFontSize() {
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
}





function checkFontSize(forceFontSize) {
    fs = forceFontSize || GetCookie('fs');
    SetCookie(fs);
    if (typeof fs === 'string' && fs !== null && fs !== '' && document.getElementById('font-options') && document.querySelector('.story-container')) {
        document.getElementById('font-options').querySelector('.' + fs.replace(/ /g, '.')).className = fs + ' selected';
        var fontClasses = ['smallest', 'smaller', 'normal', 'bigger', 'biggest'];
        var storyClasses = document.querySelector('.story-container').className;
        for (var i=0; i<fontClasses.length; i++) {
            storyClasses = storyClasses.replace(' ' + fontClasses[i], '');
        }
        document.querySelector('.story-container').className = storyClasses + ' ' + fs;
        setResizeClass();
    } else {
        document.getElementById('font-setting').querySelector('.normal').className = 'normal selected';
    }
}


/*exported getRec */
function getRec(data) {
    /* The jsonP callback function for thirdPartAPIUrl(即用jsonp请求优路科技的接口后的回调函数)
    * @param data: the response data of the thirdPartAPIUrl(即jsonp请求优路科技接口后的xhr.responseText) 
    */
    // console.log('ulu'+JSON.stringify(data));
    /*
    * 数组data的其中一个item（文章）形如：
    {
        "parameter":"1_02ap_ap_0_e7bd95ee3f644f5488675bf509f6f091","id":"001070626",
        "pic":"",
        "title":"万科取消与深圳地铁集团的交易",
        "url":""
    }
    * item(广告)形如：
    {
        "parameter":"1_02ap_dnidea_4_e7bd95ee3f644f5488675bf509f6f091",
        "id":"001072960",//广告就不要检测这个字段
        "pic":"",//广告图片链接
        "title":"",//广告图片标题
        "isAd":1,//表明是广告
        "url":"" //广告url链接
    }
    */

    if(typeof data === 'object' && data.length > 0) {
        var ids = '';
        var split = '';
        for(var i = 0, len=data.length; i < len; i++){
            if(data[i]) {
                if(data[i].isAd===1) { //把广告数据拎出来,更新全局变量adData
                    adData = data[i];
                    ga('send','event','Story Recommend With Ad','Got Data', ftItemId, {'nonInteraction':1});//MARK：如果获取的数据里面有广告，则进行一次ga监控；正常不投放的情况下应该数据中间没有广告
                } else { //把文章id拎出来，得到ids
                    var tmpKey = data[i].id;
                    var tmpVal = data[i].parameter;
                    if(tmpKey&&tmpVal) {
                        ids += split + tmpKey;
                        split = ',';
                        thirdPartData[tmpKey] = tmpVal;
                    }
                }
               
            }
        }
        if(ids && ids.length>0) {
            message.head = {};
            message.head.transactiontype = '10002';
            message.head.source = 'web';
            message.body = {};
            message.body.ielement = {};
            message.body.ielement.storyid = ids;
            message.body.ielement.withpic = 1;
            ftc_api.method = ajaxMethod;
            ftc_api.server_url = ajaxUrl;

            ftc_api.call(message, getThirdPartRecommendSuccess, getThirdPartRecommendFailed);//用message（含优路科技提供的推荐文章id)来请求我们的接口，请求成功后回调函数为getThirdPartRecommendSuccess，请求失败后回调函数为getThirdPartRecommendFaild
            //MARK:jump to  getThirdPartRecommendSuccess  
        } else {
             //console.log(' Data from jsonp is wrong');
             ga('send','event','Recommend Story API', 'No Data1' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
        //console.log('Get data from jsonp failed ');
        ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
    }
}


function getThirdPartRecommendSuccess(data) {
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
            recommendData = data.body.odatalist;
            recommendPayLoad(recommendData, adData);
            ga('send','event','Recommend Story API', 'Success' + recommendVersion, '', {'nonInteraction':1});
        } else {
            ga('send','event','Recommend Story API', 'No Data2' + recommendVersion, '', {'nonInteraction':1});
        }
    } else {
    	//console.log('no odatalist');
        ga('send','event','Recommend Story API', 'Parse Fail' + recommendVersion, data.body.oelement.errorcode, {'nonInteraction':1});
    }
}

function getThirdPartRecommendFailed(){
     /* 当用优路科技接口返回的推荐文章id 来请求我们的接口获取推荐文章的具体信息失败后，调用该函数
     */
    console.log('getThirdPartRecommendFaild');
    ga('send','event','Recommend Story API', 'Request Fail' + recommendVersion, '', {'nonInteraction':1});
}


function recommendPayLoad(recommenddata, addata){

    /* 成功获取到推荐文章数据后，渲染story文中的推荐文章div及文后的猜你喜欢div
     * @param recommenddata:TYPE Array,即获取的推荐文章数据
     * @param addata:TYPE Object, 即获取的ulu合作广告数据
    */

    //console.log(recommenddata);
    //console.log(addata);


    if (window.suppressRecommendation === true) {
        return;
    }
    
    var maxItem = 8;//规定下方推荐文章区域显示多少个
    var itemCount = 0;//记录某item位于下方推荐文章区域的第几个
    var itemHTML = '';//下方推荐文章区域的innerHTML
    var eventAction = 'Click' + recommendVersion;
    var recommendDiv = document.getElementById('in-story-recommend');//文章内部推荐的那篇文章预期的元素

 
    //MARK:一块文章item的信息定义
    var itemHeadline,itemImage,itemId,itemT,itemLead,itemTag,link,oneItem,oneImage;

    var insertedInstory = 0;//表征是否已经成功插入了文章内容中间的推荐块
    var tryToInsertAd = 0;//表征还未尝试插入广告，每次都会尝试插入一次，插入完成或因广告信息缺失没有插入的话都更新为1
    var setUluAdPosition = 0;//表征是否已判断底部推荐位广告的位置，只判断1次，判断后就置为1


    for (var i=0; i<recommenddata.length; i++) {
        var itemClass = 'XL3 L3 M6 S6 P12';
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

        //MARK:一块文章item的信息赋值
        itemHeadline = recommenddata[i].cheadline;
        itemImage = recommenddata[i].piclink;
        itemId = recommenddata[i].storyid;
        itemT = recommenddata[i].t;//这个recommenddata里面没有t
        itemLead = recommenddata[i].lead || recommenddata[i].clongleadbody ||recommenddata[i].cshortleadbody || '';
        itemTag = recommenddata[i].tag || '为您推荐';
        itemTag = itemTag.replace(/[,，].*$/g,'');
        if(itemT === undefined || itemT === null) {itemT = '';}
        link = '/story/'+itemId+'?tcode=smartrecommend&ulu-rcmd=' + thirdPartData[itemId];

        
        // MARK:insert the first item into the story body

        if (i === 0 && recommendDiv) {
            //MARK:处理第一个数据，这时必须满足recommendDiv存在
            link += '&position=instory';

            oneItem = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'" class="headline">'+itemHeadline+'</a><div class="lead">'+itemLead+'</div>';
            oneImage = '<a data-ec="In Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="recommend-image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a>';
            recommendDiv.innerHTML = '<div class="recommend-header">' + itemTag + '</div><div class="recommend-content">' + oneItem + '</div>' + oneImage;
            recommendDiv.className = 'leftPic in-story-recommend';
            insertedInstory = 1;//s

           
        } else if (itemCount<maxItem ) {
            //MARK:底部文章区
            // MARK: - Use the number i to decide the position of the ad
        
            if(insertedInstory === 0 && addata.isAd ===1 && setUluAdPosition === 0) {
                // MARK:如果文章中没有插入成推荐文章，那么ulu合作广告位就向前推一个位置。
                uluAdPosition -= 1;
                setUluAdPosition = 1;
                console.log('a');
            }
            if(tryToInsertAd === 0 && addata.isAd ===1 && i === uluAdPosition) {
                ///MARK:第4个位置放来自优路科技的广告（如果有的话）
                console.log('b');
                console.log('uluAdPosition:'+uluAdPosition);
                var adHeadline,adImage,adLink,adItem;
                adHeadline = addata.title;
                adImage = addata.pic;
                adLink = addata.url;
                adItem = itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead is-ad" ><div class="item-inner"><h2 class="item-headline"><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el= "uluAd"  target="_blank" href="'+adLink+'">'+adHeadline+'</a></h2><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el= "uluAd"  class="image" target="_blank" href="'+adLink+'"><figure class="loading" data-url="'+adImage+'"></figure></a><div class="item-bottom"></div></div></div>';

                if(adImage && adImage !== '') {
                    console.log('c');
                    itemHTML += adItem;
                    itemCount++;
                    gThereIsUluAd = 1;
                }
                tryToInsertAd = 1;
                i--;//尝试插入广告的行为势必会经历一次循环，该循环等于recommenddata[1]还没有用，就i--下次还是用recommenddata[1]
            } else if(recommenddata[i]) {
                oneItem = itemTop + '<div class="item-container ' + itemClass + ' has-image no-lead"><div class="item-inner"><h2 class="item-headline"><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" target="_blank" href="'+link+'">'+itemHeadline+'</a></h2><a data-ec="Story Recommend" data-ea="'+eventAction+'" data-el="'+itemT+'/story/'+itemId+'" class="image" target="_blank" href="'+link+'"><figure class="loading" data-url="'+itemImage+'"></figure></a><div class="item-bottom"></div></div></div>';
                if(itemImage && itemImage !== ''){
                    itemHTML += oneItem;
                    itemCount += 1;
                }
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
    if(recommendLoaded && document.getElementById('in-story-recommend')) {
        gCanReplaceInstoryWithAd = true;
    }

    





    // MARK: Test for showTextImageForAd in ad-third-party.js
    
    // var sourceInfo = {
    //    adTag: '',
    //    adHeadline: '',
    //    adLink: 'http://ad.doubleclick.net/ddm/trackclk/N5840.139612.1071020274421/B20208468.203238953;dc_trk_aid=403040961;dc_trk_cid=91843725',
    //    adLead: '',
    //    adImg: '',
    //    adType: ''
    //  };
    // setTimeout(function(){
    //     showTextImageForAd(sourceInfo);
    // }, 5000);
}


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

// MARK:Getting a random integer between two values.The maximum is exclusive and the minimum is inclusive

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}


checkFontSize();
changeFontSize();