// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no var or for of loops, or any other modern features. 
var splitter = '-|-';
var startTime = new Date();
var localStorageKey = 'translation';
if (window.opener) {
    window.userName = window.opener.userName || '';
    window.userIP = window.opener.userIP || '';
} else {
    window.userName = '';
    window.userIP = '';
}
var dict = {};
var delegate = new Delegate(document.body);
var links = '<div>更多翻译引擎：<a href="https://fanyi.baidu.com/" target=_blank>百度</a> | <a href="https://fanyi.youdao.com/" target=_blank>有道</a> | <a href="https://www.deepL.com/" target=_blank>DeepL</a> | <a href="https://translate.google.com/" target=_blank>Google</a></div>';
var heartBeatStatus = 'translating';
var type = 'other';
var id = '';
var heartBeatIntervalId;
// MARK: - Links in translated text
delegate.on('click', '.info-original a[href], .info-translation a[href], .info-original strong, .info-translation strong', function(event){
    try {
        var textArea = this.closest(".info-container").querySelector('textarea');
        var selectionStart = textArea.selectionStart;
        var selectionEnd = textArea.selectionEnd;
        var text = textArea.value;
        if (selectionEnd > selectionStart) {
            var textBefore = text.substring(0, selectionStart);
            var textSelected = text.substring(selectionStart, selectionEnd);
            var textAfter = text.substring(selectionEnd, text.length);
            var t = this.tagName.toLowerCase();
            var newText;
            if (t === 'a' && this.getAttribute('href')) {
                newText = textBefore + '<a href="' + this.getAttribute('href') + '" targe="_blank">' + textSelected + '</a>' + textAfter;
            } else if (this.parentElement.getAttribute('href') && this.parentElement.innerText === this.innerText) {
                newText = textBefore + '<a href="' + this.parentElement.getAttribute('href') + '" targe="_blank"><' + t + '>' + textSelected + '</' + t + '>' + '</a>' + textAfter;
            } else {
                newText = textBefore + '<' + t + '>' + textSelected + '</' + t + '>' + textAfter;
            }
            textArea.value = newText;
        } else {
            alert('请选中右边文本框的相应的文本内容来添加链接！');
        }
    } catch(ignore){
        alert('请选中右边文本框的相应的文本内容来添加链接！');
    }
    event.stopImmediatePropagation();
    return false;
});

delegate.on('click', '.info-translation', function(event){
    confirmTranslation(this);
    var textArea = this.closest(".info-container").querySelector('textarea');
    textArea.focus();
    toggleTextareaWarning(textArea);
});

delegate.on('click', '.translation-suggestion', function(event){
    var textArea = this.closest(".info-container").querySelector('textarea');
    var selectionStart = textArea.selectionStart;
    var selectionEnd = textArea.selectionEnd;
    var text = textArea.value;
    if (selectionStart <= selectionEnd && selectionStart >= 0) {
        var textBefore = text.substring(0, selectionStart);
        var newText = this.getAttribute('data-translation');
        var textAfter = text.substring(selectionEnd, text.length);
        var newText = textBefore + newText + textAfter;
        textArea.value = newText;
    } else {
        alert('请选中右边文本框的相应的文本内容来快捷填写！');
    }
});

delegate.on('click', '.name-entity-shortcut', function(event){
    var textArea = this.closest('.info-container').querySelector('textarea');
    var newText = this.innerHTML;
    var selectionStart = textArea.selectionStart;
    var selectionEnd = textArea.selectionEnd;
    var text = textArea.value;
    if (selectionStart <= selectionEnd && selectionStart >= 0) {
        var textBefore = text.substring(0, selectionStart);
        var textAfter = text.substring(selectionEnd, text.length);
        var newText = textBefore + newText + textAfter;
        textArea.value = newText;
        toggleTextareaWarning(textArea);
    } else {
        alert('请选中右边文本框的相应的文本内容来快捷填写！');
    }
});

delegate.on('click', '.add-name-entity', function(event){
    var ele = this.closest('.name-entity-translation');
    var en = ele.getAttribute('data-key');
    var cn = ele.querySelector('.name-entity-shortcut').innerText;
    var domain = location.hostname === 'localhost' ? 'https://backyard.ftchinese.com' : '';
    var url = domain + '/falcon.php/glossary/add?en=' + en + '&cn=' + cn;
    window.open(url, '_blank');
});

delegate.on('click', '.ignore-name-entity', function(event){
    var ele = this.closest('.name-entity-inner');
    var key = ele.getAttribute('data-key');
    var allEles = document.querySelectorAll('.name-entity-inner, .name-entity-translation');
    for (var i=0; i<allEles.length; i++) {
        var element = allEles[i];
        if (element.getAttribute('data-key') !== key) {continue;}
        element.parentElement.removeChild(element);
    }
    var nameEntityContainers = document.querySelectorAll('.name-entities-container');
    for (var m=0; m<nameEntityContainers.length; m++) {
        var nameEntityContainer = nameEntityContainers[m];
        if (nameEntityContainer.innerHTML !== '') {continue;}
        if (!nameEntityContainer.parentElement.querySelector('.name-entities-description')) {continue;}
        nameEntityContainer.parentElement.querySelector('.name-entities-description').innerHTML = ''; 
    }
    checkInfoHelpers();
    toggleAllTextareaWarning();
});

delegate.on('click', '.ignore-all-name-entity', function(event){
    if (!confirm('忽略所有的提示，可能会导致您无法发现文章中前后不一致的译名，您确定吗？')){return;}
    var allEles = document.querySelectorAll('.name-entity-inner, .name-entity-translation');
    for (var i=0; i<allEles.length; i++) {
        var element = allEles[i];
        element.parentElement.removeChild(element);
    }
    var nameEntityContainers = document.querySelectorAll('.name-entities-container');
    for (var m=0; m<nameEntityContainers.length; m++) {
        var nameEntityContainer = nameEntityContainers[m];
        if (!nameEntityContainer.parentElement.querySelector('.name-entities-description')) {continue;}
        nameEntityContainer.parentElement.querySelector('.name-entities-description').innerHTML = ''; 
    }
    checkInfoHelpers();
    toggleAllTextareaWarning();
});

delegate.on('change', '.name-entity-inner input', function(event) {
    var value = this.value;
    var ele = this.closest('.name-entity-inner');
    var key = ele.getAttribute('data-key');
    var allEles = document.querySelectorAll('.name-entity-inner input');
    for (var i=0; i<allEles.length; i++) {
        var element = allEles[i];
        if (element.closest('.name-entity-inner').getAttribute('data-key') !== key) {continue;}
        element.value = value;
    }
    var nameEntityTranslations = document.querySelectorAll('.name-entity-translation[data-key="' + key + '"]');
    for (var j=0; j<nameEntityTranslations.length; j++) {
        var element = nameEntityTranslations[j];
        if (value !== '') {
            element.innerHTML = '<span class="name-entity-shortcut">' + value + '</span><span class="name-entity-shortcut">' + value + '(' + key + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span>';
        } else {
            element.innerHTML = '';
        }
        var translationEle = element.closest('.info-container').querySelector('textarea');
        toggleTextareaWarning(translationEle);
    }
});

// MARK: - Reminder when editing a textarea
delegate.on('keyup', '.info-container textarea', function(event){
    toggleTextareaWarning(this);
});

// MARK: - Reminder when leaving a textarea
delegate.on('blur', '.info-container textarea', function(event){
    toggleTextareaWarning(this);
    checkDict(this);
});

function checkInfoHelpers() {
    var helpers = document.querySelectorAll('.info-helper');
    for (var i=0; i<helpers.length; i++) {
        var ele = helpers[i].querySelector('.name-entity-inner');
        var container = helpers[i].closest('.info-container');
        if (ele) {
            container.classList.add('has-helper');
        } else {
            container.classList.remove('has-helper');
        }
    }
}

function checkDict(ele) {
    var container = ele.closest('.info-container');
    var nameEntities = container.querySelectorAll('.name-entity-inner');
    for (var n=0; n<nameEntities.length; n++) {
        var nameEntity = nameEntities[n];
        const key = nameEntity.getAttribute('data-key');
        const value = nameEntity.querySelector('input').value;
        if (value !== '') {continue;}
        const translations = dict[key] || [];
        for (var i=0; i<translations.length; i++) {
            var translation = translations[i];
            if (translation === key || translation === '') {continue;}
            if (ele.value.indexOf(translation) === -1) {continue;}
            var nameEntityInners = document.querySelectorAll('.name-entity-inner[data-key="' + key + '"]');
            for (var j=0; j<nameEntityInners.length; j++) {
                nameEntityInners[j].querySelector('input').value = translation;
            }
            var nameEntityTranslations = document.querySelectorAll('.name-entity-translation[data-key="' + key + '"]');
            for (var m=0; m<nameEntityTranslations.length; m++) {
                nameEntityTranslations[m].innerHTML = '<span class="name-entity-shortcut">' + translation + '</span><span class="name-entity-shortcut">' + translation + '(' + key + ')</span><span><button class="add-name-entity" title="将译法添加到词库">添加</button></span>';
            }
            break;
        }
    }
}

function toggleTextareaWarning(ele) {
    var status = checkTextarea(ele);
    if (status.success === true) {
        ele.closest('.info-container').querySelector('.info-error-message').innerHTML = '';
        ele.classList.remove('warning');
        return;
    }
    var errorMessageEle = ele.closest('.info-container').querySelector('.info-error-message');
    // MARK: - Only change the innerHTML if there's a different message, so that the click will always work
    if (!errorMessageEle || errorMessageEle.innerHTML === status.message) {return;}
    errorMessageEle.innerHTML = status.message;
    ele.classList.add('warning');
}


function toggleAllTextareaWarning() {
    var textareas = document.querySelectorAll('.info-container textarea');
    for (var i=0; i<textareas.length; i++) {
        toggleTextareaWarning(textareas[i]);
    }
}


// MARK: - Check if the value of textarea is valid
function checkTextarea(ele) {
    var value = ele.value;
    if (value === '') {
        return {success: true};
    }
    if (/[\S]+[\n\r]+[\S]+/.test(value)) {
        return {success: false, message: '有些文本框有多个段落，很可能是您在编辑的时候，忘记删除多余的文字。请检查！'};
    }
    var container = ele.closest('.info-container');
    var nameEntities = container.querySelectorAll('.name-entity-inner');
    var originalText = container.querySelector('.info-original').innerHTML;
    originalText = originalText
        .replace(/[“>]/g, '“ ')
        .replace(/[”<]/g, ' ”')
        .replace(/(’s )/g, ' $1')
        .replace(/([,\.?!]+)/g, ' $1 ')
        .replace(/[ ]+/g, ' ');
    originalText = ' ' + originalText + ' ';
    var unmatchedKeys = [];
    for (var i=0; i<nameEntities.length; i++) {
        var ele = nameEntities[i];
        var key = ele.getAttribute('data-key');
        var translation = ele.querySelector('input').value;
        if (translation === '') {continue;}
        var keyReg = new RegExp(' ' + key + ' ', 'g');
        var keyMatchesArray = originalText.match(keyReg);
        if (!keyMatchesArray) {continue;}
        var keyMatches = keyMatchesArray.length;
        if (keyMatches === 0) {continue;}
        var reg = new RegExp(translation, 'g');
        var translationMatches = value.match(reg) || [];
        if (translationMatches.length === 0 || translationMatches.length < keyMatches) {
            unmatchedKeys.push({
                source: key, 
                sourceMatches: keyMatches, 
                translation: translation,
                translationMatches: translationMatches.length || 0
            });
        }
    }
    if (unmatchedKeys.length > 0) {
        var description = unmatchedKeys.map(function(x){
            var translationAppear = x.translationMatches === 0 ? '没有出现' : '仅出现<strong>' + x.translationMatches + '</strong>次';
            return '原文中<strong>' + x.source + '</strong>出现<strong>' + x.sourceMatches + '</strong>次，但译文中<strong class="name-entity-shortcut">' + x.translation + '</strong>' + translationAppear;
        }).join('；');
        return {success: false, message: '中文段落中有翻译不一致的地方，请检查，可点击加黑的译文快速插入：' + description};
    }
    return {success: true};
}

