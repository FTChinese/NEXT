function trackClicks() {
	if (typeof window.gPageId === 'string') {
		var sections = document.querySelectorAll('.block-container');
		for (var i=0; i<sections.length; i++) {
			var lists = sections[i].querySelectorAll('.list-container');
			var side = sections[i].querySelector('.side-container');
			for (var j=0; j<lists.length; j++) {
				var items = lists[j].querySelectorAll('.item-container');
				for (var k=0; k<items.length; k++) {
					var links = items[k].querySelectorAll('a');
					for (var l=0; l<links.length; l++) {
						links[l].setAttribute('data-ec', 'Click');
						links[l].setAttribute('data-ea', window.gPageId);
						links[l].setAttribute('data-el', 'Block'+i+'-List'+j+'-Item'+k);
					}
				}

			}
			if (side !== null) {
				var sideLists = side.querySelectorAll('.links-container, .interactives, .vidoes, .mps');
				for (var m=0; m<sideLists.length; m++) {
					var sideItems = sideLists[m].querySelectorAll('.item-container, li, .links a');
					for (var n=0; n<sideItems.length; n++) {
						var sideLinks;
						if (sideItems[n].tagName === 'A') {
							sideItems[n].setAttribute('data-ec', 'Click');
							sideItems[n].setAttribute('data-ea', window.gPageId);
							sideItems[n].setAttribute('data-el', 'Side'+i+'-List'+m+'-Item'+n);
						} else {
							sideLinks = sideItems[n].querySelectorAll('a');
							for (var p=0; p<sideLinks.length; p++) {
								sideLinks[p].setAttribute('data-ec', 'Click');
								sideLinks[p].setAttribute('data-ea', window.gPageId);
								sideLinks[p].setAttribute('data-el', 'Side'+i+'-List'+m+'-Item'+n);
							}
						}
					}
				}
			}
		}
	}
}
trackClicks();