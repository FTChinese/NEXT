// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no const or for of loops, or any other modern features. 
var splitter = '-|-';
function convertTextToArray(t) {
    var newText = t.replace(/[\r\n]+/g, splitter);
    return newText.split(splitter);
}
function addTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {
        return;
    }
    var text = ele.innerText;
    ele.className += ' selected';
    ele.title = '';
    var finalTranslationEle = document.getElementById('final-translation');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    finalTranslationEle.value += prefix + text;
}
function start() {
    var englishText = document.getElementById('english-text');
    var englishTextArray = convertTextToArray(englishText.value);
    var translationEles = document.querySelectorAll('.chinese-translation');
    var translationsArray = [];
    for (var i=0; i<translationEles.length; i++) {
        var translationText = translationEles[i].value;
        translationsArray.push(convertTextToArray(translationText));
    }
    var p = '';
    for (var j=0; j<englishTextArray.length; j++) {
        p += '<p>' + englishTextArray[j] + '</p>';
        for (var k=0; k<translationsArray.length; k++) {
            var currentTranslationArray = translationsArray[k];
            if (currentTranslationArray[j]) {
                p += '<p onclick="addTranslation(this)" class="chinese-translation" title="click to add this translation to the right">' + currentTranslationArray[j] + '</p>';
            }
        }
        p += '<hr>';

    }
    document.getElementById('story-body-container').innerHTML = p;
    englishText.style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('translations').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'grid';
}

function finish() {
    console.log ('paste the chinese text back! ');
    if (window.opener) {
        var result = document.getElementById('final-translation').value;
        window.opener.document.getElementById('cbody').value = result;
        window.opener.document.getElementById('tag').value += ',translation_confirmed';
        window.close();
    }
}

if (window.opener) {
    var englishText = window.opener.document.getElementById('ebody').value;
    document.getElementById('english-text').value = englishText;
    var translationText = window.opener.document.getElementById('cbody').value;
    translations = translationText.split(splitter);
    var translationsHTML = '';
    for (var k=0; k<translations.length; k++) {
        translationsHTML += '<textarea class="commentTextArea chinese-translation" width="100%" rows="3">' + translations[k] + '</textarea>'
    }
    document.getElementById('translations').innerHTML = translationsHTML;
    start();
}
/* jshint ignore:end */