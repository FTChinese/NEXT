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

var delegate = new Delegate(document.body);

// MARK: - Links in translated text
delegate.on('click', '.info-original a[href], .info-translation a[href]', function(event){
    try {
        var textArea = this.closest(".info-container").querySelector('textarea');
        var selectionStart = textArea.selectionStart;
        var selectionEnd = textArea.selectionEnd;
        var text = textArea.value;
        if (selectionEnd > selectionStart) {
            var textBefore = text.substring(0, selectionStart);
            var textSelected = text.substring(selectionStart, selectionEnd);
            var textAfter = text.substring(selectionEnd, text.length);
            var newText = textBefore + '<a href="' + this.getAttribute('href') + '" targe="_blank">' + textSelected + '</a>' + textAfter;
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
                infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑"></textarea></div></div><hr>';
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
        console.log(existingTranslationDict);

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
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑">' + t1 + '</textarea></div></div><hr>';
            k += infoHTML;
        }
        storyBodyEle.innerHTML = k;
        if (document.querySelectorAll('.bottom-button').length === 0) {
            var bottomButton = document.createElement('DIV');
            bottomButton.className = 'centerButton bottom-button';
            bottomButton.innerHTML = '<input type="button" value="全局替换" onclick="showReplace(this)" class="submitbutton button ui-light-btn"><input type="button" value="预览" onclick="preview(this)" class="submitbutton button ui-light-btn"><input type="button" value="备份" onclick="saveToLocal()" class="submitbutton button ui-light-btn"><input type="button" value="恢复" onclick="restoreFromLocal()" class="submitbutton button ui-light-btn"><input type="button" value="完成并关闭" onclick="finishTranslation()" class="submitbutton button ui-light-btn">';
            document.body.appendChild(bottomButton);
        }
        document.querySelector('.body').classList.add('full-grid');
    } else {
        var englishTextArray = convertTextToArray(englishText.value);
        var translationEles = document.querySelectorAll('.chinese-translation');
        var translationsArray = [];
        for (var i=0; i<translationEles.length; i++) {
            var translationText = translationEles[i].value;
            translationsArray.push(convertTextToArray(translationText));
        }
        console.log(translationsArray);
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
    var allLinks = document.querySelectorAll('.info-translation a[href]');
    for (var n=0; n<allLinks.length; n++) {
        allLinks[n].setAttribute('target', '_blank');
        allLinks[n].closest(".info-container").querySelector('textarea').setAttribute('placeholder', '在点选左边把文字填写到这里之后，可以尝试选择部分文字，然后点击左边的链接，就可以方便地添加链接。');
    }
    showGlossarySuggestions();
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
        console.log(j);
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
    var result = text.replace(/[\(（)]([A-z\s\d\.,]+)[\)）]/g, '($1)'); // Use the correct English brackets
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
    if (typeof window.subtitleInfo === 'object') {
        finishTranslationForVideo();
    } else {
        finishTranslationForArticle();
    }
    trackFinishTimeAndClose();
}

function finishTranslationForArticle() {
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
                console.log(ele);
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
                var suggestionEle = document.createElement('DIV');
                suggestionEle.innerHTML = en_title + ': <b>' + chinese_title + '</b>';
                suggestionEle.className = 'translation-suggestion';
                suggestionEle.setAttribute('data-translation', chinese_title);
                suggestionEle.setAttribute('title', '点击这里快速将“' + chinese_title + '”插入到下面文本框中');
                infoOriginal.parentElement.append(suggestionEle);
            }
        }
        // console.log(suggestions);
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
}

function preview(buttonEle) {
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
    var translations = englishInfoDiv.innerHTML;
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
    for (var i=0; i<allTranslationDivs.length; i++) {
        var currentDiv = allTranslationDivs[i];
        const fromRegex = new RegExp(from, "g");
        currentDiv.innerHTML = currentDiv.innerHTML.replace(fromRegex, to);
        replaceCount += 1;
    }
    for (var j=0; j<allTranslationTexts.length; j++) {
        var currentTextArea = allTranslationTexts[j];
        while (currentTextArea.value.indexOf(from) >= 0) {
            currentTextArea.value = currentTextArea.value.replace(from, to);
            replaceCount += 1;
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

if (window.opener || typeof window.subtitleInfo === 'object' || window.isTestOn) {
    var englishText;
    var translationText;
    if (window.opener) {
        englishText = window.opener.ebodyForTranslation || window.opener.document.getElementById('ebody').value;
        translationText = window.opener.cbodyForTranslation || window.opener.document.getElementById('cbody').value;
        if (/caption/.test(translationText) && /translations/.test(translationText) && /\"end\":/.test(translationText)) {
            window.subtitleInfo = JSON.parse(translationText);
        }
    } else if (window.isTestOn && window.testEnglishBody && window.testChineseBody) {
        englishText = window.testEnglishBody;
        translationText = JSON.stringify(window.testChineseBody);
        if (/caption/.test(translationText) && /translations/.test(translationText) && /\"end\":/.test(translationText)) {
            window.subtitleInfo = JSON.parse(translationText);
        }
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
        englishText = englishTexts.join('');
        translationText = JSON.stringify(translations);
    }
    document.getElementById('english-text').value = englishText;
    if (/translations/.test(translationText)) {
        document.getElementById('translation-info').value = translationText;
    } else {
        translations = translationText.split(splitter);
        var translationsHTML = '';
        for (var k=0; k<translations.length; k++) {
            translationsHTML += '<textarea class="commentTextArea chinese-translation" width="100%" rows="3">' + translations[k] + '</textarea>';
        }
        document.getElementById('translations').innerHTML = translationsHTML;
    }
    start();
}

/* jshint ignore:end */