
/* exported renderAudioData, showHightlight, seekAudio, updateAudioTime, audioEnded*/
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
	var audioJSONEle = document.getElementById('audio-json-text');
	if (audioJSONEle) {
		var exportedJSONString = audioJSONEle.value;
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
		handleInlineVideos(ele);
		// MARK: Post JSON Data to Native
		try {
			webkit.messageHandlers.audioData.postMessage(audioData);
		} catch(ignore) {

		}
	}
}

function handleInlineVideos(ele) {
	//<div class='o-responsive-video-container'><div class='o-responsive-video-wrapper-outer'><div class='o-responsive-video-wrapper-inner'><script src='http://union.bokecc.com/player?vid=6358D162C6D0874A9C33DC5901307461&siteid=922662811F1A49E9&autoStart=false&width=100%&height=100%&playerid=3571A3BF2AEC8829&playertype=1'></script></div></div><a class='o-responsive-video-caption' href='/video/3009" vsource="' target='_blank'>中国科技巨头财富缩水的背后</a></div>
	//console.log (ele.innerHTML);
	var inlineVideos = ele.querySelectorAll('.inlinevideo');
	for (var i=0; i<inlineVideos.length; i++) {
		var thisVideo = inlineVideos[i];
		var w = thisVideo.offsetWidth || window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var h = parseInt(w*9/16, 10);
		var ccVideoId = thisVideo.id || '';
		var ftcVideoId = thisVideo.getAttribute('vid') || '';
		var title = thisVideo.getAttribute('title') || '';
		var videoSrc = '';
		var videoHTML = '';
		if (ccVideoId !== '') {
			videoSrc = 'https://p.bokecc.com/playhtml.bo?vid='+ccVideoId+'&siteid=922662811F1A49E9&autoStart=false&playerid=3571A3BF2AEC8829&playertype=1';
		} else if (ftcVideoId !== '') {
			videoSrc = '/video/'+ftcVideoId+'?i=2&w='+w+'&h='+h+'&autostart=false';
		}
		if (videoSrc !== '') {
			videoHTML = '<div class="o-responsive-video-wrapper-outer"><div class="o-responsive-video-wrapper-inner"><iframe src="' + videoSrc + '" frameborder="0" style="width:100%;height:100%;" allowfullscreen="true"></iframe></div></div>';
		}
		var titleHTML = '';
		if (title !== '') {
			if (ftcVideoId !== '') {
				titleHTML = '<a class="o-responsive-video-caption" href="/video/'+ftcVideoId+'" target="_blank">' + title + '</a>';
			} else {
				titleHTML = '<div class="o-responsive-video-caption">' + title + '</div>';
			}
		}
		thisVideo.className = 'o-responsive-video-container';
		thisVideo.innerHTML = '<div class="o-responsive-video-wrapper-outer"><div class="o-responsive-video-wrapper-inner"><iframe src="https://p.bokecc.com/playhtml.bo?vid='+ccVideoId+'&siteid=922662811F1A49E9&autoStart=false&playerid=3571A3BF2AEC8829&playertype=1" frameborder="0" style="width:100%;height:100%;" allowfullscreen="true"></iframe></div></div>' + titleHTML;
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
		var addedClass = ' is-current';
		if (sectionIndex === k && rowIndex === l) {
			newClass = (currentClass.indexOf(addedClass) >= 0) ? currentClass : currentClass + addedClass;
		} else {
			newClass = currentClass.replace(addedClass, '');
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

function audioEnded() {
	var highlightedSpans = document.getElementById('story-body-container').querySelectorAll('span.is-current');
	for (var i=0; i<highlightedSpans.length; i++) {
		highlightedSpans[i].className = '';
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
