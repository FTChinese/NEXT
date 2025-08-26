
/* exported renderAudioData, showHightlight, seekAudio, updateAudioTime, audioEnded*/
var audioCurrentTime;
var audioData = {
	url: '',
	text: [
	]
};
var audioLastSpokenSentenseTime;
var audioHasRendered = false;
var currentAudio = document.getElementById('current-audio');
var playButton = document.querySelector('.control__play');
var pauseButton = document.querySelector('.control__pause');
var currentTimeEle = document.querySelector('.audio-time-text');
var totalTimeEle = document.querySelector('.audio-time-text__total');
var progressBarEle = document.querySelector('.audio-time-progress__fill');
var scrubEle = document.querySelector('.audio-time-progress__scrub');
var progressBarContainer = document.querySelector('.audio-time-progress');
var transformStyle = GetVendorPrefix(['transform', 'msTransform', 'MozTransform', 'WebkitTransform', 'OTransform']);
var progressBarWidth;
var isProgressTouched = false;

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
				var t = audioData.text[k][l].text.replace(/<strong>([^<]+)$/g, '<strong>$1</strong>').replace(/^<\/strong>/g, '');
				audioData.text[k][l].text = t;
				htmlForAudio += '<span id="span-'+k+'-'+l+'" onclick="seekAudio(this)" data-section="'+k+'" data-row="'+l+'">' + t +'</span>';
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
}



function showHightlight(k, l) {
	function findTop(obj) {
	  var curtop = 0;
	  if (obj && obj.offsetParent) {
	    do {
	      curtop += obj.offsetTop;
	    } while ((obj = obj.offsetParent));
	    return curtop;
	  }
	}
	var ele = document.getElementById('story-body-container').querySelectorAll('span');
	var highlightedEle = document.getElementById('span-' + k + '-' + l);
	//var highlightedTop = highlightedEle.offsetTop;
	var highlightedTop = findTop(highlightedEle);
	var highlightedHeight = highlightedEle.offsetHeight;
	var windowHeight = window.innerHeight;
	var windowTop = window.scrollY;
	var newScrollY = highlightedTop - 5;
	var headerEle = document.querySelector('header');
	var bottomFixedHeight = 0;
	if (headerEle) {
		newScrollY -= 136;
	}
	if (document.documentElement.className.indexOf('is-ftc-app')>=0 && currentAudio) {
		bottomFixedHeight = 44;
	}
	//console.log (bottomFixedHeight);
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
	if (windowTop > newScrollY || windowTop + windowHeight < highlightedTop + highlightedHeight + bottomFixedHeight) {
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
			if (progressBarEle) {
				var currentProgress = audioCurrentTime/duration;
				var scrubLeft = progressBarWidth * currentProgress - scrubEle.offsetWidth/2;
				progressBarEle.style[transformStyle] = 'scaleX(' + currentProgress + ')';
				if (isProgressTouched === false) {
					scrubEle.style.left = scrubLeft + 'px';
				}
				//console.log ('progess bar width: ' +  progressBarWidth + ', scrubLeft: ' + scrubLeft);
				//progressBarEle.style[transformStyle] = 'scaleX(0.5)'
			}
			currentTimeEle.innerHTML = getMinuteSecond(audioCurrentTime);
			totalTimeEle.innerHTML = getMinuteSecond(duration);
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


// MARK: Use global variables so that you can fire showHightlight function only when necessary
var lastIndex = {k:0, l:0, isLastSentenseHighlighting: false};
var latestIndex = {k:0, l:0};
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
						if (shouldHighlightLastSentense) {
							showHightlight(k, l);
							// lastIndex = {'k':k, 'l':l, 'isLastSentenseHighlighting': true};
							// console.log ('is sentense last 1? ' + isSentenseLast);
							// console.log ('current time: ' + currentTime + ', k: ' + k + ', l: ' + l);
						} else {
							showHightlight(lastK, lastL);
							//console.log ('current time: ' + currentTime + ', lastK: ' + lastK + ', lastL: ' + lastL);
						}
						latestIndex = {'k':k, 'l':l};
					}
					return;
				}
				// MARK: Only when the checkTime is available, update the lastIndex
				// console.log ('check time: ' + checkTime + ', audio last spoken sentense time: ' + audioLastSpokenSentenseTime + ' current time: ' + currentTime);
				lastIndex = {'k':k, 'l':l, 'isLastSentenseHighlighting': isSentenseLast};
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

