/* jshint ignore:start */
const delegate = new Delegate(document.body);
const userInput = document.getElementById('user-input');
const switchIntention = document.getElementById('switch-intention');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0 || window.isUsingHandleBars === true;
const isFrontendTest = location.href.indexOf('localhost') >= 0 && window.isUsingHandleBars !== true;
const isInNativeApp = location.href.indexOf('webview=ftcapp') >= 0;
const discussArticleOnly = location.href.indexOf('ftid=') >= 0 && location.href.indexOf('action=read') < 0;
const showGreeting = location.href.indexOf('action=read') < 0;
const surveyOnly = location.href.indexOf('action=survey') >= 0;
let languageOptionsDict = {Chinese: '中文'};
let preferredLanguage = navigator.language;
let readArticle = 'pop-out';
let paramDict = {};
var previousConversations = [];
var previousIntentDections = []; 
var botStatus = 'waiting';
var intention;
var articles = {};

// MARK: - scrollIntoView doesn't support offset
const scrollOptions = { 
  behavior: 'smooth', 
  block: 'end',
};
const scrollOptionsStart = { 
  behavior: 'smooth', 
  block: 'start',
  inline: "nearest"
}

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
});

delegate.on('click', '.code-block-copy', async (event) => {
  const element = event.target;
  const containerEle = element.closest('.code-block-container').querySelector('.code-block pre');
  const text = containerEle.innerText;
  copyToClipboard(text);
});

