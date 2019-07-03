
/* exported renderAudioData, showHightlight, seekAudio, updateAudioTime, audioEnded, scrubLeft, scrubEle*/
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
var currentAudio = document.getElementById('current-audio');
var playButton = document.querySelector('.control__play');
var pauseButton = document.querySelector('.control__pause');
var currentTimeEle = document.querySelector('.audio-time-text');
var progressBarEle = document.querySelector('.audio-time-progress__fill');
var scrubEle = document.querySelector('.audio-time-progress__scrub');
var progressBarContainer = document.querySelector('.audio-time-progress');
var transformStyle = GetVendorPrefix(['transform', 'msTransform', 'MozTransform', 'WebkitTransform', 'OTransform']);
var progressBarWidth;

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
	if (currentTimeEle) {
		var duration = ele.duration;
		if (audioCurrentTime > 0 && audioCurrentTime < duration) {
			currentTimeEle.innerHTML = getMinuteSecond(audioCurrentTime);
			if (progressBarEle) {
				var currentProgress = audioCurrentTime/duration;
				var scrubLeft = progressBarWidth * currentProgress - scrubEle.offsetWidth/2;
				progressBarEle.style[transformStyle] = 'scaleX(' + currentProgress + ')';
				scrubEle.style.left = scrubLeft + 'px';
				//console.log ('progess bar width: ' +  progressBarWidth + ', scrubLeft: ' + scrubLeft);
				//progressBarEle.style[transformStyle] = 'scaleX(0.5)'
			}
		}
	}
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

function getMinuteSecond(seconds) {
	if (seconds > 0) {
		var s = Math.floor(seconds);
		var secondPart = s % 60;
		if (secondPart < 10)  {
			secondPart = '0' + secondPart;
		}
		var minutePart = Math.floor(s / 60);
		if (minutePart < 10) {
			minutePart = '0' + minutePart;
		}
		//console.log (s + ' is ' + minutePart + ':' + secondPart);
		return minutePart + ':' + secondPart;
	}
	return '00:00';
}

function GetVendorPrefix(arrayOfPrefixes) {
	var tmp = document.createElement('div');
	var result = '';
	for (var i = 0; i < arrayOfPrefixes.length; i++) {
		if (typeof tmp.style[arrayOfPrefixes[i]] !== 'undefined') {
			result = arrayOfPrefixes[i];
			break;
		} else {
			result = null;
		}
	}
	return result;
}

function canPlay(ele) {
	var duration = ele.duration;
	var totalTime = document.querySelector('.audio-time-text__total');
	if (totalTime) {
		totalTime.innerHTML = getMinuteSecond(duration);
	}
}

function playerToggle(ele, action) {
	ele.setAttribute('disabled', true);
	if (action === 'play') {
		currentAudio.play();
		pauseButton.removeAttribute('disabled');
	} else {
		currentAudio.pause();
		playButton.removeAttribute('disabled');
	}
}

function progessBarClick(e) {
	function findLeft(obj) {
	  var curleft = 0;
	  if (obj && obj.offsetParent) {
	    do {
	      curleft += obj.offsetLeft;
	    } while ((obj = obj.offsetParent));
	    return curleft;
	  }
	}
	var clickedX = e.clientX - findLeft(e.target);
	var fullX = e.target.offsetWidth;
	if (clickedX > 0 && fullX > clickedX && currentAudio && currentAudio.duration > 0) {
		var currentProgress = clickedX / fullX; 
		var newTime = currentAudio.duration * currentProgress;
		currentAudio.currentTime = newTime;
		currentAudio.play();
		var scrubLeft = clickedX - scrubEle.offsetWidth/2;
		progressBarEle.style[transformStyle] = 'scaleX(' + currentProgress + ')';
		scrubEle.style.left = scrubLeft + 'px';
		playButton.setAttribute('disabled', true);
		pauseButton.removeAttribute('disabled');
		// console.log (e.target.offsetLeft);
		// console.log (clickedX + '/' + fullX);
		// console.log ('go to: ' + newTime);
	}
}

function initAudioPlayer() {
	if (currentAudio) {
		if (playButton) {
			playButton.onclick = function() {
				playerToggle(this, 'play');
			};
		}
		if (pauseButton) {
			pauseButton.onclick = function() {
				playerToggle(this, 'pause');
			};
		}
		currentAudio.oncanplay = function() {
			canPlay(this);
		};
		if (progressBarContainer) {
			progressBarContainer.addEventListener('click', progessBarClick, false);
			progressBarContainer.addEventListener('mouseover', function() {
				progressBarWidth = progressBarEle.offsetWidth;
				scrubEle.style[transformStyle] = 'scaleX(1)';
			});
			progressBarContainer.addEventListener('mouseout', function() {
				scrubEle.style[transformStyle] = 'scaleX(0)';
			});
		}
		progressBarWidth = progressBarEle.offsetWidth;
		window.addEventListener('resize', function() {
			progressBarWidth = progressBarEle.offsetWidth;
		});
	}
}

initAudioPlayer();


