function Header(rootEl, config = {headerClassName: 'o-header'}) {
	var oHeader = this;

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		var Delegate = domDelegate.Delegate
		var rootDelegate = new Delegate(rootEl);

		oHeader.delegate = rootDelegate;
		oHeader.rootEl = rootEl;

		preventScroll();
		toggle();
		selected();
	}

	function selected() {
		var selectAttribute = '[data-o-header-selectable]';
		var selectableEls = oHeader.rootEl.querySelectorAll(selectAttribute);

		oHeader.delegate.on('click', selectAttribute, (e, selectable) => {
			for (let i = 0; i < selectableEls.length; i++) {
				selectableEls[i].setAttribute('aria-selected', 'false');
			}
			selectable.setAttribute('aria-selected', 'true');
		});
	}

	function preventScroll() {
		var navToggle = oHeader.rootEl.querySelector('[data-o-header-togglable-nav]');
// add class name on body when pressed.
		var navOpenClass = config.headerClassName + '--nav-open';

		if (navToggle) {
			navToggle.addEventListener('click', function(e) {
				document.documentElement.classList.toggle(navOpenClass);
				document.body.classList.toggle(navOpenClass);
			});
		}
	}

	function toggle() {
		var toggleAttribute = '[data-o-header-togglable]';

		oHeader.delegate.on('click', toggleAttribute, (e, togglerEl) => {
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
	var rAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback){ window.setTimeout(callback, 1000/60) }


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

	    if (oSticky.lastPosition == scrollY) {
	        rAF(loop);
	        return false;
	    } else {
	    	oSticky.lastPosition = scrollY;
	    }

	    var withinRange = oSticky.end ? ((oSticky.lastPosition > oSticky.start) && (oSticky.lastPosition < oSticky.end)) : (oSticky.lastPosition > oSticky.start);

	    if (withinRange) {
	    	oSticky.fixedEl.setAttribute('aria-sticky', 'true');
	    	document.body.classList.add('o-header--nav-sticky');
	    } else {
	    	oSticky.fixedEl.removeAttribute('aria-sticky', 'false');
	    	document.body.classList.remove('o-header--nav-sticky');
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

var headerEl = document.querySelector('.o-header');
var headerNavEl = headerEl.querySelector('.o-header__nav');
var headerSecondaryEl = headerEl.querySelector('.o-header__secondary');
var headerSecondaryElOffset = getElementOffset(headerSecondaryEl);
console.log(headerSecondaryElOffset);

new Header(headerEl);
new Sticky(headerSecondaryEl, headerSecondaryElOffset.y);

