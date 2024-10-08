/* exported isUrlLocal, gIsLandingPage, obj, bannerBG, writeAd, slotStr, checkB, sendEvent,clearEvents, writeAdNew,deviceCategory, deviceType,adChannelId*/
// MARK: - Sponsored Channel Ids

var gIsLandingPage = false;

//MARK:获取当前URL的search参数键值对处理成的对象
function getSearchVars() {
  var searchVars = {};
  if (window.location.search.length > 1) {
    var searchStr = window.parent.location.search;
    for (var oneKeyValueArr, index = 0, searchStrArr = searchStr.substr(1).split('&'); index < searchStrArr.length; index++) {
      oneKeyValueArr = searchStrArr[index].split('=');
      searchVars[decodeURIComponent(oneKeyValueArr[0])] = oneKeyValueArr.length > 1 ? decodeURIComponent(oneKeyValueArr[1]) : '';
    }
  }
  return searchVars;
}


var uaString;
var w1;
var w2;
var isWeChat;
function initAds() {
  uaString = navigator.userAgent || navigator.vendor || '';
  isWeChat = /micromessenger/i.test(uaString);
  // First get the browser width
  // On an mobile phone, this may return a larger value if
  // 1.  viewport meta is not added
  // or 2. Dom is not properly rendered
  w1 = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  // However, screen.availWidth usually gets the correct value
  // Which is very useful to determine a mobile phone
  w2 = window.screen.availWidth || 0;
  if (w2>0 && w1>w2) {
    w1 = w2;
  }
}
window.gaLoaded = false;

var eventsToSend = [];

function sendEvent(ec, ea, el, ei) {
  try {
    gtag('event', ea, {'event_label': el, 'event_category': ec, 'value': ei});
  } catch (ignore) {
    // push this to an array for GA to send after loading JS
    eventsToSend.push({
      'ec': ec,
      'ea': ea,
      'el': el,
      'ei': ei
    });
  }
}

function clearEvents() {
  var l = eventsToSend.length;
  for (var i=0; i<l; i++) {
    gtag('event', eventsToSend[i].ea, {'event_label': eventsToSend[i].el, 'event_category': eventsToSend[i].ec, 'value': eventsToSend[i].ei});
  }
  eventsToSend = [];
  window.gaLoaded = true;
}

var isBlocked = 'unknown';

// MARK: - test if ad blocker is turned on
function checkB() {
  var test = document.createElement('div');
  test.innerHTML = '&nbsp;';
  test.className = 'adsbox';
  document.body.appendChild(test);
  window.setTimeout(function() {
    if (test.offsetHeight === 0) {
      //document.body.classList.add('adblock');
      isBlocked = 'yes';
      showPayWall();
    } else {
      isBlocked = 'no';
    }
    test.remove();
  }, 100);
}

// MARK: Show Pay Wall in story body when ad blocker is detected. 
function showPayWall() {
    // MARK: If the user is not logged in, no need to do network check. 
    if (GetCookie('USER_ID') === null) {
        displayPayWallInBody();
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/index.php/jsapi/paywall');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userInfo = JSON.parse(xhr.responseText);
            if (userInfo.paywall === 1) {
              displayPayWallInBody();
            }
        }
    };
    xhr.send();
}

function displayPayWallInBody() {
      var storyBody = document.getElementById('story-body-container');
      if (storyBody) {
        var storyId = window.FTStoryid || '';
        window.gSubscriptionEventLabel = 'AdBlocker/story/' + storyId; 
        var loginHTML = '如果已经是会员，请<a href="http://user.ftchinese.com/login" class="o-client-id-link">点击这里</a>登录';
        var subscribeLink = 'https://www.ftchinese.com/index.php/ft/subscription?el=' + window.gSubscriptionEventLabel;
        var reason = '<p>亲爱的读者，我们注意到您使用了广告拦截。我们完全理解您这样做的原因！</p><p>但是维持FT中文网的正常运转是需要成本的，如果您喜欢FT中文网，可以：</p><p>1. <a class="highlight o-client-id-link" href="' + subscribeLink + '">成为付费会员</a>。这样您可以继续使用广告拦截，同时可以跨平台阅读或收听FT中文网的独家内容、英文原文、以及音频。</p><p>或</p><p>2. 将FT中文网加到您的广告拦截的白名单中，以继续浏览FT中文网的免费内容。</p><p>根据我们了解的信息，国产的浏览器大部分都内置了这一功能，我们建议您更换一个纯净浏览器（例如：Firefox、Chrome等）来打开我们的网页，这样您就可以正常浏览我们的免费文章。感谢您的支持。</p>';
        var subscribeHTML = '<p></p>';
        var finalHTML = '<div><div>' + reason + '</div><div>' + loginHTML +'</div><div>' + subscribeHTML + '</div></div></div>';
        storyBody.innerHTML = finalHTML;
        updateClientIdLinks();
        gtag('event', 'Display', {'event_label': window.gSubscriptionEventLabel, 'event_category': 'Web Privileges'});
      }
}

