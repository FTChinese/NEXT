// MARK: - This is internal tool, we are free to use the latest javascript, thus no need to do jshint, which is for legacy frontend stuff
/* jshint ignore:start */
// MARK: - This has to pass through the gulp testing, so no var or for of loops, or any other modern features. 
const splitter = `-|-`;
var startTime = new Date();
var localStorageKey = 'translation';
if (window.opener) {
    window.userName = window.opener.userName || '';
    window.userIP = window.opener.userIP || '';
} else {
    window.userName = '';
    window.userIP = '';
}
window.publishedDate = window.opener?.document?.getElementById('ebyline_description')?.value ?? '';
var dict = {};
var delegate = new Delegate(document.body);
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;
var links = (isPowerTranslate || 1>0) ? `<div>Experiments: <a class="add-new-translation-choice" title="Not satisfied with the current choices? Click here to get another choice. ">OpenAI</a>, <a class="translate-with-ChatGPT" title="Not satisfied with the current choices? Ask ChatGPT to give you an answer. ">ChatGPT</a></div>` : '';
//'<div>更多翻译引擎：<a href="https://fanyi.baidu.com/" target=_blank>百度</a> | <a href="https://fanyi.youdao.com/" target=_blank>有道</a> | <a href="https://www.deepL.com/" target=_blank>DeepL</a> | <a href="https://translate.google.com/" target=_blank>Google</a></div>';
var heartBeatStatus = 'translating';
var type = 'other';
var id = '';
var heartBeatIntervalId;
var textAreaMinHeight = 60;
var source = 'en';
var target = 'cn';
var chatgptTab;
var messageCount = 0;
const previewLanguageModes = [
    {name: 'Translation', key: 'translation'},
    {name: 'Bilingual', key: 'bilingual'}
];

const PreviewLanguagePreferenceKey = 'PreviewLanguagePreference';


// MARK: - Request A Polished Version of Translation
delegate.on('click', '.translate-with-ChatGPT', async function(event){
    try {
        const container = this.parentNode.parentNode;
        const prompt = getPromptForOpenAI(container);
        const url = `https://chat.openai.com/`;
        await navigator.clipboard.writeText(prompt);
        if (chatgptTab) {
            const messageId = `message-${messageCount}`;
            messageCount += 1;
            this.parentElement.style.position = 'relative';
            this.insertAdjacentHTML('beforebegin', `<div class="message-bubble fade-in" id="${messageId}">${localize('prompt-copied-message')}</div>`);
            const message = document.querySelector(`#${messageId}`);
            message.classList.add('show');
            setTimeout(() => {
                message.classList.remove('fade-in');
                message.classList.add('fade-out');
                setTimeout(() => {
                message.remove();
                }, 500);
            }, 3000);
        } else if (confirm(localize('prompt-ChatGPT'))){
          chatgptTab = window.open(url, '_blank');
        }
    } catch(err){
        alert(`Something went wrong: ${err.toString()}`);
    }
    return false;
});

// MARK: - Request A Polished Version of Translation
delegate.on('click', '.info-translation-polish-final', async function(event){
    let requestCount = parseInt(this.getAttribute('request-count') || 0, 0);
    try {
        let requestStatus = this.getAttribute('request-status') || '';
        if (requestStatus === 'pending') {
            alert(`Please wait for the response! `);
            return;
        }
        const container = this.parentNode.parentNode;
        let translationEle = container.querySelector('textarea');
        const translationHTML = translationEle.value;
        if (translationHTML === '') {
            alert(`The textarea is empty! `);
            return;
        }
        const prompt = `Polish this and output ${target}: \n${translationHTML}\n`;
        this.setAttribute('request-status', 'pending');
        const result = await generateTextFromOpenAI(prompt, requestCount);
        if (result.status === 'success') {
            const text = result.text;
            if (confirm(`${localize('Confirm-Polish')} \n\n${text}`)) {
                translationEle.value = text;
            }
            this.setAttribute('request-count', requestCount + 1);            
        } else {
            alert(result.message || 'Something is wrong with OpenAI. Please try again later. ');
        }
        this.removeAttribute('request-status');
    } catch(err){
        alert(`Something went wrong: ${err.toString()}`);
    }
    this.removeAttribute('request-status');
    if (requestCount >= 2) {
        this.style.display = 'none';
    }
    return false;
});


// MARK: - Request A Polished Version of Translation
delegate.on('click', '.info-translation-polish', async function(event){
    let requestCount = parseInt(this.getAttribute('request-count') || 0, 0);
    try {
        let requestStatus = this.getAttribute('request-status') || '';
        if (requestStatus === 'pending') {
            alert(`Please wait for the response! `);
            return;
        }
        const container = this.parentNode.parentNode;
        const translationIndex = this.getAttribute('data-polish-index');
        let translationEle = container.querySelector(`.info-translation[data-translation-index="${translationIndex}"]`);
        const translationHTML = translationEle.innerHTML;
        const prompt = `Polish this and output ${target}: \n${translationHTML}\n`;
        this.setAttribute('request-status', 'pending');
        const result = await generateTextFromOpenAI(prompt, requestCount);
        if (result.status === 'success') {
            const text = result.text;
            const existingTranslations = container.querySelectorAll('.info-translation');
            const l = existingTranslations.length;
            const deleteHTML = `<div class="info-translation-tools-container"><a data-delete-index="${l}" class="info-translation-delete" title="Delete This Translation"></a></div>`;
            const newTranslation = `${deleteHTML}<div data-translation-index="${l}" class="info-translation info-translation-extra" title="click to confirm this translation to the right">${text}</div>`;
            translationEle.insertAdjacentHTML('afterend', newTranslation);
            this.setAttribute('request-count', requestCount + 1);            
        } else {
            alert(result.message || 'Something is wrong with OpenAI. Please try again later. ');
        }
        this.removeAttribute('request-status');
    } catch(err){
        alert(`Something went wrong: ${err.toString()}`);
    }
    this.removeAttribute('request-status');
    if (requestCount >= 2) {
        this.style.display = 'none';
    }
    return false;
});

