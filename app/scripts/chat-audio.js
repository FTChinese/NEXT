/* jshint ignore:start */

const transformStyle = GetVendorPrefix(['transform', 'msTransform', 'MozTransform', 'WebkitTransform', 'OTransform']);


delegate.on('click', '.audio-control.control__play', async (event) => {
    const ele = event.target;
    ele.setAttribute('disabled', true);
    var currentAudio = ele.closest('.audio-container').querySelector('audio');
    currentAudio.play();
    ele.closest('.audio-container').querySelector('.audio-control.control__pause').removeAttribute('disabled');
});

delegate.on('click', '.audio-control.control__pause', async (event) => {
    const ele = event.target;
    ele.setAttribute('disabled', true);
    var currentAudio = ele.closest('.audio-container').querySelector('audio');
    currentAudio.pause();
    ele.closest('.audio-container').querySelector('.audio-control.control__play').removeAttribute('disabled');
});

delegate.on('click', '.audio-time-progress', async (e) => {
    const ele = e.target;
    var currentAudio = ele.closest('.audio-container').querySelector('audio');
    var progressBarEle = ele.closest('.audio-container').querySelector('.audio-time-progress__fill');
    var scrubEle = ele.closest('.audio-container').querySelector('.audio-time-progress__scrub');
    var playButton = ele.closest('.audio-container').querySelector('.audio-control.control__play');
    var pauseButton = ele.closest('.audio-container').querySelector('.audio-control.control__pause');
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
});

delegate.on('mouseover', '.audio-time-progress', async (e) => {
    const ele = e.target;
    var scrubEle = ele.closest('.audio-container').querySelector('.audio-time-progress__scrub');
    scrubEle.style[transformStyle] = 'scaleX(1)';
});

delegate.on('mouseout', '.audio-time-progress', async (e) => {
    const ele = e.target;
    var scrubEle = ele.closest('.audio-container').querySelector('.audio-time-progress__scrub');
    scrubEle.style[transformStyle] = 'scaleX(0)';
});

// TODO: Support touch devices for play progress seeking

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

function findLeft(obj) {
    var curleft = 0;
    if (obj && obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
      } while ((obj = obj.offsetParent));
      return curleft;
    }
}

function updateAudioTime(ele) {
	const audioCurrentTime = ele.currentTime;
	// console.log ('audio current time: ' + audioCurrentTime);
    var currentTimeEle = ele.closest('.audio-container').querySelector('.audio-time-text');
	var totalTimeEle = ele.closest('.audio-container').querySelector('.audio-time-text__total');
    if (currentTimeEle) {
		var duration = ele.duration;
		if (audioCurrentTime > 0 && audioCurrentTime < duration) {
            var progressBarEle = ele.closest('.audio-container').querySelector('.audio-time-progress__fill');
            var scrubEle = ele.closest('.audio-container').querySelector('.audio-time-progress__scrub');
			if (progressBarEle) {
                const progressBarWidth = progressBarEle.offsetWidth;
				var currentProgress = audioCurrentTime/duration;
				var scrubLeft = progressBarWidth * currentProgress - scrubEle.offsetWidth/2;
				progressBarEle.style[transformStyle] = 'scaleX(' + currentProgress + ')';
				scrubEle.style.left = scrubLeft + 'px';
			}
			currentTimeEle.innerHTML = getMinuteSecond(audioCurrentTime);
			totalTimeEle.innerHTML = getMinuteSecond(duration);
		}
	}
}

function updateTotalTime(ele) {
    var currentAudio = ele.closest('.audio-container').querySelector('audio');
	var duration = currentAudio.duration;
    var totalTimeEle = ele.closest('.audio-container').querySelector('.audio-time-text__total');
	if (totalTimeEle) {
		totalTimeEle.innerHTML = getMinuteSecond(duration);
	}
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

/* jshint ignore:end */