/* exported e, ajax*/
function Nav(rootEl, config = {navClassName: 'o-nav'}) {
	var oNav = this;

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		//var Delegate = domDelegate.Delegate;
		var rootDelegate = new Delegate(rootEl);

		oNav.delegate = rootDelegate;
		oNav.rootEl = rootEl;

		preventScroll();
		toggle();
		selected();
	}

	function selected() {
		var selectAttribute = '[data-o-nav-selectable]';
		var selectableEls = oNav.rootEl.querySelectorAll(selectAttribute);
		oNav.delegate.on('click', selectAttribute, (e, selectable) => {
			for (let i = 0; i < selectableEls.length; i++) {
				selectableEls[i].setAttribute('aria-selected', 'false');
			}
			selectable.setAttribute('aria-selected', 'true');
		});
	}

	function preventScroll() {
		var navToggle = oNav.rootEl.querySelector('[data-o-nav-togglable]');
// add class name on body when pressed.
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
	        if (type.indexOf('xml') !== -1 && xhr.responseXML) {
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


var navElOffset = getElementOffset(navEl);

console.log(navElOffset);

new Nav(navEl);
new Sticky(navEl, navElOffset.y);

ajax.getData('/ajax.php', function(data) {
	console.log(data);

});

