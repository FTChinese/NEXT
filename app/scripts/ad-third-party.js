/* exported sendImpToThirdParty*/
// MARK: - Test Checking The Impression Tracking
function sendImpToThirdParty(Imp, AdName, AssID) {
    if (typeof Imp === 'string') {
        var asRandom = 'IMG' + Math.round(Math.random() * 1000000000000);
        var timestamp = new Date().getTime();
        var ImpNew = Imp;
        if (ImpNew.indexOf('?') < 0) {
            ImpNew += '?';
        }
        ImpNew = ImpNew.replace('ord=[timestamp]', 'ord=' + timestamp) + '&' + asRandom + '&ftctime=' + timestamp;
        ImpNew = ImpNew.replace('http://ad.doubleclick.net', 'https://ad.doubleclick.net');
        if (typeof window.parent.gTrackThirdParyImpression !== 'object') {
            window.parent.gTrackThirdParyImpression = {};
        }
        window.parent.gTrackThirdParyImpression[asRandom] = new Image();
        window.parent.gTrackThirdParyImpression[asRandom].src = ImpNew;
        window.parent.gTrackThirdParyImpression[asRandom].title = AdName + ' (' + AssID + ')';
        window.parent.gTrackThirdParyImpression[asRandom].alt = Imp;

        window.parent.gTrackThirdParyImpression[asRandom].onload = function() {
            window.parent.ga('send', 'event', this.title, 'Success', this.alt, {
                'nonInteraction': 1
            });
            delete window.parent.gTrackThirdParyImpression[asRandom];
        };

        window.parent.gTrackThirdParyImpression[asRandom].onerror = function() {
            window.parent.ga('send', 'event', this.title, 'Fail', this.alt, {
                'nonInteraction': 1
            });
            window.parent.ga('send', 'event', 'Fail UA String', AssID, window.parent.adReachability(), {'nonInteraction': 1});
            if (typeof window.uaString === 'string') {
                //MAKR: Baidu Analytics
                try {
                  window.parent._hmt.push(['_trackEvent',this.title, 'Fail', window.uaString]);
                } catch (ignore) {

                }
                //window.parent.ga('send', 'event', 'Fail UA String', AssID, window.uaString, {'nonInteraction': 1});
            }
            var asRandom2 = 'IMG' + Math.round(Math.random() * 1000000000000);
            ImpNew = ImpNew.replace('https://', 'http://');
            window.parent.gTrackThirdParyImpression[asRandom2] = new Image();
            window.parent.gTrackThirdParyImpression[asRandom2].src = ImpNew;
            window.parent.gTrackThirdParyImpression[asRandom2].title = this.title;
            window.parent.gTrackThirdParyImpression[asRandom2].alt = this.alt;
            window.parent.gTrackThirdParyImpression[asRandom2].onload = function() {
                window.parent.ga('send', 'event', this.title, 'Success on Retry', this.alt, {
                    'nonInteraction': 1
                });
                delete window.parent.gTrackThirdParyImpression[asRandom2];
            };
            window.parent.gTrackThirdParyImpression[asRandom2].onerror = function() {
                window.parent.ga('send', 'event', this.title, 'Fail on Retry', this.alt, {
                    'nonInteraction': 1
                });
            };
            delete window.parent.gTrackThirdParyImpression[asRandom];
        };

        window.parent.ga('send', 'event', AdName + ' (' + AssID + ')', 'Request', Imp, {
            'nonInteraction': 1
        });
    }
}