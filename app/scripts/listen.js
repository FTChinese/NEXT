/* exported listenToStory, showListenButton, listenToSpeedRead */
function listenToStory() {
	try {
		var title;
		var text;
		var audioMessage = {};
		var language = '';
		var currentStory = window.allstories[window.gCurrentStoryId];
		var eheadline = currentStory.eheadline || '';
		var ebody = currentStory.ebody || '';
		var eventCategory = 'Listen To Story';
		if (window.langmode === 'ch' || ebody === '' || eheadline === '') {
			title = currentStory.cheadline;
			text = currentStory.cbody;
			language = 'ch';
		} else {
			title = currentStory.eheadline;
			text = currentStory.ebody;
			language = 'en';
		}
		audioMessage = {
			title: title,
			text: text,
			language: language,
			eventCategory: eventCategory
		};
		webkit.messageHandlers.listen.postMessage(audioMessage);
		ga('send','event',eventCategory, 'Start', language + ': ' + title);
	} catch (ignore) {

	}
}

// MARK: - This function is used by native apps which have text-to-speech ability. For apps that does not have the ability yet, the users will not see any difference. 
function showListenButton() {
	window.isTextToSpeechEnabled = true;
	var menuButtonForStory = document.getElementById('menu-button-top-right');
	menuButtonForStory.className = menuButtonForStory.className.replace(' storyOnly', '');
	document.getElementById('audio-button-top-right').className = 'header-side right storyOnly';
}

// MARK: - This is called in speedread
function listenToSpeedRead() {
	var title;
	var text;
	var language = 'en';
	var audioMessage = {};
	var speedreadArticleEle = document.getElementById('speedread-article');
	var eventCategory = 'Listen To Speedread';
	var titleEle = speedreadArticleEle.querySelector('b');
	if (titleEle) {
		title = speedreadArticleEle.querySelector('b').innerHTML || '';
	} else {
		title = '';
	}
	text = speedreadArticleEle.innerHTML.replace(/<b>.*<\/b>/, '').replace(/[\(\（][0-9\s]+words[\)\）]/,'');
	audioMessage = {
		title: title,
		text: text,
		language: language,
		eventCategory: eventCategory
	};
	if (window.gAudioId && window.gAudioUrl) {
		audioMessage.audioId = window.gAudioId;
		audioMessage.audioUrl = window.gAudioUrl;
	}
	webkit.messageHandlers.listen.postMessage(audioMessage);
	ga('send','event',eventCategory, 'Start', language + ': ' + title);
}