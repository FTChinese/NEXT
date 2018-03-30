
/* exported renderAudioData, showHightlight */
var audioData;
function renderAudioData(ele) {
	var exportedJSONString = document.getElementById('audio-json-text').value;
	audioData = JSON.parse(exportedJSONString);
	// MARK: render data to html for preview
	var htmlForAudio = '';
	for (var k=0; k<audioData.text.length; k++) {
		htmlForAudio += '<p>';
		for (var l=0; l<audioData.text[k].length; l++) {
			htmlForAudio += '<span id="span-'+k+'-'+l+'" onclick="seekAudio(this)" data-section="'+k+'" data-row="'+l+'">' + audioData.text[k][l].text +'</span>';
		}
		htmlForAudio += '</p>';
	}
	ele.innerHTML = htmlForAudio;
	// MARK: Post JSON Data to Native
	try {
		webkit.messageHandlers.audioData.postMessage(audioData);
	} catch(ignore) {

	}
}

function showHightlight(k, l) {
	var ele = document.getElementById('story-body-container').querySelectorAll('span');
	var highlightedEle = document.getElementById('span-' + k + '-' + l);
	var highlightedTop = highlightedEle.offsetTop;
	var highlightedHeight = highlightedEle.offsetHeight;
	var windowHeight = window.innerHeight;
	var windowTop = window.scrollY;
	var newScrollY = highlightedTop - 5;
	for (var i=0; i<ele.length; i++) {
		var sectionIndex = ele[i].getAttribute('data-section');
		sectionIndex = parseInt(sectionIndex, 10);
		var rowIndex = ele[i].getAttribute('data-row');
		rowIndex = parseInt(rowIndex, 10);
		var currentClass = ele[i].className;
		var newClass;
		if (sectionIndex === k && rowIndex === l) {
			newClass = 'is-current';
		} else {
			newClass = '';
		}
		if (newClass !== currentClass) {
			ele[i].className = newClass;
		}
	}
	if (windowTop > newScrollY || windowTop + windowHeight < highlightedTop + highlightedHeight) {
		if (typeof webkit !== 'undefined') {
			webkit.messageHandlers.scrollTo.postMessage(newScrollY);
		} else {
			window.scrollTo({'behavior': 'smooth', 'top': newScrollY});
		}
	}
}

function seekAudio(ele) {
	var section = ele.getAttribute('data-section');
	var row = ele.getAttribute('data-row');
	section = parseInt(section, 10);
	row = parseInt(row, 10);
	showHightlight(section, row);
	var seekAudio = audioData.text[section][row].start;
	console.log ('seek to: ' + seekAudio);
	if (seekAudio !== null && seekAudio > 0) {
		if (typeof webkit !== 'undefined') {
			webkit.messageHandlers.seekAudio.postMessage(seekAudio);
		} else {
			var currentAudio = document.getElementById('current-audio');
			currentAudio.currentTime = seekAudio
		}
	}
}