/* exported writeAd, slotStr*/
/* jshint ignore:start */
function adReachability() {
  var thirdPartyVendors = {
    'dcR': '_dc',
    'mmR': '_mm',
    'szR': '_sz',
    'amR': '_am'
  };
  var adParameter = '';
  var adReachabilityStatus;
  for (var k in thirdPartyVendors) {
      if (thirdPartyVendors.hasOwnProperty(k)) {
         //user[k] = data[k];
         //console.log (k + ': ' + thirdPartyVendors[k]);
         adReachabilityStatus = GetCookie(k);
         if (adReachabilityStatus === 'reachable') {
          adParameter += '&' + thirdPartyVendors[k] + '=1';
         } else if (adReachabilityStatus === null) {
          adParameter += '&' + thirdPartyVendors[k] + '=2';
         }
      }
  }
  return adParameter;
}

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
      console.log (adAction + ' - ' + reachabilityStatus + ' ' + adLabel + ': ' + adTimeSpent);
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


//
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





var slotStr=setDolphinSlot('USER_KV');
var adCount = {};
var adMax = {};
var adPositions = {
  'banner': ['0001','0006','0007','0008'],
  'mpu': ['0003', '0004', '0005', '0004'],
  'storympu': ['0005', '0003', '0004', '0003'],
  'ipadhomempu': ['0003', '0004'],
  'ipadstorympu': ['0005'],
  'phonebanner': ['0101', '0114'],
  'phonempu': ['0003'],
  'phonestorybanner': ['0101', '0115'],
  'phonestorympu': ['0004']
};
var uaString=navigator.userAgent || navigator.vendor || '';
var w1 = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

for(var x in adPositions){
  if (adPositions.hasOwnProperty(x)) {
      adCount[x] = 0;
      adMax[x] = adPositions[x].length;
  }
}

//console.log (adMax);
///m/marketing/a.html#adid=10000003&slot=986723212&pid=mpu1
///m/marketing/<%$adFileName%>.html#adid=<%$p.meta.adid%><%$banners[$bannerCount]%>&slot=986723212&pid=banner<%$bannerCount%>

//<iframe id="banner<%$bannerCount%>" width="100%" height="90" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="/m/marketing/<%$adFileName%>.html#adid=<%$p.meta.adid%><%$banners[$bannerCount]%>&slot=986723212&pid=banner<%$bannerCount%>"></iframe>

function writeAd(adType) {
  var adFileName;
  var currentAdCount;
  var adPosition;
  var iframeSrc;
  var adWidth;
  var adHeight;
  var iframeHTML;
  var adch = adchID;

  if (/iPad/i.test(uaString) && /mpu/.test(adType)) {
    //if iPad, mpu ads change to iPad apps
    adch = '2021';
    adType = (adType === 'mpu') ? 'ipadhomempu' : 'ipadstorympu';
  } else if (/OS [0-9]+\_/i.test(uaString) && (/iPhone/i.test(uaString) || /iPod/i.test(uaString))) {
    adch = '2022';
  } else if (w1 <= 490){
    adch = '2023';
  }

  if (adch === '2022' || adch === '2023') {
    if (adType === 'banner') {
      adType = 'phonebanner';
    } else if (adType === 'mpu') {
      adType = 'phonempu';
    } else if (adType === 'storybanner') {
      adType = 'phonestorybanner';
    } else if (adType === 'storympu') {
      adType = 'phonestorympu';
    }
  }

  adFileName = (adType === 'banner' &&  adCount[adType] === 0) ? 'topbanner' : 'a';
  currentAdCount = adCount[adType];
  if (currentAdCount < adMax[adType]) {
    adPosition = adPositions[adType][currentAdCount];
    iframeSrc = '/m/marketing/'+adFileName+'.html?v=2#adid='+ adch + adPosition + '&pid='+adType+adCount[adType];
    if (/mpu/.test(adType)) {
      adWidth = '300';
      adHeight = '250';
    } else if (adType === 'phonebanner' || adType === 'phonestorybanner') {
      adWidth = '100%';
      adHeight = '50';
    } else {
      adWidth = '100%';
      adHeight = '90';
    }
    iframeHTML = '<iframe id="' + adType + adCount[adType] + '" width="'+ adWidth +'" height="'+ adHeight + '" frameborder="0" scrolling="no" marginwidth="0" marginheight="0" src="'+ iframeSrc +'"></iframe>';
    
    

  } else {
    if (/banner/.test(adType)) {
      document.querySelectorAll('.banner-placeholder')[currentAdCount].style.display = 'none';
    }
    iframeHTML = '';
  }

  adCount[adType] = adCount[adType] + 1;
  return iframeHTML;
  // console.log (adType + ': ' + currentAdCount);
  // console.log (adPosition);
  /*
  if (adCode=="ad300x90") {
      adPositionId="0102";
      adType="ad90";
  } else if (adCode=="ad300x250-home") {
      adPositionId="0003";
      adType="mpu-phone";
  } else if (adCode=="ad300x250-story") {
      adPositionId="0004";
      adType="mpu-phone";
  } else if (adCode=="banner-bottom-home") {
      adPositionId="0114";
      adType="ad50";
  } else if (adCode=="banner-bottom-story") {
      adPositionId="0115";
      adType="ad50";
  } else {
      adPositionId="0101";
      adType="ad50";
  }
  c=adchannelId + adPositionId;
  */
}