/* jshint ignore:start */
var userInput = document.getElementById('user-input');
const switchIntention = document.getElementById('switch-intention');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0 || window.isUsingHandleBars === true;
const isFrontendTest = location.href.indexOf('localhost') >= 0 && window.isUsingHandleBars !== true;
const isInNativeApp = location.href.indexOf('webview=ftcapp') >= 0;
const discussArticleOnly = location.href.indexOf('ftid=') >= 0 && location.href.indexOf('action=read') < 0;
const showGreeting = !/action=(read|search|news-quiz)/gi.test(location.href);
const surveyOnly = /action=(survey)/gi.test(location.href);
window.preferredLanguage = navigator.language;
var languageOptionsDict = {Chinese: '中文'};
var readArticle = 'pop-out';
var translationPreference = 'both';
var paramDict = {};
var previousConversations = [];
var previousIntentDections = []; 
var botStatus = 'waiting';
var intention;
var articles = {};
const publicVapidKey = 'BCbyPnt30RUDSelV6n1jJk8jHzR9cT7ajJPXLRq7tohhQ8D6TVb1h3ENUOJGdPxJgbbg8zPaDNJzOXIUfkWk67M';
let registration;
const readArticlesKey = 'Read Articles';

// MARK: - scrollIntoView doesn't support offset
const scrollOptions = { 
  behavior: 'smooth', 
  block: 'end',
};
const scrollOptionsStart = { 
  behavior: 'smooth', 
  block: 'start',
  inline: "nearest"
};


var composing = false;

userInput.addEventListener('input', (event) => {
  userInput.style.height = 'auto'; // reset the height
  userInput.style.height = userInput.scrollHeight + 'px'; // set new height based on the content
});

userInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey && !composing) {
    event.preventDefault();
    talk();
  }
});

userInput.addEventListener('compositionstart', () => {
  composing = true;
});

userInput.addEventListener('compositionend', () => {
  composing = false;
});

if (switchIntention) {
  switchIntention.addEventListener('click', ()=>{
    switchIntention.classList.toggle('on');
  });
}

chatSumit.addEventListener('click', function(event){
  talk();
});

chatContent.addEventListener('scroll', function() {
  checkScrollyTellingForChat();
});

delegate.on('click', '[data-action="talk"]', async (event) => {
  const element = event.target;
  userInput.value = element.innerHTML;
  hideItemActions(element);
  talk();
  trackEvent('talk', 'chatbot');
});

delegate.on('click', '[data-action="set-preference"]', async (event) => {
  const category = 'all';
  const language = preferredLanguage;
  showUserPrompt(localize('Setting'));
  const reply = localize('Set Your Preferences');
  setPreference(category, language, reply);
  trackEvent('set-preference', 'chatbot');
});

delegate.on('click', '.code-block-copy', async (event) => {
  const element = event.target;
  const containerEle = element.closest('.code-block-container').querySelector('.code-block pre');
  const text = containerEle.innerText;
  copyToClipboard(text);
  trackEvent('code-block-copy', 'chatbot');
});

delegate.on('click', '.chat-item-group-title', async (event) => {
  const element = event.target;
  const groupContainer = element.closest('.chat-item-group-container');
  groupContainer.classList.toggle('expanded');
  showImagesForExpandedGroups();
});

delegate.on('click', '.chat-items-expand', async (event) => {
  const element = event.target;
  if (element.classList.contains('pending')) {return;}
  element.classList.add('pending');
  updateBotStatus('pending');
  try {
    const chunkSize = parseInt(element.getAttribute('data-chunk'), 10);
    const chatContainer = element.closest('.chat-talk');
    const hiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    const hiddenItemsArray = Array.from(hiddenItems);
    const selectedItems = hiddenItemsArray.slice(0, chunkSize);
    for (const item of selectedItems) {
      item.classList.remove('hide');
    }
    const otherHiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    scrollIntoViewProperlyForItems(selectedItems);
    if (otherHiddenItems.length === 0) {
      element.classList.add('hide');
    }
  } catch (err) {
    console.log(err);
  }
  element.classList.remove('pending');
  updateBotStatus('waiting');
});

delegate.on('click', '[data-purpose]', async (event) => {

  if (shouldEventStop(event)) {return;}

  const element = event.target;
  if (element.classList.contains('pending')) {return;}
  const purpose = element.getAttribute('data-purpose');
  const content = element.getAttribute('data-content');
  
  trackEvent(purpose, 'chatbot', content);
  // MARK: - If there's no content attribute, this element is not meant to be clicked
  if (!content) {return;}
  element.classList.add('pending');
  hideItemActions(element);
  const ele = document.querySelector('.chat-topic-intention');
  hideEle(ele);
  try {
    const language = element.getAttribute('data-lang') || 'English';
    let reply = element.getAttribute('data-reply');
    const replyPurpose = element.getAttribute('data-reply-action');
    if (replyPurpose) {
      const regex = /<a>(.+)<\/a>/gi;
      if (regex.test(reply)) {
        reply = reply.replace(regex, `<a class="is-current" data-action="${replyPurpose}">$1</a>`);
      } else {
        reply = `<div data-action="${replyPurpose}">${reply}</div>`;
      }
    }
    const prompt = element.innerText;
    updateBotStatus('pending');
    showUserPrompt(prompt);
    showBotResponse();
    userInput.value = '';
    userInput.style.height = 'auto';
    if (purpose && content && purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, language, reply);
    }
  } catch (err) {
    console.log(err);
  }
  element.classList.remove('pending');
  updateBotStatus('waiting');
});

delegate.on('click', '.current-chat-roles [data-purpose]', (event) => {

  if (shouldEventStop(event)) {return;}

  let ele = event.target.closest('[data-purpose]');

  // Remove 'on' class from all siblings
  const siblings = ele.closest('.current-chat-roles')?.querySelectorAll('[data-purpose]') ?? [];
  siblings.forEach(sib => sib.classList.remove('on'));
  // Add 'on' class to the clicked element
  if (ele) {
    ele.classList.add('on');
  }

});


delegate.on('change', '.select-container select', async (event) => {
  const element = event.target;
  const newValue = element.value;
  const name = element.id;
  if (newValue === '' || !name) {return;}
  let myPreference = {};
  const myPreferenceString = localStorage.getItem('preference');
  if (myPreferenceString && myPreferenceString !== '') {
    try {
      myPreference = JSON.parse(myPreferenceString);
    } catch(ignore) {}
  }
  myPreference[name] = newValue;
  savePreference(myPreference);
  if (name === 'Language') {
    setPreferredLanguage();
  }
  if (name === 'Font Size') {
    setFontSize();
  }
  if (name === 'Read Article') {
    setReadArticlePreference();
  }
  if (name === 'Article Translation Preference') {
    setTranslatePreference();
  }
});

delegate.on('click', '#header-side-toggle',  (event) => {
  let sideBarEle = document.querySelector('.sidebar');
  if (sideBarEle) {
    sideBarEle.classList.add('on');
  }
});

delegate.on('click', '.sidebar-bg, .sidebar a, .sidebar button',  (event) => {

  if (shouldEventStop(event)) {return;}

  let sideBarEle = document.querySelector('.sidebar');
  if (sideBarEle) {
    sideBarEle.classList.remove('on');
  }

});



delegate.on('click', '.quiz-share[data-quiz-id]', (event) => {
  const element = event.target;
  const id = element.getAttribute('data-quiz-id');
  const language = element.getAttribute('data-language');
  const container = element.closest('.quiz-container');
  const question = container?.querySelector('.quiz-question')?.innerText;
  const options = container?.querySelector('.quiz-options')?.children;

  trackEvent('quiz-share', 'chatbot', id);

  let shareText = '';
  if (question && options && options.length > 0) {
    let optionsTexts = [];
    let index = 0;
    for (const option of options) {
      index += 1;
      optionsTexts.push(`(${index}) ${option.innerText ?? ''}`);
    }
    shareText = `${question}\n${optionsTexts.join('\n')}`;
  }
  
  // Construct the share URL using the current window's host name and port
  const hostname = 'https://www.ftchinese.com';
  const shareUrl = `${hostname}/powertranslate/chat.html#action=news-quiz&id=${id}&language=${language}&utm_source=quiz&utm_medium=share&utm_campaign=social_sharing`;

  shareText += `\n${shareUrl}`;

  // console.log(shareText);

  // Copy the share URL to the clipboard
  navigator.clipboard.writeText(shareText).then(() => {
    // Alert the success with a friendly reminder (localized message)
    alert(localize('share_quiz'));
  }).catch(err => {
    console.error('Failed to copy share URL:', err);
    // Optionally, handle the error (e.g., show an error message to the user)
  });
});

delegate.on('click', '#back-arrow',  (event) => {
  window.close();
});

function trackEvent(action = '', category = '', label = '', value = 0, nonInteraction = false) {
  try {
    if (action === '') {return;}
    let options = {'event_label': label, 'event_category': category};
    if (nonInteraction) {
      options.non_interaction = true;
    }
    gtag('event', action, options);
  } catch(err) {
    console.log(err);
  }
}

function shouldEventStop(event) {
  const element = event.target;
  if (draggingEle && element.classList.contains('for-long-press')) {
    console.log('No need to handle data-purpose! ');
    return true;
  }
  if (element.classList.contains('reorder-button')) {
    console.log('This is a reorder button click! ');
    return true;
  }
  return false;
}

// MARK: - For now, the native iOS app will call this function
function toggleSideBar() {
  let sideBarEle = document.querySelector('.sidebar');
  if (sideBarEle) {
    sideBarEle.classList.toggle('on');
  }
}

function hideItemActions(element) {
  let actionsEle = element.closest('.chat-item-actions');
  if (actionsEle) {
    actionsEle.classList.add('hide');
  }
}

function copyToClipboard(text) {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      console.log("Text copied to clipboard");
    }, function() {
      console.log("Failed to copy text to clipboard");
    });
  }
}

function updateStatus(status) {
  if (!status) {return;}
  if (status === 'CleanSlate') {
    status = 'Ready To Chat';
  }
  let currentChatEle = document.querySelector('#current-chat-status span');
  if (currentChatEle) {
    currentChatEle.setAttribute('data-key', status);
    currentChatEle.innerHTML = `${localize(status)}`;
  }
  userInput.placeholder = localize(status);
  // console.log(`\n======\nupdateStatus`);
  // console.log('previousConversations: ');
  // console.log(JSON.stringify(previousConversations, null, 2));
  // console.log('previousIntentDections: ');
  // console.log(JSON.stringify(previousIntentDections, null, 2));
}

async function nextAction(intention) {
  if (!intention) {return;}
  // console.log(`nextAction: intention: ${intention}, window.intention: ${window.intention}`);
  if (intention === 'socratic' && window.socracticInfo && typeof window.socracticIndex === 'number' && window.socracticIndex >= 0) {
    window.socracticIndex += 1;
    if (window.socracticInfo.length > window.socracticIndex) {
      showResultInChat({text: `<strong>${window.socracticInfo[window.socracticIndex].question}</strong>`});
      const startConversations = [
        {
          role: 'system',
          content: `Evaluate the user's answer based only on this context, which is delimited with triple backticks: '''${window.socracticInfo[window.socracticIndex].answer}'''`
        },
        {
            role: 'assistant',
            content: window.socracticInfo[window.socracticIndex].question
        }
      ];
      previousConversations = previousConversations.concat(startConversations);
    }
    if (window.socracticInfo.length === window.socracticIndex) {
      await setIntention('DiscussArticle', undefined, `${getRandomPrompt('ending')}`);
    }
  } else if (['DiscussArticle', 'DiscussContent', 'CustomerService'].indexOf(window.intention) >= 0) {
    console.log(`This is where you'd need to provide a back to clean sheet button! `)
    const actions = getActionOptions();
    showActions(actions);
    // showResultInChat({text: actions});
  }
}

