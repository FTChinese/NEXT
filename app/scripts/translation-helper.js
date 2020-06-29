// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no const or for of loops, or any other modern features. 
var splitter = '-|-';
function convertTextToArray(t) {
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    newText = newText.replace(/[\r\n]+/g, splitter);
    if (newText.split(splitter).length > 1) {
        return newText.split(splitter);
    }
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    var htmlTexts = [];
    for (const child of englishInfoDiv.children) {
        htmlTexts.push(child.outerHTML);
    }
    return htmlTexts;
}
function addTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {
        return;
    }
    var text = ele.innerHTML;
    ele.className += ' selected';
    ele.title = '';
    var finalTranslationEle = document.getElementById('final-translation');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    finalTranslationEle.value += prefix + text;
}

function tidyHTML(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.innerHTML;
}

function confirmTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {
        return;
    }
    var text = ele.innerHTML;
    ele.classList.add('selected');
    ele.title = '';
    var finalTranslationEle = ele.parentNode.parentNode.querySelector('textarea');
    const prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    finalTranslationEle.value += prefix + text;
}

function start() {
    var englishText = document.getElementById('english-text');
    var translationInfoEle = document.getElementById('translation-info');
    const translationInfoString = translationInfoEle.value;
    var storyBodyEle = document.getElementById('story-body-container');
    if (translationInfoString !== '') {
        const translationInfo = JSON.parse(translationInfoString);
        var englishEle = document.createElement('DIV');
        englishEle.innerHTML = englishText.value;
        var k = '';
        for (const info of translationInfo) {
            var infoHTML = ''
            const id = info.id;
            const englishHTML = englishEle.querySelector(`#${id}`).innerHTML;
            infoHTML += `<div class="info-original">${englishHTML}</div>`;
            for (const translation of info.translations) {
                const t = (/<.+>/g.test(translation)) ? tidyHTML(translation) : translation;
                infoHTML += `<div onclick="confirmTranslation(this)" class="info-translation" title="click to confirm this translation to the right">${t}</div>`;
            }
            infoHTML = `<div class="info-container"><div>${infoHTML}</div><div><textarea data-info-id="${id}" placeholder="点选右边的翻译版本，您也可以继续编辑"></textarea></div></div><hr>`;
            k += infoHTML;
        }
        k += `<div class="centerButton"><input type="button" value="完成并关闭" onclick="finishTranslation()" class="submitbutton button ui-light-btn"></div>`;
        storyBodyEle.innerHTML = k;
        document.querySelector('.body').classList.add('full-grid');
    } else {
        var englishTextArray = convertTextToArray(englishText.value);
        var translationEles = document.querySelectorAll('.chinese-translation');
        var translationsArray = [];
        for (var i=0; i<translationEles.length; i++) {
            var translationText = translationEles[i].value;
            translationsArray.push(convertTextToArray(translationText));
        }
        var p = '';
        for (var j=0; j<englishTextArray.length; j++) {
            p += '<div>' + englishTextArray[j] + '</div>';
            for (var k=0; k<translationsArray.length; k++) {
                var currentTranslationArray = translationsArray[k];
                if (currentTranslationArray[j]) {
                    p += '<div onclick="addTranslation(this)" class="chinese-translation" title="click to add this translation to the right">' + currentTranslationArray[j] + '</div>';
                }
            }
            p += '<hr>';

        }
        storyBodyEle.innerHTML = p;
    }
    englishText.style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
    document.getElementById('translations').style.display = 'none';
    translationInfoEle.style.display = 'none';
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

function finishTranslation() {
    console.log('Finish Translation! ');
    const t = document.getElementById('english-text').value;
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    for (const ele of document.querySelectorAll('[data-info-id]')) {
        const id = ele.getAttribute('data-info-id');
        var infoEle = englishInfoDiv.querySelector(`#${id}`);
        if (infoEle) {
            infoEle.innerHTML = ele.value;
        }
    }
    if (window.opener) {
        window.opener.document.getElementById('cbody').value = englishInfoDiv.innerHTML;
        window.close();
    }
}

if (window.opener) {
    var englishText = window.opener.document.getElementById('ebody').value;
    document.getElementById('english-text').value = englishText;
    var translationText = window.opener.document.getElementById('cbody').value;
    if (/translations/.test(translationText)) {
        document.getElementById('translation-info').value = translationText;
    } else {
        translations = translationText.split(splitter);
        var translationsHTML = '';
        for (var k=0; k<translations.length; k++) {
            translationsHTML += '<textarea class="commentTextArea chinese-translation" width="100%" rows="3">' + translations[k] + '</textarea>'
        }
        document.getElementById('translations').innerHTML = translationsHTML;
    }
    start();
}
/* jshint ignore:end */