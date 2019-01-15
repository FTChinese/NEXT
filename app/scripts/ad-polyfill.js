/* exported getPolyfillCode */
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
		if (typeof IntersectionObserver !== 'function') {
			polyfillFeatures.push('IntersectionObserver');
		}
		if (typeof fetch !== 'function') {
			polyfillFeatures.push('fetch');
		}
		if (polyfillFeatures.length > 0) {
			polyfillFeatures.push('default');
			var polyfillFeaturesString = polyfillFeatures.join(',');
			return '//cdn.polyfill.io/v2/polyfill.min.js?features='+ polyfillFeaturesString;
		}
	}
	return '';
}