async function getArticleFromFTAPI(id, language) {
  try {
      // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
      // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
      // if (!token || token === '') {
      //     return {status: 'failed', message: 'You need to sign in first! '};
      // }
      const data = {id: id, language: language};
      let url = (isPowerTranslate) ? '/openai/ft_article' : '/FTAPI/article.php';
      let options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
      };
      if (isFrontendTest && !isPowerTranslate) {
          // url = '/api/page/ft_article_link.json';
          // url = '/api/page/ft_podcast.json';
          // url = '/api/page/ft_video.json';
          url = '/api/page/ft_article.json';
          // url = '/api/page/ft_article_scrolly_telling.json';
          // url = '/api/page/ft_article_scrolly_telling_climate_change.json';
          // url = '/api/page/ft_article_double_image.json';
          // url = '/api/page/ft_article_chinese.json';
          // url = '/api/page/ft_article_machine_translation.json';
          options = {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              },
          };
      }
      const response = await fetch(url, options);
      let results = await response.json();
      if (response.status >= 400 && results.message) {
          return {status: 'failed', message: results.message, detail: results};
      }
      if (results) {
          results = await handleFTContent(results);
          results = await convertFTContentForChinese(results, language);
          // console.log(`Should handle chinese conversion: ${language}`);
          return {status: 'success', results: results};
      } else {
          return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
      }
  } catch(err) {
      console.log(err);
      return {status: 'failed', message: err.toString()};
  }
}

function convertToBilingualLayout(original, translation, source='') {
  let originalDiv = document.createElement('DIV');
  originalDiv.innerHTML = original;
  const originals = originalDiv.children;
  let translationDiv = document.createElement('DIV');
  translationDiv.innerHTML = translation;
  const translations = translationDiv.children;
  const loops = Math.max(originals.length, translations.length);
  let html = '';
  for (let i=0; i < loops; i++) {
    let left = '';
    if (originals.length > i) {
      left = (originals[i].tagName === 'P') ? originals[i].innerHTML : originals[i].outerHTML;
    }
    let right = '';
    let id = '';
    if (translations.length > i) {
      right = (translations[i].tagName === 'P') ? translations[i].innerHTML : translations[i].outerHTML;
      id = translations[i].id || '';
    }
    if (/^(<div|<img|<picture|<scrollable)/.test(left) && source !== 'ai') {
      // MARK: If this child is a picture or an HTML Code, display it just once
      html += `<p>${left}</p><div class="clearfloat"></div>`;
    } else {
      const contentEditable = (source === 'ai') ? ' contenteditable="true"' : '';
      html += `<div><div class="leftp">${left}</div><div id="${id}" class="rightp"${contentEditable}>${right}</div></div><div class="clearfloat"></div>`;
    }
  }
  return html;
}

async function switchLanguage(container, value) {
  const id = container.getAttribute('data-id');
  const content = articles[id];
  if (!content) {return;}
  let title = content.title;
  let standfirst = content.standfirst;
  let bodyXML = content.bodyXML;
  let byline = content.byline || '';
  let machineTranslationInfo = {};
  if (content.machineTranslation) {
    machineTranslationInfo = getInfoFromMachineTranslation(content.machineTranslation);
  }
  console.log(`switch language value: ${value}`);
  const primaryThemeDisplayEle = container.querySelector('.story-theme a');
  let primaryThemeDisplay = primaryThemeDisplayEle?.getAttribute('data-content') ?? '';
  const primaryThemeFollowEle = container.querySelector('.story-theme button');
  let primaryThemeFollow = primaryThemeFollowEle?.getAttribute('data-source') ?? '';

  if (value === 'target') {
    title = content.titleTranslation || machineTranslationInfo.titleTranslation || machineTranslationInfo.title || '';
    standfirst = content.standfirstTranslation || machineTranslationInfo.standfirstTranslation || machineTranslationInfo.standfirst || '';
    bodyXML = content.bodyXMLTranslation || machineTranslationInfo.bodyXML || '';
    byline = content.bylineTranslation || machineTranslationInfo.byline || '';
    primaryThemeDisplay = primaryThemeDisplayEle?.getAttribute('data-display') ?? '';
    primaryThemeFollow = primaryThemeFollowEle?.getAttribute('data-target') ?? '';
  } else if (value === 'bilingual') {
    let translationXML = '';
    let source = '';
    if (content.bodyXMLTranslation) {
      translationXML = content.bodyXMLTranslation;
      source = 'ftc';
    } else if (machineTranslationInfo.bodyXML) {
      translationXML = machineTranslationInfo.bodyXML;
      source = 'ai';
    }
    const contentEditable = (source === 'ai') ? ' contenteditable="true"' : '';
    title = `<div>${content.title}</div><div data-translation-property="title"${contentEditable}>${content.titleTranslation || machineTranslationInfo.titleTranslation || machineTranslationInfo.title || ''}</div>`;
    standfirst = `<div>${content.standfirst}</div><div data-translation-property="standfirst"${contentEditable}>${content.standfirstTranslation || machineTranslationInfo.standfirstTranslation || machineTranslationInfo.standfirst || ''}</div>`;
    byline = content.byline || '';
    // MARK: - For biligual mode, you should always look to match the English and translation
    const originalBodyXML = machineTranslationInfo.originalBodyXML || content.bodyXML;
    bodyXML = convertToBilingualLayout(originalBodyXML, translationXML, source);
    primaryThemeDisplay = primaryThemeDisplayEle?.getAttribute('data-display') ?? '';
    primaryThemeFollow = primaryThemeFollowEle?.getAttribute('data-target') ?? '';
  }
  const bilingualClassName = 'is-bilingual';
  if (value === 'bilingual') {
    container.classList.add(bilingualClassName);
  } else {
    container.classList.remove(bilingualClassName);
  }
  if (['target', 'bilingual'].indexOf(value) >= 0 && content.machineTranslation) {
    const aiDisclaimer = (content.machineTranslation.proofread) ? 'ai-disclaimer-proofread' : 'ai-disclaimer';
    container.querySelector('.ai-disclaimer-container').innerHTML = `<div class="ai-disclaimer">${localize(aiDisclaimer)}</div>`;
  } else {
    container.querySelector('.ai-disclaimer-container').innerHTML = '';
  }
  let titleEle = container.querySelector('.story-headline');
  titleEle.innerHTML = title;
  container.querySelector('.story-lead').innerHTML = standfirst;
  container.querySelector('.story-author').innerHTML = byline;
  container.querySelector('.story-body-container').innerHTML = bodyXML;
  for (let button of container.querySelectorAll(`.article-language-switch-container button`)) {
    button.classList.remove('on');
  }
  container.querySelector(`.article-language-switch-container button[data-value=${value}]`).classList.add('on');
  if (primaryThemeDisplayEle) {
    primaryThemeDisplayEle.innerHTML = primaryThemeDisplay;
  }
  if (primaryThemeFollowEle) {
    primaryThemeFollowEle.innerHTML = primaryThemeFollow;
  }
  container.scrollIntoView(scrollOptionsStart);
}

function getInfoFromMachineTranslation(machineTranslation) {
  function translationsToHTML(translations) {
    return (translations || [])
      .filter(x=>x && x.trim() !== '')
      .map((item, index) => {
        const hideClass = (index === 0) ? '' : ' hide';
        const eleClass = ` class="machine-translation${hideClass}"`
        return `<span${eleClass}>${item}</span>`;
      })
      .join('');
  }
  let info = {};
  let bodyXML = '';
  const translations = machineTranslation.bodyXMLTranslations;
  const proofreadTranslation = machineTranslation.bodyXMLTranslation;
  if (proofreadTranslation && proofreadTranslation !== '') {
    info.bodyXML = proofreadTranslation;
    info.proofread = true;
  } else if (translations) {
    let translationDict = {};
    for (const translation of translations) {
      const id = translation.id;
      translationDict[id] = translation.translations;
    }
    // console.log(translationDict);
    bodyXML = machineTranslation.bodyXML;
    let div = document.createElement('DIV');
    div.innerHTML = bodyXML;
    let elements = div.querySelectorAll('[id]');
    for (let ele of elements) {
      // TODO: - Keep the picture html code 
      let updatedChildrenHTMLs = [];
      const id = ele.id;
      for (const child of ele.children ) {
        if(child.nodeName === 'PICTURE'){
          // console.log('Child is a <picture> element');
          updatedChildrenHTMLs.push(child.outerHTML);
        }
      }
      const updatedChildrenHTML = updatedChildrenHTMLs.join('');
      ele.innerHTML = updatedChildrenHTML + translationsToHTML(translationDict[id]);
    }
    info.bodyXML = div.innerHTML;
  }
  info.title = machineTranslation.titleTranslation || translationsToHTML(machineTranslation.titles);
  info.standfirst = machineTranslation.standfirstTranslation || translationsToHTML(machineTranslation.standfirsts);
  info.byline = machineTranslation.byline;
  info.originalBodyXML = machineTranslation.bodyXML;
  return info;
}

function showBackArrow() {
  const isInWebAppiOS = (window.navigator.standalone === true);
  const isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
  if (!isInWebAppiOS && !isInWebAppChrome && !isFrontendTest) {return;}
  if (!document.referrer) {return;}
  let headerSideEle = document.querySelector('#header-side-toggle');
  if (!headerSideEle) {return;}
  headerSideEle.classList.remove('header-side-toggle');
  headerSideEle.classList.add('back-arrow');
  headerSideEle.id = 'back-arrow';
}

function processBylineWithLinks(content, showTranslationAsDefault) {
  // Helper function to create author links
  function createAuthorLinks(authors, authorsTranslation, language) {
      return authors.map((author, index) => {
          const name = author.replace(/ in .+$/gi, '').trim();
          const displayName = authorsTranslation && authorsTranslation.length > index ? authorsTranslation[index].trim() : name;
          if (name === '') {return displayName;}
          const url = `./chat.html#field=byline&key=${encodeURIComponent(name)}&language=${language}&action=search&display=${encodeURIComponent(displayName)}`;
          return `<a href="${url}" target="_blank">${displayName}</a>`;
      }).join(', ');
  }

  const annotations = content.annotations?.map(x => x.prefLabel || '');
  if (annotations.indexOf('FT Podcast') >= 0) {
    return {byline: '', bylineEnglish: ''};
  }

  let byline = content.byline || '';
  let bylineEnglishLinks = '';
  let bylineLinks = '';

  // Splitting English byline authors
  const englishAuthors = byline.replace(/ and /gi, ',').split(',');

  // Creating links for English byline
  bylineEnglishLinks = createAuthorLinks(englishAuthors, englishAuthors, 'en');

  let bylineTranslation = content.bylineTranslation ?? content.machineTranslation?.byline ?? '';
  
  if (bylineTranslation === '') {
    bylineTranslation = content.byline;
  }

  if (bylineTranslation) {
      // Splitting translation byline authors, considering both comma types
      const translatedAuthors = bylineTranslation.replace(/ and /gi, ',').split(/,|，/);
      if (englishAuthors.length === translatedAuthors.length) {
          // If the number of authors matches, create links for translated byline
          bylineLinks = createAuthorLinks(englishAuthors, translatedAuthors, preferredLanguage);
      } else {
          // Fallback if translation does not match in number of authors
          bylineLinks = bylineEnglishLinks;
      }
  } else {
      // If no translation, use English byline links
      bylineLinks = bylineEnglishLinks;
  }

  // Choosing which byline to display based on showTranslationAsDefault flag
  let finalByline = showTranslationAsDefault && bylineLinks !== bylineEnglishLinks ? bylineLinks : bylineEnglishLinks;

  return {
      byline: finalByline, // This will return the final byline with links, potentially translated
      bylineEnglish: `<div class="hide story-byline-english">${bylineEnglishLinks}</div>` // This will return the English byline with links
  };
}

async function showErrorInDetail(info) {
  const detail = info?.detail;
  if (!detail) {
    updateStatus('Error');
    await showError(info?.message ?? 'Unknown Error');
    return; // Ensure the function exits if there's no detail
  }

  if (detail.status === 'PermissionRequired') {
    const tierToBuy = localize(detail.tierToBuy || '');
    const text = localize('promptUpgrade').replace('[tierToBuy]', tierToBuy);
    showResultInChat({text}, true);
    updateBotStatus('waiting');
    return; // Exit after handling PermissionRequired
  }

  // Handle other statuses or default error messages
  updateStatus('Error');
  await showError(detail.message ?? 'An unexpected error occurred.');
}

