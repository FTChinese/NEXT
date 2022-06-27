// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no var or for of loops, or any other modern features. 
var splitter = '-|-';
var startTime = new Date();
var localStorageKey = 'translation';
if (window.opener && window.opener.userName) {
    window.userName = window.opener.userName;
} else {
    window.userName = '';
}
var dict = {};
var delegate = new Delegate(document.body);

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
        nameEntityContainer.parentElement.querySelector('.name-entities-description').innerHTML = ''; 
    }
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
            element.innerHTML = '<span class="name-entity-shortcut">' + value + '</span><span class="name-entity-shortcut">' + value + '(' + key + ')</span>'
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
            if (translation === key) {continue;}
            if (ele.value.indexOf(translation) === -1) {continue;}
            var nameEntityInners = document.querySelectorAll('.name-entity-inner[data-key="' + key + '"]');
            for (var j=0; j<nameEntityInners.length; j++) {
                nameEntityInners[j].querySelector('input').value = translation;
            }
            var nameEntityTranslations = document.querySelectorAll('.name-entity-translation[data-key="' + key + '"]');
            for (var m=0; m<nameEntityTranslations.length; m++) {
                nameEntityTranslations[m].innerHTML = '<span class="name-entity-shortcut">' + translation + '</span><span class="name-entity-shortcut">' + translation + '(' + key + ')</span>';
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
                infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="' + id + '" placeholder="点选左边的翻译版本，您也可以继续编辑"></textarea></div><div class="info-helper"></div></div><hr>';
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
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑">' + t1 + '</textarea></div><div class="info-helper"></div></div><hr>';
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
        var question = '您编辑的内容可能有些问题，您还要继续提交吗？\n\n' + status.message;
        if (!window.confirm(question)) {
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
    var commonStartWord = ['Meanwhile', 'Since', 'During', 'While', 'When', 'Where', 'What', 'Which', 'Who', 'How', 'For', 'It', 'The', 'A', 'We', 'Being', 'They', 'He', 'She', 'I', 'There', 'In', 'That', 'People', 'From', 'Between', 'But', 'However', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Although', 'On', 'And', 'This', 'That', 'University', 'Legal', 'General', 'Investment', 'Management', 'Securities', 'US', 'Exchange', 'Commission', 'Asset', 'Bank', 'EU', 'If', 'International', 'Economics', 'Institute', 'Africa', 'Europe', 'Asia', 'America', 'American', 'Chinese', 'China', 'India', 'South', 'North', 'East', 'West', 'Western', 'Apple', 'Google', 'Amazon', 'President', 'As', 'UK', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Airport', 'Air', 'At', 'All', 'Here'];
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
    console.log(nameEntities);
    if (!nameEntities || nameEntities.length === 0) {return;}
    var infoOriginals = document.querySelectorAll('.info-original');
    for (var i = 0; i < infoOriginals.length; i++) {
        var ele = infoOriginals[i];
        var originalText = ele.innerHTML;
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
                var nameEle = document.createElement('DIV');
                nameEle.className = 'name-entity-inner';
                nameEle.setAttribute('data-key', matchedKeys[n]);
                nameEle.innerHTML = '<span class="name-entity-key">' + matchedKeys[n] + '</span><span><input type="text" value="" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button><span>';
                nameEntitiesContainer.appendChild(nameEle);
                var translationEle = document.createElement('DIV');
                translationEle.className = 'name-entity-translation';
                translationEle.setAttribute('data-key', matchedKeys[n]);
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
    }
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
        var suggestions = JSON.parse(xhr.responseText);
        var infoOriginals = document.querySelectorAll('.info-original');
        for (var i = 0; i < infoOriginals.length; i++) {
            var infoOriginal = infoOriginals[i];
            var englishText = infoOriginal.innerText;
            for (var j = 0; j < suggestions.length; j++) {
                var suggestion = suggestions[j];
                var en_title = suggestion.en_title;
                var chinese_title = suggestion.chinese_title;
                if (!en_title || !chinese_title || englishText.indexOf(en_title) === -1) {continue;}
                var existingNameEntityInner = infoOriginal.parentElement.querySelector('.name-entity-inner[data-key="' + en_title + '"]');
                var existingNameEntityTranslation = infoOriginal.parentElement.querySelector('.name-entity-translation[data-key="' + en_title + '"]');
                if (existingNameEntityInner && existingNameEntityTranslation) {
                    existingNameEntityInner.querySelector('input').value = chinese_title;
                    existingNameEntityTranslation.innerHTML = '<span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span>';
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
                    var newNameEntityInnerHTML = '<div class="name-entities-container"><div class="name-entity-inner" data-key="' + en_title + '"><span class="name-entity-key">' + en_title + '</span><span><input type="text" value="' + chinese_title + '" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button><span></span></span></div><div class="name-entity-translation" data-key="' + en_title + '"><span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span></div>';
                    nameEntityContainer.innerHTML += newNameEntityInnerHTML;
                }
            }
        }
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
            shortCutEle.innerHTML = '<span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span>';
            foundExisting = true;
            updateCount += 1;
        }
        if (foundExisting) {continue;}
        var originalEle = infoContainer.querySelector('.info-original');
        var originalText = originalEle.innerHTML;
        originalText = originalText
            .replace(/“/g, '“ ')
            .replace(/”/g, ' ”')
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
        nameEntitiesContainer.innerHTML += '<div class="name-entity-inner" data-key="' + from + '"><span class="name-entity-key">' + from + '</span><span><input type="text" value="' + to + '" placeholder="填写统一译法，开启提醒"></span><span><button class="ignore-name-entity">忽略</button><span></span></span></div><div class="name-entity-translation" data-key="' + from + '"><span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span></div>';
        createCount += 1;
    }
    if (updateCount === 0 && createCount === 0) {
        alert('没有在原文中找到词条，请检查一下您的原文的输入！');
    } else {
        var updateMessage = (updateCount > 0) ? '更新了' + updateCount + '个段落的词条。' : '';
        var createMessage = (createCount > 0) ? '添加了' + createCount + '个段落的词条。' : '';
        alert (updateMessage + createMessage);
    }
}

function watchChange() {
    if (!window.opener) {return;}
    var fileupdatetimeEle = window.opener.document.getElementById('fileupdatetime');
    var fileupdatetime = fileupdatetimeEle.value;
    if (!fileupdatetimeEle) {return;}
    var ids = [window.opener.contentId];
    var idsString = ids.join(',');
    setInterval(function() {
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
}

/* jshint ignore:end */