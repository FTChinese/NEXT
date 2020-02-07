(function(){
	if (location.hostname === 'www.chineseft.com') {
		var userId = GetCookie('USER_ID');
		if (userId === null) {
			setTimeout(function(){
				showOverlay('overlay-login');
				document.querySelector('.overlay-close').style.display = 'none';
				var overlayBG = document.querySelector('.overlay-bg');
				overlayBG.className = 'overlay-bg-fixed';
			}, 0);
		}
	}	
})();