async function showContent(ftid, language, shouldScrollIntoView = true, shouldLoadArticle = true) {
  try {
      if (!language) {
        language = preferredLanguage;
      }
      if (shouldLoadArticle === false) {
        const targetDiv = document.querySelector(`.article-container[data-id="${ftid}"]`);
        targetDiv.focus();
        targetDiv.scrollIntoView({
          behavior: 'smooth', 
          inline: 'nearest'
        });
        return;
      }
      showBotResponse('Getting Article...', shouldScrollIntoView);
      // MARK: - It is important to set the current ft id here, because async request might not be returned in the expected sequence. 
      currentFTId = ftid;
      // console.log(`\n\n======\n\n========\nlanguage: ${language}`);
      const info = await getArticleFromFTAPI(ftid, language);
      console.log('info for artricle: ');
      console.log(info);
      console.log('status: ');
      console.log(info?.status);
      if (info?.status === 'failed') {
        console.log(1);
        await showErrorInDetail(info);
        return;
      } else {
        console.log(2);
      }
      const content = info.results;
      articles[ftid] = content;
      const type = getContentType(content);
      const hideBodyClass = (['Video', 'Audio'].indexOf(type) >= 0) ? ' hide' : '';
      if (info.status === 'success' && content) {
          let audioHTML = getAudioHTML(content);
          let englishQuiz = '';
          if (audioHTML !== '' && !/^en/gi.test(language)) {
            englishQuiz = `<a data-id="${ftid}" data-lang='English' data-action="quiz" title="Test my understanding of the article">Quiz</a>`;
          }
          const actions = `
            <div class="chat-item-actions" data-lang="${language}" data-id="${ftid}">
              ${englishQuiz}
              <a data-id="${ftid}" data-action="quiz" data-lang="${language}" title="Test my understanding of the article">${localize('Quiz Me')}</a>
              <a data-id="${ftid}" data-action="socratic" title="${localize('Socratic Method Explained')}">${localize('Socratic Method')}</a>
            </div>`;
            //              <a data-purpose="set-intention" data-lang="${language}" data-content="CleanSlate" data-reply="${localize('Offer Help')}">${localize('DoSomethingElse')}</a>

          let visualHeading = getVideoHTML(content);
          if (visualHeading === '' && content.mainImage && content.mainImage.members && content.mainImage.members.length > 0) {
              visualHeading = content.mainImage.members[0].binaryUrl;
              if (location.host === 'ftcoffer.herokuapp.com') {
                visualHeading = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(visualHeading)}?fit=scale-down&source=next&width=1920`;
              } else {
                visualHeading = `https://thumbor.ftacademy.cn/unsafe/1920x0/${encodeURIComponent(visualHeading)}`;
              }
              visualHeading = `<div class="story-image image"><figure class=""><img src="${visualHeading}"></figure></div>`;
          }
          const date = new Date(content.publishedDate || content.firstPublishedDate);
          const localizedDate = date.toLocaleString();
          let showTranslationAsDefault = false;
          let bodyXML = content.bodyXML || content.transcript || '';
          let bodyXMLEnglish = '';
          let machineTranslationInfo = {};
          let isUsingMachineTranslation = false;
          let isAITranslationPublishedOnFTC = false;
          if (content.bodyXMLTranslation && content.bodyXMLTranslation !== '') {
            bodyXMLEnglish = `<div class="hide story-body-english">${bodyXML}</div>`;
            bodyXML = content.bodyXMLTranslation;
            showTranslationAsDefault = true;
            isAITranslationPublishedOnFTC = /AITranslation/i.test(content.ftcTag || '');
            isUsingMachineTranslation = isAITranslationPublishedOnFTC;
          } else if (content.machineTranslation && translationPreference === 'both') {
            bodyXMLEnglish = `<div class="hide story-body-english">${bodyXML}</div>`;
            machineTranslationInfo = getInfoFromMachineTranslation(content.machineTranslation);
            bodyXML = machineTranslationInfo.bodyXML;
            showTranslationAsDefault = true;
            isUsingMachineTranslation = true;
          }
          let showTranscript = (bodyXML !== '' && ['Video', 'Audio'].indexOf(type) >= 0) ? `<p><a data-action="show-transcript">Show Transcript</a></p>` : '';
          let title = content.title || '';
          let titleEnglish = '';
          if (content.titleTranslation && content.titleTranslation !== '') {
              titleEnglish = `<div class="hide story-headline-english">${title}</div>`;
              title = (showTranslationAsDefault) ? content.titleTranslation : content.title;
          }
          title = machineTranslationInfo.title || title;
          let standfirst = content.standfirst || '';
          let standfirstEnglish = '';
          if (content.standfirstTranslation && content.standfirstTranslation !== '') {
              standfirstEnglish = `<div class="hide story-lead-english">${standfirst}</div>`;
              standfirst = (showTranslationAsDefault) ? content.standfirstTranslation : content.standfirst;
          }
          standfirst = machineTranslationInfo.standfirst || standfirst;

          const bylineInfo = processBylineWithLinks(content, showTranslationAsDefault);
          const byline = bylineInfo.byline;
          const bylineEnglish = bylineInfo.bylineEnglish;

          // MARK: - If the article starts with a picture, don't show the picture in the heading
          if (/^<div class=\"pic/.test(bodyXML)) {
            visualHeading = '';
          }
          const shouldShowBilligualSwitch = (language && language !== '' && language.toLowerCase() !== 'english' && !/^en/i.test(language));
          const onClass = ' class="on"';
          const showTranslation = (showTranslationAsDefault) ? onClass : '';
          const showOriginal = (showTranslationAsDefault) ? '' : onClass;
          const languageSwitchHTML = (shouldShowBilligualSwitch) ? `
            <div class="article-language-switch-container">
              <button data-value="target"${showTranslation}>${languageOptionsDict[language] || language}</button>
              <button data-value="source"${showOriginal}>English</button>
              <button data-value="bilingual">${localize('Bilingual')}</button>
            </div>
          ` : '';
          let disclaimerForMachineTranslation = '';
          // MARK: - Show Machine translation disclaimer only when necessary, localize it
          // console.log(`isUsingMachineTranslation: ${isUsingMachineTranslation}, showTranslationAsDefault: ${showTranslationAsDefault}`);
          if (isUsingMachineTranslation && showTranslationAsDefault) {
            const aiDisclaimer = (machineTranslationInfo.proofread || isAITranslationPublishedOnFTC) ? 'ai-disclaimer-proofread' : 'ai-disclaimer';
            disclaimerForMachineTranslation = `<div class="ai-disclaimer">${localize(aiDisclaimer)}</div>`;
          }
          
          const annotationInfo = getAnnotaionsInfo(content, language);

          const storyTheme = annotationInfo.storyTheme;
          const annotations = annotationInfo.annotations;
          const mentions = annotationInfo.mentions;
          const genreClass = annotationInfo.genreClass || '';

          // console.log(annotations);

          const discussArticleOnly = paramDict && paramDict.action && paramDict.ftid;
          const discussArticlePrompt = discussArticleOnly ? `<div class="article-prompt">${localize('Discuss Article')}</div>` : '';
          let html = `
              <div class="article-container" data-id="${ftid}">
                  ${languageSwitchHTML}
                  <div class="ai-disclaimer-container">${disclaimerForMachineTranslation}</div>
                  <div class="story-header-container${genreClass}">
                      <div class="text-container">
                        ${storyTheme}
                        <h1 class="story-headline story-headline-large">${title}</h1>
                        <div class="story-lead">${standfirst}</div>
                      </div>
                      ${visualHeading}
                      <div class="story-byline">
                          <span class="story-time">${localizedDate}</span>
                          <span class="story-author">${byline}</span>
                      </div>
                  </div>
                  ${audioHTML}
                  <div class="story-body${hideBodyClass}">
                    <div id="story-body-container" class="story-body-container">${bodyXML}</div>
                    ${annotations}
                    ${mentions}
                  </div>
                  ${showTranscript}
                  ${titleEnglish}
                  ${bylineEnglish}
                  ${standfirstEnglish}
                  ${bodyXMLEnglish}
              </div>
              ${actions}
              ${discussArticlePrompt}`
              .replace(/[\r\n]+[\t\s]+/g, '')
              .replace(/[\r\n]+/g, '');
          // html += `<button class="quiz-next hide">${localize('NEXT')}</button>`;
          const result = {text: html};
          showResultInChat(result, shouldScrollIntoView);
          addStoryToRead(ftid);
          checkContentLinks();
          checkScrollyTellingForChat();
          checkStoryImages();
          checkFullGridBlocks();
          initScrollyTelling(ftid);
          // MARK: - Only if a user opens an article in a new tab/window, should we stwitch the intention to discuss the article only
          if (discussArticleOnly) {
            setIntention('DiscussArticle');
            // MARK: - When you start to discuss a new article, you'll always want to clear previous conversations. 
            previousConversations = [];
            previousIntentDections = [];
          }
          userInput.focus();
          handleFlourishEmbeds(html);

          console.log(`discussArticleOnly: ${discussArticleOnly}`);

          if (!discussArticleOnly) {
            await displayCachedQuiz(ftid, language);
          }

          // Deprecating: - Migrating to Pinecone for context
          // MARK: - Create embeddings for the article content in paragraphs
          // await generateEmbeddingsForArticle(content);
      }
  } catch(err) {
      console.log(err);
  }
}

function handleFlourishEmbeds(html) {
  // MARK: - Dynamically load flourish javascript code
  if (!/flourish-embed/.test(html)) {return;}
  // MARK: - Reset the FlourishLoaded variable to force it to reload every time
  window.FlourishLoaded = false;
  let script = document.createElement('script');
  script.src = `https://public.flourish.studio/resources/embed.js`;
  script.async = true;
  document.body.appendChild(script);
  // MARK: - Make sure each flourish embed is only executed once
  for (let container of document.querySelectorAll('.flourish-embed')) {
    const config = { attributes: false, childList: true, subtree: false };
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          container.style.marginBottom = '1em';
          container.classList.remove('flourish-embed');
          observer.disconnect();
        }
      }
    };
    const observer = new MutationObserver(callback);
    observer.observe(container, config);
  }

}

function showActions(actions) {
  let chatTalkerInners = document.querySelectorAll('.chat-talk-agent .chat-talk-inner');
  if (chatTalkerInners.length === 0) {return;}
  let chatTalkInner = chatTalkerInners[chatTalkerInners.length - 1];
  chatTalkInner.innerHTML += actions;
  chatTalkInner.closest('.chat-talk-agent').scrollIntoView(scrollOptions);
}

function updateBotStatus(status) {
  botStatus = status;
  if (status === 'pending') {
    userInput.parentElement.classList.add('pending');
  } else {
    const pendingAgentChats = document.querySelectorAll('.chat-talk-agent-pending');
    for (let pendingAgentChat of pendingAgentChats) {
      pendingAgentChat.remove();
    }
    userInput.parentElement.classList.remove('pending');
  }
}

function showBotResponse(placeholder, shouldScrollIntoView = true) {
  const botResponse = document.createElement('DIV');
  botResponse.className = 'chat-talk chat-talk-agent chat-talk-agent-pending';
  botResponse.innerHTML = `<div class="chat-talk-inner chat-talk-response-status">${placeholder || '...'}</div>`;
  chatContent.appendChild(botResponse);
  if (!shouldScrollIntoView) {return;}
  botResponse.scrollIntoView(scrollOptions);
}

function showResultInChat(result, shouldScrollIntoView = true, isFullGrid = false) {
  updateBotStatus('waiting');
  const newResult = document.createElement('DIV');
  const fullGridClassName = (isFullGrid) ? ' chat-full-grid' : '';
  newResult.className = `chat-talk chat-talk-agent${fullGridClassName}`;
  // MARK: - Converting the HTML on the frontend
  if (!result || !result.text || typeof result.text !== 'string') {return;}
  const resultHTML = markdownConvert(result.text);
  newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
  chatContent.appendChild(newResult);
  if (newResult.querySelector('h1, .story-header-container')) {
    newResult.classList.add('full-grid-story');
    newResult.classList.add('show-hero-header');
    // MARK: - Need the set time out to work properly on Chrome
    let inViewClass = '.story-lead';
    if (newResult.querySelector('.audio-container, .story-header-container video') && newResult.querySelector('.chat-item-actions')) {
      inViewClass = '.chat-item-actions';
    }
    if(shouldScrollIntoView) {
      setTimeout(function(){
        // newResult.querySelector(inViewClass).scrollIntoView(scrollOptions);
        scrollIntoViewProperly(newResult.querySelector(inViewClass));
      }, 0);
    }
  } else if (shouldScrollIntoView) {
    scrollIntoViewProperly(newResult);
      // newResult.scrollIntoView(scrollOptions);
  }
}

function getOffsetTop(element) {
  let offsetTop = 0;
  while (element) {
    offsetTop += element.offsetTop;
    element = element.offsetParent;
  }
  return offsetTop;
}