// MARK: - Add New Translations
delegate.on('click', '.add-new-translation-choice', async function(event){
    const html = this.innerHTML;
    let requestCount = parseInt(this.getAttribute('request-count') || 0, 0);
    if (this.classList.contains('is-disabled')) {
        alert(`There's no point requesting again! `);
        return;
    }
    try {
        let requestStatus = this.getAttribute('request-status') || '';
        if (requestStatus === 'pending') {
            alert(`Please wait for the response! `);
            return;
        }
        const container = this.parentNode.parentNode;
        const prompt = getPromptForOpenAI(container);
        this.setAttribute('request-status', 'pending');
        
        this.innerHTML = 'Requesting...';
        const result = await generateTextFromOpenAI(prompt, requestCount);
        if (result.status === 'success') {
            const text = result.text;
            const existingTranslations = container.querySelectorAll('.info-translation');
            const l = existingTranslations.length;
            const deleteHTML = `<div class="info-translation-tools-container"><a data-delete-index="${l}" class="info-translation-delete" title="Delete This Translation"></a></div>`;
            const newTranslation = `${deleteHTML}<div data-translation-index="${l}" class="info-translation info-translation-extra" title="click to confirm this translation to the right">${text}</div>`;
            if (existingTranslations.length > 0) {
                const lastTranslation = existingTranslations[l-1];            
                lastTranslation.insertAdjacentHTML('afterend', newTranslation);
            } else {
                this.parentElement.insertAdjacentHTML("beforebegin", newTranslation);
            }
            this.setAttribute('request-count', requestCount + 1);            
        } else {
            alert(result.message || `Something is wrong with OpenAI. Please try later. `);
        }
    } catch(err){
        alert(`Something went wrong: ${err.toString()}`);
    }
    this.removeAttribute('request-status');
    if (requestCount >= 2) {
        this.classList.add('is-disabled');
    }
    this.innerHTML = html;
    return false;
});

// MARK: - Delete New Translation
delegate.on('click', '.info-translation-delete', async function(event){
    try {
        const container = this.parentNode.parentNode;
        const translationIndex = this.getAttribute('data-delete-index');
        let translationEle = container.querySelector(`.info-translation[data-translation-index="${translationIndex}"]`);
        translationEle.parentElement.removeChild(translationEle);
        this.parentElement.parentElement.removeChild(this.parentElement);
    } catch(err){
        alert(`Something went wrong: ${err.toString()}`);
    }
    return false;
});


// MARK: - Links in translated text
delegate.on('click', '.info-original a[href], .info-translation a[href], .info-original strong, .info-translation strong, .info-original em, .info-translation em', function(event){
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
            alert(localize('select-text-to-add-link'));
        }
    } catch(ignore){
        alert(localize('select-text-to-add-link'));
    }
    event.stopImmediatePropagation();
    return false;
});

delegate.on('click', '.info-translation', function(event){
    confirmTranslation(this);
    var textArea = this.closest(".info-container").querySelector('textarea');
    textArea.focus();
    toggleTextareaWarning(textArea);
    setTimeout(function(){
        textArea.style.minHeight = textAreaMinHeight + 'px';
        expandHeight(textArea);
    }, 500);
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
        alert(localize('select-text-for-short-cut'));
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
        alert(localize('select-text-for-short-cut'));
    }
});

delegate.on('paste', '[contenteditable="true"]', (event) => {
    
    event.preventDefault();
    // Get the text content from the Clipboard
    const text = (event.clipboardData || window.clipboardData).getData('text');
    console.log(`inserting: ${text}`);
    // Create a text node from the plain text
    const textNode = document.createTextNode(text);
    // Get the current selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return; // Don't proceed if there's no selection

    // Get the first range of the selection
    const range = selection.getRangeAt(0);
    range.deleteContents(); // Remove the contents of the current selection

    // Insert the new text node at the cursor's position
    range.insertNode(textNode);

    // Move the cursor to the end of the inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges(); // Remove all ranges (clears the current selection)
    selection.addRange(range); // Add the new range (sets the new cursor position)

    updatePreviewContent(event.target);
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
    if (!confirm(localize('ignore-all-name-entity-warning'))){return;}
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
            element.innerHTML = '<span class="name-entity-shortcut">' + value + '</span><span class="name-entity-shortcut">' + value + '(' + key + ')</span><button class="add-name-entity" title="将译法添加到词库"></button>';
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

// MARK: - Updating a textarea
delegate.on('input', '.info-container textarea', function(event){
    expandHeight(this);
});

// MARK: - Start editing a textarea
delegate.on('click', '.info-container textarea', function(event){
    expandHeight(this);
});


delegate.on('input', '.preview-content [id]', function(event){
    updatePreviewContent(this);
});

delegate.on('click', '.preview-language-switch div', function(event){
    if (this.classList.contains('on')) {return;}
    const key = this.getAttribute('data-key');
    let container = this.closest('.preview-language-switch');
    for (const ele of container.querySelectorAll('div')) {
        ele.classList.remove('on');
    }
    this.classList.add('on');
    updatePreviewLanguageMode(key);
});


function updatePreviewContent(ele) {
    const id = ele.id;
    console.log(id);
    const html = ele.innerHTML;
    let textEle = document.querySelector(`textarea[data-info-id="${id}"]`);
    if (textEle) {
        textEle.value = html;
    }
}

function getPromptForOpenAI(container) {
    let sourceHTML = container.querySelector('.info-original').innerHTML;
    const nameEntityEles = container.closest('.info-container').querySelectorAll('.name-entity-inner');
    let nameEntities = [];
    for (const ele of nameEntityEles) {
        const translation = ele.querySelector('input').value || '';
        if (translation === '') continue;
        const original = ele.querySelector('.name-entity-key').innerText || '';
        if (original === '') continue;
        nameEntities.push({original: original, translation: translation});
    }
    nameEntities = nameEntities.sort((a, b)=>b.original.length - a.original.length);
    for (const nameEntitie of nameEntities) {
        const reg = new RegExp(nameEntitie.original, 'g');
        sourceHTML = sourceHTML.replace(reg, nameEntitie.translation);
    }
    const prompt = `Translate from ${source} to ${target}: \n${sourceHTML}\n`;
    return prompt;
}

function TER(reference, hypothesis) {
    // initialize the distance and m, n, i and j
    let distance = 0;
    let m = reference.length;
    let n = hypothesis.length;
    let dp = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [];
      for (let j = 0; j <= n; j++) {
        dp[i][j] = 0;
      }
    }
    // fill in the dp array with the Wagner-Fisher algorithm
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (reference[i - 1] === hypothesis[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1,  // substitution
            dp[i][j - 1] + 1,      // insertion
            dp[i - 1][j] + 1       // deletion
          );
        }
      }
    }
    // calculate the TER score as the distance divided by the length of the reference string
    distance = dp[m][n];
    return distance / m;
}

