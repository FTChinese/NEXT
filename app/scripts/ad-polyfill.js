(function(){
	var ftOrigamiUrl = 'https://d2jm9zoefzwu40.cloudfront.net/n/o-ads.js';
	var adCodeLoaded = false;
	function getPolyfillCode() {
		var isIE = /*@cc_on!@*/false || !!document.documentMode;
		if (isIE) {
			return '//cdn.polyfill.io/v2/polyfill.min.js?features=Array.from,Array.prototype.find,IntersectionObserver,fetch,default';
		} else {
			var polyfillFeatures = [];
			if (typeof Array !== 'function') {
				polyfillFeatures.push('Array.from').push('Array.prototype.find');
			} else {
				if (typeof Array.from !== 'function') {
					polyfillFeatures.push('Array.from');
				}
				if (typeof Array.prototype !== 'object') {
					polyfillFeatures.push('Array.prototype.find');
				} else if (typeof Array.prototype.find !== 'function') {
					polyfillFeatures.push('Array.prototype.find');
				}
			}
			if (typeof fetch !== 'function') {
				polyfillFeatures.push('fetch');
			}
			if (polyfillFeatures.length > 0) {
				// MARK: - IntersectionObserver is not essential
				polyfillFeatures.push('IntersectionObserver');
				polyfillFeatures.push('default');
				var polyfillFeaturesString = polyfillFeatures.join(',');
				return '//cdn.polyfill.io/v2/polyfill.min.js?features='+ polyfillFeaturesString;
			}
		}
		return '';
	}
	function loadAdCode(src) {
		if (adCodeLoaded) {
			return;
		}
	    var sc = document.createElement('script');
	    sc.src = src;
	    sc.async = 1;
	    var s = document.getElementsByTagName('script')[0];
	    s.parentNode.insertBefore(sc, s);
	    adCodeLoaded = true;
	}
	function loadAdCodesAll() {
		loadAdCode(ftOrigamiUrl);
	}
	var polyFillCode = getPolyfillCode();
	if (polyFillCode !== '') {
		var pf = document.createElement('script');
		pf.src = getPolyfillCode();
		pf.async = 1;
		//MARK: - load the ad codes after polyfill is loaded. 
		pf.onload = function() {
			loadAdCodesAll();
		};
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(pf, s);
	} else {
		loadAdCodesAll();
	}
})();