// MARK: - Accurately controll how an element should be scrolled into view so that it feels totally natural and convenient for users. 
function scrollIntoViewProperly(ele) {
  const eleHeight = ele.offsetHeight || 0;
  const windowHeight = window.innerHeight || 0;

  const isQuiz = ele.classList.contains('quiz-container');
  const hasStickyAudioPlaceHolder = ele.closest('.chat-talk-inner')?.querySelector('.audio-placeholder') ? true : false;
  const topBottomEdgeHeight = hasStickyAudioPlaceHolder ? 200 : 100;
  const visibleChatWindowHeight = windowHeight - topBottomEdgeHeight;

  // console.log('\n\n===========');
  // console.log(ele);
  // console.log(`isQuiz: ${isQuiz}, hasStickyAudioPlaceHolder: ${hasStickyAudioPlaceHolder}, eleHeight: ${eleHeight}, visibleChatWindowHeight: ${visibleChatWindowHeight}, topBottomEdgeHeight: ${topBottomEdgeHeight}`);
  if (eleHeight < visibleChatWindowHeight && !isQuiz) {
    // console.log('Default scroll which has less controle. ');
    ele.scrollIntoView(scrollOptions);
  } else {
    const offsetTop = getOffsetTop(ele);
    const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const hideTopNavWidth = 768;
    const topEdge = (w <= hideTopNavWidth ) ? 88 : 64;
    const offsetPosition = Math.max(0, offsetTop - topEdge);
    // console.log(`Count the scroll height: offsetTop: ${offsetTop}, topEdge: ${topEdge}, offsetPosition: ${offsetPosition}`);
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  
  }
  
}

function scrollIntoViewProperlyForItems(eles) {
  let eleHeight = 0;
  for (const ele of eles || []) {
    eleHeight += ele.offsetHeight || 0;
  }
  const ele = eles[0];
  const windowHeight = window.innerHeight || 0;
  const topBottomEdgeHeight = 100;
  const visibleChatWindowHeight = windowHeight - topBottomEdgeHeight;

  if (eleHeight < visibleChatWindowHeight) {
    ele.scrollIntoView(scrollOptions);
  } else {
    const offsetTop = getOffsetTop(ele);
    const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const hideTopNavWidth = 768;
    const topEdge = (w <= hideTopNavWidth ) ? 88 : 44;
    const offsetPosition = Math.max(0, offsetTop - topEdge);
    // console.log(eles?.[0]?.innerHTML);
    console.log(`Count the scroll height: offsetTop: ${offsetTop}, offset position: ${offsetPosition}`);
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

function showUserPrompt(prompt) {
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-user';
  newChat.innerHTML = `<div class="chat-talk-inner">${prompt.trim().replace(/\n/g, '<br>')}</div>`;
  chatContent.appendChild(newChat);
}

function hidePreviousActions() {
  for (let action of document.querySelectorAll('.chat-item-actions')) {
    action.classList.add('hide');
  }
}

function getShortcutOptions(prompt) {
  // MARK: - If the user is prompting these keys, there's no shortcut
  const nonShortcuts = /Why|How|Which|Who|谁|为什|为啥/gi;
  if (nonShortcuts.test(prompt)) {
    return null;
  }
  const shortcuts = [
    {
      key: 'Most Popular',
      regex: /热门文章|热门内容|热门新闻|Most Popular|Hot Content|Hot Article|最受欢迎文章|最受欢迎内容|最受欢迎新闻/gi,
      purpose: 'show-ft-page',
      content: 'most-popular',
      reply: 'FindingMostPopular'
    },
    {
      key: 'Top News For Me',
      regex: /^(What's[the latest]+New[s\.\s\?]*|有什么[最新]*[新闻消息内容]+[?？\.。\s]*)$/gi,
      purpose: 'show-ft-page',
      content: 'home',
      reply: 'FindingMyFT'
    }
  ];
  for (const shortcut of shortcuts) {
    const mostpopularKey = shortcut.key.toLowerCase();
    const mostpopulars = [mostpopularKey].concat(Object.keys(statusDict[mostpopularKey] || []).map(key=>statusDict[mostpopularKey][key]));
    let mostpopularRegex = shortcut.regex; 
    if (mostpopulars.indexOf(prompt) >= 0 || mostpopularRegex.test(prompt)) {
      return {purpose: shortcut.purpose, content: shortcut.content, reply: shortcut.reply};
    }
  }
  return null;
}

async function talk() {
  // console.log(`Talk sent! Hiding the .chat-topic-intention`);
  const ele = document.querySelector('.chat-topic-intention');
  hideEle(ele);
  const prompt = userInput.value.replace(/^\s+|\s+$/g, '');
  if (prompt === '') {return;}
  if (botStatus === 'pending') {return;}
  if (!chatContent.querySelector('.chat-talk')) {
      chatContent.innerHTML = '';
  }
  updateBotStatus('pending');
  showUserPrompt(prompt);
  hidePreviousActions();
  userInput.value = '';
  userInput.style.height = 'auto';
  showBotResponse();
  // MARK: If the user input the FT url directly, just show the article
  const ftUrlPattern = /^http.+\.ft\.com\/content\/([a-zA-Z0-9\-]+)(\?.*)?$/;
  if (ftUrlPattern.test(prompt)) {
    const ftid = prompt.replace(ftUrlPattern, '$1');
    const language = preferredLanguage;
    showResultInChat({text: localize('SearchFTAPI')});
    await showContent(ftid, language);
    return;
  }
  let shortcutOptions = getShortcutOptions(prompt);
  if (shortcutOptions && typeof shortcutOptions === 'object') {
    const purpose = shortcutOptions.purpose;
    const content = shortcutOptions.content;
    const reply = shortcutOptions.reply || '';
    if (purpose && content && purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, preferredLanguage, localize(reply));
    }
    return;
  }

  // Deprecating: - Migrating to Pinecone for context
  // const context = await getContextByIntention(prompt);
  // MARK: - Send the prompt to our API for response
  const newUserPrompt = {role: 'user', content: prompt};
  const messages = previousConversations.concat([newUserPrompt]);
  const intentions = previousIntentDections.concat([newUserPrompt]);
  let data = {
      messages: messages,
      temperature: 0,
      max_tokens: 300,
      intentions: intentions,
      key: window.intention, // Pass the window intention for fast detection
        // Deprecating: - Migrating to Pinecone for context
      // context: context // Send context such as article text so that the chat bot can respond more accurately
  };
  // MARK: - If the user is dicussing one article, pass the article id
  if ('DiscussArticle' === window.intention && typeof currentFTId === 'string') {
    data.ftid = currentFTId;
  }
  // MARK: - Heroku has a 30 seconds hard limit for all requests. The best way is NOT to detect intention first (either locally or through a request to OpenAI), then deal with the intention (likely through OpenAI) because OpenAI's service is so slow that even one simple request will time out. The only way that works is to just post the task for the background to handle, then polling for the result, like what we did for the Quiz.
  const result = await createChatFromOpenAI(data);

  if (result.status === 'failed') {
    await showErrorInDetail(result);
    return;
  }

  if (result.status === 'success' && result.text) {
      showResultInChat(result);
      // MARK: - Only keep the latest 5 conversations and 4 intentions
      previousConversations = previousConversations.slice(-5);
      previousIntentDections = previousIntentDections.slice(-5);
      // MARK: - Only keep the history if the intention is not a known one, in which case, OpenAI will need the contexts. 
      if (!result.intention || ['Other', 'CustomerService', 'DiscussArticle', 'DiscussContent'].indexOf(result.intention) >= 0) {
        previousConversations.push(newUserPrompt);
        previousConversations.push({role: 'assistant', content: result.text});
      }
      previousIntentDections.push(newUserPrompt);
      previousIntentDections.push({role: 'assistant', content: result.intention || 'Other'});
      updateStatus(result.intention);
      // MARK: - Check if the resultHTML has some prompt or request for the system
      await handleResultPrompt(result.text);
      await handleResultSources(result.sources);
      await nextAction(result.intention);
  } else if (result.message) {
      updateStatus('Error');
      await showError(result.message);
  } else {
      updateStatus('Error');
      await showError('An unknown error happened. Please try again later. ');
  }
  updateBotStatus('waiting');
}

function markdownToHtmlTable(text) {
  // Search for all Markdown tables in the text
  const regex = /\s*\|(.+)\|[\s\n]*\|( *:?-+:? *\|)+\s*((.+\|)+\s*)+/gm;

  const matches = text.match(regex);
  // If no tables are found, return the original text
  if (!matches) {
    return text;
  }
  // Replace each Markdown table with its HTML equivalent
  let html = text;
  for (const match of matches) {
    const table = match.trim();
    // Split the table into rows and remove leading/trailing whitespace
    const rows = table.split('\n').map(row => row.trim());
    // Extract the headers from the first row
    const headers = rows[0].split('|').slice(1, -1).map(header => header.trim());
    // Create the HTML table and header row
    let tableHtml = '<table><tr>';
    for (const header of headers) {
      tableHtml += `<th>${header}</th>`;
    }
    tableHtml += '</tr>';
    // Create the HTML table rows from the remaining Markdown rows
    for (let i = 2; i < rows.length; i++) {
      const cells = rows[i].split('|').slice(1, -1).map(cell => cell.trim());
      tableHtml += '<tr>';
      for (const cell of cells) {
        tableHtml += `<td>${cell}</td>`;
      }
      tableHtml += '</tr>';
    }
    // Close the HTML table and replace the Markdown table with it
    tableHtml += '</table>';
    html = html.replace(table, tableHtml);
  }  
  // Return the modified text with all Markdown tables converted to HTML
  return html;
}

function markdownCodeBlock(text) {
  const result = text.replace(/```([A-z]*)\n([\s\S]+?)```/g, '<div class="code-block-container"><div class="code-block-title"><div class="code-block-copy"></div>$1</div><div class="code-block"><pre>$2</pre></div></div>');
  const re = /<pre>([\s\S]*?)<\/pre>/gm;
  const output = result.replace(re, (match, p1) => {
    return '<pre>' + p1.replace(/\n/g, '|||') + '</pre>';
  });
  return output;
}

function handleExcerpt(html) {
  // Create a temporary wrapper element
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  // Select all <excerpt> elements
  const excerpts = wrapper.querySelectorAll('excerpt');

  // If no <excerpt> tags are found, return the original HTML
  if (excerpts.length === 0) {
    return html;
  }

  // Process each <excerpt> element
  excerpts.forEach(excerpt => {
    const content = excerpt.textContent.trim(); // Get the plain text content
    const newElement = document.createElement('a'); // Create a new <a> element
    newElement.className = 'excerpt'; // Set the class
    newElement.setAttribute('title', content); // Add the title attribute with plain text content
    newElement.textContent = localize('excerpt'); // Set the localized text

    // Replace the old <excerpt> element with the new <a> element
    excerpt.replaceWith(newElement);
  });

  // Return the modified HTML as a string
  return wrapper.innerHTML;
}

function markdownConvert(text) {
  let result = markdownCodeBlock(text);
  result = markdownToHtmlTable(result);
  result = result.replace(/[\*]{2}([^*]+)[\*]{2}/g, '<strong>$1</strong>');
  result = result.replace(/[\n\r]/g, '<br>').replace(/[\|]{3}/g, '\n');
  result = handleExcerpt(result);
  return result;
}

const purposeToFunction = {
  'search-ft-api': searchFTAPI,
  'search-topic': searchTopic,
  'set-intention': setIntention,
  'show-ft-page': showFTPage,
  'set-preference': setPreference,
  'start-over': startOver,
  'clear-start-over': clearStartOver,
  'news-quiz': newsQuiz
  // 'check-news': checkNews
  // 'purpose2': function2,
  // 'purpose3': function3,
  // ... add more purposes and functions here
};

const actionTypeToFunction = {
  'content': showContent,
  'searchft': searchFTAPI,
  'page': showFTPage
};

async function handleAction(key, value) {
  if (actionTypeToFunction.hasOwnProperty(key)) {
    await actionTypeToFunction[key](value);
  }
}

// async function checkNews(content, language) {
//   console.log('Should Check News and Come Up with the search query! ');

// }

function startOver() {
  location.reload();
}

async function clearStartOver() {
  if (!confirm(localize('ConfirmDelete'))) {
    return;
  }
  await clearAllPreferences();
  location.reload();
}

function getFollowedAnnotations(myPreference, infos) {

  let allItems = [];
  let allIndex = 0;
  for (const info of infos) {
    const id = info.id;
    const action = info.action;
    for (const x of (myPreference[id] || [])) {
      if (typeof x !== 'object') {continue;}
      let index = x.index || 0;
      allIndex += index;
      allItems.push({display: localize(x.display), action: action, key: x.key, type: x.type, index: index});
    }
  }
  if (allIndex > 0) {
    allItems = allItems.sort((a,b) => a.index - b.index);
  }

  let followedAnnotations = '';

  for (const x of allItems) {
    followedAnnotations += `<div class="input-container for-click" draggable="true"><div class="input-name show-reorder-button-leading">${localize(x.display)}</div><button class="myft-follow tick" data-action="${x.action}" data-name="${x.key}" data-type="${x.type}">${localize('Unfollow')}</button></div>`;
  }

  if (followedAnnotations === '') {
    followedAnnotations = `<div data-action="add-interests">${localize('PromptAdd')}</div>`;
  }
  return followedAnnotations;

}

async function setPreference(category, language, reply) {
  console.log(`running setPreference\ncategory: ${category}, language: ${language}, reply: ${reply}`);
  const settings = {
    all: [
      {
        name: myInterestsKey,
        type: 'annotations',
        infos: interestsInfos
      },
      {
        name: 'ReadingPreferences',
        type: 'title'
      },
      {
        name: 'Language',
        type: 'select',
        options: languageOptions,
        fallback: preferredLanguage
      },
      {
        name: 'Font Size',
        type: 'select',
        options: [
          { value: 'font-smallest', name: 'Smallest'},
          { value: 'font-smaller', name: 'Smaller'},
          { value: 'font-default', name: 'Default'},
          { value: 'font-larger', name: 'Larger'},
          { value: 'font-largest', name: 'Largest'}
        ],
        fallback: 'font-default'
      },
      {
        name: 'Read Article',
        type: 'select',
        options: [
          {value: 'pop-out', name: 'Pop Out'},
          {value: 'in-chat', name: 'In Chat'}
        ],
        fallback: 'pop-out'
      },
      {
        name: 'Article Translation Preference',
        type: 'select',
        options: [
          {value: 'both', name: 'Both Human and Machine Translation'},
          {value: 'human', name: 'Only Use Human Translation'}
        ],
        fallback: 'both'
      },
      {
        name: readArticlesKey,
        type: 'select',
        options: [
          {value: 'collapse', name: 'Collapse to Bottom'},
          {value: 'show', name: 'Show'}
        ],
        fallback: 'collapse'
      }
    ]
  };
  const mySettings = settings[category];
  if (!mySettings || mySettings.length === 0) {return;}
  let html = '';
  let myPreference = {};
  const myPreferenceString = localStorage.getItem('preference');
  if (myPreferenceString && myPreferenceString !== '') {
    try {
      myPreference = JSON.parse(myPreferenceString);
    } catch(ignore) {}
  }
  for (const setting of mySettings) {
    const type = setting.type;
    const id = setting.name;
    const infos = setting.infos;
    if (!type || !id) {continue;}
    const name = localize(id);
    const currentValue = myPreference[id] || setting.fallback;
    if (type === 'select') {
      const options = setting.options;
      if (!options || options.length === 0) {continue;}
      let optionsHTML = `<option value="">${localize('Please Select')}</option>`;
      for (const option of options) {
        const selected = (option.value === currentValue) ? ' selected' : '';
        optionsHTML += `<option value="${option.value}"${selected}>${localize(option.name)}</option>`;
      }
      html += `<div class="select-container"><div class="select-label">${name}</div><select id="${id}">${optionsHTML}</select></div>`
    } else if (type === 'annotations') {
      const followedAnnotations = getFollowedAnnotations(myPreference, infos);
      html += `<div class="select-container"><div class="select-label"><strong>${name}</strong></div><button class="myft-follow plus" data-action="add-interests">${localize('Add')}</button></div><div class="annotations-container drag-drop-container">${followedAnnotations}</div>`;
    } else if (type === 'title') {
      html += `<div class="select-container"><div class="select-label"><strong>${name}</strong></div></div>`;
    }
  }
  html += `<div class="chat-item-actions"><a data-purpose="start-over" data-content="start-over">${localize('ApplyAndStartOver')}</a></div>`;
  html += `<div class="chat-item-actions"><a data-purpose="clear-start-over" data-content="clear-start-over">${localize('ClearAndStartOver')}</a></div>`;
  html = `<div class="settings-container">${html}</div>`;
  html = await convertChinese(html, language);
  const actions = getActionOptions();

  const scrollOptions = { 
    behavior: 'smooth', 
    block: 'nearest',
  };

  showResultInChat({text: `${reply || ''}`}, false, false);
  showResultInChat({text: `${html}${actions}`}, true, true);
}

async function setIntention(newIntention, language, reply, isFullGrid = false, shouldScrollIntoView = true) {
  console.log(`running setIntention: content: ${newIntention}, language: ${language}, reply: ${reply}, isFullGrid: ${isFullGrid}, shouldScrollIntoView: ${shouldScrollIntoView}`);
  // MARK: - Allow the input only when the user set intention
  userInput.removeAttribute('disabled');
  userInput.removeAttribute('placeholder');
  if (newIntention === 'CleanSlate') {
    window.intention = undefined;
  } else {
    window.intention = newIntention;
  }
  updateStatus(newIntention);
  // MARK: - Show this only when there's a reply
  if (reply && reply !== '') {
    const actions = getActionOptions();
    showResultInChat({text: `${reply}${actions}`}, shouldScrollIntoView, isFullGrid);
  }
}

async function createTranslations(results, language) {
  let titleAndSubheading = results
  .map(item => {
    return `${item.title.title || ''}\n${item.editorial.subheading || item.summary.excerpt || ''}`;
  })
  .join('\n');
  titleAndSubheading = await translateFromEnglish(titleAndSubheading, language);
  let translations = [];
  let t = '';
  let s = '';
  for (const [index, text] of titleAndSubheading.split('\n').entries()) {
    if (index % 2 === 0) {
      t = text;
    } else {
      s = text;
      translations.push({title: t, subheading: s});
    }
  }
  return translations;
}



async function newsQuiz(content, language, reply, id) {
  // console.log(`running newsQuiz... content: ${content}, language: ${language}`);
  updateBotStatus('pending');
  showResultInChat({text: reply});
  try {
    const quizInfo = await getNewsQuiz(content, language, id);
    // console.log(quizInfo);
    if (quizInfo.status === 'success' && quizInfo.results) {
      let html = '';
      const startDate = new Date('2025-01-06T00:00:00+08:00').getTime();
      const endDate = new Date('2025-01-19T23:59:59+08:00').getTime();
      const now = new Date().getTime();
      const showPromotion = now >= startDate && now <= endDate;
      const promoInfo = showPromotion ? `<a class="quiz-promotion-text-link" href="/m/corp/preview.html?pageid=2025CNY&to=all&ccode=2C2025CNYchatftcquiz" target="_blank">现在订阅，限时75折</a>`: '<a class="quiz-promotion-text-link" href="/subscription?ccode=2C2024chatftcquiz" target="_blank">立即订阅，每天仅需1元</a>';
      for (const [index, quiz] of quizInfo.results.entries()) {
          const answer = quiz.answer || '';
          const explanation = quiz.explanation || '';
          const title = (/zh/.test(language)) ? quiz.cheadline || quiz.title || '' : quiz.title || '';
          const id = quiz.id || '';
          let contentLink = '';
          if (title !== '' && id !== '') {
            contentLink = `<a href="/powertranslate/chat.html#ftid=${id}&language=${language}&action=read" target="_blank">${title}</a>`;
          }
          let shareLink = '';
          if (id !== '') {
            shareLink = `
            ${promoInfo}
            <a class="quiz-share" data-quiz-id="${id}" data-language="${language}"></a>
            <a class="quiz-detail" href="/quiz/${id}/${language}" target="_blank"></a>
            `;
          }

          let allOptions = quiz.distractors || [];
          // MARK: - OpenAI doesn't get it right all the time, especially when you prompt it to translate a quiz. So you need to verify on the frontend. 
          if (allOptions.indexOf(answer) === -1) {
              allOptions.push(answer);
          }
          allOptions = shuffle(allOptions);
          let options = '';
          for (const option of allOptions) {
              const className = (option === answer) ? 'is-correct' : 'is-wrong';
              options += `<div class=${className}>${option.trim().replace(/[\.。]+$/g, '')}</div>`; 
          }
          const hideClass = (index === 0) ? '' : ' hide'; 
          html += `
              <div class="quiz-container${hideClass}" data-score="0" data-store="DailyQuiz">
                  <div class="quiz-question">${quiz.question}</div>
                  <div class="quiz-options">${options}</div>
                  <div class="quiz-explanation"><p>${explanation}</p><p>${contentLink}</p><p>${shareLink}</p></div>
                  <div class="quiz-end-for-scroll-alignment"></div>
              </div>
          `.replace(/[\r\n]+/g, '');
      }
      html = `<div>${html}</div>`;
      html += `<button class="quiz-next hide">${localize('NEXT')}</button>`;
      html = await convertChinese(html, preferredLanguage);
      const result = {text: html};
      showResultInChat(result, true, true);
      await setIntention('Ask Me', preferredLanguage, '', true, false);

    }
  } catch (err) {

  }
  updateBotStatus('waiting');
}




async function getNewsQuiz(content, language, id) {
  try {
      const data = {content: content, language: language, id: id};

      // console.log('getNewsQuiz data: ');
      // console.log(data);

      let url = '/ai/quiz';
      let options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
      };
      if (isFrontendTest && !isPowerTranslate) {
          url = '/api/page/quiz.json';
          options = {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              },
          };
      }
      const response = await fetch(url, options);
      let results = await response.json();
      if (response.status >= 400 && results.message) {
          return {status: 'failed', message: results.message};
      }
      if (results) {
          return {status: 'success', results: results};
      } else {
          return {status: 'failed', message: 'Something is wrong with FT News Quiz, please try later. '};
      }
  } catch(err) {
      console.log(err);
      return {status: 'failed', message: err.toString()};
  }
}


