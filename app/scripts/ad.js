/* exported writeAd, slotStr, checkB, sendEvent,clearEvents, writeAdNew,deviceCategory */
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

/* jshint ignore:start */
function trackAd(adAction, adLabel, reachabilityStatus) {
  var adLoadTime;
  var adTimeSpent;
  if (typeof window.ga === 'function') {
    adLoadTime = new Date().getTime();
    adTimeSpent = adLoadTime - window.adStartTime;
    ga('send','event','Third Party Ad', adAction + ' - all', adLabel, {'nonInteraction':1});
    ga('send', 'timing', 'Third Party Ad', adAction, adTimeSpent, adLabel);
    // console.log (reachabilityStatus);
    if (reachabilityStatus !== undefined && reachabilityStatus !== '') {
      ga('send','event','Third Party Ad', adAction + ' - ' + reachabilityStatus, adLabel, {'nonInteraction':1});
    }
    if (typeof window.startTime === 'number') {
      adLoadTime = new Date().getTime();
      adTimeSpent = adLoadTime - window.startTime;
      ga('send', 'timing', 'Third Party Ad', adAction + ' VS Page Start', adTimeSpent, adLabel);
    }
    try {
      //console.log (adAction + ' - ' + reachabilityStatus + ' ' + adLabel + ': ' + adTimeSpent);
    } catch (ignore) {
    }
  }
}

function checkAd(adOptions, adDomContainer) {
  // to be on the safe side
  // use setTimeout so that the third party script will be
  // captured in the innerHTML in all browsers
  var img;
  var passDomCheck = false;
  var adDomImgs = 0;
  var adDomObjects = 0;
  var adDomIFrames = 0;
  var adDomVideos = 0;
  var adName = '';
  var fallbackImgContainer = adDomContainer.getElementsByTagName('div')[0];
  var thirdPartyVendor = '';
  var reachabilityStatus = ''; // reachable, unreachable, unknown
  var cookieSeconds = 60 * 30;
  var expression;
  var regex;

  if (adOptions.checking === true) {
    adName = adOptions.adClient + ' ' + adOptions.adWidth + 'x' + adOptions.adHeight + ' ' + adOptions.adNote;
    if (adOptions.thirdPartyVendor !== undefined) {
      thirdPartyVendor = adOptions.thirdPartyVendor;
    } else if (/doubleclick|adsafeprotected\.com\/.*\/dc\//i.test(adOptions.fallBackImg)) {
      thirdPartyVendor = 'dcR';
    }
    if (adOptions.checkingTime === 0) {
      if (thirdPartyVendor !== '') {
        // Check reachability status
        reachabilityStatus = GetCookie (thirdPartyVendor) || 'unknown';
        adOptions.reachabilityStatus = reachabilityStatus;
        //adOptions.thirdPartyVendor = thirdPartyVendor;
      }
      trackAd('Impression Track Start', adName, reachabilityStatus);
      //SetCookie(thirdPartyVendor, 'unknown', cookieSeconds, '/');
    } else {
      if (adOptions.reachabilityStatus !== undefined ) {
        reachabilityStatus = adOptions.reachabilityStatus;
      //console.log (reachabilityStatus);
      }
      if (adOptions.thirdPartyVendor !== undefined) {
        thirdPartyVendor = adOptions.thirdPartyVendor;
      }
    }
    //console.log (thirdPartyVendor);
    //Dom Check
    if (adDomContainer === null) {
      passDomCheck = false;
      //console.log ('no dom yet');
    } else if (adOptions.checkDom === true) {
      adDomImgs = adDomContainer.getElementsByTagName('img').length;
      adDomObjects = adDomContainer.getElementsByTagName('object').length;
      adDomIFrames = adDomContainer.getElementsByTagName('iframe').length;
      adDomVideos = adDomContainer.getElementsByTagName('video').length;
      if (adDomImgs > 0 || adDomIFrames > 0 || adDomObjects > 0 || adDomVideos > 0) {
        passDomCheck = true;
      } else {
        passDomCheck = false;
      }
    } else {
      passDomCheck = true;
    }
    if (passDomCheck === true) {
      adOptions.checking = false;
      trackAd('Impression Track Success', adName, reachabilityStatus);
      SetCookie(thirdPartyVendor, 'reachable', cookieSeconds, '/');
    } else if (adOptions.checkingTime < adOptions.checkingTimeMax) {
      //else if we still have time to check
      //check again in 1 second
      adOptions.checkingTime += 1;
      setTimeout(function(){
        checkAd(adOptions, adDomContainer);
      }, 1000);
    } else {
      //else if time runs out
      //tell Google Analytics ad has failed to load
      //load the fallback image
      trackAd('Impression Track Fail Main', adName, reachabilityStatus);
      SetCookie(thirdPartyVendor, 'unreachable', cookieSeconds, '/');
      if (adOptions.fallBackImg !== undefined && adOptions.fallBackImg !== '') {
      expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
      regex = new RegExp(expression);
        if (adOptions.fallBackImg.match(regex)) {
          img = new Image();
          img.src = adOptions.fallBackImg;
          img.onload = function() {
            //fallback image is loaded successfully
            //tell Google Analytics that ad has loaded through the fallback
            //adDomContainer.style.backgroundImage = 'url('+ img.src +')';
            fallbackImgContainer.innerHTML = '<img src="' + img.src + '">';
            trackAd('Impression Track Success', adName, reachabilityStatus);
            trackAd('Impression Track Fallback Image', adName, reachabilityStatus);
          };
          img.onerror = function() {
            //fallback image is not loaded successfully
            //tell Google Analytics that fallback image has also failed
            trackAd('Impression Track Fail Fallback', adName, reachabilityStatus);
          };
        } else {
          trackAd('Impression Track Fail Fallback Invalid', adName, reachabilityStatus);
          ga('send','event','FallBack Image Error', adName, adOptions.fallBackImg, {'nonInteraction':1});
        }
      }
    }
  }
}

