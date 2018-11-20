
/* exported renderAudioData, showHightlight, seekAudio, updateAudioTime*/
var audioCurrentTime;
var audioData = {
	url: '',
	text: [
	]
};
var audioLastSpokenSentenseTime;
var audioHasRendered = false;
var lastIndex = {'k':0, 'l':0, 'isLastSentenseHighlighting': false};
var latestIndex = {'k':0, 'l':0};

function renderAudioData(ele) {
	var exportedJSONString = document.getElementById('audio-json-text').value;
	audioData = JSON.parse(exportedJSONString);
	// MARK: find the start time of last spoken sentense
	audioLastSpokenSentenseTime = findAudioMaxTime(audioData);
	//console.log ('audioLastSpokenSentenseTime: ' + audioLastSpokenSentenseTime);
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
	//console.log ('k: ' + k + ', l: ' + l);
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
	//console.log (ele);
	var section = ele.getAttribute('data-section');
	var row = ele.getAttribute('data-row');
	section = parseInt(section, 10);
	row = parseInt(row, 10);
	showHightlight(section, row);
	var seekAudio = audioData.text[section][row].start;
	//console.log ('seek to: ' + seekAudio);
	if (seekAudio !== null && seekAudio > 0) {
		if (typeof webkit !== 'undefined') {
			webkit.messageHandlers.seekAudio.postMessage(seekAudio);
		} else {
			var currentAudio = document.getElementById('current-audio');
			currentAudio.currentTime = seekAudio;
			if (currentAudio.paused === true) {
				currentAudio.play();
			}
		}
	}
}

function updateAudioTime(ele) {
	audioCurrentTime = ele.currentTime;
	//console.log ('audio current time: ' + audioCurrentTime);
	if (audioHasRendered === true) {
		updateAudioTimeForRenderedText(audioCurrentTime, audioData);
	}
}

// MARK: this will be writen in SWIFT in the native app
function updateAudioTimeForRenderedText(currentTime, data) {
	for (var k=0; k<data.text.length; k++) {
		for (var l=0; l<data.text[k].length; l++) {
			var checkTime = data.text[k][l].start;
			if (checkTime) {
				var isSentenseMiddle = (checkTime>=currentTime);
				var isSentenseLast = (checkTime === audioLastSpokenSentenseTime && checkTime < currentTime);
				if (isSentenseMiddle || isSentenseLast) {
					var lastK = lastIndex.k;
					var lastL = lastIndex.l;
					var shouldHighlightMiddleSentense = ((k !== latestIndex.k || l !== latestIndex.l) && isSentenseMiddle);
					var shouldHighlightLastSentense = (isSentenseLast && lastIndex.isLastSentenseHighlighting === false);
					if (shouldHighlightMiddleSentense || shouldHighlightLastSentense) {
						showHightlight(lastK, lastL);
						latestIndex = {'k':k, 'l':l};
					}
					// MARK: Only when the checkTime is available, update the lastIndex
					lastIndex = {'k':k, 'l':l, 'isLastSentenseHighlighting': isSentenseLast};
					return;
				}
			}
		}
	}
}

function findAudioMaxTime(data) {
	var t;
	for (var k=0; k<data.text.length; k++) {
		for (var l=0; l<data.text[k].length; l++) {
			var checkTime = data.text[k][l].start;
			if (checkTime) {
				t = checkTime;
			}
		}
	}
	return t;
}
