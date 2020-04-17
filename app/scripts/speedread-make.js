function start() {
    const englishText = document.getElementById('english-text');
    document.getElementById('story-body-container').innerHTML = englishText.value;
    englishText.style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'grid';
}

function finish() {
    const splitter = '-|-';
    const englishWords = document.getElementById('english-words').value.replace(/[\n\r]+/g, splitter).split(splitter);
    const chineseWords = document.getElementById('chinese-words').value.replace(/[\n\r]+/g, splitter).split(splitter);
    var words = [];
    for (const [index, englishWord] of englishWords.entries()) {
        const chineseWord = chineseWords[index];
        if (chineseWord && englishWord && englishWord !== '' && chineseWord !== '') {
            words.push(`${englishWord}|${chineseWord}`);
        }
    }
    const finalWords = words.join('\n');
    if (window.opener) {
        const questions = document.getElementById('questions-text').value;
        window.opener.document.getElementById('cbody').value = questions;
        window.opener.document.getElementById('clongleadbody').value = finalWords;
        window.close();
    }
}

if (window.opener) {
    const englishText = window.opener.document.getElementById('ebody').value;
    document.getElementById('english-text').value = englishText;
    const questions = window.opener.document.getElementById('cbody').value;
    document.getElementById('questions-text').value = questions;
    start();
}