// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no var or for of loops, or any other modern features. 
var splitter = '-|-';
var startTime = new Date();
if (window.opener && window.opener.userName) {
    window.userName = window.opener.userName;
} else {
    window.userName = '';
}
function convertTextToArray(t) {
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
        for (var i=0; i<translationInfo.length; i++) {
            var info = translationInfo[i];
            var infoHTML = '';
            var id = info.id;
            var englishHTML = englishEle.querySelector('#' + id).innerHTML;
            infoHTML += '<div class="info-original">' + englishHTML + '</div>';
            for (var j=0; j<info.translations.length; j++) {
                var translation = info.translations[j];
                var t = (/<.+>/g.test(translation)) ? tidyHTML(translation) : translation;
                infoHTML += '<div onclick="confirmTranslation(this)" data-translation-index="' + j + '" class="info-translation" title="click to confirm this translation to the right">' + t + '</div>';
            }
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><textarea data-info-id="' + id + '" placeholder="点选右边的翻译版本，您也可以继续编辑"></textarea></div></div><hr>';
            k += infoHTML;
        }
        k += '<div class="centerButton"><input type="button" value="完成并关闭" onclick="finishTranslation()" class="submitbutton button ui-light-btn"></div>';
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
}

function recordTimeInfo(spentTime) {
    if (!window.opener || typeof window.subtitleInfo === 'object') {return;}
    if (window.opener.window.location.href.indexOf('/ia/') === -1) {return;}
    var targetEle = window.opener.document.getElementById('eskylinetext');
    if (!targetEle) {return;}
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
        chineseWordCount += final.length;
        var english = infoContainer.querySelector('.info-original').innerHTML;
        englishWordCount += english.length;
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
        window.opener.document.getElementById('cbody').value = result;
        window.opener.document.getElementById('tag').value += ',translation_confirmed';
    }
    trackFinishTimeAndClose();
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
    return cleanTexts.join('\n\n');
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
        ebodyEle = window.opener.document.getElementById('ebody');
        ebodyEle.disabled = false;
        ebodyEle.value = cleanEnglishText;
        for (var k=0; k<titlesInfo.length; k++) {
            var id = titlesInfo[k].id;
            var value = titlesInfo[k].value;
            window.opener.document.getElementById(id).disabled = false;
            window.opener.document.getElementById(id).value = value;
        }
        var tagEle = window.opener.document.getElementById('tag');
        if (tagEle) {
            tagEle.value += ',AITranslation';
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
            currentSelect = completeSelects[l];
            if (currentSelect.id && currentSelect.id.indexOf('complete_') === 0) {
                currentSelect.value = 1;
            }
        }
    }
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
            window.opener.document.getElementById('tag').value = 'FT商学院,原声视频,中英字幕,PendingSubtitle';
        }
    } else {
        console.log(window.subtitleInfo);
    }
}

if (window.opener || typeof window.subtitleInfo === 'object') {
    var englishText;
    var translationText;
    if (window.opener) {
        englishText = window.opener.ebodyForTranslation || window.opener.document.getElementById('ebody').value;
        translationText = window.opener.cbodyForTranslation || window.opener.document.getElementById('cbody').value;
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