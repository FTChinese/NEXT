// MARK: - Only subscribers can visit any page on chineseft.com
(function(){
	if (/chineseft\.com/.test(location.hostname) && /^\/users\/findpassword|\/users\/register$/.test(location.pathname) === false) {
		var userId = GetCookie('USER_ID');
		var paywall = GetCookie('paywall');
		if (userId === null) {
			setTimeout(function(){
				showOverlay('overlay-login');
				document.querySelector('.overlay-title').innerHTML = '订户专享网站';
				document.querySelector('.register-find').innerHTML = '<a href="https://www.ftacademy.cn/subscription.html">购买会员</a><span></span><a href="/users/findpassword">找回密码</a>';
				document.querySelector('.wx-login').style.marginTop = '15px';
				var overlayBG = document.querySelector('.overlay-bg');
				overlayBG.className = 'overlay-bg-fixed';
			}, 0);
		} else if (paywall === null) {
			setTimeout(function(){
				showOverlay('overlay-login');
				var userName = GetCookie('USER_NAME') || '';
				document.querySelector('.overlay-title').innerHTML = '订户专享网站';
				document.querySelector('.overlay-content form').innerHTML = '<div class="input-title">亲爱的用户您好，这个网站是付费订户专享，您当前使用的用户名' + userName + '并非用户。如果您是刚刚付款成功，请等待一分钟后刷新本页。否则请登出之后更换用户名或者访问FT中文网主站。</div><div style="padding: 0 0 15px 0;"><div class="login-btn input-submit-container center"><a class="n-button-inner" href="/users/logout">登出</a></div></div><div style="padding: 0 0 15px 0;"><div class="login-btn input-submit-container center"><a class="n-button-inner" href="http://www.ftchinese.com/">免费网站</a></div></div>';
				var overlayBG = document.querySelector('.overlay-bg');
				overlayBG.className = 'overlay-bg-fixed';
			}, 0);
		}
		var shareIcons = document.querySelectorAll('.icon-share, .icon-wechat, .icon-weibo, .icon-linkedin, .icon-twitter, .icon-facebook');
		for (var i=0; i < shareIcons.length; i++) {
			var icon = shareIcons[i];
			icon.parentNode.removeChild(icon);
		}
	}
})();