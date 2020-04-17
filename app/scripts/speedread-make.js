// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
function start() {
    var englishText = document.getElementById('english-text');
    document.getElementById('story-body-container').innerHTML = englishText.value;
    englishText.style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'grid';
}

function finish() {
    var splitter = '-|-';
    var englishWords = document.getElementById('english-words').value.replace(/[\n\r]+/g, splitter).split(splitter);
    var chineseWords = document.getElementById('chinese-words').value.replace(/[\n\r]+/g, splitter).split(splitter);
    var words = [];
    for (var i=0; i < englishWords.length; i++) {
        var chineseWord = chineseWords[i];
        var englishWord = englishWords[i];
        if (chineseWord && englishWord && englishWord !== '' && chineseWord !== '') {
            words.push(englishWord + '|' + chineseWord);
        }
    }
    var finalWords = words.join('\n');
    if (window.opener) {
        var questions = document.getElementById('questions-text').value;
        window.opener.document.getElementById('cbody').value = questions;
        window.opener.document.getElementById('clongleadbody').value = finalWords;
        window.close();
    }
}

if (window.opener) {
    var englishText = window.opener.document.getElementById('ebody').value;
    document.getElementById('english-text').value = englishText;
    var questions = window.opener.document.getElementById('cbody').value;
    document.getElementById('questions-text').value = questions;
    start();
}
/* jshint ignore:end */