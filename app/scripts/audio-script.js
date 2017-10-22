/*
var audioCurrentTime;
var audioData = {
	url: '',
	text: [
	]
};

function startPlay() {
	var audioUrl = document.getElementById('audio-url').value || '';
	//console.log (audioUrl);
	if (audioUrl === '') {
		alert ('请输入正确的音频地址');
		return;
	}
	document.getElementById('audio-player-container').innerHTML = '<audio preload="true" controls="" ontimeupdate="updateAudioTime(this)"><source src="'+audioUrl+'"><br clear="all"></audio>';
	audioData.url = audioUrl;
	// MARK: get the text from user input
	var text = document.getElementById('audio-text').value;
	text = text.replace(/[\r\n]/g,'||')
	.replace(/\|+/g,'|');
	textData = text.split('|');
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
			}
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
	alert (exportedJSONString);
}
*/