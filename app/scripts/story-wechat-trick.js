(function(){
	var pageLoaded = false;
	var tipContent = '<div style="padding: 0 15px;"><p><b>重要提示：</b></p><p style="margin-bottom: 1em;">亲爱的读者，由于微信不能识别和记录您的FT中文网用户和支付信息，请按照下列说明在手机默认浏览器中打开本页。</p><p style="margin-bottom: 1em;">如果您已经安装FT中文网App或者已经在手机的默认浏览器登录了FT中文网，请点击微信右上角的...按钮，再点击在浏览器中打开。</p><p style="margin-bottom: 1em;"><a href="https://a.app.qq.com/o/simple.jsp?pkgname=com.ft">您也可以下载FT中文网的App</a>，了解FT中文网的更多优秀内容。</p></div>';
	window.onload = function() {
		pageLoaded = true;
	};
	var uaString = navigator.userAgent || navigator.vendor || '';
   	var isWeChat = (/micromessenger/i.test(uaString));
   	var timeInSeconds = 10;
   	var timeString = 't' + timeInSeconds;
   	function popWeChat() {
		var tip = document.createElement('DIV');
		tip.style.padding = '15px';
		tip.style.position = 'absolute';
		tip.style.top = '15px';
		tip.style.left = '15px';
		tip.style.bottom = '15px';
		tip.style.right = '15px';
		tip.style.background = '#FFF1E0';
		tip.innerHTML = tipContent;
		var tipArrow = document.createElement('DIV');
		tipArrow.style.position = 'absolute';
		tipArrow.style.top = '0';
		tipArrow.style.right = '15px';
		tipArrow.style.width = '0';
		tipArrow.style.background = 'transparent';
		tipArrow.style.borderWidth = '15px 15px 7px 0';
		tipArrow.style.borderColor = 'transparent #FFF1E0';
		tipArrow.style.borderStyle = 'solid';
		var tipOverlay = document.createElement('DIV');
		tipOverlay.style.position = 'fixed';
		tipOverlay.style.top = '0';
		tipOverlay.style.left = '0';
		tipOverlay.style.right = '0';
		tipOverlay.style.bottom = '0';
		tipOverlay.style.background = 'rgba(0, 0, 0, 0.7)';
		tipOverlay.style.zIndex = 99999999999999;
		tipOverlay.appendChild(tip);
		tipOverlay.appendChild(tipArrow);
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
			lockBlock.innerHTML = tipContent;
			if (isWeChat) {
				lockBlock.onclick = function() {
					popWeChat();
				};
				document.querySelector('.subscribe-lock-container').style.height = '450px';
			}
		}
	}
})();