async function renderResults(results, language) {
  const newResult = document.createElement('DIV');
  newResult.className = 'chat-talk chat-talk-agent chat-full-grid';
  const newResultInner = document.createElement('DIV');
  newResultInner.className = 'chat-talk-inner';
  newResult.appendChild(newResultInner);
  chatContent.appendChild(newResult);
  const itemChunk = 10;
  // const translations = await results.slice(0, itemChunk), language);
  let html = '';
  for (const [index, item] of results.entries()) {
    const id = item.id;
    let title = item.title.title || '';
    let subheading = item.editorial.subheading || item.summary.excerpt || '';
    const byline = item.editorial.byline;
    const excerpt = item.summary.excerpt;
    const time = item.lifecycle.lastPublishDateTime;
    const timeStamp = new Date(time).toLocaleString();
    let hideClass = ' hide';
    if (index < itemChunk) {
      hideClass = '';
      // if (translations.length > index) {
      //   title = translations[index].title || title;
      //   subheading = translations[index].subheading || subheading;
      // }
      // title = title.trim().replace(/[\.。]+$/g, '');
      // subheading = subheading.trim().replace(/[\.。]+$/g, '');
    }
    // console.log(`hide class: ${hideClass}`);
    const lang = language || 'English';
    const articleLink = (readArticle === 'pop-out') ? `href="./chat.html#ftid=${id}&language=${lang}&action=read"` : `data-action="show-article"`;
    const newHTML = `
    <div data-id="${id}" data-lang="${lang}" class="chat-item-container${hideClass}">
      <div class="chat-item-title">
        <a ${articleLink} target="_blank" title="${byline}: ${excerpt}">${title}</a>
      </div>
      <div class="item-lead">${subheading}</div>
      <div>
        <div class="show-article-later-container">
          <button data-action="show-article-later" class="show-article-later">${localize('Read_It_Later')}</button>
          <div class="show-article-later-flag">${localize('Read_It_Later_Flag')}</div>
          <button data-action="jump-to-article" class="jump-to-article">${localize('jump-to-article')}</button>
        </div>
        <span class="story-time">${timeStamp}</span>
      </div>
    </div>`;
    html += newHTML;
  }
  html = await convertChinese(html, language);
  newResultInner.innerHTML = html;
  if (results.length > itemChunk) {
    const langProperty = (language && language !== 'English') ? ` data-lang=${language}` : '';
    newResultInner.innerHTML += `<div class="chat-items-expand" data-chunk="${itemChunk}" data-length="${results.length}"${langProperty}></div>`;
  }
  newResultInner.innerHTML += getActionOptions();
  // newResult.scrollIntoView(scrollOptions);
  const itemContainers = newResultInner.querySelectorAll('.chat-item-container');
  if (itemContainers.length >= 3) {
    itemContainers[2].scrollIntoView(scrollOptions);
  } else {
    newResult.scrollIntoView(scrollOptions);
  }
  const n = 3;
  if (previousConversations.length > n) {
    previousConversations = previousConversations.slice(-n);
  }
}