// MARK: - Equivalent to php's str_word_count, which is used by the FTC's CMS workflow statistics
function str_word_count(str) {
    if (typeof str !== 'string') {return 0;}
    var words = str.replace(/([(\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!<>\|\:])/g, '')
        .replace(/(^\s*)|(\s*$)/gi,"")
        .replace(/[0-9]/gi,"")
        .replace(/[ ]{2,}/gi," ")
        .replace(/\n /,"\n");
    return words.split(' ').length;
}

function convertTextToArray(t) {
    if (typeof t !== 'string') {return [];}
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    newText = newText.replace(/[\r\n]+/g, splitter);
    if (newText.split(splitter).length > 1) {return newText.split(splitter);}
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    var htmlTexts = [];
    for (var i=0; i<englishInfoDiv.children.length; i++) {
        htmlTexts.push(englishInfoDiv.children[i].outerHTML);
    }
    return htmlTexts;
}

function addTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {return;}
    var text = ele.innerHTML;
    ele.className += ' selected';
    ele.title = '';
    var finalTranslationEle = document.getElementById('final-translation');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    finalTranslationEle.value += prefix + text;
    var ea = ele.getAttribute('data-translation-index');
    gtag('event', ea, {'event_label': window.userName, 'event_category': 'Translation Helper', 'non_interaction': false});
}

function tidyHTML(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.innerHTML;
}

function confirmTranslation(ele) {
    if (ele.className.indexOf(' selected')>=0) {return;}
    var text = ele.innerHTML;
    ele.classList.add('selected');
    ele.title = '';
    var finalTranslationEle = ele.parentNode.parentNode.querySelector('textarea');
    var prefix = (finalTranslationEle.value === '') ? '' : '\n\n';
    var translatedText = prefix + text;
    translatedText = translatedText.replace(/&amp;/g, '&');
    finalTranslationEle.value += translatedText;
    var infoContainers = document.querySelectorAll('.info-container');
    var originalText = ele.parentNode.parentNode.querySelector('.info-original');
    // MARK: - You only need to translate once for the same phrase
    for (var i=0; i < infoContainers.length; i++) {
        var containerEle = infoContainers[i];
        var textEle = containerEle.querySelector('textarea');
        var originalEle = containerEle.querySelector('.info-original');
        if (originalText.innerHTML !== originalEle.innerHTML || textEle.value !== '') {continue;}
        textEle.value = translatedText;
        var infoTranslations = containerEle.querySelectorAll('.info-translation');
        for (var j=0; j<infoTranslations.length; j++) {
            var translationEle = infoTranslations[j];
            if (translationEle.innerHTML !== text) {continue;}
            translationEle.classList.add('selected');
        }
    }
    var ea = ele.getAttribute('data-translation-index');
    gtag('event', ea, {'event_label': window.userName, 'event_category': 'Translation Helper', 'non_interaction': false});
}

