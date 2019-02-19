(function(){
	var pageLoaded = false;
	window.onload = function() {
		pageLoaded = true;
	};
	var uaString = navigator.userAgent || navigator.vendor || '';
   	var isWeChat = (/micromessenger/i.test(uaString));
	setTimeout(function(){
		if (pageLoaded === false && isWeChat) {
			window.stop();
			ga('send', 'event', 'WeChatLoad', 'stop', '', {'nonInteraction':1});
		} else {
			ga('send', 'event', 'WeChatLoad', 'success', '', {'nonInteraction':1});
		}
	}, 10000);
})();