function bleu(prediction, references, ngrams) {
    let numMatches = [0, 0, 0, 0];
    let closestRefLength = Infinity;

    // Calculate the length of the closest reference sentence
    for (let ref of references) {
        closestRefLength = Math.min(closestRefLength, ref.length);
    }

    // Calculate the number of matches for each ngrams size
    for (let i = 0; i < ngrams; i++) {
        let maxNGram = i + 1;

        for (let start = 0; start < closestRefLength - maxNGram + 1; start++) {
            let ngram = prediction.substring(start, start + maxNGram);

            for (let ref of references) {
                if (ref.indexOf(ngram) !== -1) {
                    numMatches[i]++;
                    break;
                }
            }
        }
    }

    // Calculate the BLEU score
    let weightSum = 0;
    for (let i = 0; i < ngrams; i++) {
        weightSum += Math.pow(0.25, i) / numMatches[i];
    }

    return 1 - weightSum;
}

function localize(text) {
    let language = (isPowerTranslate) ? navigator.language : 'zh-CN';
    if (/^en/.test(language)) {
        language = 'en';
    }
    const dict = {
        'ignore-all-name-entity-warning': {'en': 'Ignoring all the hints may result in you not spotting inconsistent translations in the article, are you sure?', 'zh-CN': '忽略所有的提示，可能会导致您无法发现文章中前后不一致的译名，您确定吗？'},
        'Finish & Close': {'zh-CN': '完成并关闭'},
        'Edit': {'zh-CN': '编辑'},
        'Finish': {'zh-CN': '完成'},
        'Top': {'zh-CN': '顶部'},
        'Recover': {'zh-CN': '恢复'},
        'Backup': {'zh-CN': '备份'},
        'Preview': {'zh-CN': '预览'},
        'Add Word': {'zh-CN': '加词条'},
        'Replace': {'zh-CN': '替换'},
        'Click the translation': {'zh-CN': '点选左边的翻译版本，您也可以继续编辑'},
        'Add the translation': {'zh-CN': '填写统一译法，开启提醒'},
        'Ignore': {'zh-CN': '忽略'},
        'Ignore All': {'zh-CN': '忽略所有提醒'},
        'Name Entities': {'zh-CN': '多次出现词语'},
        'select-text-to-add-link': {'en': 'Please select text from the right text to add link', 'zh-CN': '请选中右边文本框的相应的文本内容来添加链接！'},
        'select-text-for-short-cut': {'en': 'Please select text from the right text for shortcut!', 'zh-CN': '请选中右边文本框的相应的文本内容来快捷填写！'},
        'tap-to-add': {'en': 'After tapping on the left to fill in the text here, you can try to select part of the text and then click on the links and bold fonts on the left to easily add links or bold text', 'zh-CN': '在点选左边把文字填写到这里之后，可以尝试选择部分文字，然后点击左边的链接和加粗字体，就可以方便地添加链接或加粗文字。'},
        'content-error-hint': {'en': 'There may be some problems with your edits, do you want to continue submitting?', 'zh-CN': '您编辑的内容可能有些问题，您还要继续提交吗？'},
        'mark-red-reminder': {'en': 'Relevant passages have been marked in red.', 'zh-CN': '相关的段落已经标红。'},
        'ask-to-overwrite': {'en': 'Overwrite the version previously saved locally, OK? Please note that this function is only intended for handling unexpected situations. If you plan to save your work progress for a long term, please complete the proofreading as soon as possible and submit it to the CMS.', 'zh-CN': '覆盖之前保存在本地的版本，确定吗？请注意这个功能仅仅用于应对意外情况，如果您打算长期保存工作进度，请尽快完成校对并提交到CMS。'},
        'cannot-save-prompt': {'en': 'Due to a browser problem, it is not possible to save your work locally, please take a screenshot of this error message to the technician. ', 'zh-CN': '由于浏览器的问题，无法在本地保存您的工作，请把这个错误信息截屏给技术人员'},
        'recover-prompt': {'en': 'Reverting to the last version saved locally will lose all the changes made now, are you sure?', 'zh-CN': '恢复到上次保存在本地的版本，会丢失现在的所有修改，确定吗？'},
        'Current Translation': {'zh-CN': '旧译名'},
        'New Translation': {'zh-CN': '新译名'},
        'Replace All': {'zh-CN': '全部替换'},
        'Hide Replacement': {'zh-CN': '隐藏替换'},
        'Empty-Translation': {'en': 'Current translation cannot be empty!', 'zh-CN': '旧译名不能为空!'},
        'Empty-Source': {'en': 'Original test cannot be empty!', 'zh-CN': '原文不能为空!'},
        'Original': {'zh-CN': '原文'},
        'Translation': {'zh-CN': '译文'},
        'Bilingual': {'zh-CN': '对照'},
        'Hide Add Word': {'zh-CN': '隐藏添加'},
        'Not-Found-Word-In-Original': {'en': 'No word found in the original, please check your input in the original!', 'zh-CN': '没有在原文中找到词条，请检查一下您的原文的输入！'},
        'Others-Working-On-It': {'en': 'This article seems to have been modified or posted by someone else while you were editing it, would you like to see the details?', 'zh-CN': '这篇文章在您进行编辑的时候，似乎被别人进行了修改或发布，您要看看详情吗？'},
        'Polish-Translation': {'en': 'Polish This Translation', 'zh-CN': '为这段译文润色'},
        'Confirm-Polish': {'en': 'Do you want to replace the existing text with this polished text? ', 'zh-CN': '您想要用以下这段润色后的文字替换当前的翻译吗？'},
        'prompt-copied-message': {'en': 'The prompt is already copied to your clipboard. ', 'zh-CN': '原文已经复制到您的剪贴板。'},
        'prompt-ChatGPT': {'en': 'The prompt is already copied to your clipboard. Open ChatGPT now? ', 'zh-CN': '原文已经复制到您的剪贴板，您要现在打开ChatGPT吗？'},
        'AITranslation': {'en': 'New Feature: There is an AI-translated version, which should be better than current options. Do you want to use it for your review?', 'zh-CN': '新功能：我们检测到AI翻译的版本，效果应该更好，您要直接填入吗？'},
        'preview-edit': {en: 'Now you can edit directly in the preview mode. The bilingual mode button allows you to verify the translation is accurate more conveniently. ', 'zh-CN': '现在，您可以直接在预览界面进行编辑。你可以点击上方按钮切换到双语对照模式，更为方便地检查译文的准确性。'}
    };
    if (dict[text]) {
        if (dict[text][language]) {
            return dict[text][language];
        }
        if (dict[text].en) {
            return dict[text].en;
        }
    }
    return text;
}


