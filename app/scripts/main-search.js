let my = getMyPreference();
let preferredLanguage = my.Language || navigator.language || 'zh-CN';
// const isFrontendTest = location.href.indexOf('localhost') >= 0 && window.isUsingHandleBars !== true;
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0 || window.isUsingHandleBars === true;
// const myInterestsKey = 'My Interests';
const isFrontendTest = false;
delegate.on('input', '#search-term', debounce((event) => {
    const processInput = () => {
        if(window.intention && window.intention !== 'DiscussContent'){
            return;
        }
        const ele = event.target;
        const navSearchEle = ele.closest('.o-nav__search');
        const suggestionEle = navSearchEle ? navSearchEle.querySelector('.search-topic-intention') : null;
        const hideSuggestionForEmptyValue = () => {
            const currentValue = ele.value.trim();
            if (currentValue === '') {
                hideEle(suggestionEle);
                return;
            }
        };
        // MARK: - Do this now in case there's an error so that the check is never executed
        hideSuggestionForEmptyValue();
        const value = ele.value.trim();
        fetchSuggestions(value).then(intentions => {
            renderShowIntention(suggestionEle, intentions);
            // MARK: - Do this again after async request is returned, which is necessary
            hideSuggestionForEmptyValue();
            updateSearchContent();
        });
    };
    processInput();
}, 300)); // 300 ms debounce time


function renderShowIntention(ele, intentions) {
    if (!ele) {return;}
    console.log(intentions);
    const areIntentionsValidArrays = typeof intentions === 'object' && intentions.length > 0;
    if (!areIntentionsValidArrays) {
        hideEle(ele);
        return;
    }
    // MARK: - At this point, we know the intentions is a valid array. We need to filter the intentions to show only relevant ones
    let minScore = 5; // This number is based on oberservation, but we can find out more by looking at MongoDB's guides. 
    const minScoreRate = 0.9;
    const highestScore = intentions && intentions.length > 0 && intentions[0].score !== undefined ? intentions[0].score : (minScore / minScoreRate);
    minScore = Math.max(minScore, highestScore * minScoreRate);
    intentions = intentions.filter(x => x.score > minScore).slice(0, 5);
    if (intentions.length === 0) {
        hideEle(ele);
        return;
    }
    console.log(preferredLanguage);
    showEle(ele);
    // const myPreference = getMyPreference();
    // const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    // const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    // console.log('intentions: ');
    // console.log(intentions);

    // intentions = intentions.slice(0, 1);
    const intentionsHTML = intentions
        .map(intention=>{
            const key = intention.name;
            const field = intention.field;
            const name = intention.translations && intention.translations[preferredLanguage] ? intention.translations[preferredLanguage] : key;
            const extra = (localizeForSearch(name) === key) ? '' : `(${key})`;
            const display = localizeForSearch(name);

            //<a  data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${content}" data-reply="${localize('Finding')}" data-name="${key}" data-type="${field}">${display}${reorderButton}</a>`};

            const content = `${field}: ${key}`;
            const searchTerm = document.getElementById('search-term').value.trim();
            const displayExtra = `${display}${extra}`;
            const highlightedDisplayExtra = searchTerm ? displayExtra.replace(new RegExp(`(${searchTerm})`, 'gi'), `<span class="yx_hl">$1</span>`) : displayExtra;
            return `
            <div class="input-container">
                <div class="input-name-container">
                <a href="/search/?keys=${display}&type=default" data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${content}" data-reply="${localizeForSearch('Finding')}" data-name="${key}" data-type="${field}">
                    ${highlightedDisplayExtra}
                </a>
                </div>
            </div>`;
        })
        .join('');
    ele.innerHTML = `${intentionsHTML}`;
}


function hideEle(ele) {
    if (ele) {
        ele.classList.remove('on');
    }
}


function fetchSuggestions(query) {
    return new Promise((resolve, reject) => {
        try {
            
            let url = '/ai/search_annotation';
            const data = {query: query, language: preferredLanguage, limit: 10};
            let options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            };
            if (isFrontendTest) {
                url = '/api/page/search_result.json';
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                };
            }
            fetch(url, options)
                .then(response => {
                    console.log(response);
                    if (response.status >= 400) {
                        return response.json().then(results => {
                            if (results.message) {
                                reject(null);
                            }
                        });
                    } else {
                        return response.json().then(results => resolve(results));
                    }
                });
        } catch(err) {
            console.log(err);
            reject(null);
        }
    });
}

document.addEventListener('click', function(event) {
    const suggestionEle = document.querySelector('.search-topic-intention');
    if (suggestionEle && isClickedOutside(event, suggestionEle)) {
        hideEle(suggestionEle);       
    }
});

function debounce(func, delay) {

    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };

}

function showEle(ele) {
    if (ele) {
        ele.classList.add('on');
    }
}

function localizeForSearch(text) {
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
        AccountSharingReminder: {
            en: 'Your session has been securely ended on this device because your account was accessed from a new device. You can sign in on up to three different types of devices (mobile, tablet, and desktop) at a time. Please log in again if this was not you.',
            'zh-CN': '由于您的帐户已在新设备上访问，您在此设备上的会话已安全结束。您可以同时在三种不同类型的设备（手机、平板和桌面）上登录。如果这不是您的操作，请重新登录。',
            'zh-TW': '由於您的帳戶已在新設備上訪問，您在此設備上的會話已安全結束。您可以同時在三種不同類型的設備（手機、平板和桌面）上登錄。如果這不是您的操作，請重新登錄。',
            'zh-HK': '由於您的帳戶已在新設備上訪問，您在此設備上的會話已安全結束。您可以同時在三種不同類型的設備（手機、平板和桌面）上登錄。如果這不是您的操作，請重新登錄。',
        },
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

function isClickedOutside(event, ele) {
    return !ele.contains(event.target);
}

function updateSearchContent() {
    const searchTerm = document.getElementById('search-term').value.trim();
    const searchTopicIntention = document.querySelector('.search-topic-intention');

    let newInputContainer = document.createElement('div');
    newInputContainer.className = 'input-container';
    searchTopicIntention.appendChild(newInputContainer);

    let inputNameContainer = document.createElement('div');
    inputNameContainer.className = 'input-name-container';
    newInputContainer.appendChild(inputNameContainer);

    let searchLink = document.createElement('a');
    searchLink.href = `/search/?keys=${encodeURIComponent(searchTerm)}&type=default`;
    searchLink.setAttribute('data-purpose', 'search-ft-api');
    searchLink.setAttribute('data-lang', preferredLanguage);
    searchLink.setAttribute('data-content', `people: ${searchTerm}`);
    searchLink.setAttribute('data-reply', 'Finding');
    searchLink.setAttribute('data-name', searchTerm);
    searchLink.setAttribute('data-type', 'people');
    searchLink.innerHTML = `更多搜索: <span class="yx_hl"> ${searchTerm}</span>`;

    inputNameContainer.appendChild(searchLink);
    
}


function getMyPreference() {
    let myPreference = {};
    const myPreferenceString = localStorage.getItem('preference');
    if (myPreferenceString && myPreferenceString !== '') {
      try {
        myPreference = JSON.parse(myPreferenceString);
      } catch(ignore) {}
    }
    return myPreference;
  }