function updateTotalTime() {
	var duration = currentAudio.duration;
	if (totalTimeEle) {
		totalTimeEle.innerHTML = getMinuteSecond(duration);
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


function findLeft(obj) {
  var curleft = 0;
  if (obj && obj.offsetParent) {
    do {
      curleft += obj.offsetLeft;
    } while ((obj = obj.offsetParent));
    return curleft;
  }
}

function progessBarClick(e) {
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

function progressTouchStart(e) {
	isProgressTouched = true; 
	scrubEle.style[transformStyle] = 'scaleX(1)';
	progressTouchMove(e);
	e.preventDefault();
}

function progressTouchMove(e) {
	if (isProgressTouched === false) {
		return;
	}
	var clickedX = e.changedTouches[0].clientX - findLeft(e.target);
	var fullX = e.target.offsetWidth;
	if (clickedX > 0 && fullX > clickedX && currentAudio && currentAudio.duration > 0) {
		var scrubLeft = clickedX - scrubEle.offsetWidth/2;
		scrubEle.style.left = scrubLeft + 'px';
	}
	//e.preventDefault();
}

function progressTouchEnd(e) {
	console.log ('touche end fired! ');
	if (isProgressTouched === false) {
		return;
	}
	isProgressTouched = false; 
	var clickedX = e.changedTouches[0].clientX - findLeft(e.target);
	var fullX = e.target.offsetWidth;
	clickedX = Math.min(Math.max(clickedX, 0), fullX);
	if (clickedX >= 0 && fullX >= clickedX && currentAudio && currentAudio.duration >= 0) {
		var currentProgress = clickedX / fullX; 
		var newTime = currentAudio.duration * currentProgress;
		var scrubLeft = clickedX - scrubEle.offsetWidth/2;
		scrubEle.style.left = scrubLeft + 'px';
		progressBarEle.style[transformStyle] = 'scaleX(' + currentProgress + ')';
		currentAudio.currentTime = newTime;
	}
	scrubEle.style[transformStyle] = 'scaleX(0)';
	e.preventDefault();
}


function progressTouchCancel(e) {
	if (isProgressTouched === false) {
		return;
	}
	isProgressTouched = false; 
	scrubEle.style[transformStyle] = 'scaleX(0)';
	e.preventDefault();
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
			updateTotalTime();
		};
		currentAudio.ondurationchange = function() {
			updateTotalTime();
		};
		currentAudio.addEventListener('loadedmetadata',function(){
		    updateTotalTime();
		},false);
		currentAudio.onplay = function() {
			updateTotalTime();
			pauseButton.removeAttribute('disabled');
			playButton.setAttribute('disabled', true);
		};
		currentAudio.onpause = function() {
			updateTotalTime();
			playButton.removeAttribute('disabled');
			pauseButton.setAttribute('disabled', true);
		};
		if (progressBarContainer) {
			if (isTouchDevice()) {
				progressBarContainer.addEventListener('touchstart', progressTouchStart, false);
				window.addEventListener('touchmove', progressTouchMove, false);
				window.addEventListener('touchend', progressTouchEnd, false);
				window.addEventListener('touchcancel', progressTouchCancel, false);
			} else {
				progressBarContainer.addEventListener('click', progessBarClick, false);
				progressBarContainer.addEventListener('mouseover', function() {
					progressBarWidth = progressBarEle.offsetWidth;
					scrubEle.style[transformStyle] = 'scaleX(1)';
				});
				progressBarContainer.addEventListener('mouseout', function() {
					scrubEle.style[transformStyle] = 'scaleX(0)';
				});
			}
		}
		progressBarWidth = progressBarEle.offsetWidth;
		window.addEventListener('resize', function() {
			progressBarWidth = progressBarEle.offsetWidth;
		});
		// MARK: - If audio is available on a mobile web page, hide the promo box. 
		var promoBoxEle = document.querySelector('.subscription-promo-container');
		if (promoBoxEle && promoBoxEle.classList) {
			promoBoxEle.classList.remove('show-image-in-mobile');
		}
	}
}

initAudioPlayer();


