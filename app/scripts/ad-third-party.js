/* exported sendImpToThirdParty, adReachability */
// MARK: - Test Checking The Impression Tracking
function sendImpToThirdParty(Imp, AdName, AssID) {
    if (typeof Imp === 'string') {
        if (typeof window.parent.gTrackThirdParyImpression !== 'object') {
            window.parent.gTrackThirdParyImpression = {};
        }
        var reRryTimes = 0;
        var lastImp = Imp;
        var isRequestSuccessful = false;
        var retryTimeLimit = 3;
        var sendEvent = function() {
          var eventCategory = arguments[0] || '';
          var eventAction = arguments[1] || '';
          var eventLabel = arguments[2] || '';
          try {
            window.parent.ga('send', 'event', eventCategory, eventAction, eventLabel, {'nonInteraction': 1});
          } catch (ignore) {
            var gaServerTracker = new Image();
            gaServerTracker.src = 'http://www.ftchinese.com/index.php/ft/hit/' + AssID + '/2?ec=' + eventCategory + '&ea=' + eventAction + '&el=' + eventLabel;
            if (eventAction === 'request') {
              var topUrl = top.location.href;
              var topUrlTracker = new Image();
              topUrlTracker.src = 'http://www.ftchinese.com/index.php/ft/hit/' + AssID + '/1?url=' + encodeURIComponent(topUrl);
            }
          }
        };
        var sendOnetime = function() {
            var asRandom = 'IMG' + Math.round(Math.random() * 1000000000000);
            var timestamp = new Date().getTime();
            var ImpNew = Imp;
            var retryReason;
            try {
              retryReason = arguments[0] || '';
            } catch (ignore) {
              retryReason = '';
            }
            if (ImpNew.indexOf('?') < 0) {
                ImpNew += '?';
            }
            ImpNew = ImpNew.replace('ord=[timestamp]', 'ord=' + timestamp) + '&' + asRandom + '&ftctime=' + timestamp;
            // MARK: - Alternate http and https for DoubleClick while retrying
            if (reRryTimes>0) {
              if (lastImp.indexOf('https') === 0) {
                ImpNew = ImpNew.replace('https://ad.doubleclick.net', 'http://ad.doubleclick.net');
                ImpNew = ImpNew.replace('https://v.admaster.com.cn', 'http://v.admaster.com.cn');
              } else {
                ImpNew = ImpNew.replace('http://ad.doubleclick.net', 'https://ad.doubleclick.net');
                ImpNew = ImpNew.replace('http://v.admaster.com.cn', 'https://v.admaster.com.cn');
              }
            }
            lastImp = ImpNew;
            window.parent.gTrackThirdParyImpression[asRandom] = new Image();
            window.parent.gTrackThirdParyImpression[asRandom].src = ImpNew;
            window.parent.gTrackThirdParyImpression[asRandom].title = AdName + ' (' + AssID + ')';
            window.parent.gTrackThirdParyImpression[asRandom].alt = Imp;
            window.parent.gTrackThirdParyImpression[asRandom].onload = function() {
                var actionName = '';
                if(reRryTimes === 0){
                    actionName = 'Success';
                } else if (retryReason !== '') {
                    actionName = 'Success on Retry'+retryReason;
                } else {
                    actionName = 'Success on Retry'+reRryTimes;
                }
                sendEvent(this.title, actionName, this.alt);
                delete window.parent.gTrackThirdParyImpression[asRandom];
                isRequestSuccessful = true;
            };
            window.parent.gTrackThirdParyImpression[asRandom].onerror = function() {
                var failActionName = '';
                if(reRryTimes === 0){
                    failActionName = 'Fail';
                } else if (retryReason !== '') {
                    failActionName = 'Fail on Retry'+retryReason;
                } else {
                    failActionName = 'Fail on Retry'+reRryTimes;
                }
                sendEvent(this.title, failActionName, this.alt);
                sendEvent('Fail UA String', AssID, window.parent.adReachability());

                if (typeof window.uaString === 'string') {
                    //MAKR: Baidu Analytics
                    try {
                    window.parent._hmt.push(['_trackEvent',this.title, 'Fail', window.uaString]);
                    } catch (ignore) {

                    }
                }
                reRryTimes++;
                if (reRryTimes <= retryTimeLimit) {
                    setTimeout(sendOnetime, 100 * reRryTimes * reRryTimes * reRryTimes);
                }
            };
        };
        sendOnetime();
        // MARK: if the request is not successful in 10 seconds, try for the last time
        setTimeout(function(){
          if (isRequestSuccessful === false && reRryTimes === 0) {
              reRryTimes = retryTimeLimit -1;
              var retryReason2 = ' from Pending';
              sendOnetime(retryReason2);
              sendEvent(AdName + ' (' + AssID + ')', 'Request' + retryReason2, Imp);
          }
        }, 10000);
        // MARK: send request for all
        sendEvent(AdName + ' (' + AssID + ')', 'Request', Imp);
    }
}

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
         try {
             if (typeof window.GetCookie === 'function') {
                adReachabilityStatus = GetCookie(k);
             } else {
                adReachabilityStatus = getCookie(k);
             }
         } catch(ignore) {
            adReachabilityStatus = null;
         }
         
         if (adReachabilityStatus === 'reachable') {
          adParameter += '&' + thirdPartyVendors[k] + '=1';
         } else if (window.gIsSpider === true && (k === 'dcR' || k === 'amR')) {
          // MARK: - If it's spam. Don't use DoubleClick and AdMaster to serve
          adParameter += '&' + thirdPartyVendors[k] + '=0';
         } else if (adReachabilityStatus === null) {
          adParameter += '&' + thirdPartyVendors[k] + '=2';
         }
      }
  }
  if (typeof window.gUserType !== 'string') {
    window.gUserType = 'visitor';
  }
  adParameter += '&' + '_ut=' + window.gUserType;
  //console.log (adParameter);
  return adParameter;
}