function start() {
    function renderBottomButtons() {
        if (document.querySelectorAll('.bottom-button').length === 0) {
            var bottomButton = document.createElement('DIV');
            bottomButton.className = 'centerButton bottom-button';
            bottomButton.innerHTML = '<input id="show-replace-button" type="button" value="全文替换" onclick="showReplace(this)" class="submitbutton button ui-light-btn"><input id="add-new-match-button" type="button" value="添加词条" onclick="showAddNewMatch(this)" class="submitbutton button ui-light-btn"><input type="button" value="预览" onclick="preview(this)" class="submitbutton button ui-light-btn"><input type="button" value="备份" onclick="saveToLocal()" class="submitbutton button ui-light-btn"><input type="button" value="恢复" onclick="restoreFromLocal()" class="submitbutton button ui-light-btn"><input type="button" value="完成并关闭" onclick="finishTranslation()" class="submitbutton button ui-light-btn">';
            document.body.appendChild(bottomButton);
        }
        document.querySelector('.body').classList.add('full-grid');
    }
    function isNotEmpty(element, index, array) {
        return element !== '';
    }
    var englishText = document.getElementById('english-text');
    var translationInfoEle = document.getElementById('translation-info');
    var translationInfoString = translationInfoEle.value;
    var storyBodyEle = document.getElementById('story-body-container');
    if (translationInfoString !== '') {
        var translationInfo = JSON.parse(translationInfoString);
        var englishEle = document.createElement('DIV');
        englishEle.innerHTML = englishText.value;
        var k = '';
        if (window.opener && window.opener.titles) {
            for (var j=0; j<window.opener.titles.length; j++) {
                var info = window.opener.titles[j];
                var infoHTML = '<div class="info-original">' + info.original + '</div>';
                var id = info.id;
                var translations = info.translations.split(splitter);
                for (var m=0; m<translations.length; m++) {
                    infoHTML += '<div onclick="confirmTranslation(this)" data-translation-index="' + m + '"  class="info-translation" title="click to confirm this translation to the right">' + translations[m] + '</div>';
                }
                infoHTML = '<div class="info-container"><div>' + infoHTML + links + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="' + id + '" placeholder="点选左边的翻译版本，您也可以继续编辑"></textarea></div><div class="info-helper"></div></div><hr>';
                k += infoHTML;
            }
        }
        var existingTranslationDict = {};
        if (window.opener && window.opener.checkUpdate === true) {
            var cbodyEle = window.opener.document.getElementById('cbody');
            var ebodyEle = window.opener.document.getElementById('ebody');
            if (cbodyEle && ebodyEle) {
                var cbody = cbodyEle.value;
                var ebody = ebodyEle.value;
                var chineseParagraphs = cbody.split('\n');
                var englishParagraphs = ebody.split('\n');
                // console.log(`englishParagraphs: ${englishParagraphs.length}, chineseParagraphs: ${chineseParagraphs.length}`);
                if (englishParagraphs.length > 0 && chineseParagraphs.length > 0) {
                    for (var l=0; l<englishParagraphs.length; l++) {
                        var englishParagraph = englishParagraphs[l];
                        if (englishParagraph === '' || l >= chineseParagraphs.length) {continue;}
                        var chineseParagraph = chineseParagraphs[l];
                        existingTranslationDict[englishParagraph] = chineseParagraph;
                    }
                }
            }
        }
        for (var i=0; i<translationInfo.length; i++) {
            var info = translationInfo[i];
            var infoHTML = '';
            var id = info.id;
            var englishHTML = englishEle.querySelector('#' + id).innerHTML;
            infoHTML += '<div class="info-original">' + englishHTML + '</div>';
            for (var j=0; j<info.translations.length; j++) {
                var translation = info.translations[j];
                var t = (/<.+>/g.test(translation)) ? tidyHTML(translation) : translation;
                if (/^<picture>.*<\/picture>/.test(englishHTML) && !/^<picture>.*<\/picture>/.test(t)) {
                    t = englishHTML.replace(/(^<picture>.*<\/picture>)(.*)$/g, '$1') + t;
                }
                infoHTML += '<div data-translation-index="' + j + '" class="info-translation" title="click to confirm this translation to the right">' + t + '</div>';
            }
            var j1 = info.translations.length;
            var t1 = existingTranslationDict[englishHTML] || '';
            if (t1 !== '') {
                infoHTML += '<div data-translation-index="' + j1 + '" class="info-translation selected" title="click to confirm this translation to the right">' + t1 + '</div>';
            }
            infoHTML = '<div class="info-container"><div>' + infoHTML + links + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑">' + t1 + '</textarea></div><div class="info-helper"></div></div><hr>';
            k += infoHTML;
        }
        storyBodyEle.innerHTML = k;
        renderBottomButtons();
    } else if (isReviewMode && eText && tText) {
        var eTexts = eText.split('\n').filter(isNotEmpty);
        var tTexts = tText.split('\n').filter(isNotEmpty);
        var k = '';
        for (var j=0; j<eTexts.length; j++) {
            var infoHTML = '';
            infoHTML += '<div class="info-original">' + eTexts[j] + '</div>';
            var t1 = '';
            if (j < tTexts.length) {
                t1 = tTexts[j] || '';
            }
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea placeholder="点选右边的翻译版本，您也可以继续编辑">' + t1 + '</textarea></div><div class="info-helper"></div></div><hr>';
            k += infoHTML;
        }
        storyBodyEle.innerHTML = k;
        renderBottomButtons();
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
                    p += '<div onclick="addTranslation(this)" data-translation-index="' + k + '" class="chinese-translation" title="click to add this translation to the right">' + currentTranslationArray[j] + '</div>';
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
    // MARK: - If all three translations are the same, select directly
    var containers = document.querySelectorAll('.info-container')
    for (var m=0; m<containers.length; m++) {
        var container = containers[m];
        var translations = new Set();
        var translationEles = container.querySelectorAll('.info-translation')
        for (var n=0; n<translationEles.length; n++) {
            var translation = translationEles[n];
            translations.add(translation.innerHTML);
        }
        if (translations.size !== 1) {continue;}
        var value = translationEles[0].innerHTML;
        container.querySelector('textarea').value = value;
        container.querySelector('.info-translation').classList.add('selected');
    }
    // MARK: - Open all links in new tab
    var allLinks = document.querySelectorAll('.info-original a[href]');
    for (var n=0; n<allLinks.length; n++) {
        allLinks[n].setAttribute('target', '_blank');
        var suggestion = '在点选左边把文字填写到这里之后，可以尝试选择部分文字，然后点击左边的链接和加粗字体，就可以方便地添加链接或加粗文字。';
        allLinks[n].closest(".info-container").querySelector('.info-suggestion').innerHTML = suggestion;
        // allLinks[n].closest(".info-container").querySelector('textarea').setAttribute('placeholder', suggestion);
    }
    showGlossarySuggestions();
    showNames();
}

function recordTimeInfo(spentTime) {
    if (!window.opener || typeof window.subtitleInfo === 'object') {return;}
    if (window.opener.window.location.href.indexOf('/ia/') === -1) {return;}
    var targetEle = window.opener.document.getElementById('eskylinetext');
    // MARK: - Check if the target input is already used by other purposes. 
    if (!targetEle || targetEle.value !== '') {return;}
    var allSelectedItems = document.querySelectorAll('[data-translation-index].selected');
    var selections = {};
    for (var i=0; i<allSelectedItems.length; i++) {
        var item = allSelectedItems[i];
        var index = item.getAttribute('data-translation-index');
        if (!selections[index]) {selections[index] = 0;}
        selections[index] += 1;
    }
    var infoContainers = document.querySelectorAll('.info-container');
    var adoptionsCount = 0;
    var chineseWordCount = 0;
    var englishWordCount = 0;
    for (var j=0; j<infoContainers.length; j++) {
        var infoContainer = infoContainers[j];
        var final = infoContainer.querySelector('textarea').value;
        // MARK: - Count only Chinese characters
        chineseWordCount += (final.match(/\p{Unified_Ideograph}/ug) || []).length;
        var english = infoContainer.querySelector('.info-original').innerHTML;
        englishWordCount += str_word_count(english);
        var foundMatch = false;
        var translationOptions = infoContainer.querySelectorAll('.info-translation');
        for (var m=0; m<translationOptions.length; m++) {
            if (final !== translationOptions[m].innerHTML) {continue;}
            foundMatch = true;
            break;
        }
        if (foundMatch) {adoptionsCount += 1;}
    }
    var seconds = Math.round(spentTime/1000);
    var result = {seconds: seconds, adopt: adoptionsCount, total: infoContainers.length, chinese: chineseWordCount, english: englishWordCount, translator: window.userName};
    window.opener.document.getElementById('eskylinetext').value = JSON.stringify(result);
}

function trackFinishTimeAndClose() {
    var finishTime = new Date();
    var spentTime = Math.round(finishTime.getTime() - startTime.getTime());
    recordTimeInfo(spentTime);
    gtag('event', 'timing_complete', {
        'name' : 'finish',
        'value' : spentTime,
        'event_category' : "Quick Translation",
        'event_callback': function() {
            console.log('Spent ' + spentTime + ' miliseconds! ');
            if (window.opener) {window.close();}
        }
    });
    setTimeout(function(){
        if(window.opener) {window.close();}
    }, 3000);
}

function finish() {
    console.log ('paste the chinese text back! ');
    if (window.opener) {
        var result = document.getElementById('final-translation').value;
        window.opener.document.getElementById('cbody').value = tidyUpChineseText(result);
        window.opener.document.getElementById('tag').value += ',translation_confirmed';
        stopHeartbeat();
    }
    trackFinishTimeAndClose();
}

function tidyUpChineseText(text) {
    // MARK: - Use the correct English brackets
    var result = text.replace(/[\(（)]([A-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s\d\.,\'\-]+)[\)）]/g, '($1)'); 
    return result;
}

function getCleanText(ele) {
    var cleanTexts = [];
    for (var i=0; i<ele.children.length; i++) {
        var child = ele.children[i];
        if (child.tagName.toUpperCase() === 'P') {
            cleanTexts.push(child.innerHTML);
        } else {
            cleanTexts.push(child.outerHTML);
        }
    }
    var text = cleanTexts.join('\n\n');
    return tidyUpChineseText(text);
}

function formatDuration(seconds) {
    if (seconds === 0) {return 'now';}
    var formats = [
        {name: 'second', up: 60},
        {name: 'minute', up: 60},
        {name: 'hour', up: 24},
        {name: 'day', up: 365},
        {name: 'year'}
    ]
    var v = seconds;
    var times = [];
    for (var i=0; i<formats.length; i++) {
        var up = formats[i].up;
        var name = formats[i].name;
        var value = (up) ? v % up : v;
        if (value>0) {
            var suffix = (value>1) ? 's' : '';
            times.push(value + ' ' + name + suffix);
        }
        v = Math.floor(v/up);
        if (v === 0) {break;}
    }
    times = times.reverse();
    result = times.join(', ').replace(/, ([^,]+)$/, ' and $1');
    return result;
}

function getUpdatedDict() {
    var dict = {};
    var nameEntities = document.querySelectorAll('.name-entity-inner');
    for (var i = 0; i < nameEntities.length; i++) {
        var nameEntity = nameEntities[i];
        var key = nameEntity.getAttribute('data-key');
        if (!key || key === '') {continue;}
        var value = nameEntity.querySelector('input').value;
        if (!value || value === '') {continue;}
        dict[key] = [value];
    }
    var result = JSON.stringify(dict);
    console.log(result);
    return result;
}

function finishTranslation() {
    try {
        saveToLocal(true);
    }catch(ignore){}
    var finish = false;
    if (isReviewMode) {
        finish = finishReview();
    } else if (typeof window.subtitleInfo === 'object') {
        finish = finishTranslationForVideo();
    } else {
        finish = finishTranslationForArticle();
    }
    if (finish !== true) {
        return;
    }
    trackFinishTimeAndClose();
}

function checkAllTextAreas() {
    var textareas = document.querySelectorAll('.info-container textarea');
    for (var i=0; i<textareas.length; i++) {
        var status = checkTextarea(textareas[i]);
        if (status.success) {continue;}
        return status;
    }
    return {success: true};
}

function finishTranslationForArticle() {
    var status = checkAllTextAreas();
    if (!status.success) {
        var question = '您编辑的内容可能有些问题，您还要继续提交吗？\n\n' + status.message + '\n\n相关的段落已经标红。';
        if (!window.confirm(question)) {
            toggleAllTextareaWarning();
            return false;
        }
    }
    var t = document.getElementById('english-text').value;
    var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
    var englishInfoDiv = document.createElement('DIV');
    englishInfoDiv.innerHTML = newText;
    var cleanEnglishText = getCleanText(englishInfoDiv);
    var titles = ['cheadline', 'clongleadbody'];
    var titlesInfo = [];
    for (var i=0; i<document.querySelectorAll('[data-info-id]').length; i++) {
        var ele = document.querySelectorAll('[data-info-id]')[i];
        var id = ele.getAttribute('data-info-id');
        var infoEle = englishInfoDiv.querySelector('#' + id);
        if (infoEle) {
            infoEle.innerHTML = ele.value.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
        }
        for (var m=0; m<titles.length; m++) {
            if (titles[m] === id) {
                titlesInfo.push({id: id, value: ele.value});
            }
        }
    }
    var cleanChineseText = getCleanText(englishInfoDiv);
    if (window.opener) {
        var cbodyEles = window.opener.document.querySelectorAll('textarea.bodybox, #cbody');
        for (var j=0; j<cbodyEles.length; j++) {
            var cbodyEle = cbodyEles[j];
            cbodyEle.disabled = false;
            cbodyEle.value = cleanChineseText;
        }
        var ebodyEle = window.opener.document.getElementById('ebody');
        ebodyEle.disabled = false;
        ebodyEle.value = cleanEnglishText;
        var cshortleadbodyEle = window.opener.document.getElementById('cshortleadbody');
        cshortleadbodyEle.disabled = false;
        cshortleadbodyEle.value = getUpdatedDict();
        for (var k=0; k<titlesInfo.length; k++) {
            var id = titlesInfo[k].id;
            var value = titlesInfo[k].value;
            window.opener.document.getElementById(id).disabled = false;
            window.opener.document.getElementById(id).value = value;
        }
        var tagEle = window.opener.document.getElementById('tag');
        // MARK: - A list of good translation reviewer whose quality is so good that there's no need to display that AI disclaimer
        var goodTranslators = 'oliver.zhang';
        var isGoodTranslator = typeof window.userName === 'string' && goodTranslators.indexOf(window.userName)>=0;
        if (tagEle) {
            var goodTranslatorTag = isGoodTranslator ? ',IsEdited' : '';
            window.opener.document.getElementById('tag').value += ',AITranslation' + goodTranslatorTag;
            var tags = window.opener.document.getElementById('tag').value.split(',');
            var tagsSet = new Set(tags);
            window.opener.document.getElementById('tag').value = Array.from(tagsSet).join(',');
        }
        var translationHelperButton = window.opener.document.querySelector('.translation-helper');
        if (translationHelperButton) {
            var finishTime = new Date();
            var spentTime = Math.round((finishTime.getTime() - startTime.getTime())/1000);
            translationHelperButton.innerHTML = 'Translation finished in ' + formatDuration(spentTime) + '. ';
            setTimeout(function(){translationHelperButton.style.display = 'none';}, 6000);
        }
        // MARK: - In the workflow, there's a weird requirement that a translator have to use a select menu to indicate that the translation is finished. This is totally stupid so I'll just automate it. 
        var completeSelects = window.opener.document.querySelectorAll('select');
        for (var l=0; l<completeSelects.length; l++) {
            var currentSelect = completeSelects[l];
            if (currentSelect.id && currentSelect.id.indexOf('complete_') === 0) {
                currentSelect.value = 1;
            }
        }
    }
    return true;
}

function finishReview() {
    var finishedTexts = [];
    var textAreas = document.querySelectorAll('.info-container textarea');
    for (var i=0; i<textAreas.length; i++) {
        finishedTexts.push(textAreas[i].value || '');
    }
    var cbody = finishedTexts.join('\n\n');
    if (window.opener) {
        var cbodyEles = window.opener.document.querySelectorAll('textarea.bodybox, #cbody');
        for (var j=0; j<cbodyEles.length; j++) {
            var cbodyEle = cbodyEles[j];
            cbodyEle.disabled = false;
            cbodyEle.value = cbody;
        }
        var cshortleadbodyEle = window.opener.document.getElementById('cshortleadbody');
        cshortleadbodyEle.disabled = false;
        cshortleadbodyEle.value = getUpdatedDict();
    }
    return true;
}

function fillArray(length, end, middle) {
    var vals = [];
    for (var i=0; i<length; i++) {
        if (i === 0 || i >= length - 2) {
            vals.push(end);
        } else {
            vals.push(middle);
        }
    }
    return vals;
}

function getNameEntities(english, translation, minLength) {
    var names = new Set();
    // MARK: - Use the update update-common-words.js file under ft/tokens to update common words
    var commonStartWord = ["Meanwhile","Since","During","While","When","Where","What","Which","Who","How","For","It","The","A","We","Being","They","He","She","I","There","In","That","People","From","Between","But","However","January","February","March","April","May","June","July","August","September","October","November","December","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday","Although","On","And","This","University","Legal","General","Investment","Management","Securities","US","Exchange","Commission","Asset","Bank","EU","If","International","Economics","Institute","Africa","Europe","Asia","America","American","Chinese","China","India","South","North","East","West","Western","Apple","Google","Amazon","President","As","UK","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Airport","Air","At","All","Here","Paris","London","New","York","Times","Germany","German","France","English","England","British","Briton","Abandon","Ability","Able","Abortion","About","Above","Abroad","Absence","Absolute","Absolutely","Absorb","Abuse","Academic","Accept","Access","Accident","Accompany","Accomplish","According","Account","Accurate","Accuse","Achieve","Achievement","Acid","Acknowledge","Acquire","Across","Act","Action","Active","Activist","Activity","Actor","Actress","Actual","Actually","Ad","Adapt","Add","Addition","Additional","Address","Adequate","Adjust","Adjustment","Administration","Administrator","Admire","Admission","Admit","Adolescent","Adopt","Adult","Advance","Advanced","Advantage","Adventure","Advertising","Advice","Advise","Adviser","Advocate","Affair","Affect","Afford","Afraid","African","African-American","After","Afternoon","Again","Against","Age","Agency","Agenda","Agent","Aggressive","Ago","Agree","Agreement","Agricultural","Ah","Ahead","Aid","Aide","AIDS","Aim","Aircraft","Airline","Album","Alcohol","Alive","Alliance","Allow","Ally","Almost","Alone","Along","Already","Also","Alter","Alternative","Always","AM","Amazing","Among","Amount","Analysis","Analyst","Analyze","Ancient","Anger","Angle","Angry","Animal","Anniversary","Announce","Annual","Another","Answer","Anticipate","Anxiety","Any","Anybody","Anymore","Anyone","Anything","Anyway","Anywhere","Apart","Apartment","Apparent","Apparently","Appeal","Appear","Appearance","Application","Apply","Appoint","Appointment","Appreciate","Approach","Appropriate","Approval","Approve","Approximately","Arab","Architect","Area","Argue","Argument","Arise","Arm","Armed","Army","Around","Arrange","Arrangement","Arrest","Arrival","Arrive","Art","Article","Artist","Artistic","Asian","Aside","Ask","Asleep","Aspect","Assault","Assert","Assess","Assessment","Assign","Assignment","Assist","Assistance","Assistant","Associate","Association","Assume","Assumption","Assure","Athlete","Athletic","Atmosphere","Attach","Attack","Attempt","Attend","Attention","Attitude","Attorney","Attract","Attractive","Attribute","Audience","Author","Authority","Auto","Available","Average","Avoid","Award","Aware","Awareness","Away","Awful","Baby","Back","Background","Bad","Badly","Bag","Bake","Balance","Ball","Ban","Band","Bar","Barely","Barrel","Barrier","Base","Baseball","Basic","Basically","Basis","Basket","Basketball","Bathroom","Battery","Battle","Be","Beach","Bean","Bear","Beat","Beautiful","Beauty","Because","Become","Bed","Bedroom","Beer","Before","Begin","Beginning","Behavior","Behind","Belief","Believe","Bell","Belong","Below","Belt","Bench","Bend","Beneath","Benefit","Beside","Besides","Best","Bet","Better","Beyond","Bible","Big","Bike","Bill","Billion","Bind","Biological","Bird","Birth","Birthday","Bit","Bite","Black","Blade","Blame","Blanket","Blind","Block","Blood","Blow","Blue","Board","Boat","Body","Bomb","Bombing","Bond","Bone","Book","Boom","Boot","Border","Born","Borrow","Boss","Both","Bother","Bottle","Bottom","Boundary","Bowl","Box","Boy","Boyfriend","Brain","Branch","Brand","Bread","Break","Breakfast","Breast","Breath","Breathe","Brick","Bridge","Brief","Briefly","Bright","Brilliant","Bring","Broad","Broken","Brother","Brown","Brush","Buck","Budget","Build","Building","Bullet","Bunch","Burden","Burn","Bury","Bus","Business","Busy","Butter","Button","Buy","Buyer","By","Cabin","Cabinet","Cable","Cake","Calculate","Call","Camera","Camp","Campaign","Campus","Can","Canadian","Cancer","Candidate","Cap","Capability","Capable","Capacity","Capital","Captain","Capture","Car","Carbon","Card","Care","Career","Careful","Carefully","Carrier","Carry","Case","Cash","Cast","Cat","Catch","Category","Catholic","Cause","Ceiling","Celebrate","Celebration","Celebrity","Cell","Center","Central","Century","CEO","Ceremony","Certain","Certainly","Chain","Chair","Chairman","Challenge","Chamber","Champion","Championship","Chance","Change","Changing","Channel","Chapter","Character","Characteristic","Characterize","Charge","Charity","Chart","Chase","Cheap","Check","Cheek","Cheese","Chef","Chemical","Chest","Chicken","Chief","Child","Childhood","Chip","Chocolate","Choice","Cholesterol","Choose","Christian","Christmas","Church","Cigarette","Circle","Circumstance","Cite","Citizen","City","Civil","Civilian","Claim","Class","Classic","Classroom","Clean","Clear","Clearly","Client","Climate","Climb","Clinic","Clinical","Clock","Close","Closely","Closer","Clothes","Clothing","Cloud","Club","Clue","Cluster","Coach","Coal","Coalition","Coast","Coat","Code","Coffee","Cognitive","Cold","Collapse","Colleague","Collect","Collection","Collective","College","Colonial","Color","Column","Combination","Combine","Come","Comedy","Comfort","Comfortable","Command","Commander","Comment","Commercial","Commit","Commitment","Committee","Common","Communicate","Communication","Community","Company","Compare","Comparison","Compete","Competition","Competitive","Competitor","Complain","Complaint","Complete","Completely","Complex","Complicated","Component","Compose","Composition","Comprehensive","Computer","Concentrate","Concentration","Concept","Concern","Concerned","Concert","Conclude","Conclusion","Concrete","Condition","Conduct","Conference","Confidence","Confident","Confirm","Conflict","Confront","Confusion","Congress","Congressional","Connect","Connection","Consciousness","Consensus","Consequence","Conservative","Consider","Considerable","Consideration","Consist","Consistent","Constant","Constantly","Constitute","Constitutional","Construct","Construction","Consultant","Consume","Consumer","Consumption","Contact","Contain","Container","Contemporary","Content","Contest","Context","Continue","Continued","Contract","Contrast","Contribute","Contribution","Control","Controversial","Controversy","Convention","Conventional","Conversation","Convert","Conviction","Convince","Cook","Cookie","Cooking","Cool","Cooperation","Cop","Cope","Copy","Core","Corn","Corner","Corporate","Corporation","Correct","Correspondent","Cost","Cotton","Couch","Could","Council","Counselor","Count","Counter","Country","County","Couple","Courage","Course","Court","Cousin","Cover","Coverage","Cow","Crack","Craft","Crash","Crazy","Cream","Create","Creation","Creative","Creature","Credit","Crew","Crime","Criminal","Crisis","Criteria","Critic","Critical","Criticism","Criticize","Crop","Cross","Crowd","Crucial","Cry","Cultural","Culture","Cup","Curious","Current","Currently","Curriculum","Custom","Customer","Cut","Cycle","Dad","Daily","Damage","Dance","Danger","Dangerous","Dare","Dark","Darkness","Data","Date","Daughter","Day","Dead","Deal","Dealer","Dear","Death","Debate","Debt","Decade","Decide","Decision","Deck","Declare","Decline","Decrease","Deep","Deeply","Deer","Defeat","Defend","Defendant","Defense","Defensive","Deficit","Define","Definitely","Definition","Degree","Delay","Deliver","Delivery","Demand","Democracy","Democrat","Democratic","Demonstrate","Demonstration","Deny","Department","Depend","Dependent","Depending","Depict","Depression","Depth","Deputy","Derive","Describe","Description","Desert","Deserve","Design","Designer","Desire","Desk","Desperate","Despite","Destroy","Destruction","Detail","Detailed","Detect","Determine","Develop","Developing","Development","Device","Devote","Dialogue","Die","Diet","Differ","Difference","Different","Differently","Difficult","Difficulty","Dig","Digital","Dimension","Dining","Dinner","Direct","Direction","Directly","Director","Dirt","Dirty","Disability","Disagree","Disappear","Disaster","Discipline","Discourse","Discover","Discovery","Discrimination","Discuss","Discussion","Disease","Dish","Dismiss","Disorder","Display","Dispute","Distance","Distant","Distinct","Distinction","Distinguish","Distribute","Distribution","District","Diverse","Diversity","Divide","Division","Divorce","DNA","Do","Doctor","Document","Dog","Domestic","Dominant","Dominate","Door","Double","Doubt","Down","Downtown","Dozen","Draft","Drag","Drama","Dramatic","Dramatically","Draw","Drawing","Dream","Dress","Drink","Drive","Driver","Drop","Drug","Dry","Due","Dust","Duty","Each","Eager","Ear","Early","Earn","Earnings","Earth","Ease","Easily","Eastern","Easy","Eat","Economic","Economist","Economy","Edge","Edition","Editor","Educate","Education","Educational","Educator","Effect","Effective","Effectively","Efficiency","Efficient","Effort","Egg","Either","Elderly","Elect","Election","Electric","Electricity","Electronic","Element","Elementary","Eliminate","Elite","Else","Elsewhere","E-mail","Embrace","Emerge","Emergency","Emission","Emotion","Emotional","Emphasis","Emphasize","Employ","Employee","Employer","Employment","Empty","Enable","Encounter","Encourage","End","Enemy","Energy","Enforcement","Engage","Engine","Engineer","Engineering","Enhance","Enjoy","Enormous","Enough","Ensure","Enter","Enterprise","Entertainment","Entire","Entirely","Entrance","Entry","Environment","Environmental","Episode","Equal","Equally","Equipment","Era","Error","Escape","Especially","Essay","Essential","Essentially","Establish","Establishment","Estate","Estimate","Etc","Ethics","Ethnic","European","Evaluate","Evaluation","Even","Evening","Event","Eventually","Ever","Every","Everybody","Everyday","Everyone","Everything","Everywhere","Evidence","Evolution","Evolve","Exact","Exactly","Examination","Examine","Example","Exceed","Excellent","Except","Exception","Exciting","Executive","Exercise","Exhibit","Exhibition","Exist","Existence","Existing","Expand","Expansion","Expect","Expectation","Expense","Expensive","Experience","Experiment","Expert","Explain","Explanation","Explode","Explore","Explosion","Expose","Exposure","Express","Expression","Extend","Extension","Extensive","Extent","External","Extra","Extraordinary","Extreme","Extremely","Eye","Fabric","Face","Facility","Fact","Factor","Factory","Faculty","Fade","Fail","Failure","Fair","Fairly","Faith","Fall","False","Familiar","Family","Famous","Fan","Fantasy","Far","Farm","Farmer","Fashion","Fast","Fat","Fate","Father","Fault","Favor","Favorite","Fear","Feature","Federal","Fee","Feed","Feel","Feeling","Fellow","Female","Fence","Few","Fewer","Fiber","Fiction","Field","Fifteen","Fifth","Fifty","Fight","Fighter","Fighting","Figure","File","Fill","Film","Final","Finally","Finance","Financial","Find","Finding","Fine","Finger","Finish","Fire","Firm","First","Fish","Fishing","Fit","Fitness","Fix","Flag","Flame","Flat","Flavor","Flee","Flesh","Flight","Float","Floor","Flow","Flower","Fly","Focus","Folk","Follow","Following","Food","Foot","Football","Force","Foreign","Forest","Forever","Forget","Form","Formal","Formation","Former","Formula","Forth","Fortune","Forward","Found","Foundation","Founder","Fourth","Frame","Framework","Free","Freedom","Freeze","French","Frequency","Frequent","Frequently","Fresh","Friend","Friendly","Friendship","Front","Fruit","Frustration","Fuel","Full","Fully","Fun","Function","Fund","Fundamental","Funding","Funeral","Funny","Furniture","Furthermore","Future","Gain","Galaxy","Gallery","Game","Gang","Gap","Garage","Garden","Garlic","Gas","Gate","Gather","Gay","Gaze","Gear","Gender","Gene","Generally","Generate","Generation","Genetic","Gentleman","Gently","Gesture","Get","Ghost","Giant","Gift","Gifted","Girl","Girlfriend","Give","Given","Glad","Glance","Glass","Global","Glove","Go","Goal","God","Gold","Golden","Golf","Good","Government","Governor","Grab","Grade","Gradually","Graduate","Grain","Grand","Grandfather","Grandmother","Grant","Grass","Grave","Gray","Great","Greatest","Green","Grocery","Ground","Group","Grow","Growing","Growth","Guarantee","Guard","Guess","Guest","Guide","Guideline","Guilty","Gun","Guy","Habit","Habitat","Hair","Half","Hall","Hand","Handful","Handle","Hang","Happen","Happy","Hard","Hardly","Hat","Hate","Have","Head","Headline","Headquarters","Health","Healthy","Hear","Hearing","Heart","Heat","Heaven","Heavily","Heavy","Heel","Height","Helicopter","Hell","Hello","Help","Helpful","Her","Heritage","Hero","Herself","Hey","Hi","Hide","High","Highlight","Highly","Highway","Hill","Him","Himself","Hip","Hire","His","Historian","Historic","Historical","History","Hit","Hold","Hole","Holiday","Holy","Home","Homeless","Honest","Honey","Honor","Hope","Horizon","Horror","Horse","Hospital","Host","Hot","Hotel","Hour","House","Household","Housing","Huge","Human","Humor","Hundred","Hungry","Hunter","Hunting","Hurt","Husband","Hypothesis","Ice","Idea","Ideal","Identification","Identify","Identity","Ie","Ignore","Ill","Illegal","Illness","Illustrate","Image","Imagination","Imagine","Immediate","Immediately","Immigrant","Immigration","Impact","Implement","Implication","Imply","Importance","Important","Impose","Impossible","Impress","Impression","Impressive","Improve","Improvement","Incentive","Incident","Include","Including","Income","Incorporate","Increase","Increased","Increasing","Increasingly","Incredible","Indeed","Independence","Independent","Index","Indian","Indicate","Indication","Individual","Industrial","Industry","Infant","Infection","Inflation","Influence","Inform","Information","Ingredient","Initial","Initially","Initiative","Injury","Inner","Innocent","Inquiry","Inside","Insight","Insist","Inspire","Install","Instance","Instead","Institution","Institutional","Instruction","Instructor","Instrument","Insurance","Intellectual","Intelligence","Intend","Intense","Intensity","Intention","Interaction","Interest","Interested","Interesting","Internal","Internet","Interpret","Interpretation","Intervention","Interview","Into","Introduce","Introduction","Invasion","Invest","Investigate","Investigation","Investigator","Investor","Invite","Involve","Involved","Involvement","Iraqi","Irish","Iron","Islamic","Island","Israeli","Issue","Italian","Item","Its","Itself","Jacket","Jail","Japanese","Jet","Jew","Jewish","Job","Join","Joint","Joke","Journal","Journalist","Journey","Joy","Judge","Judgment","Juice","Jump","Junior","Jury","Just","Justice","Justify","Keep","Key","Kick","Kid","Kill","Killer","Killing","Kind","King","Kiss","Kitchen","Knee","Knife","Knock","Know","Knowledge","Lab","Label","Labor","Laboratory","Lack","Lady","Lake","Land","Landscape","Language","Lap","Large","Largely","Last","Late","Later","Latin","Latter","Laugh","Launch","Law","Lawn","Lawsuit","Lawyer","Lay","Layer","Lead","Leader","Leadership","Leading","Leaf","League","Lean","Learn","Learning","Least","Leather","Leave","Left","Leg","Legacy","Legend","Legislation","Legitimate","Lemon","Length","Less","Lesson","Let","Letter","Level","Liberal","Library","License","Lie","Life","Lifestyle","Lifetime","Lift","Light","Like","Likely","Limit","Limitation","Limited","Line","Link","Lip","List","Listen","Literally","Literary","Literature","Little","Live","Living","Load","Loan","Local","Locate","Location","Lock","Long","Long-term","Look","Loose","Lose","Loss","Lost","Lot","Lots","Loud","Love","Lovely","Lover","Low","Lower","Luck","Lucky","Lunch","Lung","Machine","Mad","Magazine","Mail","Main","Mainly","Maintain","Maintenance","Major","Majority","Make","Maker","Makeup","Male","Mall","Man","Manage","Manager","Manner","Manufacturer","Manufacturing","Many","Map","Margin","Mark","Market","Marketing","Marriage","Married","Marry","Mask","Mass","Massive","Master","Match","Material","Math","Matter","Maybe","Mayor","Me","Meal","Mean","Meaning","Measure","Measurement","Meat","Mechanism","Media","Medical","Medication","Medicine","Medium","Meet","Meeting","Member","Membership","Memory","Mental","Mention","Menu","Mere","Merely","Mess","Message","Metal","Meter","Method","Mexican","Middle","Might","Military","Milk","Million","Mind","Mine","Minister","Minor","Minority","Minute","Miracle","Mirror","Miss","Missile","Mission","Mistake","Mix","Mixture","Mm-hmm","Mode","Model","Moderate","Modern","Modest","Mom","Moment","Money","Monitor","Month","Mood","Moon","Moral","More","Moreover","Morning","Mortgage","Most","Mostly","Mother","Motion","Motivation","Motor","Mount","Mountain","Mouse","Mouth","Move","Movement","Movie","Mr","Mrs","Ms","Much","Multiple","Murder","Muscle","Museum","Music","Musical","Musician","Muslim","Must","Mutual","My","Myself","Mystery","Myth","Naked","Name","Narrative","Narrow","Nation","National","Native","Natural","Naturally","Nature","Near","Nearby","Nearly","Necessarily","Necessary","Neck","Need","Negative","Negotiate","Negotiation","Neighbor","Neighborhood","Neither","Nerve","Nervous","Net","Network","Never","Nevertheless","Newly","News","Newspaper","Next","Nice","Night","No","Nobody","Nod","Noise","Nomination","None","Nonetheless","Nor","Normal","Normally","Northern","Nose","Not","Note","Nothing","Notice","Notion","Novel","Now","Nowhere","N't","Nuclear","Number","Numerous","Nurse","Nut","Object","Objective","Obligation","Observation","Observe","Observer","Obtain","Obvious","Obviously","Occasion","Occasionally","Occupation","Occupy","Occur","Ocean","Odd","Odds","Of","Off","Offense","Offensive","Offer","Office","Officer","Official","Often","Oh","Oil","Ok","Okay","Old","Olympic","Once","Ongoing","Onion","Online","Only","Onto","Open","Opening","Operate","Operating","Operation","Operator","Opinion","Opponent","Opportunity","Oppose","Opposite","Opposition","Option","Or","Orange","Order","Ordinary","Organic","Organization","Organize","Orientation","Origin","Original","Originally","Other","Others","Otherwise","Ought","Our","Ourselves","Out","Outcome","Outside","Oven","Over","Overall","Overcome","Overlook","Owe","Own","Owner","Pace","Pack","Package","Page","Pain","Painful","Paint","Painter","Painting","Pair","Pale","Palestinian","Palm","Pan","Panel","Pant","Paper","Parent","Park","Parking","Part","Participant","Participate","Participation","Particular","Particularly","Partly","Partner","Partnership","Party","Pass","Passage","Passenger","Passion","Past","Patch","Path","Patient","Pattern","Pause","Pay","Payment","PC","Peace","Peak","Peer","Penalty","Pepper","Per","Perceive","Percentage","Perception","Perfect","Perfectly","Perform","Performance","Perhaps","Period","Permanent","Permission","Permit","Person","Personal","Personality","Personally","Personnel","Perspective","Persuade","Pet","Phase","Phenomenon","Philosophy","Phone","Photo","Photograph","Photographer","Phrase","Physical","Physically","Physician","Piano","Pick","Picture","Pie","Piece","Pile","Pilot","Pine","Pink","Pipe","Pitch","Place","Plan","Plane","Planet","Planning","Plant","Plastic","Plate","Platform","Play","Player","Please","Pleasure","Plenty","Plot","Plus","PM","Pocket","Poem","Poet","Poetry","Point","Pole","Police","Policy","Political","Politically","Politician","Politics","Poll","Pollution","Pool","Poor","Pop","Popular","Population","Porch","Port","Portion","Portrait","Portray","Pose","Position","Positive","Possess","Possibility","Possible","Possibly","Post","Pot","Potato","Potential","Potentially","Pound","Pour","Poverty","Powder","Power","Powerful","Practical","Practice","Pray","Prayer","Precisely","Predict","Prefer","Preference","Pregnancy","Pregnant","Preparation","Prepare","Prescription","Presence","Present","Presentation","Preserve","Presidential","Press","Pressure","Pretend","Pretty","Prevent","Previous","Previously","Price","Pride","Priest","Primarily","Primary","Prime","Principal","Principle","Print","Prior","Priority","Prison","Prisoner","Privacy","Private","Probably","Problem","Procedure","Proceed","Process","Produce","Producer","Product","Production","Profession","Professional","Professor","Profile","Profit","Program","Progress","Project","Prominent","Promise","Promote","Prompt","Proof","Proper","Properly","Property","Proportion","Proposal","Propose","Proposed","Prosecutor","Prospect","Protect","Protection","Protein","Protest","Proud","Prove","Provide","Provider","Province","Provision","Psychological","Psychologist","Psychology","Public","Publication","Publicly","Publish","Publisher","Pull","Punishment","Purchase","Pure","Purpose","Pursue","Push","Put","Qualify","Quality","Quarter","Quarterback","Question","Quick","Quickly","Quiet","Quietly","Quit","Quite","Quote","Race","Racial","Radical","Radio","Rail","Rain","Raise","Range","Rank","Rapid","Rapidly","Rare","Rarely","Rate","Rather","Rating","Ratio","Raw","Reach","React","Reaction","Read","Reader","Reading","Ready","Real","Reality","Realize","Really","Reason","Reasonable","Recall","Receive","Recent","Recently","Recipe","Recognition","Recognize","Recommend","Recommendation","Record","Recording","Recover","Recovery","Recruit","Red","Reduce","Reduction","Refer","Reference","Reflect","Reflection","Reform","Refugee","Refuse","Regard","Regarding","Regardless","Regime","Region","Regional","Register","Regular","Regularly","Regulate","Regulation","Reinforce","Reject","Relate","Relation","Relationship","Relative","Relatively","Relax","Release","Relevant","Relief","Religion","Religious","Rely","Remain","Remaining","Remarkable","Remember","Remind","Remote","Remove","Repeat","Repeatedly","Replace","Reply","Report","Reporter","Represent","Representation","Representative","Republican","Reputation","Request","Require","Requirement","Research","Researcher","Resemble","Reservation","Resident","Resist","Resistance","Resolution","Resolve","Resort","Resource","Respect","Respond","Respondent","Response","Responsibility","Responsible","Rest","Restaurant","Restore","Restriction","Result","Retain","Retire","Retirement","Return","Reveal","Revenue","Review","Revolution","Rhythm","Rice","Rich","Rid","Ride","Rifle","Right","Ring","Rise","Risk","River","Road","Rock","Role","Roll","Romantic","Roof","Room","Root","Rope","Rose","Rough","Roughly","Round","Route","Routine","Row","Rub","Rule","Run","Running","Rural","Rush","Russian","Sacred","Sad","Safe","Safety","Sake","Salad","Salary","Sale","Sales","Salt","Same","Sample","Sanction","Sand","Satellite","Satisfaction","Satisfy","Sauce","Save","Saving","Say","Scale","Scandal","Scared","Scenario","Scene","Schedule","Scheme","Scholar","Scholarship","School","Science","Scientific","Scientist","Scope","Score","Scream","Screen","Script","Sea","Search","Season","Seat","Second","Secret","Secretary","Section","Sector","Secure","Security","See","Seed","Seek","Seem","Segment","Seize","Select","Selection","Self","Sell","Senate","Senator","Send","Senior","Sense","Sensitive","Sentence","Separate","Sequence","Series","Serious","Seriously","Serve","Service","Session","Set","Setting","Settle","Settlement","Several","Severe","Sex","Sexual","Shade","Shadow","Shake","Shall","Shape","Share","Sharp","Sheet","Shelf","Shell","Shelter","Shift","Shine","Ship","Shirt","Shit","Shock","Shoe","Shoot","Shooting","Shop","Shopping","Shore","Short","Shortly","Shot","Should","Shoulder","Shout","Show","Shower","Shrug","Shut","Sick","Side","Sigh","Sight","Sign","Signal","Significance","Significant","Significantly","Silence","Silent","Silver","Similar","Similarly","Simple","Simply","Sin","Sing","Singer","Single","Sink","Sir","Sister","Sit","Site","Situation","Size","Ski","Skill","Skin","Sky","Slave","Sleep","Slice","Slide","Slight","Slightly","Slip","Slow","Slowly","Small","Smart","Smell","Smile","Smoke","Smooth","Snap","Snow","So","So-called","Soccer","Social","Society","Soft","Software","Soil","Solar","Soldier","Solid","Solution","Solve","Some","Somebody","Somehow","Someone","Something","Sometimes","Somewhat","Somewhere","Son","Song","Soon","Sophisticated","Sorry","Sort","Soul","Sound","Soup","Source","Southern","Soviet","Space","Spanish","Speak","Speaker","Special","Specialist","Species","Specific","Specifically","Speech","Speed","Spend","Spending","Spin","Spirit","Spiritual","Split","Spokesman","Sport","Spot","Spread","Spring","Square","Squeeze","Stability","Stable","Staff","Stage","Stair","Stake","Stand","Standard","Standing","Star","Stare","Start","State","Statement","Station","Statistics","Status","Stay","Steady","Steal","Steel","Step","Stick","Still","Stir","Stock","Stomach","Stone","Stop","Storage","Store","Storm","Story","Straight","Strange","Stranger","Strategic","Strategy","Stream","Street","Strength","Strengthen","Stress","Stretch","Strike","String","Strip","Stroke","Strong","Strongly","Structure","Struggle","Student","Studio","Study","Stuff","Stupid","Style","Subject","Submit","Subsequent","Substance","Substantial","Succeed","Success","Successful","Successfully","Such","Sudden","Suddenly","Sue","Suffer","Sufficient","Sugar","Suggest","Suggestion","Suicide","Suit","Summer","Summit","Sun","Super","Supply","Support","Supporter","Suppose","Supposed","Supreme","Sure","Surely","Surface","Surgery","Surprise","Surprised","Surprising","Surprisingly","Surround","Survey","Survival","Survive","Survivor","Suspect","Sustain","Swear","Sweep","Sweet","Swim","Swing","Switch","Symbol","Symptom","System","Table","Tablespoon","Tactic","Tail","Take","Tale","Talent","Talk","Tall","Tank","Tap","Tape","Target","Task","Taste","Tax","Taxpayer","Tea","Teach","Teacher","Teaching","Team","Tear","Teaspoon","Technical","Technique","Technology","Teen","Teenager","Telephone","Telescope","Television","Tell","Temperature","Temporary","Tend","Tendency","Tennis","Tension","Tent","Term","Terms","Terrible","Territory","Terror","Terrorism","Terrorist","Test","Testify","Testimony","Testing","Text","Than","Thank","Thanks","Theater","Their","Them","Theme","Themselves","Then","Theory","Therapy","Therefore","These","Thick","Thin","Thing","Think","Thinking","Third","Thirty","Those","Though","Thought","Thousand","Threat","Threaten","Throat","Through","Throughout","Throw","Thus","Ticket","Tie","Tight","Time","Tiny","Tip","Tire","Tired","Tissue","Title","To","Tobacco","Today","Toe","Together","Tomato","Tomorrow","Tone","Tongue","Tonight","Too","Tool","Tooth","Top","Topic","Toss","Total","Totally","Touch","Tough","Tour","Tourist","Tournament","Toward","Towards","Tower","Town","Toy","Trace","Track","Trade","Tradition","Traditional","Traffic","Tragedy","Trail","Train","Training","Transfer","Transform","Transformation","Transition","Translate","Transportation","Travel","Treat","Treatment","Treaty","Tree","Tremendous","Trend","Trial","Tribe","Trick","Trip","Troop","Trouble","Truck","True","Truly","Trust","Truth","Try","Tube","Tunnel","Turn","TV","Twelve","Twenty","Twice","Twin","Type","Typical","Typically","Ugly","Ultimate","Ultimately","Unable","Uncle","Under","Undergo","Understand","Understanding","Unfortunately","Uniform","Union","Unique","Unit","United","Universal","Universe","Unknown","Unless","Unlike","Unlikely","Until","Unusual","Up","Upon","Upper","Urban","Urge","Us","Use","Used","Useful","User","Usual","Usually","Utility","Vacation","Valley","Valuable","Value","Variable","Variation","Variety","Various","Vary","Vast","Vegetable","Vehicle","Venture","Version","Versus","Very","Vessel","Veteran","Via","Victim","Victory","Video","View","Viewer","Village","Violate","Violation","Violence","Violent","Virtually","Virtue","Virus","Visible","Vision","Visit","Visitor","Visual","Vital","Voice","Volume","Volunteer","Vote","Voter","Vs","Vulnerable","Wage","Wait","Wake","Walk","Wall","Wander","Want","War","Warm","Warn","Warning","Wash","Waste","Watch","Water","Wave","Way","Weak","Wealth","Wealthy","Weapon","Wear","Weather","Wedding","Week","Weekend","Weekly","Weigh","Weight","Welcome","Welfare","Well","Wet","Whatever","Wheel","Whenever","Whereas","Whether","Whisper","White","Whole","Whom","Whose","Why","Wide","Widely","Widespread","Wife","Wild","Will","Willing","Win","Wind","Window","Wine","Wing","Winner","Winter","Wipe","Wire","Wisdom","Wise","Wish","With","Withdraw","Within","Without","Witness","Woman","Wonder","Wonderful","Wood","Wooden","Word","Work","Worker","Working","Works","Workshop","World","Worried","Worry","Worth","Would","Wound","Wrap","Write","Writer","Writing","Wrong","Yard","Yeah","Year","Yell","Yellow","Yes","Yesterday","Yet","Yield","You","Young","Your","Yours","Yourself","Youth","Zone","Afghanistan","Algeria","Andorra","Anguilla","Antigua","Barbuda","Armenia","Australia","Azerbaijan","Bahamas","Bangladesh","Belarus","Belize","Bermuda","Bolivia","Botswana","Brunei","Darussalam","Burkina","Faso","Cambodia","Canada","Cayman","Islands","Chad","Cocos","Keeling","Comoros","Congo","Republic","Brazzaville","Costa","Rica","Croatia","Cyprus","Denmark","Dominica","Timor","Timor-Leste","Egypt","Equatorial","Guinea","Estonia","Falkland","Fiji","Polynesia","Gabon","Georgia","Ghana","Greenland","Guadeloupe","Guatemala","Guinea-Bissau","Haiti","Honduras","Hungary","Iceland","Indonesia","Iraq","Israel","Ivory","Jamaica","Jordan","Kazakhstan","Kiribati","Korea","Kuwait","Lao","Lebanon","Liberia","Liechtenstein","Luxembourg","Malawi","Maldives","Malta","Martinique","Mauritius","Mexico","Moldova","Mongolia","Montserrat","Mozambique","Namibia","Nepal","Netherlands","Antilles","Zealand","Niger","Niue","Macedonia","Norway","Oman","Pakistan","Territories","Papua","Peru","Pitcairn","Portugal","Qatar","Reunion","Federation","Saint","Kitts","Nevis","Vincent","Grenadines","San","Marino","Saudi","Arabia","Serbia","Sierra","Leone","Slovakia","Slovak","Solomon","Spain","Sudan","Swaziland","Eswatini","Switzerland","Taiwan","Tanzania;","Officially","Tanzania","Tibet","Togo","Tonga","Tunisia","Turkmenistan","Tuvalu","Uganda","Emirates","States","Uzbekistan","Vanuatu","Venezuela","Virgin","Wallis","Futuna","Yemen","Zambia","Tokyo","Delhi","Shanghai","Dhaka","Sao","Paulo","Cairo","Beijing","Mumbai","Osaka","Chongqing","Karachi","Istanbul","Kinshasa","Lagos","Buenos","Aires","Kolkata","Manila","Tianjin","Guangzhou","Rio","De","Janeiro","Lahore","Bangalore","Shenzhen","Moscow","Chennai","Bogota","Jakarta","Lima","Bangkok","Hyderabad","Seoul","Nagoya","Chengdu","Nanjing","Tehran","Ho","Chi","Minh","Luanda","Wuhan","Xi-an","Shaanxi","Ahmedabad","Kuala","Lumpur","Hangzhou","Surat","Suzhou","Hong","Kong","Riyadh"];
    var ebodyBackup = english
        .replace(/([“>])/g, '$1 ')
        .replace(/([”<])/g, ' $1')
        .replace(/(’s )/g, ' $1')
        .replace(/([,\.?!]+)/g, ' $1 ')
        .replace(/[ ]+/g, ' ');
    var ebody = ebodyBackup;
    // MARK: - Only extra phrases that has at least two words, mostly people names
    for (var j = 8; j >= minLength; j--) {
        var namesArray = fillArray(j, '([A-Z][a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\'\-]+)', '([A-Z][a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\'\-]+|and)'); 
        var nameReg = new RegExp(' ' + namesArray.join(' ') + ' ', 'g');
        var matches = ebody.match(nameReg);
        ebody = ebody.replace(nameReg, ' ').replace(/[ ]+/g, ' ');
        if (matches) {
            matches = matches.filter(function(item){
                return commonStartWord.indexOf(item) === -1;
            });
            for (var k = 0; k < matches.length; k++) {
                var val = matches[k].trim();
                var startWord = val.replace(/ .+$/g, '');
                if (commonStartWord.indexOf(startWord) >= 0) {continue;}
                names.add(val);
            }
        }
    }
    var words = new Set();
    for (var it = names.values(), val= null; val=it.next().value; ) {
        var newWords = val.split(' ');
        for (var j=0; j<newWords.length; j++) {
            words.add(newWords[j]);
        }
    }
    // MARK: - Use the translated text to extra words that are missed
    var matches = translation.match(/[\(（][A-Za-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\'\-\d ]+[\)）]/g);
    if (matches) {
        for (var j=0; j<matches.length; j++) {
            var match = matches[j].replace(/[\(\)\（\）]/g, '');
            if (words.has(match)) {continue;}
            names.add(match);
        }
    }
    ebody = ebodyBackup;
    var goodMatches = [];
    for (var it = names.values(), val= null; val=it.next().value; ) {
        var oneMatch = {
            key: val,
            appear: 0,
            parts: []
        };
        var nameReg = new RegExp(' ' + val + ' ', 'g');
        var matches = ebody.match(nameReg);
        ebody = ebody.replace(nameReg, ' ');
        if (matches && matches.length > 0) {
            oneMatch.appear += matches.length;
            var parts = val.split(' ');

            for (var l=0; l<parts.length; l++) {
                var part = parts[l];
                if (commonStartWord.indexOf(part) >= 0 || !/[A-Z]/.test(part)) {continue;}
                var partReg = new RegExp(' ' + part + ' ', 'g');
                var partMatches = ebody.match(partReg);
                // MARK: match return null if not found, but in future versions of JavaScript, it might return an empty array. Let me on the safe side. 
                if (partMatches && partMatches.length > 0) {
                    if (part === 'Al') {
                        console.log(partReg);
                    }
                    oneMatch.parts.push({
                        key: part,
                        appear: partMatches.length
                    });
                }
            }
        }
        if (oneMatch.appear > 1 || oneMatch.parts.length > 0) {
            goodMatches.push(oneMatch);
        }
    }
    // MARK: - In review mode, add the words that are in the dict. 
    if (isReviewMode && typeof dict === 'object') {
        var existingKeys = new Set();
        for (var m = 0; m < goodMatches.length; m++) {
            existingKeys.add(goodMatches.key);
            for (n = 0; n < goodMatches[m].parts.length; n++) {
                existingKeys.add(goodMatches[m].parts[n].key);
            }
        }
        var dictKeys = Object.keys(dict);
        for (var p = 0; p < dictKeys.length; p++) {
            var key = dictKeys[p];
            if (existingKeys.has(key)) {continue;}
            goodMatches.push({
                key: key,
                appear: 1,
                parts: []
            });
        }
    }
    return goodMatches;
}

// MARK: - Show some helpful reminder for the translators to unify translation of name entities
function showNames() {
    var ebody = '';
    var englishTexts = document.querySelectorAll('.info-original');
    for (var i = 0; i < englishTexts.length;  i++) {
        var html = ' ' + englishTexts[i].innerHTML + ' ';
        html = html.replace(/([,.?!]+)/g, ' $1 ').replace(/[ ]+/g, ' ');
        ebody += html;
    }
    var translation = '';
    var translations = document.querySelectorAll('.info-translation');
    for (var m=0; m < translations.length; m++) {
        translation += translations[m].innerHTML;
    }
    var nameEntities = getNameEntities(ebody, translation, 2);
    // console.log(nameEntities);
    if (!nameEntities || nameEntities.length === 0) {return;}
    var infoOriginals = document.querySelectorAll('.info-original');
    for (var i = 0; i < infoOriginals.length; i++) {
        var ele = infoOriginals[i];
        var originalText = ele.innerHTML;
        // MARK: Don't insert the same word twice in one paragraph
        var insertedKeySet = new Set();
        for (var j = 0; j < nameEntities.length; j++) {
            var nameEntity = nameEntities[j];
            var key = nameEntity.key;
            var reg = new RegExp(key, 'g');
            var matches = originalText.match(reg);
            var matchedKeySets = new Set();
            if (matches && matches.length > 0) {
                matchedKeySets.add(key);
                for (var m=0; m<nameEntity.parts.length; m++) {
                    matchedKeySets.add(nameEntity.parts[m].key);
                }
            } else {
                for (var k=0; k<nameEntity.parts.length; k++) {
                    var partNameEntity = nameEntity.parts[k];
                    var partKey = partNameEntity.key;
                    var partReg = new RegExp(partKey, 'g');
                    var partMatches = originalText.match(partReg);
                    if (partMatches && partMatches.length > 0) {
                        matchedKeySets.add(key);
                        matchedKeySets.add(partKey);
                    }
                }
            }
            if (matchedKeySets.size === 0) {continue;}
            var matchedKeys = Array.from(matchedKeySets);
            var infoContainer = ele.closest('.info-container');
            var nameEntitiesContainer = infoContainer.querySelector('.name-entities-container');
            if (!nameEntitiesContainer) {
                nameEntitiesContainer = document.createElement('DIV');
                nameEntitiesContainer.className = 'name-entities-container';
                infoContainer.querySelector('.info-helper').append(nameEntitiesContainer);
            }
            for (var n=0; n<matchedKeys.length; n++) {
                var key = matchedKeys[n];
                if (insertedKeySet.has(key)) {continue;}
                insertedKeySet.add(key);
                var nameEle = document.createElement('DIV');
                nameEle.className = 'name-entity-inner';
                nameEle.setAttribute('data-key', key);
                var value = '';
                var shortCutHTML = '';
                if (isReviewMode && dict[key] && dict[key].length === 1 && dict[key][0] !== '') {
                    value = dict[key][0];
                    shortCutHTML = '<span class="name-entity-shortcut">' + value + '</span><span class="name-entity-shortcut">' + value + '(' + key + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span>';
                }
                nameEle.innerHTML = '<span class="name-entity-key">' + key + '</span><span><input type="text" value="' + value + '" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button></span>';
                nameEntitiesContainer.appendChild(nameEle);
                var translationEle = document.createElement('DIV');
                translationEle.className = 'name-entity-translation';
                translationEle.setAttribute('data-key', key);
                translationEle.innerHTML = shortCutHTML;
                nameEntitiesContainer.appendChild(translationEle);                
            }
        }
        var firstNameEntitiesContainer = ele.closest('.info-container').querySelector('.name-entities-container');
        if (firstNameEntitiesContainer) {
            var nameEntitieDescription = document.createElement('DIV');
            nameEntitieDescription.className = 'name-entities-description';
            nameEntitieDescription.innerHTML = '在本段落中找到在全文多次出现的词语，为避免同一个英文名词在同一篇文章中被译成不同中文名词，您可以把统一的译法填写在下方的文本框中。这样，这些词在别的地方出现时，您可以通过点击来快速使用，并得到相应的提示。';
            firstNameEntitiesContainer.parentElement.insertBefore(nameEntitieDescription, firstNameEntitiesContainer);
        }
        var ignoreAllContainer = document.createElement('BUTTON');
        ignoreAllContainer.className = 'ignore-all-name-entity';
        ignoreAllContainer.innerHTML = '全部忽略';
        ele.closest('.info-container').querySelector('.info-helper').append(ignoreAllContainer);
    }
    checkInfoHelpers();
}

function showGlossarySuggestions() {
    if (!window.opener) {return;}
    var ebodyEle = window.opener.document.getElementById('ebody');
    if (!ebodyEle) {return;}
    var ebody = ebodyEle.value;
    var div = document.createElement('DIV');
    div.innerHTML = ebody;
    ebody = div.innerText;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/falcon.php/glossary/ajax_get_suggestions');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {
        if (xhr.status !== 200) {return;}
        var suggestions;
        try {
            suggestions = JSON.parse(xhr.responseText);
        } catch(err) {
            console.log('ajax_get_suggestions api not a valid JSON: ');
            console.log(xhr.responseText);
            console.log(err);
            return;
        }
        var infoOriginals = document.querySelectorAll('.info-original');
        for (var i = 0; i < infoOriginals.length; i++) {
            var infoOriginal = infoOriginals[i];
            var englishText = infoOriginal.innerText;
            for (var j = 0; j < suggestions.length; j++) {
                var suggestion = suggestions[j];
                var en_title = suggestion.en_title;
                var chinese_title = suggestion.chinese_title;
                if (!en_title || !chinese_title || englishText.indexOf(en_title) === -1) {continue;}
                var infoContainer = infoOriginal.closest('.info-container');
                var existingNameEntityInner = infoContainer.querySelector('.name-entity-inner[data-key="' + en_title + '"]');
                var existingNameEntityTranslation = infoContainer.querySelector('.name-entity-translation[data-key="' + en_title + '"]');
                if (existingNameEntityInner && existingNameEntityTranslation) {
                    existingNameEntityInner.querySelector('input').value = chinese_title;
                    existingNameEntityTranslation.innerHTML = '<span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span>';
                } else {
                    var suggestionEle = document.createElement('DIV');
                    suggestionEle.innerHTML = en_title + ': <b>' + chinese_title + '</b>';
                    suggestionEle.className = 'translation-suggestion';
                    suggestionEle.setAttribute('data-translation', chinese_title);
                    suggestionEle.setAttribute('title', '点击这里快速将“' + chinese_title + '”插入到下面文本框中');
                    infoOriginal.parentElement.append(suggestionEle);
                    // MARK: - Insert glossary to the right column
                    var infoHelper = infoOriginal.closest('.info-container').querySelector('.info-helper');
                    var nameEntityContainer = infoHelper.querySelector('.name-entity-container');
                    if (!nameEntityContainer) {
                        nameEntityContainer = document.createElement('DIV');
                        infoHelper.append(nameEntityContainer);
                    }
                    var newNameEntityInnerHTML = '<div class="name-entities-container"><div class="name-entity-inner" data-key="' + en_title + '"><span class="name-entity-key">' + en_title + '</span><span><input type="text" value="' + chinese_title + '" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button><span></span></span></div><div class="name-entity-translation" data-key="' + en_title + '"><span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span></div>';
                    nameEntityContainer.innerHTML += newNameEntityInnerHTML;
                }
            }
        }
        checkInfoHelpers();
    };
    xhr.send(encodeURI('post_text=' + ebody));
}

function finishTranslationForVideo() {
    var infos = window.subtitleInfo.text;
    for (var i=0; i<infos.length; i++) {
        var p = infos[i];
        for (var j=0; j<p.length; j++) {
            var s = p[j];
            var id = s.id;
            var translation = document.querySelector('[data-info-id="' + id + '"]').value;
            s.translation = translation;
            delete s.translations;
            delete s.id;
        }
    }
    if (window.opener) {
        var cbodyEle = window.opener.document.querySelector('#cbody');
        if (cbodyEle) {
            cbodyEle.value = JSON.stringify(window.subtitleInfo);
            window.opener.document.getElementById('cshortleadbody').value = '';
            // MARK: 
            // - PendingSubtitle will be searched by FTC Bot to upload biligual subtitles to CC Video. 
            // - This process will only be used for FT Academy as the video team has indicated that they will not use this to speed up translation. 
            window.opener.document.getElementById('tag').value = 'FT商学院,高端专享,原声视频,中英字幕,PendingSubtitle';
        }
    } else {
        console.log(window.subtitleInfo);
    }
    return true;
}

function preview(buttonEle) {
    var translations = '';
    if (isReviewMode) {
        var textareas = document.querySelectorAll('.info-container textarea');
        for (var i=0; i<textareas.length; i++) {
            var t = textareas[i].value;
            if (/^<.*>$/.test(t) === false) {
                t = '<p>' + t + '</p>';
            }
            translations += t;
        }
    } else {
        var t = document.getElementById('english-text').value;
        var newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
        var englishInfoDiv = document.createElement('DIV');
        englishInfoDiv.innerHTML = newText;
        for (var i=0; i<document.querySelectorAll('[data-info-id]').length; i++) {
            var ele = document.querySelectorAll('[data-info-id]')[i];
            var id = ele.getAttribute('data-info-id');
            var infoEle = englishInfoDiv.querySelector('#' + id);
            if (infoEle) {
                infoEle.innerHTML = ele.value.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
            }
        }
        translations = englishInfoDiv.innerHTML;
    }
    var previewContainer;
    if (document.querySelectorAll('.preview-container').length === 0) {
        previewContainer = document.createElement('DIV');
        previewContainer.className = 'preview-container';
        document.body.appendChild(previewContainer);
    }
    previewContainer = document.querySelector('.preview-container');
    previewContainer.innerHTML = '<div class="preview-content">' + translations + '</div>';
    document.body.classList.toggle('preview');
    if (document.body.classList.contains('preview')) {
        buttonEle.value = '编辑';
    } else {
        buttonEle.value = '预览';
    }
}

function saveToLocal(force) {
    if (!force) {
        if (!confirm('覆盖之前保存在本地的版本，确定吗？')) {return;}
    }
    var storyBodyConttainerEle = document.getElementById('story-body-container');
    if (!storyBodyConttainerEle) {return;}
    var textareas = storyBodyConttainerEle.querySelectorAll('textarea');
    for (var i=0; i<textareas.length; i++) {
        textareas[i].innerHTML = textareas[i].value;
    }
    var saved = storyBodyConttainerEle.innerHTML;
    try {
        localStorage.setItem(localStorageKey, saved);
    } catch(err) {
        alert('由于浏览器的问题，无法在本地保存您的工作，请把这个错误信息截屏给技术人员\n' + err.toString());
    }
}

function restoreFromLocal() {
    if (!confirm('恢复到上次保存在本地的版本，会丢失现在的所有修改，确定吗？')) {return;}
    var storyBodyConttainerEle = document.getElementById('story-body-container');
    if (!storyBodyConttainerEle) {return;}
    try {
        var saved = localStorage.getItem(localStorageKey);
        console.log(saved);
        storyBodyConttainerEle.innerHTML = saved;
    } catch(err) {
        alert('很可能是由于浏览器的问题，无法从本地恢复您的工作，请把这个错误信息截屏给技术人员\n' + err.toString());
    }
}

function showReplace(buttonEle) {
    var from = window.getSelection().toString() || '';
    var replaceContainer;
    if (!document.querySelector('.replace-container')) {
        replaceContainer = document.createElement('DIV');
        replaceContainer.className = 'replace-container';
        document.body.appendChild(replaceContainer);
    }
    replaceContainer = document.querySelector('.replace-container');
    replaceContainer.innerHTML = '<div class="replace-content"><input placeholder="旧译名" type="text" class="replace-from" value="' + from + '"><input placeholder="新译名" type="text" class="replace-to"><button onclick="replaceAll()">全部替换</button></div>';
    document.body.classList.remove('show-add-new-match');
    document.getElementById('add-new-match-button').value = '添加词条';
    document.body.classList.toggle('show-replace');
    if (document.body.classList.contains('show-replace')) {
        buttonEle.value = '隐藏替换';
    } else {
        buttonEle.value = '全文替换';
    }
}

function replaceAll() {
    var from = document.querySelector('.replace-from').value;
    if (from === '') {
        alert('旧译名不能为空!');
        return;
    }
    var to = document.querySelector('.replace-to').value;
    if (to === from) {return;}
    var allTranslationDivs = document.querySelectorAll('.info-translation');
    var allTranslationTexts = document.querySelectorAll('.info-container textarea');
    var replaceCount = 0;
    const fromRegex = new RegExp(from, "g");
    for (var i=0; i<allTranslationDivs.length; i++) {
        var currentDiv = allTranslationDivs[i];
        const matches = currentDiv.innerHTML.match(fromRegex);
        if (matches && matches.length > 0) {
            currentDiv.innerHTML = currentDiv.innerHTML.replace(fromRegex, to);
            replaceCount += matches.length;
        }
    }
    for (var j=0; j<allTranslationTexts.length; j++) {
        var currentTextArea = allTranslationTexts[j];
        while (currentTextArea.value.indexOf(from) >= 0) {
            const matches = currentTextArea.value.match(fromRegex);
            if (matches && matches.length > 0) {
                currentTextArea.value = currentTextArea.value.replace(fromRegex, to);
                replaceCount += matches.length;
            }
            // MARK: - avoid infinite loop with this
            if (to.indexOf(from) >= 0) {
                break;
            }
        }
    }
    if (replaceCount > 0) {
        toggleAllTextareaWarning();
        alert('完成了' + replaceCount + '次替换！如您对此功能有进一步的要求和建议，比如，希望我们的机器翻译结果能“记住”正确的译法，请告诉Oliver');
    } else {
        alert('在译文中没有找到“' + from + '”，请检查一下您的输入是否正确');
    }
}

function showAddNewMatch(buttonEle) {
    var from = window.getSelection().toString() || '';
    var to = '';
    var reg = /^(.+)[\(（](.+)[\)）]$/g;
    if (reg.test(from)) {
        to = from.replace(reg, '$1');
        from = from.replace(reg, '$2');
    }
    var addNewMatchContainer;
    if (!document.querySelector('.add-new-match-container')) {
        addNewMatchContainer = document.createElement('DIV');
        addNewMatchContainer.className = 'add-new-match-container';
        document.body.appendChild(addNewMatchContainer);
    }
    addNewMatchContainer = document.querySelector('.add-new-match-container');
    addNewMatchContainer.innerHTML = '<div class="replace-content"><input placeholder="原文" type="text" class="new-match-from" value="' + from + '"><input placeholder="译文" type="text" class="new-match-to" value="' + to + '"><button onclick="addNewMatch()">添加词条</button></div>';
    document.body.classList.remove('show-replace');
    document.getElementById('show-replace-button').value = '全文替换';
    document.body.classList.toggle('show-add-new-match');
    if (document.body.classList.contains('show-add-new-match')) {
        buttonEle.value = '隐藏添加';
    } else {
        buttonEle.value = '添加词条';
    }
}

function addNewMatch() {
    var from = document.querySelector('.new-match-from').value;
    if (from === '') {
        alert('原文不能为空!');
        return;
    }
    var to = document.querySelector('.new-match-to').value;
    if (to === '') {
        alert('译文不能为空');
        return;
    }
    var infoContainers = document.querySelectorAll('.info-container');
    var createCount = 0;
    var updateCount = 0;
    for (var i=0; i<infoContainers.length; i++) {
        var infoContainer = infoContainers[i];
        var existingNameEntities = infoContainer.querySelectorAll('.name-entity-inner');
        var foundExisting = false;
        for (var j=0; j<existingNameEntities.length; j++) {
            var existingNameEntity = existingNameEntities[j];
            if (existingNameEntity.getAttribute('data-key') !== from) {continue;}
            existingNameEntity.querySelector('input').value = to;
            var shortCutEle = existingNameEntity.parentElement.querySelector('.name-entity-translation[data-key="' + from + '"]');
            if (!shortCutEle) {continue;}
            shortCutEle.innerHTML = '<span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span>';
            foundExisting = true;
            updateCount += 1;
        }
        if (foundExisting) {continue;}
        var originalEle = infoContainer.querySelector('.info-original');
        var originalText = originalEle.innerHTML;
        originalText = originalText
            .replace(/([“>]+)/g, '$1 ')
            .replace(/([”<])/g, ' $1')
            .replace(/(’s )/g, ' $1')
            .replace(/([,\.?!]+)/g, ' $1 ')
            .replace(/[ ]+/g, ' ');
        originalText = ' ' + originalText + ' ';
        var reg = new RegExp(' ' + from + ' ', 'g');
        if (reg.test(originalText) === false) {continue;}
        var infoContainer = originalEle.closest('.info-container');
        var nameEntitiesContainer = infoContainer.querySelector('.name-entities-container');
        if (!nameEntitiesContainer) {
            var nameEntitiesContainer = document.createElement('DIV');
            nameEntitiesContainer.className = 'name-entities-container';
            infoContainer.querySelector('.info-helper').appendChild(nameEntitiesContainer);
        }
        nameEntitiesContainer.innerHTML += '<div class="name-entity-inner" data-key="' + from + '"><span class="name-entity-key">' + from + '</span><span><input type="text" value="' + to + '" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button><span></span></span></div><div class="name-entity-translation" data-key="' + from + '"><span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span><button class="add-name-entity" title="将译法添加到词库">添加</button></span></div>';
        createCount += 1;
    }
    if (updateCount === 0 && createCount === 0) {
        alert('没有在原文中找到词条，请检查一下您的原文的输入！');
    } else {
        var updateMessage = (updateCount > 0) ? '更新了' + updateCount + '个段落的词条。' : '';
        var createMessage = (createCount > 0) ? '添加了' + createCount + '个段落的词条。' : '';
        alert (updateMessage + createMessage);
        checkInfoHelpers();
        toggleAllTextareaWarning();
    }
}

function watchChange() {
    if (!window.opener) {return;}
    var fileupdatetimeEle = window.opener.document.getElementById('fileupdatetime');
    var fileupdatetime = fileupdatetimeEle.value;
    if (!fileupdatetimeEle) {return;}
    var ids = [window.opener.contentId];
    var idsString = ids.join(',');
    heartBeatIntervalId = setInterval(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('post', '/falcon.php/jsapi/get_interactive_info_by_id');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status !== 200) {return;}
            var items = JSON.parse(xhr.responseText);
            if (items.length === 0) {return;}
            var newFileupdatetime = items[0].fileupdatetime;
            if (newFileupdatetime != fileupdatetime) {
                fileupdatetime = newFileupdatetime;
                if (window.confirm('这篇文章在您进行编辑的时候，似乎被别人进行了修改或发布，您要看看详情吗？')) {
                    window.open('/falcon.php/ia/edit/' + window.opener.contentId, '_blank');
                }
            }
        };
        xhr.send(idsString);
    }, 60000);
}

function startHeartBeat(status) {
    if (!window.opener) {return;}

    function humanTimeDiff(t) {
        var now = new Date().getTime()/1000;
        var seconds = now - t;
        if (seconds < 60) {
            return Math.round(seconds) + '秒';
        } else if (seconds < 3600) {
            return Math.round(seconds/60) + '分钟';
        } else {
            return Math.round(seconds/3600) + '小时';
        }
    }

    function popReminder(data) {
        var info = parseReminder(data);
        if (!info) {
            updateHeartBeat(status);
            return;
        }
        var message = '请注意，这篇文章似乎有别人正在处理，以下是具体的信息：' + info.message + '您还要继续打开吗？';
        if (window.confirm(message)) {
            updateHeartBeat(status);
            return;
        }
        window.close();
    }

    function toggleReminder(data) {
        var info = parseReminder(data);
        var reminderEle = document.querySelector('.reminder-container');
        if (!reminderEle) {
            reminderEle = document.createElement('DIV');
            reminderEle.className = 'reminder-container';
            document.body.appendChild(reminderEle);
        }
        if (!info) {
            reminderEle.classList.remove('on');
            return;
        }
        if (info.warning) {
            reminderEle.classList.add('is-warning');
        } else {
            reminderEle.classList.remove('is-warning');
        }
        reminderEle.classList.add('on');
        reminderEle.innerHTML = info.message;
    }

    function parseReminder(data) {
        if (!data || typeof data !== 'object') {
            return null;
        }
        delete data[window.userName];
        delete data[window.userIP];
        var keys = Object.keys(data);
        if (keys.length === 0) {
            return null;
        }
        // MARK: Show the reminder now
        var now = new Date().getTime()/1000;
        var maxSeconds = 120;
        var cutTime = now - maxSeconds;
        var message = '';
        var statusDict = {
            translating: '翻译',
            editing: '编辑'
        };
        var warning = false;
        var warningSeconds = 20;
        var warningCutTime = now - warningSeconds;
        for (var i=0; i<keys.length; i++) {
            var key = keys[i];
            var regIP = /^[\d\.]+$/;
            // if (regIP.test(key) && keys.length === 1) {
            //     break;
            // }
            var extraInfo = '';
            if (regIP.test(key) && location.hostname === 'backyard.ftchinese.org') {
                extraInfo = '(有可能是你自己的IP，如果确认的话，可以忽略这个警告)';
            }
            var info = JSON.parse(data[key]);
            if (info.time < cutTime) {continue;}
            if (info.time > warningCutTime) {
                warning = true;
            }
            var explaination = (warning) ? '。' : '，他/她有可能已经断网或者退出了。';
            message += key + extraInfo + '可能在' + statusDict[info.status] + '，最新的活跃时间是' + humanTimeDiff(info.time) + '之前' + explaination;
        }
        if (message === '') {
            return null;
        }
        return {warning: warning, message: message};
    }

    function checkHeartBeat() {
        var fromUrl = window.opener.location.pathname;
        if (/workflow/.test(fromUrl)) {
            type = 'story';
        } else if (/\/ia\//.test(fromUrl)) {
            type = 'interactive';
        }
        id = fromUrl.replace(/[\?#].*$/g, '').substring(fromUrl.lastIndexOf('/') + 1);
        var postObj = {"type": type, "id": id};   
        var post = JSON.stringify(postObj);
        var url = "/falcon.php/status/get";
        var xhr = new XMLHttpRequest()
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
        xhr.send(post);
        xhr.onload = function () {
            if(xhr.status !== 200) {
                updateHeartBeat(status);
                return;
            }
            var data = JSON.parse(xhr.responseText);
            popReminder(data);
        }
    }

    function updateHeartBeat() {
        setInterval(function(){
            var postObj = {"type": type, "id": id, "status": status};   
            var post = JSON.stringify(postObj);
            var url = "/falcon.php/status/update";
            var xhr = new XMLHttpRequest()
            xhr.open('POST', url, true)
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
            xhr.send(post);
            xhr.onload = function () {
                if(xhr.status !== 200) {return;}
                var data = JSON.parse(xhr.responseText);
                toggleReminder(data);
            }
        }, 10000);
    }

    // MARK: - Start heart beat immediately
    checkHeartBeat(status);
}

function stopHeartbeat() {
    var postObj = {"type": type, "id": id};   
    var post = JSON.stringify(postObj);
    var url = "/falcon.php/status/delete";
    var xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)
    xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8')
    xhr.send(post);
    xhr.onload = function () {
        if(xhr.status !== 200) {return;}
        var data = JSON.parse(xhr.responseText);
        console.log('\n\nstopped: ');
        console.log(data);
    }
    // MARK: cancel time interval for updating
    clearInterval(heartBeatIntervalId);
}


var isReviewMode = false;
var eText;
var tText;
if (window.opener || typeof window.subtitleInfo === 'object' || window.testingType) {
    if (window.opener) {
        eText = window.opener.ebodyForTranslation || window.opener.document.getElementById('ebody').value;
        tText = window.opener.cbodyForTranslation || window.opener.document.getElementById('cbody').value;
        if (/caption/.test(tText) && /translations/.test(tText) && /\"end\":/.test(tText)) {
            window.subtitleInfo = JSON.parse(tText);
        }
        var dictEle = window.opener.document.getElementById('cshortleadbody');
        if (dictEle) {
            try {
                dict = JSON.parse(dictEle.value);
            } catch(ignore) {}
        }
    } else if (window.testingType === 'json' && window.testEnglishBodyJSON && window.testChineseBodyJSON) {
        eText = window.testEnglishBodyJSON;
        tText = JSON.stringify(window.testChineseBodyJSON);
        if (/caption/.test(tText) && /translations/.test(tText) && /\"end\":/.test(tText)) {
            window.subtitleInfo = JSON.parse(tText);
        }
        dict = window.testingDict;
    } else if (window.testingType === 'text' && window.testEnglishBodyText && window.testChineseBodyText) {
        eText = window.testEnglishBodyText;
        tText = window.testChineseBodyText;
        dict = window.testingDict;
    }
    // MARK: - Update english and translation text for video subtitles
    if (typeof window.subtitleInfo === 'object') {
        var infos = window.subtitleInfo.text;
        var englishTexts = [];
        var translations = [];
        var n = 0;
        for (var i=0; i<infos.length; i++) {
            var p = infos[i];
            for (var j=0; j<p.length; j++) {
                var s = p[j];
                var id = 'id-' + n;
                englishTexts.push('<p id="' + id + '">' + s.text + '</p>');
                var t = s.translations || [];
                translations.push({id: id, translations: t});
                s.id = id;
                n += 1;
            }
        }
        eText = englishTexts.join('');
        tText = JSON.stringify(translations);
    }
    if (/translations/.test(tText)) {
        document.getElementById('translation-info').value = tText;
        document.getElementById('english-text').value = eText;
    } else {
        isReviewMode = true;
    }
    start();
    watchChange();
    startHeartBeat(heartBeatStatus);
}

/* jshint ignore:end */