function expandHeight(ele) {
    var scrollHeight = ele.scrollHeight;
    var paddingTop = window.getComputedStyle(ele, null).getPropertyValue('padding-top').replace(/[^\d]+/g, '');
    var paddingBottom = window.getComputedStyle(ele, null).getPropertyValue('padding-bottom').replace(/[^\d]+/g, '');
    var scrollHeight = ele.scrollHeight;
    var padding = parseInt(paddingTop, 10) + parseInt(paddingBottom, 10);
    var actualHeight = scrollHeight - padding;
    var offsetHeight = ele.offsetHeight;
    if (actualHeight >= offsetHeight) {
        ele.style.minHeight = actualHeight + 'px';
    }
}

function backToTop() {
    var eles = document.querySelectorAll('.content, .preview-container');
    for (var i = 0; i < eles.length; i++) {
        eles[i].scrollTo({ top: 0, behavior: 'smooth' });
    }
    var textareas = document.querySelectorAll('.info-container textarea');
    for (var j = 0; j < textareas.length; j++) {
        textareas[j].style.minHeight = textAreaMinHeight + 'px';
        expandHeight(textareas[j]);
    }
}

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
                nameEntityTranslations[m].innerHTML = '<span class="name-entity-shortcut">' + translation + '</span><span class="name-entity-shortcut">' + translation + '(' + key + ')</span><button class="add-name-entity" title="Add to Dictionary"></button>';
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
        return {success: false, message: 'Some textareas have multiple paragraphs. It is probably because you forgot to delete unneeded text. Please check again! '};
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
            var translationAppear = x.translationMatches === 0 ? ' is not found. ' : ' occurs only <strong>' + x.translationMatches + '</strong> times. ';
            return 'In the original text, <strong>' + x.source + '</strong> occurs ' + x.sourceMatches + ' time(s), but in the translation, <strong class="name-entity-shortcut">' + x.translation + '</strong>' + translationAppear;
        }).join('；');
        return {success: false, message: 'Check for inconsistencies in translation. You can quickly insert by clicking on the bolded translation: ' + description};
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
    let container = ele.closest(".info-container");
    let index = ele.getAttribute('data-translation-index');
    if (index && index !== '') {
        let polishEle = container.querySelector(`[data-polish-index="${index}"], [data-delete-index="${index}"]`)
        if (polishEle) {
            polishEle.style.display = 'none';
        }
    }
    var finalTranslationEle = ele.closest(".info-container").querySelector('textarea');
    var polishEle = ele.closest(".info-container").querySelector('.info-translation-polish-final');
    if (polishEle) {
        polishEle.classList.add('on');
    }
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

async function checkAITranslation() {
    const ftidEle = window.opener?.document?.getElementById('eskylineheadline');
    let ftid = '';
    if (ftidEle) {
        ftid = ftidEle.value || '';
    } else if (isFrontendTest) {
        ftid = 'anyidforfrontendtest';
    }
    if (ftid === '') {return;}
    let url = (isFrontendTest) ? '/api/page/ai_translation.json' : `/FTAPI/grab_ai_translation.php?id=${ftid}`;
    const response = await fetch(url);
    const json = await response.json();
    // console.log(JSON.stringify(json, null, 2));
    const bodyXMLTranslation = json.bodyXMLTranslation;
    if (!bodyXMLTranslation || typeof bodyXMLTranslation !== 'string' || bodyXMLTranslation === '') {return;}
    // MARK: - If the time stamp isn't the same, the AI Translation is not valid! 
    console.log(`window.publishedDate: ${window.publishedDate}, json.publishedDate: ${json.publishedDate}`);
    if (window.publishedDate !== '' && window.publishedDate !== json.publishedDate) {return;}
    let ele = document.createElement('DIV');
    ele.innerHTML = bodyXMLTranslation;
    const translationEles = ele.querySelectorAll('[id]');
    if (confirm(localize('AITranslation'))) {
        for (const translationEle of translationEles) {
            const translation = translationEle.innerHTML;
            const translationId = translationEle.id;
            let textareaEle = document.querySelector(`textarea[data-info-id="${translationId}"]`);
            textareaEle.value = translation;
        }
        let previewButton = document.querySelector('#preview-button');
        if (previewButton) {
            preview(previewButton);
            const titleTranslation = json.titleTranslation || '';
            let previewTitleEle = document.querySelector('.preview-content .story-title');
            if (previewTitleEle && titleTranslation !== '') {
                previewTitleEle.innerHTML = titleTranslation;
            }
            const standfirstTranslation = json.standfirstTranslation || '';
            let previewStandfirstEle = document.querySelector('.preview-content .story-standfirst');
            if (previewStandfirstEle && standfirstTranslation !== '') {
                previewStandfirstEle.innerHTML = standfirstTranslation;
            }
            let previewTitleSourceEle = document.querySelector('.preview-content .story-title-source');
            if (previewTitleSourceEle) {
                previewTitleSourceEle.innerHTML = window.opener?.document?.getElementById('eheadline')?.value ?? '';
            }
            let previewStandfirstSourceEle = document.querySelector('.preview-content .story-standfirst-source');
            if (previewStandfirstSourceEle) {
                previewStandfirstSourceEle.innerHTML = window.opener?.document?.getElementById('elongleadbody')?.value ?? '';
            }
        }
    } else {
        console.log(`Add it a new option! `);
        for (const translationEle of translationEles) {
            const translation = translationEle.innerHTML;
            if (translation.trim() === '') {continue;}
            const translationId = translationEle.id;
            const textareaEle = document.querySelector(`textarea[data-info-id="${translationId}"]`);
            let infoContainer = textareaEle.closest('.info-container');

            // Find the last element with class 'info-translation'
            const translations = infoContainer.querySelectorAll('.info-translation');
            const lastTranslation = translations[translations.length - 1]; // Get the last one

            // Create a new div element
            const newDiv = document.createElement('div');
            // Optionally set any attributes or content for the new div
            newDiv.innerHTML = translation;
            newDiv.className = "info-translation";
            newDiv.setAttribute('data-translation-index', translations.length);

            // Append the new div after the last 'info-translation'
            // If there's a last translation, insert after. Otherwise, just append to the container.
            if (lastTranslation) {
                lastTranslation.insertAdjacentElement('afterend', newDiv);
            } else {
                // If no elements with 'info-translation', append new div to the container
                infoContainer.appendChild(newDiv);
            }

            // console.log(`${translationId}: ${translation}`);

            
            // textareaEle.value = translation;
        }
    }
}

