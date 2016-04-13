/*exported e, ajax*/
function Nav(rootEl) {
	var config = {navClassName: 'o-nav'}
	var oNav = this;

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		var rootDelegate = new Delegate(rootEl);

		oNav.delegate = rootDelegate;
		oNav.rootEl = rootEl;
	}

	function selected() {
		var selectAttribute = '[data-o-nav-selectable]';
		oNav.delegate.on('click', selectAttribute, function (e, selectable) {
// This line must be put here, inside the click event.
// Since we use ajax to establish new nav element, `button.nav-section-head`s will be completely different ones when clicked.
// But this way might consume more memory.
			var selectableEls = oNav.rootEl.querySelectorAll(selectAttribute);

			console.log(e.target == selectableEls[0]);

			for (var i = 0; i < selectableEls.length; i++) {
				selectableEls[i].setAttribute('aria-selected', 'false');
			}
			selectable.setAttribute('aria-selected', 'true');
		});
	}

	function preventScroll() {
		var navToggle = oNav.rootEl.querySelector('[data-o-nav-togglable]');
		var navOpenClass = config.navClassName + '--open';

		if (navToggle) {
			navToggle.addEventListener('click', function() {
				document.documentElement.classList.toggle(navOpenClass);
				document.body.classList.toggle(navOpenClass);
			});
		}
	}

	function toggle() {
		var toggleAttribute = '[data-o-nav-togglable]';

		oNav.delegate.on('click', toggleAttribute, function (e, togglerEl) {
			var togglerElState = togglerEl.getAttribute('aria-pressed');

			if (togglerElState === 'true') {
				togglerEl.setAttribute('aria-pressed', 'false');
			} else if (togglerElState === 'false' || !togglerElState) {
				togglerEl.setAttribute('aria-pressed', 'true');
			}
		});
	}
	
	init();
	preventScroll();
	toggle();
	selected();
}

function Sticky(fixedEl, startDistance, endDistance) {
	var oSticky = this;
	var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000/60); };


	function init() {	
		oSticky.lastPosition = -1;
		if (!startDistance) {
			startDistance = 0;
		}
		oSticky.start = startDistance;
		oSticky.end = endDistance;
		if (!(fixedEl instanceof HTMLElement)) {
			fixedEl = document.querySelector(fixedEl);
		}
		oSticky.fixedEl = fixedEl;
	}

	function loop(){
	    // Avoid calculations if not needed
	    var scrollY = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

	    if (oSticky.lastPosition === scrollY) {
	        rAF(loop);
	        return false;
	    } else {
	    	oSticky.lastPosition = scrollY;
	    }

	    var withinRange = oSticky.end ? ((oSticky.lastPosition > oSticky.start) && (oSticky.lastPosition < oSticky.end)) : (oSticky.lastPosition > oSticky.start);

	    if (withinRange) {
	    	oSticky.fixedEl.setAttribute('aria-sticky', 'true');
	    } else {
	    	oSticky.fixedEl.removeAttribute('aria-sticky', 'false');
	    }

	    rAF( loop );
	}
	init();
	loop();
}

function getElementOffset(e) {

	function getPageOffset(w) {
		w = w || window;
		var x = (w.pageXOffset !== undefined) ? w.pageXOffset : (document.documentElement || document.body.parentNode || document.body).scrollLeft;
		var y = (w.pageYOffset !== undefined) ? w.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
		return {x: x, y: y};
	}

	if (!(e instanceof HTMLElement)) {
		e = document.querySelector(e);
	}
	var box = e.getBoundingClientRect();
	var offset = getPageOffset();
	var x = box.left + offset.x;
	var y = box.top + offset.y;

	return {x: x, y: y};
}

var ajax = {
	getData: function (url, callback) {
	  var xhr = new XMLHttpRequest();  

	  xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
	      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
	        var type = xhr.getResponseHeader('Content-Type');
	        if (type.indexOf('html') !== -1 && xhr.responseXML) {
	          callback(xhr.responseXML);
	        } else if (type === 'application/json') {
	          callback(JSON.parse(xhr.responseText));
	        } else {
	          callback(xhr.responseText);
	        }
	      } else {
	        console.log('Request was unsuccessful: ' + xhr.status);
	      }

	    } else {
	      console.log('readyState: ' + xhr.readyState);
	    }
	  };

	  xhr.onprogress = function(event) {
	    console.log('Request Progress: Received ' + event.loaded / 1000 + 'kb, Total' + event.total / 1000 + 'kb');
	  };
	  xhr.open('GET', url);
	  xhr.send(null);
	}
};

var navEl = document.querySelector('.o-nav');
var navContainerEl = navEl.querySelector('.o-nav__container');
var navItemsContainerEl = navContainerEl.querySelector('.o-nav__level-1');

console.log(navContainerEl);
console.log(navItemsContainerEl);

var navElOffset = getElementOffset(navEl);

console.log(navElOffset);

new Nav(navEl);
new Sticky(navEl, navElOffset.y);

ajax.getData('/ajax.php', function(data) {
// data is text, not DOM! 
// You need to parse data into DOM before appending it.
// But string to DOM conversion is hard in browser.
	var div = document.createElement('div');
	div.innerHTML = data;
// Then we can use DOM to manipulate
	var newNavItems = div.querySelector('.o-nav__level-1');
	navContainerEl.replaceChild(newNavItems, navItemsContainerEl);
	//new Nav(navEl);
});