async function searchFTAPI(content, language, reply) {
  // console.log(`running searchFTAPI... content: ${content}, language: ${language}, reply: ${reply}`);
  updateBotStatus('pending');
  showResultInChat({text: reply});
  try {
    // let fullTextContent = content;
    // if (/[a-z]+:/g.test(fullTextContent)) {
    //   fullTextContent = fullTextContent.replace(/[a-z]+:/g, '').trim().replace(/[\ ]+/g, ' ');
    // }
    // console.log('full text content: ');
    // console.log(fullTextContent);
    const searchResults = await getFTAPISearchResult(content, language);
    let results = searchResults?.results?.[0]?.results ?? [];
    if (results.length > 0) {
      const results = searchResults.results[0].results;
      await renderResults(results, language);
    } else {
      await showErrorInDetail(searchResults)
    }
  } catch (err){
    console.log('Error with searchFTAPI');
    console.log(err);
  }
  updateBotStatus('waiting');
}

async function searchTopic(content, language, reply) {
  console.log(`running searchTopic... content: ${content}, language: ${language}`);
  updateBotStatus('pending');
  showResultInChat({text: reply});
  try {

    // MARK: - Query of form: Financial Times will return all results containing “Financial” and “Times”, with the keywords potentially separated and in any order. This is because the above example is equal to: Financial AND Times. I assume user might want to do a more accurate search, so the query form has quotes like this: "Financial Times"
    // https://developer.ft.com/portal/docs-api-v1-reference-search-search-api-tutorial
    // MARK: - Get the items from keyword search
    const result = await getFTAPISearchResult(`"${content}"`, language);
    let results = (result?.results?.[0]?.results ?? []).map(item => {
      item.source = 'keyword';
      return item;
    });
    // console.log(language);
    // console.log(results);
    const idsSet = new Set(results.map(x=>x.id));

    // MARK: - Search in vector DB
    const embedding = await getEmbedding(content);
    if (typeof embedding === 'object' && embedding.length > 0) {
      // MARK: - Get the matching items from vector DB
      let matches = await getMatchesFromVectorDB(embedding, language);
      const bothSet = new Set();

      matches = matches
        // MARK: - mark the source of the items
        .map(item => {
          const id = item.id;
          if (idsSet.has(id)) {
            bothSet.add(id);
          } else {
            item.source = 'vector';
          }
          return item;
        })
        // MARK: - only keep the items that are not in the keyword search result
        .filter(item => item.source === 'vector');

      // MARK: - mark the items that are both in keyword and vector search, this is a sign that the item is highly relevant. At least they are recent because they appear in the keyword search result. We might later find a way to highlight the highlight these items. 
      results = results.map(item => {
        const id = item.id
        if (bothSet.has(id)) {
          item.source = 'both';
        }
        return item;
      });

      results = results.concat(matches);
      results = results.sort((a, b) => {
        const aTime = new Date(a.lifecycle?.lastPublishDateTime ?? a.lifecycle?.lastPublishDateTime ?? '').getTime();
        const bTime = new Date(b.lifecycle?.lastPublishDateTime ?? b.lifecycle?.lastPublishDateTime ?? '').getTime();
        return bTime - aTime;
      });

    }

    if (results.length > 0) {
      await renderResults(results, language);
    } else if (/[a-z]+:/g.test(content)) {
      const fullTextContent = content.replace(/[a-z]+:/g, '').trim().replace(/[\ ]+/g, ' ');
      await searchFTAPI(fullTextContent, language, reply);
      return;
    } else {
      // MARK: - Handle error
      showResultInChat({text: localize('No Search Result')});
    }
  } catch (err){
    console.log('Error with searchFTAPI');
    console.log(err);
  }
  updateBotStatus('waiting');
}

async function handleActionClick(element) {
  if (element.classList.contains('pending')) {return;}
  element.classList.add('pending');
  element.classList.add('hide');
  const action = element.getAttribute('data-action');
  updateBotStatus('pending');
  try {
      const id = element.getAttribute('data-id') || '';
      const language = element.getAttribute('data-lang') || element.closest('.chat-item-actions').getAttribute('data-lang') || 'English';
      const reminder = localize('ProcessingRequest');

      let reminderContainer = document.createElement('div');
      reminderContainer.innerHTML = reminder;
      reminderContainer.className = 'quizzes-container quizzes-status';


      if (action === 'quiz') {
          const audioEle = document.querySelector(`[data-id="${id}"] .audio-placeholder.is-sticky-top`);
          const chatTalkInnerEle = element.closest('.chat-talk-inner');          
          if (audioEle && audioEle.parentElement) {
            audioEle.parentElement.appendChild(reminderContainer);
          } else if (chatTalkInnerEle) {
            chatTalkInnerEle.appendChild(reminderContainer);
          } else {
            showUserPrompt(element.innerHTML);
            showBotResponse(reminder);
          }
      } else {
          showUserPrompt(element.innerHTML);
          showBotResponse(reminder);
      }

      let articleEle = document.querySelector(`.article-container[data-id="${id}"]`);
      // MARK: - Using English text to create quiz and questions saves tokens and produces better quality results. But the names might not be translated correctly. 
      let title = '';

      if (1>2 && articleEle.querySelector('.story-headline-english')) {
          title = articleEle.querySelector('.story-headline-english').innerHTML;
      } else {
          title = articleEle.querySelector('.story-headline').innerHTML;
      }
      let byline = '';
      if (1>2 && articleEle.querySelector('.story-author-english')) {
          byline = articleEle.querySelector('.story-author-english').innerHTML;
      } else {
          byline = articleEle.querySelector('.story-author').innerHTML;
      }
      let standfirst = '';
      if (1>2 && articleEle.querySelector('.story-lead-english')) {
          standfirst = articleEle.querySelector('.story-lead-english').innerHTML;
      } else {
          standfirst = articleEle.querySelector('.story-lead').innerHTML;
      }
      let storyBody = '';
      if (1>2 && articleEle.querySelector('.story-body-english')) {
          storyBody = articleEle.querySelector('.story-body-english').innerHTML;
      } else {
          storyBody = articleEle.querySelector('.story-body').innerHTML;
      }
      const storyTime = articleEle.querySelector('.story-time').innerHTML;
      const contextPrefix = `Published at ${storyTime}\n`;
      let articleContextAll = `${title}\n${standfirst}\nby: ${byline.trim()}\n${storyBody.trim()}`;
      articleContextAll = articleContextAll
          .replace(/<\/p><p>/g, '\n')
          .replace(/(<([^>]+)>)/gi, '')
          .replace(/\[MUSIC PLAYING\]/g, '')
          .replace(/[\s]+[\n\r]/g, '\n')
      const articleContextChunks = textToChunks(articleContextAll, 1024, contextPrefix);
      if (action === 'quiz') {
          await generateQuiz(id, language, articleContextChunks, action);
      } else if (action === 'socratic') {
          await generateSocratic(id, language, articleContextChunks, action);
      }
  } catch (err) {
      console.log(err);
  }
  element.classList.remove('pending');
  updateBotStatus('waiting');
}

async function showFTPage(content, language, reply) {
  // console.log(`running showFTPage... content: ${content}, language: ${language}`);
  updateBotStatus('pending');
  showResultInChat({text: reply});
  try {
    // console.log(`Getting ${content}`);
    const statusMessage = localize('Checking Content');
    showBotResponse(statusMessage, true);
    let result = await getFTPageInfo(content, language);
    // console.log('showFTPage result: ');
    // console.log(JSON.stringify(result, null, 2));
    const groups = result?.results?.[0]?.groups ?? [];
    if (groups.length > 0) {
      const myPreference = getMyPreference();
      let myInterestsDict = {};
      const interetKeys = [myInterestsKey, myCustomInterestsKey];
      for (const interestKey of interetKeys) {
        const items = myPreference[interestKey] || [];
        for (const item of items) {
          const key = item.key;
          if (!key) {continue;}
          myInterestsDict[key] = item;
        }
      }
      const newResult = document.createElement('DIV');
      newResult.className = 'chat-talk chat-talk-agent chat-full-grid';
      const newResultInner = document.createElement('DIV');
      newResultInner.className = 'chat-talk-inner';
      newResult.appendChild(newResultInner);
      chatContent.appendChild(newResult);
      const vectorHighScoreIds = await getHighScoreIdsFromVectorDB(content);
      const results = reorderFTResults(groups, vectorHighScoreIds);
      let html = '';
      let themes = new Set();
      let expandedItemCount = 0;
      const minItemsToExpand = 5;
      for (const [index, group] of results.entries()) {
        const items = group.items;
        let groupExpandClass = '';
        const isExpanded = expandedItemCount < minItemsToExpand;
        if (isExpanded) {
          groupExpandClass = ' expanded';
          expandedItemCount += items.length;
        }
        let groupHTML = '';
        for (const item of items) {
          const id = item.id;
          let title = item.title.title || '';
          let excerpt = item.summary?.excerpt || '';
          let subheading = item.editorial?.subheading || excerpt || '';
          const byline = item.editorial?.byline || '';
          let timeStamp = '';
          if (item.lifecycle && item.lifecycle.lastPublishDateTime) {
            const time = item.lifecycle.lastPublishDateTime;
            timeStamp = new Date(time).toLocaleString();
          }
          let primaryTheme = '';
          let termName = item.metadata?.primaryTheme?.term?.name;
          let follow = item.follow;
          if (follow) {
            // console.log(`follow: ${JSON.stringify(myInterestsDict[follow])}`);
            const fallback = myInterestsDict[follow]?.display;
            const name = myInterestsDict[follow]?.key;
            const field = myInterestsDict[follow]?.type;
            const buttonHTML = `<button class="myft-follow tick" data-action="add-interest" data-name="${name}" data-type="${field}" data-display="${fallback}" data-source="Followed" data-target="${localize('Followed')}">${localize('Followed')}</button>`;
            primaryTheme = `<span class="primary-theme">${localize(follow, fallback)}</span>${buttonHTML}`;
          } else if (termName && !themes.has(termName) && !/[\(\)（）]/.test(termName)) {
            // console.log(`themes: `);
            // console.log(themes);
            // console.log(item.metadata?.primaryTheme);
            const name = item.metadata?.primaryTheme?.term?.key ?? item.metadata?.primaryTheme?.term?.name ?? '';
            const field = item.metadata?.primaryTheme?.term?.taxonomy ?? '';
            const buttonHTML = `<button class="myft-follow plus" data-action="add-interest" data-name="${name}" data-type="${field}" data-display="${termName}" data-source="Follow" data-target="${localize('Follow')}">${localize('Follow')}</button>`;
            primaryTheme = `<span class="primary-theme">${termName}</span>${buttonHTML}`;
            themes.add(termName);
          }
          // console.log(`primaryTheme: ${primaryTheme}`);
          const lang = language || 'English';
          const articleLink = (readArticle === 'pop-out') ? `href="./chat.html#ftid=${id}&language=${lang}&action=read"` : `data-action="show-article"`;
          const readClass = (item.read === true) ? ' read' : '';
          let media = '';
          let noImageClass = ' no-image';
          if (item.image) {
            media = `<div class="image story-image"><a ${articleLink} target="_blank"><figure data-url="${item.image}" class="loading"></figure></a></div>`;
            noImageClass = '';
          }

          groupHTML += `
            <div data-id="${id}" data-lang="${lang}" class="chat-item-container${readClass}${noImageClass}">
              <div class="chat-item-topper">
                ${media}
                ${primaryTheme}
                <div class="chat-item-title">
                  <a ${articleLink} target="_blank" title="${byline}: ${excerpt}">${title}</a>
                </div>
                <div class="item-lead">${subheading}</div>
              </div>
              <div class="chat-item-footer">
                <span class="story-time">${timeStamp}</span>
                <div class="show-article-later-container">
                  <button data-action="show-article-later" class="show-article-later">${localize('Read_It_Later')}</button>
                  <div class="show-article-later-flag">${localize('Read_It_Later_Flag')}</div>
                  <button data-action="jump-to-article" class="jump-to-article">${localize('jump-to-article')}</button>
                </div>
              </div>
            </div>`;            
        }
        const groupTitleHTML = (group.group && group.group !== '' && !isExpanded) ? `<div class="chat-item-group-title">${group.group}</div>` : '';
        const groupClass = items.length % 2 === 1 ? ' has-odd-items' : '';
        const groupItemsHTML = `<div class="chat-item-group-items${groupClass}">${groupHTML}</div>`;
        const newHTML = `
          <div class="chat-item-group-container${groupExpandClass}">
            ${groupTitleHTML}
            ${groupItemsHTML}
          </div>`;

        html += newHTML;


        if (index > 0) {continue;}
        const startDate = new Date('2025-01-06T00:00:00+08:00').getTime();
        const endDate = new Date('2025-01-19T23:59:59+08:00').getTime();
        const now = new Date().getTime();
        const showPromotion = now >= startDate && now <= endDate;
        const domain = isInNativeApp ? 'www.ftchinese.com' : 'www.ftchinese.com';
        const promotion = showPromotion ? `<a href="https://${domain}/m/corp/preview.html?pageid=2024D11&to=all&ccode=2C2024D11chatftclp" target="_blank"><img class="promotion" src="https://thumbor.ftacademy.cn/unsafe/picture/1/000256781_piclink.jpg" width="300" height="250"></a>` : '';
        html += promotion;
        
          
      }
      newResultInner.innerHTML = await convertChinese(html, language);
      showImagesForExpandedGroups();
      await setIntention('DiscussContent', language, localize('Discuss More'), true, false);
      // const itemContainers = newResultInner.querySelectorAll('.chat-item-container');
      
      // if (itemContainers.length >= 3) {
      //   itemContainers[2].scrollIntoView(scrollOptions);
      // } else {
      //   newResult.scrollIntoView(scrollOptions);
      // }

      scrollIntoViewProperly(newResult);
      
      const n = 3;
      if (previousConversations.length > n) {
        previousConversations = previousConversations.slice(-n);
      }
    } else {
      const errorStatus = result?.results?.status;
      if (errorStatus === 'PermissionRequired') {
        showPaywallMessage(result?.results)
      }
    }
  } catch (err){
    console.log('Error with showFTPage');
    console.log(err);
  }
  updateBotStatus('waiting');
}

