/*exported e, ajax*/
function Toggler(rootEl) {
  var toggler = this;
  var togglerBtnAttribute = '[data-o-toggler-button]';
	var togglerTargetAttribute = '[data-o-toggler-target]';

  function init() {
    if (!rootEl) {
      rootEl = document.body;
    }

    var btnEl = rootEl.querySelector(togglerBtnAttribute);
    var targetEl = rootEl.querySelector(togglerTargetAttribute);

    if (!btnEl) { return; }

    toggler.rootEl = rootEl;
    toggler.button = btnEl;
    toggler.target = targetEl;
    toggler.isOpen = false;

    toggler.button.addEventListener('click', handleToggle);
    document.body.addEventListener('click', handleClick);     
    document.body.addEventListener('keydown', handleEsc);     
  }

  function handleToggle() {
    toggler.isOpen = !toggler.isOpen;

    if (toggler.isOpen) {
      toggler.button.setAttribute('aria-expanded', 'true');
      toggler.target.setAttribute('aria-hidden', 'false');
    } else {
      toggler.button.setAttribute('aria-expanded', 'false');
      toggler.target.setAttribute('aria-hidden', 'true');
    }
  }

  function handleEsc(e) {
    if (toggler.isOpen && e.keyCode === 27) {
        handleToggle();
    }
  }

  function handleClick(e) {
    if (toggler.isOpen && !rootEl.contains(e.target)) {
      handleToggle();
    }
  }

  init();
}

function Nav(rootEl) {
	var config = {navClassName: 'o-nav'};
	var oNav = this;

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} 
		var rootDelegate = new Delegate(rootEl);

		oNav.delegate = rootDelegate;
		oNav.rootEl = rootEl;
	}

	function selected() {
		var selectAttribute = '.nav-section-head.mobile';
		var selectableEls = oNav.rootEl.querySelectorAll(selectAttribute);

		oNav.delegate.on('click', selectAttribute, function (e, selectable) {
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

// callback(error, data)
var ajax = {
	getData: function (url, callback) {
	  var xhr = new XMLHttpRequest();  

	  xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
	      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
	        var type = xhr.getResponseHeader('Content-Type');
	        /*if (type.indexOf('html') !== -1 && xhr.responseXML) {
	        	console.log('HTML or XML');
	          callback(null, xhr.responseXML);
	        } else if (type === 'application/json') {
	          callback(null, JSON.parse(xhr.responseText));
	        } else {*/
	          callback(null, xhr.responseText);
	        /*}*/
	      } else {
	        //console.log('Request was unsuccessful: ' + xhr.status);
	        callback(xhr.status);
	      }

	    } else {
	      //console.log('readyState: ' + xhr.readyState);
	    }
	  };

	  xhr.open('GET', url);
	  xhr.send(null);
	}
};

function oNavSections(container) {
	var navSectionClassname = '.nav-section';

	var navSectionEls = container.querySelectorAll(navSectionClassname);
	var navSectionsObj = {};

	for (var i = 0, len = navSectionEls.length; i < len; i++) {
		var navSectionEl = navSectionEls[i];

		var selected = navSectionEl.getAttribute('aria-selected');
		var navSectionName = navSectionEl.getAttribute('data-section');

		if ((!selected) && navSectionName) {
			navSectionsObj[navSectionName] = navSectionEl;
		}
	}
	return navSectionsObj;
}

function zipObject(objA, objB) {
	for (var k in objA) {
		if (!objA.hasOwnProperty(k)) {
			continue;
		}

		if (k in objB) {
			// console.log(k);
			// console.log(objA[k]);

			objA[k].appendChild(objB[k]);
		}	
	}
}

var navEl = document.querySelector('.o-nav');
new Nav(navEl);

var searchEl = navEl.querySelector('.o-nav__search');
new Toggler(searchEl);

var initialNavSections = oNavSections(navEl);

ajax.getData('/m/corp/ajax-nav.html', function(error, data) {

	if (error) {return error;}
	var tmpEl = document.createElement('div');
	tmpEl.innerHTML = data;

	var navSectionEls = tmpEl.querySelectorAll('.nav-section');
	// console.log(data);

	var navSectionsObj = {};

	// console.log('Elements in ajax string: ' + navSectionEls.length);

	for (var i = 0, len = navSectionEls.length; i< len; i++) {

		var navSectionEl = navSectionEls[i];

		var navSectionName = navSectionEl.getAttribute('data-section');
		var navItemsEl = navSectionEl.querySelector('.nav-items');

		navSectionsObj[navSectionName] = navItemsEl;

	}

	zipObject(initialNavSections, navSectionsObj);
});