/* jshint ignore:start */
(function (){

    function clickRegister() {
		var link = this.href;
		var ec = '';
		if (link.indexOf('register')>=0) {
			ec = 'Register';
		} else if (link.indexOf('findpassword')>=0) {
			ec = 'Find Password';
		}
		if (ec !== '') {
			ga('send', 'event', 'Barrier Page', ec, window.FTStoryid);
		}
    }
	if (typeof window.FTStoryid === 'string' && w > 490 && isTouchDevice() === false) {

		var maxStory = 8;
		var storyIdLength = 9;
		var historyDays = 30;
		var unixday=Math.round(new Date().getTime()/1000);
        


        var viewstart=GetCookie ('viewstart') || '';
        var viewhistory = GetCookie('viewhistory') || '';
        var username=GetCookie('USER_NAME') || '';



        if (viewstart === '') {
        	SetCookie('viewstart', unixday);
        } else if (unixday-viewstart >= historyDays * 86400) {
            DeleteCookie ('viewstart');
            DeleteCookie ('viewhistory');
            SetCookie('viewstart',unixday,86400*100,'/');
            viewhistory = '';
        }

        

		if (viewhistory.indexOf(window.FTStoryid) < 0 && username === '') {
			viewhistory += FTStoryid;
			if (viewhistory.length > (maxStory * storyIdLength)) {
				showOverlay('overlay-login');
				document.getElementById('login-reason').innerHTML = '亲爱的读者，您在' + historyDays + '天内连续阅读了' + maxStory + '篇以上文章，如果您喜欢FT中文网，我们诚邀您登录访问或<a href="http://user.ftchinese.com/register/?ccode=1B110427" class=highlight>免费注册</a>为FT中文网的会员。';
				ga('send', 'event', 'Barrier Page', 'Pop Out', window.FTStoryid, {'nonInteraction':1});
				var ele = document.getElementById('overlay-login');
				var form = ele.getElementsByTagName('form')[0];
				form.onsubmit = function () {
					ga('send', 'event', 'Barrier Page', 'Log In', window.FTStoryid);
				};
				var register = ele.getElementsByTagName('a');
				for (var i=0; i<register.length; i++) {
					register[i].onclick = clickRegister;
					if (register[i].href.indexOf('register')>=0) {
						register[i].href = 'http://user.ftchinese.com/register/?ccode=1B110427';
					}
				}
				var closeButton = ele.querySelector('.overlay-close');
				closeButton.onclick = function () {
					ga('send', 'event', 'Barrier Page', 'Click Close Button', window.FTStoryid);
				};
				var overlayBG = ele.querySelector('.overlay-bg');
				overlayBG.onclick = function () {
					ga('send', 'event', 'Barrier Page', 'Click Close BG', window.FTStoryid);
				};
			} else {
				SetCookie('viewhistory', viewhistory);
			}
		}

	}
})();


/* jshint ignore:end */




