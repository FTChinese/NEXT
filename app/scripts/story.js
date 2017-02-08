/*exported recommendVersion*/

var fontOptionsEle;
var fs;
var ajaxMethod;
var ajaxUrl;
var message = {};
var recommendLoaded = false;
var recommendInner = document.getElementById('story-recommend');
var recommendVersion;
// var thirdPartAPIUrl = 'http://120.27.47.77:8091/getRtCmd?siteId=5002&num=8&itemId=' + FTStoryid;
// var thirdPartFeedbackUrl = 'http://120.27.47.77:8091/rec/click?siteId=5002&itemId=' + FTStoryid;

var thirdPartAPIUrl = '//uluai.com.cn/rcmd/getRtCmd?siteId=5002&num=12&itemId=' + FTStoryid;
var thirdPartFeedbackUrl = '//uluai.com.cn/rcmd/rec/click?siteId=5002&itemId=' + FTStoryid;

var thirdPartData = [];
var userId;


recommendVersion = GetCookie('ab001') || '';
if (recommendVersion === '') {
    recommendVersion = (Math.random() > 0.5)? '-001': '-002';
    SetCookie('ab001',recommendVersion,'','/');
}

recommendVersion = '-002';

/**
 * Switch to local mode or remote mode.
 */
if (/127\.0|localhost|192\.168/.test(window.location.href)) {
	ajaxMethod = 'GET';
	ajaxUrl = '/api/page/recommend.json';
} else {
	ajaxMethod = 'POST';
	ajaxUrl = '/eaclient/apijson.php';
}

/**
 * The FTC API communication
 */
var ftc_api = {
    server_url: '',
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
    }
};

ftc_api.method = ajaxMethod;
ftc_api.server_url = ajaxUrl;

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
function recommendationPayload(datalist){
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
        var itemLead = datalist[i].lead || '';
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
function getThirdPartRecommendSuccess(data) {
    data = JSON.parse(data);
    if (data.body.oelement.errorcode === '0') {
        if (data.body.odatalist && data.body.odatalist.length > 0) {
            recommendationPayload(data.body.odatalist);
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

/* jshint unused: true */
/*exported getRec */
function getRec(data) {

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
    message.head = {};
    message.head.transactiontype = '61008';
    message.head.source = 'web';
    message.body = {};
    message.body.ielement = {};
    message.body.ielement.storyid = FTStoryid;

    ga('send','event','Recommend Story API', 'Load' + recommendVersion, '', {'nonInteraction':1});
    ftc_api.call(message, getFtcRecommendSuccess, getFtcRecommendFailed);
} else {
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