function start() {
    function renderBottomButtons() {

        if (document.querySelectorAll('.bottom-button').length === 0) {
            const closeButtonValue = isPowerTranslate ? localize('Finish') : localize('Finish & Close');
            // console.log(closeButtonValue);

            var bottomButton = document.createElement('DIV');
            bottomButton.className = 'centerButton bottom-button';
            bottomButton.innerHTML = '<input id="show-replace-button" type="button" value="' + localize('Replace') + '" onclick="showReplace(this)" class="submitbutton button ui-light-btn"><input id="add-new-match-button" type="button" value="' + localize('Add Word') + '" onclick="showAddNewMatch(this)" class="submitbutton button ui-light-btn"><input type="button" id="preview-button" value="' + localize('Preview') + '" onclick="preview(this)" class="submitbutton button ui-light-btn"><input type="button" value="' + localize('Backup') + '" onclick="saveToLocal()" class="submitbutton button ui-light-btn"><input type="button" value="' + localize('Recover') + '" onclick="restoreFromLocal()" class="submitbutton button ui-light-btn"><input type="button" value="' + localize('Top') + '" onclick="backToTop()" class="submitbutton button ui-light-btn"><input type="button" value="'+ closeButtonValue + '" onclick="finishTranslation(this)" class="submitbutton button ui-light-btn">';
            document.body.appendChild(bottomButton);
        }
        document.querySelector('.body').classList.add('full-grid');
    }

    function isNotEmpty(element, index, array) {
        return element !== '';
    }

    if (isPowerTranslate && stage == 'page loaded') {
        addNewTranslation();
        return;
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
                    infoHTML += `<div onclick="confirmTranslation(this)" data-translation-index="${m}"  class="info-translation" title="click to confirm this translation to the right">${translations[m]}</div>`;
                }
                infoHTML = '<div class="info-container"><div>' + infoHTML + links + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="' + id + '" placeholder="' + localize('Click the translation') + '"></textarea></div><div class="info-helper"></div></div><hr>';
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
                const toolHTML = `<div class="info-translation-tools-container"><a data-polish-index="${j}" class="info-translation-polish" title="${localize('Polish-Translation')}"></a></div>`;
                infoHTML += `${toolHTML}<div data-translation-index="${j}" class="info-translation" title="click to confirm this translation to the right">${t}</div>`;
            }
            var j1 = info.translations.length;
            var t1 = existingTranslationDict[englishHTML] || '';
            if (t1 !== '') {
                infoHTML += '<div data-translation-index="' + j1 + '" class="info-translation selected" title="click to confirm this translation to the right">' + t1 + '</div>';
            }
            const polishHTML = '<div class="info-translation-tools-container"><a class="info-translation-polish-final" title="Polish This Translation"></a></div>'; 
            infoHTML = `<div class="info-container"><div>${infoHTML}${links}</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea data-info-id="${id}" placeholder="${localize('Click the translation')}">${t1}</textarea>${polishHTML}</div><div class="info-helper"></div></div><hr>`;
            k += infoHTML;
        }
        storyBodyEle.innerHTML = k;
        renderBottomButtons();
        checkAITranslation();

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
            infoHTML = '<div class="info-container"><div>' + infoHTML + '</div><div><div class="info-suggestion"></div><div class="info-error-message"></div><textarea placeholder="' + localize('Click the translation') + '">' + t1 + '</textarea></div><div class="info-helper"></div></div><hr>';
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
    document.querySelector('.logged-in-container').style.display = 'none';
    document.querySelector('.sign-in-container').style.display = 'none';
    document.querySelector('.sidebar').style.display = 'none';
    document.querySelector('#page-title').style.display = 'none';
    document.querySelector('#page-description').style.display = 'none';
    document.querySelector('#languages-container').style.display = 'none';
    document.querySelector('#status-message').style.display = 'none';
    document.querySelector('.body').classList.remove('power-translate-page-loaded');
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
        var suggestion = localize('tap-to-add');
        allLinks[n].closest(".info-container").querySelector('.info-suggestion').innerHTML = suggestion;
        // allLinks[n].closest(".info-container").querySelector('textarea').setAttribute('placeholder', suggestion);
    }
    showGlossarySuggestions();
    showNames();
}

