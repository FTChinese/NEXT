/* jshint ignore:start */
(function (){

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createElement(name, attributes) {
	var node = document.createElement(name);
	if (attributes) {
		for (var attr in attributes) {
			if (attributes.hasOwnProperty(attr)) {
				node.setAttribute(attr, attributes[attr]);
			}
		}
	}

	for (var i = 2; i < arguments.length; i++) {
		var child = arguments[i];
		if (typeof child == 'string') {
			child = document.createTextNode(child);
		}
		node.appendChild(child);
	}
	return node;
}

function createBarrier(id, commonClass, message) {
	var registerElt = createElement('a', {
		'href': 'http://user.ftchinese.com/register/?ccode=1B110427',
		'class': 'o-register'
	}, '免费注册');
	var loginElt = createElement('a', {
		'href': 'http://user.ftchinese.com/login',
		'class': 'o-login'
	}, '登录');

	var actionWrapper = createElement('div', {
		'class': 'o-barrier__action'
	}, registerElt, loginElt);
	var messageElt = createElement('p', {
		'class': 'o-barrier__message'
	}, '亲爱的读者，您在30天内连续阅读了8篇以上文章，如果您喜欢FT中文网，我们诚邀您登录访问或免费注册为FT中文网的会员。');
	var closeElt = createElement('button', {
		'class': 'o-barrier__close'
	}, '阅读完本文以后再注册或登录');

	var barrierWrapper = createElement('div', {
		'class': 'o-barrier__wrapper'
	}, messageElt, actionWrapper, closeElt);

	var barrierElt = createElement('div', {
		'class': 'o-barrier',
		'id': id
	}, barrierWrapper);

	return barrierElt;
}

function recordAction(type, category) {
	try {
		ga('send', 'event', type, category, window.FTStoryid);
	} catch(err) {
		console.log('send', 'event', type, category)
	}
}

function barrierOnBottom(className) {
	if (className.indexOf('--bottom') === -1) {
		return false
	}
	return true;
}

function goToBottom(elm) {
	var oldClassName = elm.className;
	if (!barrierOnBottom(oldClassName)) {
		elm.className = oldClassName + ' ' + oldClassName + '--bottom';
		var msgElm = elm.querySelector('.o-barrier__message');
		msgElm.innerHTML = '欢迎来到FT中文网，我们诚邀您登录访问或免费注册为FT中文网会员。';		
	}
}

function abTest() {
	const rand = getRandomIntInclusive(0, 1);
	// console.log('rand number: ', rand);

	const barrierNew = createBarrier('barrier-new');

	document.body.appendChild(barrierNew);
// Use event delegation on the outermost element.
// set up a map of element to action performed so taht we do not need to traverse the dom.
// use e.target to capture the element click, then use the element's class or id as the map's key.
	const oBarrierInstances = [
		{
			elt: barrierNew,
			type: 'Barrier Page New',
			events: {
				'o-barrier': function(e, type) {
					// console.log(barrierOnBottom(e.currentTarget.className))
					if (!barrierOnBottom(e.currentTarget.className)) {
						goToBottom(e.currentTarget)
						recordAction(type, 'Click Close BG');
					}
				},

				'o-barrier__close': function(e, type) {
					if (!barrierOnBottom(e.currentTarget.className)) {
						goToBottom(e.currentTarget);
						recordAction(type, 'Click Close Button');
					}
				},

				'o-register': function(e, type) {
					// e.preventDefault();
					if (barrierOnBottom(e.currentTarget.className)) {
						recordAction(type + ' bottom', 'Register');
					} else {
						recordAction(type, 'Register');
					}
					// console.log('clicked register', type);
				},

				'o-login': function(e, type) {
					if (barrierOnBottom(e.currentTarget.className)) {
						recordAction(type + ' bottom', 'Log In');
					} else {
						recordAction(type, 'Log In');
					}
					// console.log('clicked login', type);
				}			
			}
		},
		{
			elt: document.getElementById('overlay-login'),
			type: 'Barrier Page',
			events: {
				'register': function(e, type) {
					recordAction(type, 'Register');
				},

				'findPassword': function(e, type) {
					recordAction(type, 'Find Password');
				},

				'logIn': function(e, type) {
					recordAction(type, 'Log In');
				},

				'overlay-close': function(e, type) {
					closeOverlay(e.currentTarget.id);
					recordAction(type, 'Click Close Button');
				},

				'overlay-bg': function(e, type) {
					closeOverlay(e.currentTarget.id);
					recordAction(type, 'Click Close BG');
				}
			}
		}
	];

	const barrierType = oBarrierInstances[rand].type;
	const barrierElt = oBarrierInstances[rand].elt;
	const barrierEvents = oBarrierInstances[rand].events;

	if (rand === 0) {
		barrierElt.style.display = 'block';
		try {
			ga('send', 'event', barrierType, 'Pop Out', window.FTStoryid, {'nonInteraction':1});
		} catch(err) {
			console.log('send', 'event', barrierType,  'Pop Out');
		}

		barrierElt.onclick = function(e) {
			e.preventDefault();
			const eventKey = e.target.className;
			// console.log('clicked element className: ', eventKey);

			if (barrierEvents[eventKey]) {
				barrierEvents[eventKey](e, barrierType);
			}
		};	
	} else if (rand === 1) {
		showOverlay('overlay-login');
		const msgElt = document.getElementById('login-reason');
		msgElt.innerHTML = '亲爱的读者，您在' + historyDays + '天内连续阅读了' + maxStory + '篇以上文章，如果您喜欢FT中文网，我们诚邀您登录访问或<a href="http://user.ftchinese.com/register/?ccode=1B110427" class=highlight>免费注册</a>为FT中文网的会员。';
		
		try {
			ga('send', 'event', barrierType, 'Pop Out', window.FTStoryid, {'nonInteraction':1});
		} catch(err) {
			console.log('send', 'event', barrierType,  'Pop Out');
		}

		barrierElt.onclick = function(e) {
			// e.preventDefault();
			const target = e.target
			const className = target.className;
			const tagName = target.tagName.toLowerCase();
			var eventKey = '';

			if (tagName === 'a') {

				if (target.href.indexOf('register') !== -1) {
					target.href = 'http://user.ftchinese.com/register/?ccode=1B110427'
					eventKey = 'register';
				} else if (target.href.indexOf('findpassword') !== -1) {
					eventKey = 'findPassword';
				}
			} else {
				eventKey = className;
			}

			// console.log(eventKey);

			if (barrierEvents[eventKey]) {
				barrierEvents[eventKey](e, barrierType);
			}
		};

		barrierElt.getElementsByTagName('form')[0].onsubmit = function(e) {
			const eventKey = 'logIn';

			if (barrierEvents[eventKey]) {
				barrierEvents[eventKey](e, barrierType);
			}
		}
	}	
}
  //   function clickRegister() {
		// var link = this.href;
		// var ec = '';
		// if (link.indexOf('register')>=0) {
		// 	ec = 'Register';
		// } else if (link.indexOf('findpassword')>=0) {
		// 	ec = 'Find Password';
		// }
		// if (ec !== '') {
		// 	ga('send', 'event', 'Barrier Page', ec, window.FTStoryid);
		// }
  //   }
	if (typeof window.FTStoryid === 'string' && w > 490 && isTouchDevice() === false) {

		var maxStory = 8;
		// var maxStory = 1;
		var storyIdLength = 9;
		var historyDays = 30;
		var unixday=Math.round(new Date().getTime()/1000);
        
    var viewstart=GetCookie ('viewstart') || unixday;
    var viewhistory = GetCookie('viewhistory') || '';
    var username=GetCookie('USER_NAME') || '';

    viewstart = parseInt(viewstart, 10);

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

				abTest();
				// showOverlay('overlay-login');
				// document.getElementById('login-reason').innerHTML = '亲爱的读者，您在' + historyDays + '天内连续阅读了' + maxStory + '篇以上文章，如果您喜欢FT中文网，我们诚邀您登录访问或<a href="http://user.ftchinese.com/register/?ccode=1B110427" class=highlight>免费注册</a>为FT中文网的会员。';
				// ga('send', 'event', 'Barrier Page', 'Pop Out', window.FTStoryid, {'nonInteraction':1});
				// var ele = document.getElementById('overlay-login');
				// var form = ele.getElementsByTagName('form')[0];
				// form.onsubmit = function () {
				// 	ga('send', 'event', 'Barrier Page', 'Log In', window.FTStoryid);
				// };
				// var register = ele.getElementsByTagName('a');
				// for (var i=0; i<register.length; i++) {
				// 	register[i].onclick = clickRegister;
				// 	if (register[i].href.indexOf('register')>=0) {
				// 		register[i].href = 'http://user.ftchinese.com/register/?ccode=1B110427';
				// 	}
				// }
				// var closeButton = ele.querySelector('.overlay-close');
				// closeButton.onclick = function () {
				// 	ga('send', 'event', 'Barrier Page', 'Click Close Button', window.FTStoryid);
				// };
				// var overlayBG = ele.querySelector('.overlay-bg');
				// overlayBG.onclick = function () {
				// 	ga('send', 'event', 'Barrier Page', 'Click Close BG', window.FTStoryid);
				// };
			} else {
				SetCookie('viewhistory', viewhistory);
			}
		}

	}
})();


/* jshint ignore:end */