function checkAdLoad() {
	var el;
	var aTag;
    var videoTag;
    var iFrameTag;
    var imgTag;
	var divTag;
	var objTag;
	var tagLength;
	if (window.adUnitTrack === '5') {
		el = document.body;
	} else if (document.getElementById(window.adUnitIds[window.adUnitTrack])) {
		el = document.getElementById(window.adUnitIds[window.adUnitTrack]);
	}
	if (typeof el === 'object') {
		aTag = el.getElementsByTagName("a").length || 0;
    	videoTag = el.getElementsByTagName("video").length || 0;
    	iFrameTag = el.getElementsByTagName("iframe").length || 0;
    	imgTag = el.getElementsByTagName("img").length || 0;
    	divTag = el.getElementsByTagName("div").length || 0;
    	objTag = el.getElementsByTagName("object").length || 0;
    	tagLength = aTag + videoTag + iFrameTag + imgTag + divTag + objTag;
		if (tagLength > 0) {
			trackAd ('Loaded Something', window.adPositionTrack + ' ' + window.adIdTrack);
		} else {
			setTimeout(function(){
				checkAdLoad();
			},1000);
		}
	} else {
		trackAd ('ID ' + window.adUnitIds[window.adUnitTrack] + ' not found', window.adPositionTrack + ' ' + window.adIdTrack);
	}
	try {
		//console.log ('check ad load!');
	} catch(ignore) {

	}
}

function adLoadStatus(eventAction, eventLabel) {
  ga('send','event', 'Ad Load', eventAction, eventLabel, {'nonInteraction':1});
}

function setDolphinSlot(key){
  //定义slot随机数实现联动互斥功能
  var rString = window.dolRand?"&slot="+window.dolRand:"",
      cString = GetCookie(key),
      x;
  if(!cString){return rString;}
  window.cArray = cString.split(";");
  for(x in window.cArray){
      if (window.cArray.hasOwnProperty(x)) {
          window.cArray[x]=window.cArray[x].replace("|","=");
          rString += "&_"+window.cArray[x];
      }
  }
  return rString;
}
/* jshint ignore:end */

window.dolRand = Math.round(Math.random()*1000000);//定义slot随机数实现联动互斥功能
var slotStr=setDolphinSlot('USER_KV');


var uaString;
var w1;
var w2;
var isWeChat;
function initAds() {
  uaString = navigator.userAgent || navigator.vendor || '';
  isWeChat = (/micromessenger/i.test(uaString));
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
    ga('send','event',ec, ea, el, ei);
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
    ga('send', 'event', eventsToSend[i].ec, eventsToSend[i].ea, eventsToSend[i].el, eventsToSend[i].ei);
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
    } else {
      isBlocked = 'no';
    }
    test.remove();
  }, 100);
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