function showPaywallMessage(results) {
  console.log('handlePermissionErrors: ');
  console.log(JSON.stringify(results));
  const tierToBuy = results?.tierToBuy;
  const currentTier = results?.currentTier;
  if (tierToBuy) {
    const subscrption = localize(`${tierToBuy} subscription`);
    const paywallHTML = `You are currently a ${currentTier}. You need to buy <a href="/subscription">${subscrption}</a> to access this feature. `;
    showResultInChat({text: paywallHTML}, false, false);
  } else {
    const errorMessage = results?.message ?? localize('unknown error! ');
    showError(errorMessage);
  }
}

function showImagesForExpandedGroups() {
  let figures = document.querySelectorAll('.chat-item-group-container.expanded figure.loading');
  // console.log(figures);
  for (let figure of figures) {
    // console.log(figure.outerHTML);
    const url = figure.getAttribute('data-url');
    if (!url) {continue;}
    const imageWidth = 800;
    const imageHeight = Math.round(imageWidth * 9 / 16);
    let src = `https://thumbor.ftacademy.cn/unsafe/${imageWidth}x${imageHeight}/${encodeURIComponent(url)}`;
    if (location.host === 'ftcoffer.herokuapp.com') {
      src = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(url)}?fit=scale-down&source=next&width=${imageWidth}&height=${imageHeight}`;
    }
    figure.innerHTML = `<img src="${src}">`;
    figure.classList.remove('loading');
  }

  // if (location.host === 'ftcoffer.herokuapp.com') {
  //   visualHeading = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(visualHeading)}?fit=scale-down&source=next&width=1920`;
  // } else {
  //   visualHeading = `https://thumbor.ftacademy.cn/unsafe/1920x0/${encodeURIComponent(visualHeading)}`;
  // }
}

async function handleResultPrompt(resultHTML) {
  try {
    let ele = document.createElement('DIV');
    ele.innerHTML = resultHTML;
    let purposeEle = ele.querySelector('[data-purpose]');
    if (!purposeEle) {return;}
    const purpose = purposeEle.getAttribute('data-purpose');
    const language = purposeEle.getAttribute('data-lang');
    const reply = purposeEle.getAttribute('data-reply');
    const content = purposeEle.innerHTML;
    if (purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, language, reply);
    }
  } catch(err) {

  }
}

async function handleResultSources(sources) {
  const language = preferredLanguage || 'English';
  if (!sources || sources.length === 0) {return;}
  const keyword = sources.map(ftid=>`id: "${ftid}"`).join(' OR ');
  const searchResult = await getFTAPISearchResult(keyword, language);
  if (!searchResult.results || searchResult.results.length === 0) {return;}
  const items = searchResult.results[0].results;
  if (!items || items.length === 0) {return;}
  let html = '';
  for (const item of items) {
    let title = item.title.title;
    html += `<li><a target="_blank" href="./chat.html#ftid=${item.id}&language=${language}&amp;action=read">${title}</a></li>`
  }
  html = `<ul class="chat-citations">${html}</ul>`;
  showResultInChat({text: html}, false);
}

function getRandomPrompt(purpose) {
  const language = preferredLanguage || navigator.language || 'zh-CN';
  const languagePrefix = language.replace(/\-.*$/g, '');
  const dict = randomPromptDict[purpose];
  if (!dict) {return 'Hello, How can I help you?';}
  const prompts = dict[language] || dict[languagePrefix] || dict.en;
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const prompt = prompts[randomIndex];
  return prompt;
}

function getActionOptions() {
  const language = preferredLanguage;
  console.log(`getActionOptions with intention: ${intention}`);
  let result = '';
  if (intention === 'DiscussArticle') {
    result = moveStoryActions();
  } else if (['CustomerService'].indexOf(intention) >= 0) {
    result = '';
  } else if (['SearchFTAPI'].indexOf(intention) >= 0) {
    result = `
    <div class="chat-item-actions">
      <a data-purpose="search-ft-api" data-lang="${language}" data-content="regions: China" data-reply="${localize('Finding')}">${localize('China News')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content="topics: Companies OR topics: Business" data-reply="${localize('Finding')}">${localize('Companies')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='topics: Technology' data-reply="${localize('Finding')}">${localize('Tech News')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='topics: Markets' data-reply="${localize('Finding')}">${localize('Markets')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='genre:Opinion' data-reply="${localize('Finding')}">${localize('Opinion')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='topics:Work & Careers' data-reply="${localize('Finding')}">${localize('Work & Careers')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='topics:Life & Arts OR topics: Lifestyle OR topics: Arts' data-reply="${localize('Finding')}">${localize('Life & Arts')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='topics:"Artificial Intelligence"' data-reply="${localize('Finding')}">${localize('AI News')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='genre:"Deep Dive" OR genre:"News in-depth" OR genre:"Explainer"' data-reply="${localize('Finding')}">${localize('Deep Dive')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='VIDEOS' data-reply="${localize('Finding')}">${localize('Videos')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='PODCASTS' data-reply="${localize('Finding')}">${localize('Podcasts')}</a>
    </div>
    `;
  } else if (intention === undefined || intention === '') {

    const startDate = new Date('2025-01-06T00:00:00+08:00').getTime();
    const endDate = new Date('2025-01-19T23:59:59+08:00').getTime();
    const now = new Date().getTime();
    const showPromotion = now >= startDate && now <= endDate;
    const domain = isInNativeApp ? 'www.ftchinese.com' : 'www.ftchinese.com';
    const promotion = showPromotion ? `<a target="_blank" href="https://${domain}/m/corp/preview.html?pageid=2025CNY&to=all&ccode=2C2025CNYchatftclp">${localize('PromotionActionButton')}</a>` : '';
    result = `
      <div class="chat-item-actions">
        <a data-purpose="show-ft-page" data-lang="${language}" data-content='home' data-reply="${localize('FindingMyFT')}" data-reply-action="set-preference">${localize('Top News For Me')}</a>
        <a data-purpose="show-ft-page" data-lang="${language}" data-content='most-popular' data-reply="${localize('Finding')}">${localize('Most Popular')}</a>
        <a data-purpose="news-quiz" data-lang="${language}" data-content='quiz' data-reply="${localize('PrepareingQuiz')}">${localize('NewsQuiz')}</a>
        <a data-purpose="set-preference" data-lang="${language}" data-content="all" data-reply="${localize('Set Your Preferences')}">${localize('Setting')}</a>
        ${promotion}
      </div>
    `;
    // <a data-purpose="set-intention" data-lang="${language}" data-content="SearchFTAPI" data-reply="${localize('Find More')}">${localize('Search')}</a>
    // <a data-purpose="set-intention" data-lang="${language}" data-content="CustomerService" data-reply="${localize('Offer Help')}">${localize('CustomerService')}</a>
    
  } else if (intention === 'DailyEnglish') {
    result = `
      <div class="chat-item-actions">
        <a data-purpose="show-ft-page" data-lang="en" data-content='home' data-reply="Checking Top News for You..." data-reply-action="set-preference">What's news for me? </a>
        <a data-purpose="show-ft-page" data-lang="en" data-content='most-popular' data-reply="Checking Most Popular News for You...">What are the most popular stories on the FT? </a>
      </div>
    `;
  } else if (intention === 'VideoAudio') {
    result = `
    <div class="chat-item-actions">
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='VIDEOS' data-reply="${localize('Finding')}">${localize('Videos')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content='PODCASTS' data-reply="${localize('Finding')}">${localize('Podcasts')}</a>
    </div>
    `;
  } else if (intention === 'FTAcademy') {
    result = `
    <div class="chat-item-actions">
      <a data-purpose="news-quiz" data-lang="${language}" data-content='quiz' data-reply="${localize('PrepareingQuiz')}">${localize('NewsQuiz')}</a>
    </div>
    `;
  }
  return result.replace(/[\n\r]+/g, '');
    // News in-depth, Deep Dive
  // <a data-id="" data-action="developing">What are the top stories of the day on FT?</a>
  // <a data-id="" data-action="developing">Recommend some good reads to me.</a>
  // <a data-id="" data-action="developing">I'd like to improve my English.</a>
}