function checkLandingPage() {
  var hostName = window.location.host || '';
  var referrerPage = document.referrer || '';
  if (referrerPage.indexOf(hostName) < 0) {
    gIsLandingPage = true;
  } else {
    gIsLandingPage = false;
  }
}


initAds();
if (isWeChat === true) {
  document.documentElement.className += ' is-wechat';
}
checkLandingPage();

var searchVars = getSearchVars(); 
var deviceCategory = getDeviceCategory();
var deviceType = getDeviceTpye();

//console.log('deviceType:'+deviceType);
var adChannelId = getAdChannelId();
//console.log('adChannelId:'+adChannelId);

var bannerBG = getBannerBG();

var isUrlLocal = isLocal();

function getDeviceCategory() {
  var deviceCategory = 'PC';
  if ((/iPad/i.test(uaString))||(/OS [0-9]+\_/i.test(uaString) && (/iPhone/i.test(uaString) || /iPod/i.test(uaString)))||(/Android|micromessenger/i.test(uaString) || w1 <= 490) || (searchVars.webview === 'ftcapp')) {
    deviceCategory = 'Mobile';
  }
  return deviceCategory;
}
function getDeviceTpye() {
    /**
     * @dependGlob uaString
     * @dependGlob searchVars
     * @dest: determin device type
     */
    var deviceType = 'PC';
  
    if (/iPad/i.test(uaString)) {
      deviceType = 'PadWeb';
      if(searchVars.webview && searchVars.webview === 'ftcapp') {
        deviceType = 'PadApp';
      }
    } else if (/OS [0-9]+\_/i.test(uaString) && (/iPhone/i.test(uaString) || /iPod/i.test(uaString))) {
      deviceType = 'iPhoneWeb';
      if(searchVars.webview && searchVars.webview === 'ftcapp') {
        deviceType = 'iPhoneApp';
      }
    } else if (/Android|micromessenger/i.test(uaString) || w1 <= 490) {
      deviceType = 'AndroidWeb';
    }
    return deviceType;
}

function getAdChannelId() {
  return '';
  /**
   * @dependGlob adchID
   * @dependGlob FTadchannelID
   * @dependGlob deviceType
   */
  // var adch = adchID; //TODO:集中channel号码的获取方式，不要head.html等等都有
  // var adchURL = window.location.href.replace(/^.*adchannelID=([0-9]{4}).*$/g,'$1');
  // if (/^[0-9]{4}$/.test(adchURL) && window.isAdchannelIdFinal !== true) { //MARK:如果是从url可以得到4位频道号
  //   adch = adchURL;
  // } else if (typeof(window.FTadchannelID)!=='undefined' && window.FTadchannelID ) { //MARK:否则看一下全局变量FTadchannelID是否存在
  //   console.log(window.FTadchannelID);
  //   adch = window.FTadchannelID;
  // } 
  // //MARK:Mobile情况下的频道要抹去二级频道（一级频道为50的除外）
  // //MARK：1902的移动端卖了广告，所以1902也要除去————移动端子频道分开卖广告是趋势
  // var mobileDeviceTypeArr = ['iPhoneApp','iPhoneWeb','AndroidApp','AndroidWeb','PadApp','PadWeb'];
  // if (adch && mobileDeviceTypeArr.indexOf(deviceType) >= 0 && adch.substring(0,2)!== '50' && adch.substring(2,4)!=='00' && adch !== '1902') {
  //   adch = adch.substring(0,2) + '00';
  // }
  // var adChannelId = adch||'1000';
  // return adChannelId;
}

function getBannerBG() {
  var bannerBG = '';
  if (window.pageTheme === 'luxury') {
    bannerBG = '&bg=e0cdac';
  } else if (window.pageTheme === 'ebook') {
    bannerBG = '&bg=777777';
  }
  return bannerBG;
}

function isLocal() {
  /**
   * @dest determine if it is local
   */
  if (window.location.hostname === 'localhost' || window.location.hostname.indexOf('192.168') === 0 || window.location.hostname.indexOf('10.113') === 0 || window.location.hostname.indexOf('127.0') === 0) {
    return true;
  } else {
    return false;
  }
}

