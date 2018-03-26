
/* exported renderAudioData, showHightlight */
function renderAudioData(ele) {
	var exportedJSONString = document.getElementById('audio-json-text').value;
	var audioData = JSON.parse(exportedJSONString);
	// MARK: render data to html for preview
	var htmlForAudio = '';
	for (var k=0; k<audioData.text.length; k++) {
		htmlForAudio += '<p>';
		for (var l=0; l<audioData.text[k].length; l++) {
			htmlForAudio += '<span id="span-'+k+'-'+l+'" data-section="'+k+'" data-row="'+l+'">' + audioData.text[k][l].text +'</span>';
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
}