var isLocal = isLocal();
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
  /**
   * @dependGlob adchID
   * @dependGlob FTadchannelID
   * @dependGlob deviceType
   */
  var adch = adchID; //TODO:集中channel号码的获取方式，不要head.html等等都有
  var adchURL = window.location.href.replace(/^.*adchannelID=([0-9]{4}).*$/g,'$1');
  if (/^[0-9]{4}$/.test(adchURL)) { //MARK:如果是从url可以得到4位频道号
    adch = adchURL;
  } else if (typeof(window.FTadchannelID)!=='undefined' && window.FTadchannelID ) { //MARK:否则看一下全局变量FTadchannelID是否存在
    console.log(window.FTadchannelID);
    adch = window.FTadchannelID;
  } 
  //MARK:Mobile情况下的频道要抹去二级频道（一级频道为50的除外）
  //MARK：1902的移动端卖了广告，所以1902也要除去————移动端子频道分开卖广告是趋势
  var mobileDeviceTypeArr = ['iPhoneApp','iPhoneWeb','AndroidApp','AndroidWeb','PadApp','PadWeb'];
  if (adch && mobileDeviceTypeArr.indexOf(deviceType) >= 0 && adch.substring(0,2)!== '50' && adch.substring(2,4)!=='00' && adch !== '1902') {
    adch = adch.substring(0,2) + '00';
  }
  var adChannelId = adch||'1000';
  return adChannelId;
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
   */
  
  // MARK: If there's ad=no in the url, return empty string immediately
  if (location.href.indexOf('ad=no')>0 || window.hideAllAds === true) {
    return '';
  }

  //MARK: First, get the adid
  
  var iframeHTML = '';
  var debugString = '';
  var adid = '';
  var deviceId = '';
  var adPatternId = '';
  var adPositionId = '';
  var adWidth = '';
  var adHeight = '';
  var containerType = '';
  var adDescription = '';
  var adPatternData;

  // MARK: If device does not fit, return immediately
  if (obj.devices.indexOf(deviceType) < 0) {
    return '';
  }
  deviceId = adDevices[deviceType].id;//get the deviceId
  //console.log('deviceId:'+deviceId);
  /*
  if(window.deviceGotFromPhp) {//线上环境根据后台php传过来的deviceGotFromPhp来获取设备类型
    console.log(window.deviceGotFromPhp);
    if (window.deviceGotFromPhp === 'Pad') {
      adPatternData = window.adPatternsPad;
    } else if (window.deviceGotFromPhp === 'Phone') {
      adPatternData = window.adPatternsPhone;
    } else {
      adPatternData = window.adPatternsPC;
    }
  } else { //本地情况只能根据deviceType来判断
    */
  //console.log('deviceType:'+deviceType);
  if(deviceType === 'PadWeb'|| deviceType === 'PadApp') {
    adPatternData = window.adPatternsPad;
  } else if(deviceType === 'iPhoneWeb'|| deviceType === 'iPhoneApp' || deviceType === 'AndroidWeb') {
    adPatternData = window.adPatternsPhone;
  } else {
    adPatternData = window.adPatternsPC;
  }
  //} 

  if(adPatternData) {
    var adPattern = adPatternData[obj.pattern];
    adPatternId = adPattern.id;
    adPositionId = adPattern.position[obj.position].id;
    adWidth = adPattern.width || '100%';
    adHeight = adPattern.height || '50';
    containerType = obj.container || adPattern.container || 'none';
    adid = deviceId + adChannelId + adPatternId + adPositionId;
  }
  
 
  var iframeSrc = '';
  if (isLocal) {
    iframeSrc = 'a.html?v=20171214112400' + bannerBG + '#adid='+ adid + '&pid=' + adid;
  } else {
    iframeSrc = '/a.html?v=20171214112400' + bannerBG + '#adid='+ adid + '&pid=' + adid;
  }
  var iframeId = 'ad-'+adid;
  iframeHTML = '<iframe class="banner-iframe" data-adch="'+adChannelId+'" data-adPosition="'+ adPatternId + adPositionId+'" id="' + iframeId + '" width="'+ adWidth +'" height="'+ adHeight + '" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="'+ iframeSrc +'" data-src="'+ iframeSrc +'" data-ad-type="'+ adPatternId + adPositionId +'" data-ad-count=0></iframe>';


  if (window.gDebugAd && typeof window.gDebugAd === 'string') { //有两种情况存在gDebugAd：1线上为www7时，如果$debug_model == 1，则存在gDebugAd(参见partials/head.html);2本地测试一定存在gDebugAd
    //MARK:找出channel的describtion
    //TODO:按需加载channel数据
    /*
    var topChannelId = adChannelId.substring(0,2);
    var subChannelId = adChannelId.substring(2,4);
    var adChannel = adDevices[deviceType].channels; 

    var subChannels = {};
    */
    var topChannelTitle = '';
    var subChannelTitle = '';
    /*
    for(var prop in adChannel) {
      var propObj = adChannel[prop];
      if(propObj.id === topChannelId) {
        topChannelTitle = propObj.title;
        subChannels = propObj.sub;
      }
    }
    for(var subProp in subChannels) {
      var subPropObj = subChannels[subProp];
      if(subPropObj.id === subChannelId) {
        subChannelTitle = subPropObj.title;
      }
    }
    */
    adDescription = deviceType + '-' + topChannelTitle + '-' + subChannelTitle + '-' + obj.pattern + '-' + obj.position;
    debugString = window.gDebugAd.replace('adcode_for_debug', adid + ': ' + adDescription);
  }

  iframeHTML += debugString;

  if (containerType === 'banner') {
    iframeHTML = '<div class="bn-ph"><div class="banner-container"><div class="banner-inner"><div class="banner-content">' + iframeHTML + '</div></div></div></div>';
  } else if (containerType === 'mpu') {
    iframeHTML = '<div class="mpu-container">' + iframeHTML + '</div>';
  } else if (containerType === 'mpuInStroy') {
    iframeHTML = '<div class="mpu-container-instory">' + iframeHTML + '</div>';
  }
  return iframeHTML;
}