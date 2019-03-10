(function(){
	var pageLoaded = false;
	window.onload = function() {
		pageLoaded = true;
	};
	var uaString = navigator.userAgent || navigator.vendor || '';
   	var isWeChat = (/micromessenger/i.test(uaString));
   	var timeInSeconds = 10;
   	var timeString = 't' + timeInSeconds;
   	// MARK: - If wechat page loading progress bar doesn't finish in 10 seconds, stop refreshing and let it finish, so that user can share the page. 
	setTimeout(function(){
		if (pageLoaded === false && isWeChat) {
			window.stop();
			// MARK: - Wait a second then try reload unloaded images and ads
			setTimeout(function(){
				if (typeof oAds === 'object') {
					for (var key in oAds.slots) {
					    if (oAds.slots.hasOwnProperty(key)) {
					        if (!/fullscreen|lazyLoadingObservers/.test(key)) {
					        	//console.log(key + " -> " + oAds.slots[key]);
					        	try {
					        		oAds.slots[key].refresh();
					        	} catch(ignore) {

					        	}
					        }
					    }
					}
					ga('send', 'event', 'WeChatLoadTrack', 'reload ad', timeString, {'nonInteraction':1});
				}
				// MARK: - check the images that uses FT Image service. If loading is not complete, use the original image, which might be quite big in size, but we'll accept that. Anyway, the extra traffic data usage will be attributed to WeChat. 
				var images = document.querySelectorAll('img');
				var imageReloaded = false;
				for (var i=0; i<images.length; i++) {
					var currentImage = images[i];
					if (currentImage.complete === false) {
						var imageContainer = currentImage.parentElement;
						if (imageContainer) {
							var originalImage = imageContainer.getAttribute('data-url');
							if (originalImage) {
								currentImage.src = originalImage;
								imageReloaded = true;
							}
						}
					}
				}
				if (imageReloaded) {
					ga('send', 'event', 'WeChatLoadTrack', 'reload image', timeString, {'nonInteraction':1});
				}
			}, 1000);
			ga('send', 'event', 'WeChatLoadTrack', 'stop', timeString, {'nonInteraction':1});
		} else if (pageLoaded) {
			ga('send', 'event', 'WeChatLoadTrack', 'success', timeString, {'nonInteraction':1});
		} else {
			ga('send', 'event', 'WeChatLoadTrack', 'ignore', timeString, {'nonInteraction':1});
		}
	}, timeInSeconds * 1000);
	// MARK: If the user opens a paid content and is required to login, give him the option to view this content with his app. 
	if (window.gPaywallShowed === true) {
		var lockContent = document.querySelector('.lock-content');
		if (lockContent) {
			console.log ('found: ' + lockContent.innerHTML);
			var pathname = window.location.pathname;
			pathname = pathname.replace('interactive', 'gym');
			window.location.href = 'ftchinese:/' + window.location.pathname;
		}
	}
})();