function writeAdNew(obj) {
  console.log ('writeAdNew');
  if (obj) {
    return '';
  }
  return '';
  /**
   * @param obj
   * @param obj.devices: TYPE Array, the devices are allowed to show this ad, Eg:['PC','PadWeb','iPhoneWeb','AndroidWeb']
   * @param obj.pattern: TYPE String,the key string of var adPattern, Eg：'FullScreen'、'Leaderboard'
   * @param obj.position：TYPE String, the key string of var adPattern.xxx.position,Eg: 'Num1','Right1','Middle2'
   * @param obj.container: TYPE String, the container specified for the ad position in a certain page. The priority of obj.container is the highest among obj.container,adPattern.container and 'none'
   
   * @dependglob adDevices: It is from adDevice.js
   * @dependglob deviceType
   * @dependglob adChannelId
   * @dependglob bannerBg
   * @dependglob isLocal
   * @dependglob searchVars.testDB
   */
  
  // MARK: If there's ad=no in the url, return empty string immediately
  // if (location.href.indexOf('ad=no')>0 || window.hideAllAds === true) {
  //   return '';
  // }


  //MARK: First, get the adid
  
  // var iframeHTML = '';
  // var debugString = '';
  // var adid = '';
  // var deviceId = '';
  // var adPatternId = '';
  // var adPositionId = '';
  // var adWidth = '';
  // var adHeight = '';
  // var containerType = '';
  // var adDescription = '';
  // var adPatternData;

  // // MARK: If device does not fit, return immediately
  // if (obj.devices.indexOf(deviceType) < 0) {
  //   return '';
  // }
  // deviceId = adDevices[deviceType].id;//get the deviceId
  
  // if(deviceType === 'PadWeb'|| deviceType === 'PadApp') {
  //   adPatternData = window.adPatternsPad;
  // } else if(deviceType === 'iPhoneWeb'|| deviceType === 'iPhoneApp' || deviceType === 'AndroidWeb') {
  //   adPatternData = window.adPatternsPhone;
  // } else {
  //   adPatternData = window.adPatternsPC;
  // }

  // if(adPatternData) {
  //   var adPattern = adPatternData[obj.pattern];
  //   adPatternId = adPattern.id;
  //   adPositionId = adPattern.position[obj.position].id;
  //   adWidth = adPattern.width || '100%';
  //   adHeight = adPattern.height || '50';
  //   containerType = obj.container || adPattern.container || 'none';
  //   adid = deviceId + adChannelId + adPatternId + adPositionId;
  // }
  
 
  // var iframeSrc = '';
  // var versionNumber = '2018100308';
  // if(bannerBG) {
  //   if (searchVars.testDB === 'yes') {
  //     iframeSrc = '/a.html?v=' + versionNumber + bannerBG + '#testDB=yes&adid='+ adid + '&pid=' + adid + '&device=' + deviceType + '&pattern=' +  obj.pattern;
  //   } else {
  //     iframeSrc = '/a.html?v=2018100302' + versionNumber + bannerBG + '#adid='+ adid + '&pid=' + adid + '&device=' + deviceType + '&pattern=' +  obj.pattern;
  //   }
  // } else {
  //   if (searchVars.testDB === 'yes') {
  //     iframeSrc = '/a.html?v=' + versionNumber + '#testDB=yes&adid='+ adid + '&pid=' + adid + '&device=' + deviceType + '&pattern=' +  obj.pattern;
  //   } else {
  //     iframeSrc = '/a.html?v=' + versionNumber + '#adid='+ adid + '&pid=' + adid + '&device=' + deviceType + '&pattern=' +  obj.pattern;
  //   }
    
  // }

  // if (location.href.indexOf('ad=no')>0 || window.hideAllAds === true) {
  //   iframeSrc = iframeSrc.replace(/a\.html/g, 'b.html');
  // }

  // var iframeId = 'ad-'+adid;
  // iframeHTML = '<iframe class="banner-iframe" data-adch="'+adChannelId+'" data-adPosition="'+ adPatternId + adPositionId+'" id="' + iframeId + '" width="'+ adWidth +'" height="'+ adHeight + '" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="'+ iframeSrc +'" data-src="'+ iframeSrc +'" data-ad-type="'+ adPatternId + adPositionId +'" data-ad-count=0></iframe>';


  // if (window.gDebugAd && typeof window.gDebugAd === 'string') { //有两种情况存在gDebugAd：1线上为www7时，如果$debug_model == 1，则存在gDebugAd(参见partials/head.html);2本地测试一定存在gDebugAd

    
  //   var topChannelTitle = '';
  //   var subChannelTitle = '';
    
  //   adDescription = deviceType + '-' + topChannelTitle + '-' + subChannelTitle + '-' + obj.pattern + '-' + obj.position;
  //   debugString = window.gDebugAd.replace('adcode_for_debug', adid + ': ' + adDescription);
  // }

  // iframeHTML += debugString;

  // if (containerType === 'banner') {
  //   iframeHTML = '<div class="bn-ph"><div class="banner-container"><div class="banner-inner"><div class="banner-content">' + iframeHTML + '</div></div></div></div>';
  // } else if (containerType === 'mpu') {
  //   iframeHTML = '<div class="mpu-container">' + iframeHTML + '</div>';
  // } else if (containerType === 'mpuInStory') {
  //   iframeHTML = '<div class="mpu-container-instory">' + iframeHTML + '</div>';
  // }
  // return iframeHTML;
}