delegate.on('click', '.chat-item-group-title', async (event) => {
  const element = event.target;
  const groupContainer = element.closest('.chat-item-group-container');
  groupContainer.classList.toggle('expanded');
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
    const language = element.getAttribute('data-lang');
    const results = selectedItems.map(item => {
      let title = item.querySelector('.chat-item-title a').innerHTML;
      let lead = item.querySelector('.item-lead').innerHTML;
      return {
        title: {title: title},
        editorial: {
          subheading: lead
        }
      };
    });
    const translations = await createTranslations(results, language);
    for (const [index, item] of selectedItems.entries()) {
      const id = item.getAttribute('data-id');
      let title = item.querySelector('.chat-item-title a').innerHTML;
      // title = await translateFromEnglish(title, language);
      let lead = item.querySelector('.item-lead').innerHTML;
      // lead = await translateFromEnglish(lead, language);
      if (translations.length > index) {
        title = translations[index].title || title;
        lead = translations[index].subheading || lead;
      }
      item.querySelector('.chat-item-title a').innerHTML = title;
      item.querySelector('.item-lead').innerHTML = lead;
      item.classList.remove('hide');
    }
    const otherHiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    chatContainer.scrollIntoView(scrollOptions);
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
  const element = event.target;
  if (element.classList.contains('pending')) {return;}
  const purpose = element.getAttribute('data-purpose');
  const content = element.getAttribute('data-content');
  // MARK: - If there's no content attribute, this element is not meant to be clicked
  if (!content) {return;}
  element.classList.add('pending');
  hideItemActions(element);
  try {
    const language = element.getAttribute('data-lang') || 'English';
    const reply = element.getAttribute('data-reply');
    const prompt = element.innerHTML;
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
  // console.log('myPreference: ');
  // console.log(myPreference);
  // console.log(`name: ${name}`);
  myPreference[name] = newValue;
  localStorage.setItem('preference', JSON.stringify(myPreference));
  if (name === 'Language') {
    setPreferredLanguage();
  }
  if (name === 'Font Size') {
    setFontSize();
  }
  if (name === 'Read Article') {
    setReadArticlePreference();
  }
  if (name === 'Translate Setting') {
    setTranslatePreference();
  }
});

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

function localize(status) {
  if (!status) {return;}
  let language = preferredLanguage;
  if (language === 'Chinese') {language = 'zh';}
  const languagePrefix = language.replace(/\-.*$/g, '');
  let statusTitle = status;
  const s = statusDict[status];
  if (s) {
    statusTitle = s[language] || s[languagePrefix] || s.en;
  }
  return statusTitle;
}
function identifyLanguage(language){//TO Identify language which need to use the function to translate.
  if (!language || ['zh-TW', 'zh-HK', 'zh-MO', 'zh-MY', 'zh-SG'].indexOf(language) === -1) {
    return false;
  }
  return true
}
async function convertChinese(text, language) {

  async function fetchDictJSON(url) {
    const dictLocation = (isFrontendTest && !isPowerTranslate) ? './scripts' : '/powertranslate/scripts';
    const response = await fetch(`${dictLocation}/${url}`);
    return response.json();
  }

  function mergeJSONObjects(mergedObj, obj2) {
    for (let key in obj2) {
      if (obj2.hasOwnProperty(key)) {
        if (mergedObj.hasOwnProperty(key) && typeof obj2[key] === "object" && !Array.isArray(obj2[key])) {
          mergedObj[key] = mergeJSONObjects(mergedObj[key], obj2[key]);
        } else {
          mergedObj[key] = obj2[key];
        }
      }
    }
    return mergedObj;
  }

  async function getDictionary(language){
    let content = {
      'zh-TW':['big5.json','tw.json','tw-names.json'], 
      'zh-HK':['big5.json','hk.json','hk-names.json'],
      'zh-MO':['big5.json','mo.json','mo-names.json'], 
      'zh-MY':['my.json','my-names.json'],
      'zh-SG':['sg.json','sg-names.json']
    };
    try {
      let dictionary_list = content[language];
      let fetchPromises = dictionary_list.map(fetchDictJSON);
      let fetchedDataArray = await Promise.all(fetchPromises);
      let mergedDictionary = {};
      fetchedDataArray.forEach(item => {
        mergedDictionary = mergeJSONObjects(mergedDictionary, item);
      });
      return mergedDictionary
    } catch(err) {
      console.error(`Error reading or parsing JSON data: ${error}`);
    }
  }
  async function convert(language, text) {
      try {
          if (window.trie === undefined) {
            window.trie = new Trie();
          }
          if (window.trieLangauge !== language) {
            let dic =await getDictionary(language);
            window.trie.load(dic);
            window.trieLangauge = language;
          }
          let currentIndex = 0;
          let replacedText = '';
          while (currentIndex < text.length) {
            const result = window.trie.findMaxMatch(text, currentIndex);
            if (result && result.to) {
                replacedText += result.to;
                currentIndex = result.index + 1;
            } else {
                replacedText += text[currentIndex];
                currentIndex++;
            }
          }
          return replacedText;
      } catch (error) {
          console.error(`Error reading or parsing JSON data: ${error}`);
      }
  }

  // if (!language || ['zh-TW', 'zh-HK', 'zh-MO', 'zh-MY', 'zh-SG'].indexOf(language) === -1) {
  //   return text;
  // }
  if (identifyLanguage(language)===false){
    return text 
  }
  // MARK: get the urls from language
  const newText = await convert(language, text);
  return newText;
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
  console.log(`\n======\nupdateStatus`);
  console.log('previousConversations: ');
  console.log(JSON.stringify(previousConversations, null, 2));
  console.log('previousIntentDections: ');
  console.log(JSON.stringify(previousIntentDections, null, 2));
}

async function nextAction(intention) {
  if (!intention) {return;}
  console.log(`nextAction: intention: ${intention}, window.intention: ${window.intention}`);
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
      const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
      if (!token || token === '') {
          return {status: 'failed', message: 'You need to sign in first! '};
      }
      const data = {id: id, language: language};
      let url = (isPowerTranslate) ? '/openai/ft_article' : '/FTAPI/article.php';
      let options = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
      };
      if (isFrontendTest && !isPowerTranslate) {
          // url = '/api/page/ft_podcast.json';
          // url = '/api/page/ft_video.json';
          // url = '/api/page/ft_article.json';
          // url = '/api/page/ft_article_scrolly_telling.json';
          // url = '/api/page/ft_article_scrolly_telling_climate_change.json';
          // url = '/api/page/ft_article_double_image.json';
          url = '/api/page/ft_article_chinese.json';
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

function convertToBilingualLayout(original, translation) {
  let originalDiv = document.createElement('DIV');
  originalDiv.innerHTML = original;
  const originals = originalDiv.children;
  let translationDiv = document.createElement('DIV');
  translationDiv.innerHTML = translation;
  const translations = translationDiv.children;
  const loops = Math.max(originals.length, translations.length);
  let html = '';
  for (let i=0; i < loops; i++) {
    const left = (originals.length > i) ? originals[i].innerHTML : '';
    const right = (translations.length > i) ? translations[i].innerHTML : '';
    if (/<div|<img|<picture|<scrollable/.test(left)) {
      // MARK: If this child is a picture or an HTML Code, display it just once
      html += `<p>${left}</p>`;
    } else {
      html += `<div><div class="leftp">${left}</div><div class="rightp">${right}</div></div><div class="clearfloat"></div>`;
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
  let byline = content.byline;
  if (value === 'target') {
    title = content.titleTranslation || '';
    standfirst = content.standfirstTranslation || '';
    bodyXML = content.bodyXMLTranslation || '';
    byline = content.bylineTranslation || '';
  } else if (value === 'bilingual') {
    title = `<div>${content.title}</div><div>${content.titleTranslation}</div>`;
    standfirst = `<div>${content.standfirst}</div><div>${content.standfirstTranslation}</div>`;
    byline = content.byline;
    bodyXML = convertToBilingualLayout(content.bodyXML, content.bodyXMLTranslation);
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
  container.scrollIntoView(scrollOptionsStart);
}


async function showContent(ftid, language, shouldScrollIntoView = true, shouldLoadArticle = true) {
  try {
      if(shouldLoadArticle === false){
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
      const content = info.results;
      articles[ftid] = content;
      const type = getContentType(content);
      const hideBodyClass = (['Video', 'Audio'].indexOf(type) >= 0) ? ' hide' : '';
      if (info.status === 'success' && content) {
          const actions = `<div class="chat-item-actions" data-lang="${language}" data-id="${ftid}"><a data-id="${ftid}" data-action="quiz" title="Test my understanding of the article">${localize('Quiz Me')}</a><a data-id="${ftid}" data-action="socratic" title="${localize('Socratic Method Explained')}">${localize('Socratic Method')}</a><a data-purpose="set-intention" data-lang="${language}" data-content="CleanSlate" data-reply="${localize('Offer Help')}">${localize('DoSomethingElse')}</a></div>`;
          let visualHeading = getVideoHTML(content);
          let audioHTML = getAudioHTML(content);
          if (visualHeading === '' && content.mainImage && content.mainImage.members && content.mainImage.members.length > 0) {
              visualHeading = content.mainImage.members[0].binaryUrl;
              visualHeading = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(visualHeading)}?fit=scale-down&source=next&width=1920`;
              visualHeading = `<div class="story-image image"><figure class=""><img src="${visualHeading}"></figure></div>`;
          }
          const date = new Date(content.publishedDate || content.firstPublishedDate);
          const localizedDate = date.toLocaleString();
          let showTranslationAsDefault = false;
          let bodyXML = content.bodyXML || content.transcript || '';
          let bodyXMLEnglish = '';
          if (content.bodyXMLTranslation && content.bodyXMLTranslation !== '') {
              bodyXMLEnglish = `<div class="hide story-body-english">${bodyXML}</div>`;
              bodyXML = content.bodyXMLTranslation;
              showTranslationAsDefault = true;
          }
          let showTranscript = (bodyXML !== '' && ['Video', 'Audio'].indexOf(type) >= 0) ? `<a data-action="show-transcript">Show Transcript</a>` : '';
          let title = content.title || '';
          let titleEnglish = '';
          if (content.titleTranslation && content.titleTranslation !== '') {
              titleEnglish = `<div class="hide story-headline-english">${title}</div>`;
              title = (showTranslationAsDefault) ? content.titleTranslation : content.title;
          }
          let standfirst = content.standfirst || '';
          let standfirstEnglish = '';
          if (content.standfirstTranslation && content.standfirstTranslation !== '') {
              standfirstEnglish = `<div class="hide story-lead-english">${standfirst}</div>`;
              standfirst = (showTranslationAsDefault) ? content.standfirstTranslation : content.standfirst;
          }
          let byline = content.byline || '';
          let bylineEnglish = '';
          if (content.bylineTranslation && content.bylineTranslation !== '') {
              bylineEnglish = `<div class="hide story-author-english">${byline}</div>`;
              byline = (showTranslationAsDefault) ? content.bylineTranslation : content.byline;
          }
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
          let html = `
              <div class="article-container" data-id="${ftid}">
                  ${languageSwitchHTML}
                  <div class="story-header-container">
                      <h1 class="story-headline story-headline-large">${title}</h1>
                      <div class="story-lead">${standfirst}</div>
                      ${visualHeading}
                      <div class="story-byline">
                          <span class="story-time">${localizedDate}</span>
                          <span class="story-author">${byline}</span>
                      </div>
                  </div>
                  ${audioHTML}
                  <div class="story-body${hideBodyClass}"><div id="story-body-container" class="story-body-container">${bodyXML}</div></div>
                  ${showTranscript}
                  ${titleEnglish}
                  ${bylineEnglish}
                  ${standfirstEnglish}
                  ${bodyXMLEnglish}
              </div>
              ${actions}
              <div class="article-prompt">${localize('Discuss Article')}</div>
          `
          .replace(/[\r\n]+[\t\s]+/g, '')
          .replace(/[\r\n]+/g, '');
          // console.log('html:');
          // console.log(html);
          html += `<button class="quiz-next hide">NEXT</button>`;
          const result = {text: html};
          showResultInChat(result, shouldScrollIntoView);
          checkContentLinks();
          checkScrollyTellingForChat();
          checkFullGridBlocks();
          initScrollyTelling();
          setIntention('DiscussArticle');
          // MARK: - When you start to discuss a new article, you'll always want to clear previous conversations. 
          previousConversations = [];
          previousIntentDections = [];
          userInput.focus();
          // Deprecating: - Migrating to Pinecone for context
          // MARK: - Create embeddings for the article content in paragraphs
          // await generateEmbeddingsForArticle(content);
      }
  } catch(err) {
      console.log(err);
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
  botResponse.innerHTML = `<div class="chat-talk-inner">${placeholder || '...'}</div>`;
  chatContent.appendChild(botResponse);
  if (!shouldScrollIntoView) {return;}
  botResponse.scrollIntoView(scrollOptions);
}

function showResultInChat(result, shouldScrollIntoView = true) {
  updateBotStatus('waiting');
  const newResult = document.createElement('DIV');
  newResult.className = 'chat-talk chat-talk-agent';
  // MARK: - Converting the HTML on the frontend
  if (!result || !result.text || typeof result.text !== 'string') {return;}
  // const resultHTML = markdownToHtmlTable(result.text).replace(/\n/g, '<br>');
  const resultHTML = markdownConvert(result.text);
  // console.log(`actions: ${actions}`);
  // console.log(resultHTML);
  newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
  // newResult.innerHTML = `<div class="chat-talk-inner"><div><h1>haha</h1></div></div>`;
  chatContent.appendChild(newResult);
  if (newResult.querySelector('h1, .story-header-container')) {
    newResult.classList.add('full-grid-story');
    // MARK: - Need the set time out to work properly on Chrome
    let inViewClass = '.story-lead';
    if (newResult.querySelector('.audio-container, .story-header-container video') && newResult.querySelector('.chat-item-actions')) {
      inViewClass = '.chat-item-actions';
    }
    if(shouldScrollIntoView==true){
      setTimeout(function(){
        newResult.querySelector(inViewClass).scrollIntoView(scrollOptions);
      }, 0);
    }else{  
      setTimeout(0);
    }
   
  } else {
      newResult.scrollIntoView(scrollOptions);
  } 
}

function showUserPrompt(prompt) {
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-user';
  newChat.innerHTML = `<div class="chat-talk-inner">${prompt}</div>`;
  chatContent.appendChild(newChat);
}

function hidePreviousActions() {
  for (let action of document.querySelectorAll('.chat-item-actions')) {
    action.classList.add('hide');
  }
}

async function talk() {
  var token = localStorage.getItem('accessToken');
  if (!token || token === '') {
      alert('You need to sign in first! ');
      window.location.href = '/login';
      return;
  }
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

function markdownConvert(text) {
  let result = markdownCodeBlock(text);
  result = markdownToHtmlTable(result);
  result = result.replace(/[\n\r]/g, '<br>').replace(/[\|]{3}/g, '\n');
  return result;
}

const purposeToFunction = {
  'search-ft-api': searchFTAPI,
  'set-intention': setIntention,
  'show-ft-page': showFTPage,
  'set-preference': setPreference,
  'start-over': startOver,
  // 'check-news': checkNews
  // 'purpose2': function2,
  // 'purpose3': function3,
  // ... add more purposes and functions here
};

// async function checkNews(content, language) {
//   console.log('Should Check News and Come Up with the search query! ');

// }

function startOver() {
  location.reload();
}

async function setPreference(category, language, reply) {
  console.log(`running setPreference\ncategory: ${category}, language: ${language}, reply: ${reply}`);
  const settings = {
    all: [
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
          {value: 'UseTranslator', name: 'Use Translator'},
          {value: 'DisplayOriginalArticle', name: 'Only Use Human Translation'}
        ],
        fallback: 'pop-out'
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
    }
  }
  const actions = getActionOptions();
  showResultInChat({text: `${reply || ''}${html}${actions}`});
}

async function setIntention(newIntention, language, reply) {
  console.log(`running setIntention... content: ${newIntention}, language: ${language}`);
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
    showResultInChat({text: `${reply}${actions}`});
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

async function searchFTAPI(content, language, reply) {
  // console.log(`running searchFTAPI... content: ${content}, language: ${language}`);
  updateBotStatus('pending');
  showResultInChat({text: reply});
  try {
    let result = await getFTAPISearchResult(content);
    // console.log(result);
    if (result.results && result.results.length > 0 && result.results[0].results && result.results[0].results.length > 0) {
      const newResult = document.createElement('DIV');
      newResult.className = 'chat-talk chat-talk-agent';
      const newResultInner = document.createElement('DIV');
      newResultInner.className = 'chat-talk-inner';
      newResult.appendChild(newResultInner);
      chatContent.appendChild(newResult);
      const itemChunk = 5;
      const results = result.results[0].results;
      const translations = await createTranslations(results.slice(0, itemChunk), language);
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
          if (translations.length > index) {
            title = translations[index].title || title;
            subheading = translations[index].subheading || subheading;
          }
          title = title.trim().replace(/[\.。]+$/g, '');
          subheading = subheading.trim().replace(/[\.。]+$/g, '');
        }
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
    } else if (/[a-z]+:/g.test(content)) {
      const fullTextContent = content.replace(/[a-z]+:/g, '').trim().replace(/[\ ]+/g, ' ');
      await searchFTAPI(fullTextContent, language, reply);
      return;
    } else {
      //TODO: - Handle error
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
      const language = element.closest('.chat-item-actions').getAttribute('data-lang') || 'English';
      showUserPrompt(element.innerHTML);
      showBotResponse(`Creating ${action} data for you...`);
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
    let result = await getFTPageInfo(content, language);
    if (result.results && result.results.length > 0 && result.results[0].groups) {
      const newResult = document.createElement('DIV');
      newResult.className = 'chat-talk chat-talk-agent';
      const newResultInner = document.createElement('DIV');
      newResultInner.className = 'chat-talk-inner';
      newResult.appendChild(newResultInner);
      chatContent.appendChild(newResult);
      const results = result.results[0].groups;
      let html = '';
      let themes = new Set();
      for (const [groupIndex, group] of results.entries()) {
        const groupExpandClass = groupIndex === 0 ? ' expanded' : '';
        let groupHTML = '';
        for (const item of group.items) {
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
          if (termName && !themes.has(termName) && !/[\(\)（）]/.test(termName)) {
            primaryTheme = `<span class="primary-theme">${termName}</span>`;
            themes.add(termName);
          }
          const lang = language || 'English';
          const articleLink = (readArticle === 'pop-out') ? `href="./chat.html#ftid=${id}&language=${lang}&action=read"` : `data-action="show-article"`;
          groupHTML += `
            <div data-id="${id}" data-lang="${lang}" class="chat-item-container">
              ${primaryTheme}
              <div class="chat-item-title">
                <a ${articleLink} target="_blank" title="${byline}: ${excerpt}">${title}</a>
              </div>
              <div class="item-lead">${subheading}</div>
              <span class="story-time">${timeStamp}</span>
              <div class="show-article-later-container">
                <button data-action="show-article-later" class="show-article-later">${localize('Read_It_Later')}</button>
                <div class="show-article-later-flag">${localize('Read_It_Later_Flag')}</div>
                <button data-action="jump-to-article" class="jump-to-article">${localize('jump-to-article')}</button>
              </div>
            </div>`;            
        }
        const groupTitleHTML = (group.group && group.group !== '') ? `<div class="chat-item-group-title">${group.group}</div>` : '';
        const groupItemsHTML = `<div class="chat-item-group-items">${groupHTML}</div>`;
        const newHTML = `
          <div class="chat-item-group-container${groupExpandClass}">
            ${groupTitleHTML}
            ${groupItemsHTML}
          </div>`;
        html += newHTML;
      }
      newResultInner.innerHTML = html;
      await setIntention('DiscussContent', language, localize('Discuss More'));
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
    } else {
      //TODO: - Handle error
    }
  } catch (err){
    console.log('Error with showFTPage');
    console.log(err);
  }
  updateBotStatus('waiting');
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
  if (!sources || sources.length === 0) {return;}
  const keyword = sources.map(ftid=>`id: "${ftid}"`).join(' OR ');
  const searchResult = await getFTAPISearchResult(keyword);
  if (!searchResult.results || searchResult.results.length === 0) {return;}
  const items = searchResult.results[0].results;
  if (!items || items.length === 0) {return;}
  const language = preferredLanguage || 'English';
  // const translations = await createTranslations(items, language);
  const titles = items.map(x=>x.title.title).join('\n');
  const translationsText = await translateFromEnglish(titles, language);
  const translations = translationsText.split('\n');
  console.log(translations);
  let html = '';
  for (const [index, item] of items.entries()) {
    let title = item.title.title;
    if (translations.length > index) {
      title = translations[index];
    }
    html += `<li><a target="_blank" data-id="${item.id}" href="https://www.ft.com/content/${item.id}">${title}</a></li>`
  }
  html = `<ul class="chat-citations">${html}</ul>`;
  showResultInChat({text: html});
}

function getRandomPrompt(purpose) {
  const language = preferredLanguage;
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
    result = `
      <div class="chat-item-actions right">
        <a data-purpose="set-intention" data-lang="${language}" data-content="CleanSlate" data-reply="${localize('Offer Help')}">${localize('ChangeSubject')}</a>
      </div>
    `;
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
    result = `
      <div class="chat-item-actions">
        <a data-purpose="show-ft-page" data-lang="${language}" data-content='home' data-reply="${localize('Finding')}">${localize('Looking For News')}</a>
        <a data-purpose="set-intention" data-lang="${language}" data-content="SearchFTAPI" data-reply="${localize('Find More')}">${localize('Discover and Explore')}</a>
        <a data-purpose="set-intention" data-lang="${language}" data-content="CustomerService" data-reply="${localize('Offer Help')}">${localize('Need Customer Service')}</a>
        <a data-purpose="set-preference" data-lang="${language}" data-content="all" data-reply="${localize('Set Your Preferences')}">${localize('Setting')}</a>
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
  const lang = paramDict.language;
  if (lang && lang !== '') {
    preferredLanguage = lang;
    if (/^zh/i.test(preferredLanguage)) {
      preferredLanguage = preferredLanguage.replace(/\-han[ts]\-/i, '-');
    } else if (/hans/i.test(preferredLanguage)) {
      preferredLanguage = 'zh-CN';
    }
  } else {
    const myPreference = getMyPreference();
    if (myPreference['Language']) {
      preferredLanguage = myPreference['Language'];
      console.log(`preferredLanguage from local storage: ${preferredLanguage}`);
      const buttons = document.querySelectorAll('[data-lang]');
      for (let button of buttons) {
        button.setAttribute('data-lang', preferredLanguage);
      }
    }
  }
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
  readArticle = myPreference['Translate Setting'] ?? 'pop-out';
}

function setConfigurations() {
  // MARK: Update from the hash parameters
  const hashParams = window.location.hash.replace(/^#/g, '').split('&');
  for (const hashString of hashParams) {
    const hashPair = hashString.split('=');
    if (hashPair.length < 2) {continue;}
    const key = hashPair[0];
    const value = hashPair[1];
    paramDict[key] = value;
  }
  setPreferredLanguage();
  setFontSize();
  setReadArticlePreference();
  setTranslatePreference();
  window.shouldPromptLogin = true;
  localStorage.setItem('pagemark', window.location.href);
  var script = document.createElement('script');
  script.src = '/powertranslate/scripts/register.js';
  document.head.appendChild(script);
  let currentChatStatus = document.getElementById('current-chat-status');
  if (!currentChatStatus) {return;}
  currentChatStatus.innerHTML += `
    <a data-purpose="set-intention" data-content="CleanSlate" data-reply="${localize('Offer Help')}" data-key="BackToTop">${localize('BackToTop')}</a>
    <a data-purpose="set-intention" data-content="DiscussContent" data-reply="${localize('Discuss More')}" data-key="DiscussContent">${localize('DiscussContent')}</a>
    <a data-purpose="set-intention" data-content="SearchFTAPI" data-reply="${localize('Offer Help For Search')}" data-key="SearchFT">${localize('SearchFT')}</a>
    <a data-purpose="set-intention" data-content="CustomerService" data-reply="${localize('Offer Help')}" data-key="CustomerService">${localize('CustomerService')}</a>
    <a data-purpose="set-intention" data-content="Other" data-reply="${localize('Offer Help')}" data-key="Other">${localize('Other')}</a>
  `;
}

async function waitForAccessToken() {
  const oneDayInMiniSeconds = 24 * 60 * 60 * 1000;
  for (let i=0; i<15; i++) {
    const accessToken = localStorage.getItem('accessToken');
    const accessTokenUpdateTimeString = localStorage.getItem('accessTokenUpdateTime');
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
  if (ftid && ftid !== '') {
    // MARK: - If you want to handle actions at the launch of the page, you'll need to wait for the access token to available before continuing. 
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
  }
  const intent = paramDict.intent;
  if (intent && intent !== '') {
    document.documentElement.classList.add('intention-fixed');
    await setIntention(intent);
  }
}

function greet() {
  if (showGreeting === false) {return;}
  const introduction = `<p>${localize('Introduction')}</p>`;
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
  userInput.setAttribute('placeholder', localize('Prompt Set Intention'));
}

// MARK: Chat page Related functions
function initChat() {
  setConfigurations();
  greet();
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

const registerServiceWorker = async () => {
  if (isFrontendTest && !isPowerTranslate) {return;}
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/powertranslate/chat-service-worker.js", {
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

updateLanguageOptionDict();
initChat();

(async()=>{
  await registerServiceWorker();
  await setGuardRails();
})();


// console.log('main-chat.js version: 27');


/* jshint ignore:end */