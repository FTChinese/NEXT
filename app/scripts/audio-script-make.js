/* exported startPlay, updateAudioTime, changeAudioTime, addTag, finish, exportData, previewData, updateAudioSpeed, seekTime */




function startPlay() {
	var safeReplaces = [
		{p: '. ', r: 'english-period'},
		{p: '! ', r: 'english-question-mark'},
		{p: '? ', r: 'english-exclaim'},
		{p: '。', r: 'chinese-period'},
		{p: '？', r: 'chinese-question-mark'}
	];
	function handleBlocks(text, regPattern) {
		var blocks = text.match(regPattern);
		if (blocks && blocks.length > 0) {
			for (var h=0; h<blocks.length; h++) {
				var newBlock = blocks[h]
					.replace(/<p>/g, '<start-p>')
					.replace(/<\/p>/g, '<end-p>');
				for (var m=0; m<safeReplaces.length; m++) {
					newBlock = newBlock.replace(safeReplaces[m].p, safeReplaces[m].r);
				}
				console.log (newBlock);
				text = text.replace(blocks[h], newBlock);
			}
		}
		return text;
	}
	var audioUrl = document.getElementById('audio-url').value || '';
	if (audioUrl === '') {
		alert ('请输入正确的音频地址');
		return;
	}
	document.getElementById('audio-player-container').innerHTML = '<audio id="current-audio" preload="true" controls="" ontimeupdate="updateAudioTime(this)"><source src="'+audioUrl+'"><br clear="all"></audio>';
	audioData.url = audioUrl;
	var audioSpeed = document.getElementById('audio-speed').value || 1;
	updateAudioSpeed(audioSpeed);
	// MARK: get the text from user input
	var text = document.getElementById('audio-text').value;
	// MARK: don't split inside block quotes
	var blockRegex = /<blockquote .*?<\/blockquote>/g;
	text = handleBlocks(text, blockRegex);
	text = handleBlocks(text, /<div .*?<\/div>/g);

	text = text.replace(/[\r\n]/g,'||');
	// MARK: remove extra line breaks between <p> and </p>
	var pRegex = /<p>.+?<\/p>/g;
	var pBlocks = text.match(pRegex);
	if (pBlocks && pBlocks.length > 0) {
		for (var g=0; g<pBlocks.length; g++) {
			var newPBlock = pBlocks[g].replace(/[|]+/g,'');
			text = text.replace(pBlocks[g], newPBlock);
		}
	}
	text = text.replace(/<[pP]>/g, '|')
		.replace(/<\/[pP]>/g, '|')
		.replace(/\|+/g,'|')
		.replace(/start-p/g,'p')
		.replace(/end-p/g,'/p')
		.replace(/<\/li><li>/g, '</li>|<li>')
		.replace(/\. /g, '. ')
		.replace(/\.<\//g, '. </');
	var textData = text.split('|');
	var textDataMarked = [];
	for (var i=0; i<textData.length; i++) {
		var currentParagraph = textData[i]
		.replace(/([\.\?\!][ ”])/g, '$1|')
		.replace(/[。？]/g, '$1|');
		var currentParagraphData = currentParagraph.split('|');
		var currentParagraphDataArray = [];
		for (var j=0; j<currentParagraphData.length; j++) {
			for (var n=0; n<safeReplaces.length; n++) {
				currentParagraphData[j] = currentParagraphData[j].replace(safeReplaces[n].r, safeReplaces[n].p);
			}
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
			htmlForAudio += '<tr id="line-'+k+'-'+l+'" data-section="'+k+'" data-row="'+l+'"><td nowrap><input onclick="seekTime(this);" onchange="changeAudioTime(this)" onended="audioEnded()" type="text" value="" class="audio-time-stamp"></td><td onclick="addTag(this);return false;" class="audio-line-text">'+ audioData.text[k][l].text+'</td></tr>';
		}
	}
	document.getElementById('audio-player-text-lines').innerHTML = '<table class="big-font"><caption>点击加上时间点位</caption><thead><tr><th><span class="ft-bold">时间</span></th><th><span class="ft-bold">文字</span></th></tr></thead><tbody>' + htmlForAudio + '</tbody></table>';
}


function seekTime(ele) {
	var seekAudio = ele.value;
	if (seekAudio === '') {
		return;
	}
	var seekAudioTime = parseInt(seekAudio, 10);
	if (seekAudioTime > 0) {
		var currentAudio = document.getElementById('current-audio');
		currentAudio.currentTime = seekAudioTime;
		if (currentAudio.paused === true) {
			currentAudio.play();
		}
	}
}

function changeAudioTime(ele) {
	const newValue = Number(ele.value) || null;
	var eleNode = ele.parentNode.parentNode;
	var section = eleNode.getAttribute('data-section');
	var row = eleNode.getAttribute('data-row');
	audioData.text[section][row].start = newValue;
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
	// TODO: Should check if the data is correct with all the time stamp. For example, no time stamp should be null and the numbers should increase. 
	var exportedJSONString = JSON.stringify(audioData);
	document.getElementById('audio-json-text').value = exportedJSONString;
}

function finish() {
	var exportedJSONString = JSON.stringify(audioData);
	if (window.opener) {
		var audioEle = window.opener.document.getElementById('cbody');
		if (audioEle) {
			audioEle.value = exportedJSONString;
			window.close();
		}
	}
}

function updateAudioSpeed(speed) {
	if (localStorage) {
		localStorage.setItem('audioSpeed', speed);
	}
	var currentAudio = document.getElementById('current-audio');
	if (currentAudio) {
		currentAudio.playbackRate = speed;
	}
}

function previewData() {
	var exportedJSONString = document.getElementById('audio-json-text').value;
	audioData = JSON.parse(exportedJSONString);
	var ele = document.getElementById('story-body-container');
	renderAudioData(ele);
	audioHasRendered = true;
}

function initPage() {
	var ftid = paravalue(window.location.href, 'ftid');
	if (ftid !== '') {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/FTAPI/article.php?pageAction=article&id=' + ftid);
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.onload = function() {
		    if (xhr.status === 200) {
		        var data = JSON.parse(xhr.responseText);
		        var audioImageUrl = 'https://s3-us-west-2.amazonaws.com/ftlabs-audio-rss-bucket.prod/' + ftid + '.mp3';
		        var ebody = data.bodyXML.replace(/<[\/]*body>/g, '');
		        document.getElementById('audio-url').value = audioImageUrl;
		        document.getElementById('audio-text').value = ebody;
		    }
		};
		xhr.send();
	} else if (window.opener) {
		var audioUrl = window.opener.document.getElementById('cshortleadbody');
		if (audioUrl) {
			document.getElementById('audio-url').value = audioUrl.value;
		}
		var audioText = window.opener.document.getElementById('ebody');
		if (audioText) {
			document.getElementById('audio-text').value = audioText.value;
		}
	}
	if (localStorage) {
		var audioSpeed = localStorage.getItem('audioSpeed') || 1;
		document.getElementById('audio-speed').value = audioSpeed;
	}
}

initPage();

// function renderAudioData(ele) {
// 	// MARK: render data to html for preview
// 	var htmlForAudio = '';
// 	for (var k=0; k<audioData.text.length; k++) {
// 		htmlForAudio += '<p>';
// 		for (var l=0; l<audioData.text[k].length; l++) {
// 			htmlForAudio += '<span id="span-'+k+'-'+l+'" data-section="'+k+'" data-row="'+l+'">' + audioData.text[k][l].text +'</span>';
// 		}
// 		htmlForAudio += '</p>';
// 	}
// 	ele.innerHTML = htmlForAudio;

// }

