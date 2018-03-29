/* exported startPlay, updateAudioTime, addTag, exportData, previewData, updateAudioSpeed */


var audioCurrentTime;
var audioData = {
	url: '',
	text: [
	]
};
var audioHasRendered = false;

function startPlay() {
	var audioUrl = document.getElementById('audio-url').value || '';
	//console.log (audioUrl);
	if (audioUrl === '') {
		alert ('请输入正确的音频地址');
		return;
	}
	document.getElementById('audio-player-container').innerHTML = '<audio id="current-audio" preload="true" controls="" ontimeupdate="updateAudioTime(this)"><source src="'+audioUrl+'"><br clear="all"></audio>';
	audioData.url = audioUrl;
	// MARK: get the text from user input
	var text = document.getElementById('audio-text').value;
	text = text.replace(/<[pP]>/g, '|')
	.replace(/<\/[pP]>/g, '|')
	.replace(/[\r\n]/g,'||')
	.replace(/\|+/g,'|');
	var textData = text.split('|');
	var textDataMarked = [];
	for (var i=0; i<textData.length; i++) {
		var currentParagraph = textData[i]
		//.replace(/, /g, ', |')
		.replace(/\. /g, '. |')
		.replace(/。/g, '。|');
		var currentParagraphData = currentParagraph.split('|');
		var currentParagraphDataArray = [];
		for (var j=0; j<currentParagraphData.length; j++) {
			var currentLine = {
				start: null,
				text: currentParagraphData[j]
			};
			currentParagraphDataArray.push(currentLine);
		}
		textDataMarked.push(currentParagraphDataArray);
	}
	audioData.text = textDataMarked;

	// MARK: render data into html
	var htmlForAudio = '';
	for (var k=0; k<audioData.text.length; k++) {
		for (var l=0; l<audioData.text[k].length; l++) {
			htmlForAudio += '<tr id="line-'+k+'-'+l+'" data-section="'+k+'" data-row="'+l+'"><td nowrap><input type="text" value="" class="audio-time-stamp"></td><td onclick="addTag(this);" class="audio-line-text">'+ audioData.text[k][l].text+'</td></tr>';
		}
	}
	document.getElementById('audio-player-text-lines').innerHTML = '<table><caption>点击加上时间点位</caption><thead><tr><th><span class="ft-bold">时间</span></th><th><span class="ft-bold">文字</span></th></tr></thead><tbody>' + htmlForAudio + '</tbody></table>';
}

function updateAudioTime(ele) {
	audioCurrentTime = ele.currentTime;
	if (audioHasRendered === true) {
		updateAudioTimeForRenderedText(audioCurrentTime, audioData);
	}
}

function addTag(ele) {
	if (audioCurrentTime !== undefined) {
		var eleNode = ele.parentNode;
		eleNode.querySelector('.audio-time-stamp').value = audioCurrentTime;
		var section = eleNode.getAttribute('data-section');
		var row = eleNode.getAttribute('data-row');
		audioData.text[section][row].start = audioCurrentTime;
	}
}

function exportData() {
	// TODO: Should check if the data is correct with all the time stamp. For example, all time stamp should not be null and the numbers should increase. 
	var exportedJSONString = JSON.stringify(audioData);
	document.getElementById('audio-json-text').value = exportedJSONString;
}

function updateAudioSpeed(speed) {
	console.log (speed);
	var currentAudio = document.getElementById('current-audio');
	currentAudio.playbackRate = speed;
}

function previewData() {
	var exportedJSONString = document.getElementById('audio-json-text').value;
	audioData = JSON.parse(exportedJSONString);
	var ele = document.getElementById('rendered-text');
	renderAudioData(ele);
	audioHasRendered = true;
}

function renderAudioData(ele) {
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

}

var lastIndex = {'k':0, 'l':0};
var latestIndex = {'k':0, 'l':0};
// MARK: this will be writen in SWIFT in the native app
function updateAudioTimeForRenderedText(currentTime, data) {
	//console.log ('current time: ' + currentTime);
	for (var k=0; k<data.text.length; k++) {
		for (var l=0; l<data.text[k].length; l++) {
			var checkTime = data.text[k][l].start;
			if (checkTime && checkTime>=currentTime) {
				///console.log (latestIndex);
				var lastK = lastIndex.k;
				var lastL = lastIndex.l;
				if (k !== latestIndex.k || l !== latestIndex.l) {
					console.log (lastK + '/' + k + '-' + lastL + '/' + l + ': ' + checkTime + '/' + currentTime);
					

					//MARK: Handle the output tuple from native side
					showHightlight(lastK, lastL);



					latestIndex = {'k':k, 'l':l};


					var text = data.text[lastK][lastL].text;
					if (text) {
						console.log (text);
					}
				}
				return;
			}
			lastIndex = {'k':k, 'l':l};
		}
	}
}