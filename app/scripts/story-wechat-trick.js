// MARK: - WeChat's browser has idiosyncrasies that we have to do some hacks to trick it and encourage users/subscribers to go back to our apps/web site.  
(function(){
	var uaString = navigator.userAgent || navigator.vendor || '';
	var pageLoaded = false;
	var browserName = (/iphone|ipad|ipod/i.test(uaString)) ? 'Safari' : '手机默认浏览器';
	var tipContent = '<div style="padding: 0 15px;"><p><b>重要提示：</b></p><p style="margin-bottom: 1em;">这是一篇需要付费订阅才能阅读的内容。但是由于微信不能识别和记录您的FT中文网用户和支付信息，请点击这里在FT中文网App或'+browserName+'中打开本页，来完成订阅或者使用您已经购买的订阅权限。</p><p style="margin-bottom: 1em;"><a href="https://a.app.qq.com/o/simple.jsp?pkgname=com.ft">您也可以下载FT中文网的App</a>，了解FT中文网的更多优秀内容。</p></div>';
   	var isWeChat = (/micromessenger/i.test(uaString));
   	var timeInSeconds = 10;
   	var timeString = 't' + timeInSeconds;
   	window.onload = function() {
		pageLoaded = true;
	};
   	function popWeChat() {
		var tipOverlay = document.createElement('DIV');
		tipOverlay.style.position = 'fixed';
		tipOverlay.style.top = '0';
		tipOverlay.style.left = '0';
		tipOverlay.style.right = '0';
		tipOverlay.style.bottom = '0';
		tipOverlay.style.background = '#FFF1E0';
		tipOverlay.style.zIndex = 99999999999999;
		var tipImageUrl = (/iphone|ipad|ipod/i.test(uaString)) ? 'http://i.ftimg.net/picture/2/000084162_piclink.jpg' : 'http://i.ftimg.net/picture/3/000084163_piclink.jpg';
		tipOverlay.innerHTML = '<img src="'+ tipImageUrl +'" max-width="100%">';
		document.body.appendChild(tipOverlay);
   	}
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
		var lockBlock = document.querySelector('.lock-block');
		if (lockBlock) {
			var pathname = window.location.pathname;
			pathname = pathname.replace('interactive', 'gym');
			window.location.href = 'ftchinese:/' + pathname;
			// MARK: If the page is not redirected, update lockBlock
			if (isWeChat) {
				lockBlock.innerHTML = tipContent;
				lockBlock.onclick = function() {
					popWeChat();
				};
				document.querySelector('.subscribe-lock-container').style.height = '450px';
			}
		}
	}
})();