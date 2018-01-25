/* exported sendImpToThirdThirdPartyOnce */
// MARK: - Test Checking The Impression Tracking
function sendImpToThirdThirdPartyOnce(Imp, AdName, AssID) {
  if (typeof Imp === 'string') {
      if (typeof window.parent.gTrackThirdParyImpression !== 'object') {
          window.parent.gTrackThirdParyImpression = {};
      }
      var lastImp = Imp;
      var isRequestSuccessful = false;
      var sendEvent = function() {
          var eventCategory = arguments[0] || '';
          var eventAction = arguments[1] || '';
          var eventLabel = arguments[2] || '';
          var asRandom = 'G' + Math.round(Math.random() * 1000000000000);
          try {
              window.parent.ga('send', 'event', eventCategory, eventAction, eventLabel, {'nonInteraction': 1});
          } catch (ignore) {
              var gaServerTracker = new Image();
              gaServerTracker.src = 'http://www.ftchinese.com/index.php/ft/hit/' + AssID + '/2?ec=' + eventCategory + '&ea=' + eventAction + '&el=' + encodeURIComponent(eventLabel) + '&r=' + asRandom;
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
 
          lastImp = ImpNew;
          window.parent.gTrackThirdParyImpression[asRandom] = new Image();
          window.parent.gTrackThirdParyImpression[asRandom].src = ImpNew;
          window.parent.gTrackThirdParyImpression[asRandom].title = AdName + ' (' + AssID + ')';
          window.parent.gTrackThirdParyImpression[asRandom].alt = Imp;
          window.parent.gTrackThirdParyImpression[asRandom].onload = function() {
              var actionName = 'Success';
              
              sendEvent(this.title, actionName, this.alt);
              delete window.parent.gTrackThirdParyImpression[asRandom];
              isRequestSuccessful = true;
          };
      };
      sendOnetime();
      // MARK: send request for all
      sendEvent(AdName + ' (' + AssID + ')', 'Request', Imp);
  }
}