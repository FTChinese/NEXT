/*exported e, ajax*/
function Toggler(rootEl) {
  var toggler = this;
  var togglerBtnAttribute = '[data-o-toggler-button]';
	var togglerTargetAttribute = '[data-o-toggler-target]';

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

function searchRedirect(formEl) {
	if (typeof formEl === 'string') {
		formEl = document.querySelector(formEl);
	}
	if (!formEl) {
		return;
	}
	var searchEl = formEl.querySelector('.search-input');

	var baseUrl = window.location.protocol + '//' + window.location.hostname + '/archiver/';

	var pattern = /^(20\d{2})[-\s\/](0[1-9]|1[012])[-\s\/](0[1-9]|[12][0-9]|3[01])$/;

	formEl.addEventListener('submit', function(e) {	
		var searchValue = searchEl.value;
		var matchedValue = searchValue.match(pattern);

		if (matchedValue) {
			e.preventDefault();
			var archiveDate = matchedValue.slice(1).join('-');
			console.log(archiveDate);

			window.location.assign(baseUrl + archiveDate);
		}
	});	
}

searchRedirect('#search-form');

// callback(error, data)
var ajax = {
	getData: function (url, callback) {
	  var xhr = new XMLHttpRequest();  

	  xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) {
	      if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
	        // var type = xhr.getResponseHeader('Content-Type');
	        // if (type.indexOf('html') !== -1 || xhr.responseXML) {
	        // 	console.log('HTML or XML');
	        //   callback(null, xhr.responseXML);
	        // } else if (type === 'application/json') {
	        //   callback(null, JSON.parse(xhr.responseText));
	        // } else {
	        	// console.log('text');
	          callback(null, xhr.responseText);
	        // }
	      } else {
	        //console.log('Request was unsuccessful: ' + xhr.status);
	        callback(xhr.status);
	      }

	    } else {
	      //console.log('readyState: ' + xhr.readyState);
	    }
	  };

	  xhr.open('GET', url);
	  // xhr.responseType = 'document';
	  xhr.send(null);
	}
};

// Find .nav-sections which are not the currently loaded page and thus have no .nav-items.level-2
function getEmptyNavSections(container) {
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
		if (objA.hasOwnProperty(k) && k in objB) {
			objA[k].appendChild(objB[k]);
		}
	}
}

var navEl = document.querySelector('.o-nav');
new Nav(navEl);

var searchEl = navEl.querySelector('.o-nav__search');
new Toggler(searchEl);

function stringToDOM(str) {
	var tmpEl = document.createElement('ol');
	tmpEl.innerHTML = str;
	var elCollection = {};
	var navSectionEls = tmpEl.querySelectorAll('.nav-section');

// In IE8, `tmpEl.querySelectorAll('.nav-section')`does not work.
// This might be that `querySelector` is not live.
// If it does not work, fallback to `getElementsByTagName`,
// and manually iterate elements and filter by classname. 

	if (navSectionEls.length > 0) {
		for (var k = 0, len = navSectionEls.length; k< len; k++) {

			var navSectionEl = navSectionEls[k];

			var navSectionName = navSectionEl.getAttribute('data-section');
			var navItemsEl = navSectionEl.querySelector('.nav-items');

			elCollection[navSectionName] = navItemsEl;
		}	
	} else {
		var liEls = tmpEl.getElementsByTagName('li');

		for (var i = 0; i < liEls.length; i++) {
			var liEl = liEls[i];
			if (liEl.className.search(/nav-section/) > -1) {
				var sectionName = liEl.getAttribute('data-section');
				var olEls = liEl.getElementsByTagName('ol');
				for(var j = 0; j < olEls.length; j++) {
					var olEl = olEls[j];
					if (olEl.className.search(/nav-items/) !== -1) {
						var navItems = olEl;
						elCollection[sectionName] = navItems;
					}
				}
			}
		}	
	}
	return elCollection;
}

var emptyNavSections = getEmptyNavSections(navEl);

ajax.getData('/m/corp/ajax-nav.html', function(error, data) {
	if (error) {return error;}

	var parsedDOM = stringToDOM(data);

	zipObject(emptyNavSections, parsedDOM);
});