function recordTimeInfo(spentTime) {
    if (!window.opener || typeof window.subtitleInfo === 'object') {return;}
    if (window.opener.window.location.href.indexOf('/ia/') === -1) {return;}
    if (isAITranslation()) {return;}
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
    // MARK: - The style only applies to Chinese
    if (target !== 'cn') return text;
    // MARK: - Use the correct English brackets
    var result = text
        .replace(/[\(（)]([A-zàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð\s\d\.,\'\-]+)[\)）]/g, '($1)')
        .replace(/·/g, '•'); 
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

function finishTranslation(buttonEle) {
    try {
        saveToLocal(true);
    } catch(ignore) {}
    var finish = false;
    if (isReviewMode) {
        finish = finishReview(buttonEle);
    } else if (typeof window.subtitleInfo === 'object') {
        finish = finishTranslationForVideo(buttonEle);
    } else {
        finish = finishTranslationForArticle(buttonEle);
    }
    if (finish !== true) {return;}
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

function isAITranslation() {
    var goodTranslators = 'oliver.zhang';
    return typeof window.userName === 'string' && goodTranslators.indexOf(window.userName)>=0;
}

function finishTranslationForArticle(buttonEle) {
    var status = checkAllTextAreas();
    if (!status.success) {
        var question = localize('content-error-hint') + '\n\n' + status.message + '\n\n' + localize('mark-red-reminder');
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
        // MARK: - if the browser can find the opener tab, it can just update the editing page automatically by updating fields as the cbody, ebody and tag. 
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
        // MARK: - If there are proofread story title and standfirst
        const title = document.querySelector('.story-title')?.innerHTML ?? '';
        const standfirst = document.querySelector('.story-standfirst')?.innerHTML ?? '';
        let cheadlineEle = window.opener?.document?.getElementById('cheadline');
        if (cheadlineEle && title !== '') {
            cheadlineEle.value = title;
        }
        let clongleadbodyEle = window.opener?.document?.getElementById('clongleadbody');
        if (clongleadbodyEle && standfirst !== '') {
            clongleadbodyEle.value = standfirst;
        }
        var tagEle = window.opener.document.getElementById('tag');
        if (tagEle) {
            var AITranslatorTag = isAITranslation() ? ',AITranslation,FT商学院' : '';
            tagEle.value += AITranslatorTag;
            var tags = window.opener.document.getElementById('tag').value.split(',');
            var tagsSet = new Set(tags);
            const newTags = Array.from(tagsSet).join(',');
            tagEle.value = newTags;
            // MARK: - you need to make changes to two places because of the way the interactive edit page handles tags on the frontend
            var moreTagEle = window.opener.document.getElementById('moretag');
            if (moreTagEle) {
                moreTagEle.value = newTags;
            }
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
    } else if (isPowerTranslate) {
        finishPowerTranslate(buttonEle, cleanChineseText);
    }
    return true;
}

function finishReview() {
    var finishedTexts = [];
    var textAreas = document.querySelectorAll('.info-container textarea');
    for (var i=0; i<textAreas.length; i++) {
        finishedTexts.push(textAreas[i].value || '');
    }
    var cbody = tidyUpChineseText(finishedTexts.join('\n\n'));
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
                    shortCutHTML = '<span class="name-entity-shortcut">' + value + '</span><span class="name-entity-shortcut">' + value + '(' + key + ')</span><button class="add-name-entity" title="将译法添加到词库"></button>';
                }
                nameEle.innerHTML = '<span class="name-entity-key">' + key + '</span><span><input type="text" value="' + value + '" placeholder="' + localize('Add the translation') + '"></span><button class="ignore-name-entity" title="' + localize('Ignore') + '"></button>';
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
            nameEntitieDescription.innerHTML = localize('Name Entities');
            firstNameEntitiesContainer.parentElement.insertBefore(nameEntitieDescription, firstNameEntitiesContainer);
        }
        var ignoreAllContainer = document.createElement('BUTTON');
        ignoreAllContainer.className = 'ignore-all-name-entity';
        ignoreAllContainer.setAttribute('title', localize('Ingore All'));
        ele.closest('.info-container').querySelector('.info-helper').append(ignoreAllContainer);
    }
    checkInfoHelpers();
}

function showGlossarySuggestions() {
    if (source !== 'en' || target !== 'cn') {return;}
    var ebody = '';
    if (window.opener) {
        var ebodyEle = window.opener.document.getElementById('ebody');
        if (!ebodyEle) {return;}
        ebody = ebodyEle.value;
    } else if (document.getElementById('english-text')) {
        ebody = document.getElementById('english-text').value;
    }
    var div = document.createElement('DIV');
    div.innerHTML = ebody;
    ebody = div.innerText;
    var xhr = new XMLHttpRequest();
    var apiUrl = '/falcon.php/glossary/ajax_get_suggestions';
    var apiMethod = 'POST';
    if (isFrontendTest && !isPowerTranslate) {
        apiUrl = '/api/page/glossary.json';
        apiMethod = 'GET';
    }
    xhr.open(apiMethod, apiUrl);
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
                var chinese_title = tidyUpChineseText(suggestion.chinese_title);
                if (!en_title || !chinese_title || englishText.indexOf(en_title) === -1) {continue;}
                var infoContainer = infoOriginal.closest('.info-container');
                var existingNameEntityInner = infoContainer.querySelector('.name-entity-inner[data-key="' + en_title + '"]');
                var existingNameEntityTranslation = infoContainer.querySelector('.name-entity-translation[data-key="' + en_title + '"]');
                if (existingNameEntityInner && existingNameEntityTranslation) {
                    existingNameEntityInner.querySelector('input').value = chinese_title;
                    existingNameEntityTranslation.innerHTML = '<span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span><button class="add-name-entity" title="Add to Glossary"></button>';
                } else {
                    var suggestionEle = document.createElement('DIV');
                    suggestionEle.innerHTML = en_title + ': <b>' + chinese_title + '</b>';
                    suggestionEle.className = 'translation-suggestion';
                    suggestionEle.setAttribute('data-translation', chinese_title);
                    suggestionEle.setAttribute('title', 'Click to insert “' + chinese_title + '” into the text area below');
                    infoOriginal.parentElement.append(suggestionEle);
                    // MARK: - Insert glossary to the right column
                    var infoHelper = infoOriginal.closest('.info-container').querySelector('.info-helper');
                    var nameEntityContainer = infoHelper.querySelector('.name-entity-container');
                    if (!nameEntityContainer) {
                        nameEntityContainer = document.createElement('DIV');
                        infoHelper.append(nameEntityContainer);
                    }
                    var newNameEntityInnerHTML = '<div class="name-entities-container"><div class="name-entity-inner" data-key="' + en_title + '"><span class="name-entity-key">' + en_title + '</span><span><input type="text" value="' + chinese_title + '" placeholder="' + localize('Add the translation') + '"></span><button class="ignore-name-entity" title="忽略"></button></div><div class="name-entity-translation" data-key="' + en_title + '"><span class="name-entity-shortcut">' + chinese_title + '</span><span class="name-entity-shortcut">' + chinese_title + '(' + en_title + ')</span><button class="add-name-entity" title="Add to glossary"></button></div>';
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
    let translations = '';
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
        const newText = t.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
        var sourceInfoDiv = document.createElement('DIV');
        sourceInfoDiv.innerHTML = newText;
        var translationInfoDiv = document.createElement('DIV');
        translationInfoDiv.innerHTML = newText;
        for (var i=0; i<document.querySelectorAll('[data-info-id]').length; i++) {
            let ele = document.querySelectorAll('[data-info-id]')[i];
            let id = ele.getAttribute('data-info-id');
            let infoEle = translationInfoDiv.querySelector('#' + id);
            if (infoEle) {
                infoEle.innerHTML = ele.value.trim().replace(/^[\n\r\s]+/, '').replace(/[\n\r\s]+$/, '');
            }
            let sourceEle = sourceInfoDiv.querySelector('#' + id);
            if (sourceEle) {
                sourceEle.removeAttribute('id');
            }
        }
        for (var i=0; i<translationInfoDiv.childNodes.length; i++) {
            sourceInfoDiv.childNodes[i]?.classList?.add('preview-source');
            let sourceHTML = sourceInfoDiv.childNodes[i]?.outerHTML ?? '';
            let translationHTML = translationInfoDiv.childNodes[i]?.outerHTML ?? '';
            translations += `<div class="preview-translation-container">${sourceHTML}${translationHTML}</div>`;
        }
        // translations = translationInfoDiv.innerHTML;
    }
    var previewContainer;
    if (document.querySelectorAll('.preview-container').length === 0) {
        previewContainer = document.createElement('DIV');
        previewContainer.className = 'preview-container';
        document.body.appendChild(previewContainer);
    }
    previewContainer = document.querySelector('.preview-container');
    const note = localize('preview-edit');
    const title = '<div class="preview-translation-container"><h1 class="story-title-source preview-source"></h1><h1 class="story-title" contenteditable="true"></h1></div>';
    const standfirst = '<div class="preview-translation-container"><div class="story-standfirst-source preview-source"></div><div class="story-standfirst" contenteditable="true"></div></div>';
    const storyHeaders = title + standfirst;
    const languageSwitch = createLanguageSwitch();
    previewContainer.innerHTML = `<div class="preview-content">${languageSwitch}<p><em>${note}</em></p>${storyHeaders}${tidyUpChineseText(translations)}</div>`;
    for (let idEle of previewContainer.querySelectorAll('.preview-content [id]')) {
        idEle.setAttribute('contenteditable', 'true');
    }
    document.body.classList.toggle('preview');
    if (document.body.classList.contains('preview')) {
        buttonEle.value = localize('Edit');
    } else {
        buttonEle.value = localize('Preview');
    }
}

function createLanguageSwitch() {
    const previewLanguagePreference = localStorage.getItem(PreviewLanguagePreferenceKey) ?? previewLanguageModes[0]?.key ?? 'translation';
    updatePreviewLanguageMode(previewLanguagePreference);
    const html = previewLanguageModes.map(mode=>{
        const key = mode.key;
        const onClass = (key === previewLanguagePreference) ? ' class="on"' : '';
        return `<div${onClass} data-key="${mode.key}">${localize(mode.name)}</div>`;
    }).join('');
    return `<div class="preview-language-switch">${html}</div>`;
}

function updatePreviewLanguageMode(key) {
    for (const mode of previewLanguageModes) {
        const modeClass = `preview-${mode.key}`;
        document.body.classList.remove(modeClass);
    }
    document.body.classList.add(`preview-${key}`);
    localStorage.setItem(PreviewLanguagePreferenceKey, key);
}

function saveToLocal(force) {
    if (!force) {
        if (!confirm(localize('ask-to-overwrite'))) {return;}
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
        alert(localize('cannot-save-prompt') + '\n' + err.toString());
    }
}

function restoreFromLocal() {
    if (!confirm(localize('recover-prompt'))) {return;}
    var storyBodyConttainerEle = document.getElementById('story-body-container');
    if (!storyBodyConttainerEle) {return;}
    try {
        var saved = localStorage.getItem(localStorageKey);
        console.log(saved);
        storyBodyConttainerEle.innerHTML = saved;
    } catch(err) {
        alert(localize('cannot-save-prompt') + '\n' + err.toString());
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
    replaceContainer.innerHTML = '<div class="replace-content"><input placeholder="' + localize('Current Translation') + '" type="text" class="replace-from" value="' + from + '"><input placeholder="' + localize('New Translation') + '" type="text" class="replace-to"><button onclick="replaceAll()">' + localize('Replace All') + '</button></div>';
    document.body.classList.remove('show-add-new-match');
    document.getElementById('add-new-match-button').value = localize('Add Word');
    document.body.classList.toggle('show-replace');
    if (document.body.classList.contains('show-replace')) {
        buttonEle.value = localize('Hide Replacement');
    } else {
        buttonEle.value = localize('Replace All');
    }
}

function replaceAll() {
    var from = document.querySelector('.replace-from').value;
    if (from === '') {
        alert(localize('Empty-Translation'));
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
        alert('Finished ' + replaceCount + 'replacement(s). If you have further requests and suggestions for this feature, for example, if you want our machine translation results to "remember" the correct translation, please let Oliver know. ');
    } else {
        alert('Cannot find “' + from + '”, please check your input. ');
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
    addNewMatchContainer.innerHTML = '<div class="replace-content"><input placeholder="' + localize('Original') + '" type="text" class="new-match-from" value="' + from + '"><input placeholder="' + localize('Translation') + '" type="text" class="new-match-to" value="' + to + '"><button onclick="addNewMatch()">' + localize('Add Word') + '</button></div>';
    document.body.classList.remove('show-replace');
    document.getElementById('show-replace-button').value = localize('Replace All');
    document.body.classList.toggle('show-add-new-match');
    if (document.body.classList.contains('show-add-new-match')) {
        buttonEle.value = localize('Hide Add Word');
    } else {
        buttonEle.value = localize('Add Word');
    }
}

function addNewMatch() {
    var from = document.querySelector('.new-match-from').value;
    if (from === '') {
        alert(localize('Empty-Source'));
        return;
    }
    var to = tidyUpChineseText(document.querySelector('.new-match-to').value);
    if (to === '') {
        alert(localize('Empty-Translation'));
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
            shortCutEle.innerHTML = '<span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span><button class="add-name-entity" title="Add to Glossary"></button>';
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
        nameEntitiesContainer.innerHTML += '<div class="name-entity-inner" data-key="' + from + '"><span class="name-entity-key">' + from + '</span><span><input type="text" value="' + to + '" placeholder="' + localize('Add the translation') + '"></span><button class="ignore-name-entity" title="' + localize('Ignore') + '"></button></div><div class="name-entity-translation" data-key="' + from + '"><span class="name-entity-shortcut">' + to + '</span><span class="name-entity-shortcut">' + to + '(' + from + ')</span><button class="add-name-entity" title="Add to glossary"></button></div>';
        createCount += 1;
    }
    if (updateCount === 0 && createCount === 0) {
        alert(localize('Not-Found-Word-In-Original'));
    } else {
        var updateMessage = (updateCount > 0) ? 'Updated in' + updateCount + ' paragraphs. ' : '';
        var createMessage = (createCount > 0) ? 'Added words in' + createCount + ' paragraphs. ' : '';
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
                if (window.confirm(localize('Others-Working-On-It'))) {
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
            return Math.round(seconds) + ' seconds';
        } else if (seconds < 3600) {
            return Math.round(seconds/60) + ' minutes';
        } else {
            return Math.round(seconds/3600) + ' hours';
        }
    }

    function popReminder(data) {
        var info = parseReminder(data);
        if (!info) {
            updateHeartBeat(status);
            return;
        }
        var message = 'Please note that someone else appears to be working on this article, and the following specific information is available: ' + info.message + 'Do you want to keep it open?';
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
                extraInfo = '(It could be your own IP, if confirmed, you can ignore this warning)';
            }
            var info = JSON.parse(data[key]);
            if (info.time < cutTime) {continue;}
            if (info.time > warningCutTime) {
                warning = true;
            }
            var explaination = (warning) ? '。' : 'It is possible that he/she has disconnected or quit. ';
            message += key + extraInfo + 'Might be ' + statusDict[info.status] + ' the latest active time is ' + humanTimeDiff(info.time) + ' ago' + explaination;
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


// MARK: Power Translate Related functions
function initPowerTranslate() {
    window.shouldPromptLogin = true;
    document.getElementById('translation-info').style.display = 'none';
    document.getElementById('translations').style.display = 'none';
    document.body.classList.add('power-translate');
    document.querySelector('.body').classList.add('power-translate-page-loaded');
    document.getElementById('english-text').setAttribute('placeholder', 'Paste the text that you need to translate');
    localStorage.setItem('pagemark', window.location.href);
    var script = document.createElement('script');
    script.src = '/powertranslate/scripts/register.js';
    document.head.appendChild(script);
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('inspect');
    if (typeof id === 'string' && id !== '') {
        inspectTranslation(id);
    }
}

function addNewTranslation() {
    const sourceText = document.getElementById('english-text').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value; 
    const id = Math.random().toString(16).slice(2);
    const t = new Date().getTime();
    if (sourceText.length <= 1) {
        alert('Please input some text for translation! ');
        return;
    }
    var xhr = new XMLHttpRequest();
    var method = 'POST';
    var url = '/pt/add';
    if (isFrontendTest && !isPowerTranslate) {
        method = 'GET';
        url = '/api/powertranslate/add.json';
    }
    var token = GetCookie('accessToken');
    
    if (!token || token === '') {
        alert('You need to sign in first! ');
        window.location.href = '/login';
        return;
    }
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onload = function() {
        if (xhr.status !== 200) {
            alert('Can not access the server right now! ');
            return;
        }
        try {
            var result = JSON.parse(xhr.responseText);
            if (result.status === 'ok') {
                inspectTranslation(id);
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?inspect=' + id;
                history.pushState({}, '', newUrl);
            } else {
                alert('The translation task can not be submitted right now because of server error! ');
            }
        } catch(err){
            alert('There is an error when adding new translation task! ');
            console.log(err);
        }
    };
    var postData = {
        text: sourceText,
        from: from,
        to: to,
        id: id,
        t: t
    };
    xhr.send(JSON.stringify(postData));
}

function inspectTranslation(id) {
    function inspectOne() {
        var xhr = new XMLHttpRequest();
        var method = 'POST';
        var url = '/pt/inspect';
        if (isFrontendTest && !isPowerTranslate) {
            method = 'GET';
            url = '/api/powertranslate/inspect.json';
        }
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status !== 200) {return;}
            try {
                var results = JSON.parse(xhr.responseText);
                if (results.length > 0 && results[0].status === 'translated') {
                    launchTranslationReview(results[0]);
                    clearInterval(timer);
                    return;
                }
            } catch(err){
                alert('There is an error when adding new translation task! ');
                console.log(err);
            }
        };
        var postData = {id: id};
        xhr.send(JSON.stringify(postData));
    }
    document.getElementById('status-message').innerHTML = 'Please wait for about 15 minutes for your text to be processed. Don\'t close this page. You can go have a cup of tea or do something else...';
    document.getElementById('start-button').disabled = true;
    inspectOne();
    var timer = setInterval(function(){
        inspectOne();
    }, 20000);
}

function finishPowerTranslate(buttonEle, cleanChineseText) {
    document.body.classList.toggle('preview');
    if (document.body.classList.contains('preview')) {
        var previewContainer;
        var translations = '';            
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
        if (document.querySelectorAll('.preview-container').length === 0) {
            previewContainer = document.createElement('DIV');
            previewContainer.className = 'preview-container';
            document.body.appendChild(previewContainer);
        }
        var finishTime = new Date();
        var spentTime = Math.round(finishTime.getTime() - startTime.getTime());
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
        // var result = {seconds: seconds, adopt: adoptionsCount, total: infoContainers.length, chinese: chineseWordCount, english: englishWordCount, translator: window.userName};
        const minutes = Math.round(seconds/60);
        const thousandWordMinutes = Math.round(1000*seconds/60/englishWordCount);
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        const performanceStatus = '<a href="' + newUrl + '" style="display: block">Back</a>Spent ' + minutes + ' minutes, or ' + thousandWordMinutes + ' minutes per thousand words. ';
        previewContainer = document.querySelector('.preview-container');
        previewContainer.innerHTML = '<div class="preview-content">' + '<p id="performance-status"><b>' + performanceStatus + '</b></p><p><b>The translation is already copied to your clipboard. Below is a preview: </b></p>' + '<textarea id="text-content">' + cleanChineseText.replace(/[\n\r]+/g, '\n\n') + '</textarea>' + tidyUpChineseText(translations) + '</div>';
        buttonEle.value = 'Edit';
        // Get the text field
        var copyText = document.getElementById("text-content");
        // Select the text field
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
        // Copy the text inside the text field
        navigator.clipboard.writeText(copyText.value);
        copyText.style.display = 'none';
    } else {
        buttonEle.value = 'Finish';
    }
}

function launchTranslationReview(result) {
    // console.log('Now you can review the translations');
    // console.log(result);
    alert('Your text is translated by machine, now you need to do a final review! ');
    document.getElementById('translation-info').value = result.translation.cbody;
    document.getElementById('english-text').value = result.translation.ebody;
    source = result.from;
    target = result.to;
    try {
        dict = JSON.parse(result.translation.dict);
    } catch(err) {
        console.log(err);
    }
    stage = 'translated';
    start();
    watchChange();
    startHeartBeat(heartBeatStatus);
}

var isReviewMode = false;
var eText;
var tText;
var stage = 'page loaded';

if (isPowerTranslate) {
    initPowerTranslate();
} else if (window.opener || typeof window.subtitleInfo === 'object' || window.testingType) {
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
    tText = tidyUpChineseText(tText);
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