function showError(message) {
  updateBotStatus('waiting');
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `<div class="chat-talk-inner error">${message}</div>`;
  chatContent.appendChild(newChat);
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

function setPreferredLanguage() {
  // MARK: Set the preferred language
  // TODO: Should let users customize their preferred language
  const lang = paramDict?.language;
  if (lang && lang !== '') {
    preferredLanguage = lang;
    if (/^zh/i.test(preferredLanguage)) {
      preferredLanguage = preferredLanguage.replace(/\-han[ts]\-/i, '-');
    } else if (/hans/i.test(preferredLanguage)) {
      preferredLanguage = 'zh-CN';
    }
  } else {
    const myPreference = getMyPreference();
    if (myPreference && myPreference['Language']) {
      preferredLanguage = myPreference['Language'];
      console.log(`preferredLanguage from local storage: ${preferredLanguage}`);
      const buttons = document.querySelectorAll('[data-lang]');
      for (let button of buttons) {
        button.setAttribute('data-lang', preferredLanguage);
      }
    }
  }
  if (!preferredLanguage) {
    preferredLanguage = navigator.language;
  }
  SetCookie('preferredLanguage', preferredLanguage);
  console.log(`Saved language preference to Cookie: ${preferredLanguage}`);
  const eles = document.querySelectorAll('[data-key]');
  for (let ele of eles) {
    const key = ele.getAttribute('data-key');
    ele.innerHTML = localize(key);
  }
}

function setFontSize() {
  const myPreference = getMyPreference();
  const fontSize = myPreference['Font Size'];
  if (fontSize) {
    document.body.className = fontSize;
  }
}

function setReadArticlePreference() {
  const myPreference = getMyPreference();
  readArticle = myPreference['Read Article'] ?? 'pop-out';
}

function setTranslatePreference() {
  const myPreference = getMyPreference();
  // console.log('setTranslatePreference: ')
  // console.log(myPreference);
  translationPreference = myPreference['Article Translation Preference'] ?? 'both';
}


async function setConfigurations() {

  // MARK: Update from the hash parameters
  const hashParams = window.location.hash.replace(/^#/g, '').split('&');
  for (const hashString of hashParams) {
    const hashPair = hashString.split('=');
    if (hashPair.length < 2) {continue;}
    const key = hashPair[0];
    const value = hashPair[1];
    paramDict[key] = value.replace(/\?/g, '');
  }
  setPreferredLanguage();
  setFontSize();
  setReadArticlePreference();
  setTranslatePreference();

  // console.log('paramDict: ');
  // console.log(paramDict);

  // MARK: - For survey and news quiz, no need to ask user to login
  if (!['survey', 'news-quiz'].includes(paramDict?.action ?? '')) {
    window.shouldPromptLogin = true;
  }
  localStorage.setItem('pagemark', window.location.href);

  var script = document.createElement('script');
  script.src = '/powertranslate/scripts/register.js';
  document.head.appendChild(script);
  
  const mainRoleHTML = `
    <a data-purpose="start-over" data-content="start-over" data-key="start-over">${localize('ChatFTC')}</a>
    <a href="/" class="side-bar-logo"><img src="https://d2785ji6wtdqx8.cloudfront.net/img/ipad_icon.png"></a>
  `;
  let mainChatRole = document.getElementById('main-chat-role');
  if (mainChatRole) {
    mainChatRole.innerHTML = mainRoleHTML;
  }
  const myFollowsHTML = await convertChinese(getMyFollowsHTML(), preferredLanguage);
  const rolesHTML = `
  <a class="show-right-arrow-trailing" data-purpose="show-ft-page" data-lang="${preferredLanguage}" data-content='home' data-reply="${localize('FindingMyFT')}" data-reply-action="set-preference">${localize('MyFT')}</a>
  <div class="drag-drop-container">${myFollowsHTML}</div>
  <a class="show-right-arrow-trailing" data-purpose="set-intention" data-lang="${preferredLanguage}" data-content="SearchFTAPI" data-reply="${localize('Offer Help')}" data-key="SearchFT">${localize('Search')}</a>
  <a class="show-right-arrow-trailing" data-purpose="news-quiz" data-lang="${preferredLanguage}" data-content='quiz' data-reply="${localize('PrepareingQuiz')}">${localize('NewsQuiz')}</a>
  <a class="show-right-arrow-trailing" data-purpose="set-intention" data-lang="${preferredLanguage}" data-content="CustomerService" data-reply="${localize('Offer Help')}" data-key="CustomerService">${localize('CustomerService')}</a>
  <a class="show-right-arrow-trailing" data-purpose="set-intention" data-lang="${preferredLanguage}" data-content="Other" data-reply="${localize('Offer Help')}" data-key="Other">${localize('Other')}</a>
  <a class="show-right-arrow-trailing" data-purpose="link" href="/powertranslate/translation-helper.html">${localize('Translation Helper')}</a>
  
  `;
  let currentChatStatus = document.getElementById('current-chat-status');
  if (currentChatStatus) {
    currentChatStatus.innerHTML += mainRoleHTML + rolesHTML;
  }
  let currentChatRoles = document.getElementById('current-chat-roles');
  if (currentChatRoles) {
    currentChatRoles.innerHTML = rolesHTML;
  }
  let disclaimerEle = document.getElementById('chat-disclaimer');
  if (disclaimerEle) {
    disclaimerEle.innerHTML = localize('ChatDisclaimer');
  }
  const sideSettingsHTML = `
  <a data-purpose="set-preference" data-content="all" data-reply="${localize('Set Your Preferences')}">${localize('Setting')}</a>
  `;
  let sideSettingsEle = document.getElementById('side-user-settings');
  if (sideSettingsEle) {
    sideSettingsEle.innerHTML = sideSettingsHTML;
  }
  
}


async function waitForAccessToken() {
  return;
  if (isFrontendTest) {return;}
  const oneDayInMiniSeconds = 24 * 60 * 60 * 1000;
  for (let i=0; i<15; i++) {
    // const accessToken = localStorage.getItem('accessToken');
    const accessToken = GetCookie('accessToken');
    // const accessTokenUpdateTimeString = localStorage.getItem('accessTokenUpdateTime');
    const accessTokenUpdateTimeString = GetCookie('accessTokenUpdateTime');
    const now = new Date().getTime();
    let isAccessTokenUpdated = false;
    if (typeof accessTokenUpdateTimeString === 'string' && accessTokenUpdateTimeString !== '') {
      const accessTokenUpdateTime = parseInt(accessTokenUpdateTimeString, 10);
      if (accessTokenUpdateTime > 0 && now - accessTokenUpdateTime < oneDayInMiniSeconds) {
        isAccessTokenUpdated = true;
      }
    }
    // MARK: - The token needs to be updated within 24 hours
    if (typeof accessToken === 'string' && accessToken && accessToken !== '' && isAccessTokenUpdated) {
      console.log('Found valid and updated access token! ');
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// MARK: Set up guard rails based on the initial settings
async function setGuardRails() {
  if (isInNativeApp) {
    document.documentElement.classList.add('is-in-native-app');
  }
  if (discussArticleOnly) {
    document.documentElement.classList.add('discuss-article-only');
  }
  if (surveyOnly) {
    document.documentElement.classList.add('survey-only');
  }
  const ftid = paramDict.ftid;
  const action = paramDict.action;
  const surveyName = paramDict.name;
  const field = paramDict.field;
  const key = paramDict.key;
  const display = paramDict.display;
  const id = paramDict.id;
  if (ftid && ftid !== '') {
    // MARK: - If you want to handle actions at the launch of the page, you'll need to wait for the access token to available before continuing. 
    showBackArrow();
    await waitForAccessToken();
    await showContent(ftid, preferredLanguage);
    if (action && action !== '') {
      const element = document.querySelector(`[data-action="${action}"]`);
      if (element) {
        await handleActionClick(element);
      }
    }
  } else if (action === 'survey' && surveyName) {
    // MARK: - Wait for the showSurvey function to be loaded
    await new Promise(resolve => setTimeout(resolve, 1));
    await showSurvey(surveyName);
    paramDict.intent = 'CustomerService';
  } else if (action === 'search' && field && key) {
    showBackArrow();
    await waitForAccessToken();
    await searchFTAPI(`${field}: ${key}`, preferredLanguage, decodeURIComponent(display));
  } else if (action === 'news-quiz') {
    const quizLanguage = paramDict?.language ?? preferredLanguage;
    await newsQuiz('quiz', quizLanguage, localize('IntroducingQuiz'), id);
  }
  const intent = paramDict.intent;
  if (intent && intent !== '') {
    document.documentElement.classList.add('intention-fixed');
    await setIntention(intent);
  }
}

async function greet() {

  const intentInPara = paramDict.intent;
  if (intentInPara && intentInPara !== '' && intention === undefined) {
    intention = intentInPara;
  }
  if (showGreeting === false) {return;}
  const inductionNeeded = await shouldShowInduction();
  if (inductionNeeded) {
    await showInduction();
    return;
  }
  const introductionWithIntents = new Set(['DailyEnglish', 'VideoAudio', 'FTAcademy', 'CustomerService']);
  let introductionKey = 'Introduction';
  if (introductionWithIntents.has(intention)) {
    introductionKey += intention;
  }
  let introduction = `<p>${localize(introductionKey)}</p>`;
  const startDate = new Date('2024-10-30T00:00:00+08:00').getTime();
  const endDate = new Date('2024-11-12T23:59:59+08:00').getTime();
  const now = new Date().getTime();
  if (now >= startDate && now <= endDate) {
    introduction += `<p>${localize('PromotionInIntroduction')}</p>`;
  }
  const prompt = (discussArticleOnly || surveyOnly) ? '' : `<p>${getRandomPrompt('greeting')}</p>`;
  if (!chatContent.querySelector('.chat-talk')) {
      chatContent.innerHTML = '';
  }
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `<div class="chat-talk-inner">${introduction}${prompt}${getActionOptions()}</div>`;
  if (!surveyOnly) {
    chatContent.appendChild(newChat);
  }
  userInput.setAttribute('placeholder', localize('Ask Me'));

}

// MARK: Chat page Related functions
async function initChat() {
  await setConfigurations();
  await greet();
}

function getBodyHeight() {
  var w = window,
  d = document,
  e = d.documentElement,
  g = d.getElementsByTagName('body')[0],
  y = w.innerHeight|| e.clientHeight|| g.clientHeight;
  return y;
}

function findTop(obj) {
  var curtop = 0;
  if (obj && obj.offsetParent) {
    do {
      curtop += obj.offsetTop;
    } while ((obj = obj.offsetParent));
    return curtop;
  }
}

function checkScrollyTellingForChat() {
  try {
    var scrollTop = chatContent.scrollTop;
    if (!document.querySelector('.scrollable-block')) {
      return;
    }
    for (const block of document.querySelectorAll('.scrollable-block')) {
      let chatTalk = block.closest('.chat-talk');
      if (!chatTalk) {continue;}
      chatTalk.classList.add('has-scrolly-telling');
      chatTalk.classList.remove('show-hero-header');
      chatTalk.classList.add('full-grid-story');
    }
    // MARK: - Check all the scrollable blocks;
    var scrollableSlides = document.querySelectorAll('.scrollable-slide, .scrollable-slide-info');
    var bodyHeight = getBodyHeight();
    var firstScrollableSlidesInView;
    for (var i=0; i<scrollableSlides.length; i++) {
      var itemHeight = scrollableSlides[i].offsetHeight;
      var itemTop = findTop(scrollableSlides[i]);
      var isScrollableSlideInView = (scrollTop + bodyHeight >= itemTop && itemTop + itemHeight >= scrollTop);
      if (isScrollableSlideInView) {
        firstScrollableSlidesInView = scrollableSlides[i];
        var slideId = firstScrollableSlidesInView.getAttribute('data-id');
        var currentBlock = firstScrollableSlidesInView.closest('.scrollable-block');
        var currentImages = currentBlock.querySelectorAll('.scrolly-telling-viewport figure, .scrolly-telling-viewport picture');
        for (var j=0; j<currentImages.length; j++) {
          var imageId = j.toString();
          if (imageId === slideId) {
            currentImages[j].classList.add('visible');
          } else {
            currentImages[j].classList.remove('visible');
          }
        }
        break;
      }
    }
  } catch (err){
    console.log('checkScrollyTelling error: ');
    console.log(err);
  }
}

function updateLanguageOptionDict() {

  for (const option of languageOptions) {
    const name = option.name;
    const value = option.value;
    languageOptionsDict[value] = name;
  }
  
}


function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const registerServiceWorker = async () => {
  if (isFrontendTest && !isPowerTranslate) {return;}
  if ("serviceWorker" in navigator) {
    try {
      registration = await navigator.serviceWorker.register("/powertranslate/chat-service-worker.js", {
        scope: "/powertranslate/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }

    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};


async function subscribeTopics(topics = []) {
      // MARK: - Check if the browser supports push notifications
    if ('PushManager' in window) {
      // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
      // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
      // if (!token || token === '') {
      //     console.log('No token! ');
      //     return;
      // }
      let subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });
      console.log("Push Registered...");
      const info = {
        topics: [],
        subscription: subscription
      };
      // Subscribe Topics for Push Notification
      console.log("Sending Push...");
      await fetch("/subscribe_topic", {
        method: "POST",
        body: JSON.stringify(info),
        headers: {
          "content-type": "application/json",
          // 'Authorization': `Bearer ${token}`
        }
      });
      console.log("Push Sent...");
    } else {
      console.warn('Push notifications are not supported by this browser.');
    }
}

// MARK: - Request permission to send push notifications
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log('User has granted permission to send push notifications.');
  } else {
    console.warn('User has denied permission to send push notifications.');
  }
}

// Listen for messages from the service worker
if (navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('message', async event => {
    // Retrieve the data sent from the service worker
    const { name, data } = event.data;
    console.log(`Received message from service worker with name: ${name} and data:`);
    console.log(data);
    const action = data.action;
    const value = data.value;
    if (!action || !value) {return;}
    await handleAction(action, value);
  });
}



// window.addEventListener('message', event => {
//   const info = event.data;
//   console.log('Got posted message: ');
//   console.log(info); // Output: { data: 'Hello from the service worker!' }
// });

const urlParams = new URLSearchParams(window.location.search);
const webpushInfo = JSON.parse(urlParams.get("webpush"));
if (webpushInfo) {
  console.log(webpushInfo);
  alert(webpushInfo);
}


updateLanguageOptionDict();


(async() => {
  await initChat();
  await registerServiceWorker();
  await setGuardRails();
})();


// console.log('main-chat.js version: 27');


/* jshint ignore:end */