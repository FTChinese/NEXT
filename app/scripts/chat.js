/* jshint ignore:start */

const delegate = new Delegate(document.body);
const userInput = document.getElementById('user-input');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;
var previousConversations = [];
var previousIntentDections = []; 
var botStatus = 'waiting';

const greetingDict = {
  'en': [
    'Hello, how can I help you?',
    'Hi, how may I help you?',
    'Hello, how may I assist you?',
    'Greetings, how can I be of service?',
    'Hey there, how can I help you today?'
  ],
  'es': [
    'Hola, ¿en qué puedo ayudarte?',
    '¡Hola! ¿Cómo puedo ayudarte?',
    'Bienvenido, ¿en qué puedo ayudarte hoy?',
    '¿En qué puedo asistirte?',
    'Buenos días, ¿cómo puedo ayudarte?'
  ],
  'fr': [
    'Bonjour, comment puis-je vous aider ?',
    'Salut, comment puis-je vous aider ?',
    'Bonjour, en quoi puis-je vous aider ?',
    'Bonjour, que puis-je faire pour vous ?',
    'Bonjour, comment je peux vous aider aujourd\'hui ?'
  ],
  'de': [
    'Hallo, wie kann ich Ihnen helfen?',
    'Guten Tag, wie kann ich Ihnen helfen?',
    'Hallo, wie kann ich Ihnen behilflich sein?',
    'Guten Morgen, wie kann ich Ihnen helfen?',
    'Hi, was kann ich für Sie tun?'
  ],
  'ja': [
    'こんにちは、何かお手伝いできますか？',
    'はじめまして、何かご質問はありますか？',
    'お問い合わせありがとうございます。どういったことでお困りですか？',
    'こんにちは。何かお探しですか？',
    'こんにちは。ご相談はありますか？'
  ],
  'ko': [
    '안녕하세요, 무엇을 도와드릴까요?',
    '안녕하세요, 무엇이 문제인가요?',
    '안녕하세요, 무엇을 도와드릴까요?',
    '안녕하세요, 어떤 문제가 있으신가요?',
    '안녕하세요, 도움이 필요하시면 언제든지 말씀해주세요.'
  ],
  'pt': [
    'Olá, em que posso ajudar?',
    'Oi, como posso ajudar?',
    'Boa tarde, como posso ajudá-lo?',
    'Posso ajudar em alguma coisa?',
    'Olá, posso ajudar em algo?'
  ],
  'it': [
    'Ciao, come posso aiutarti?',
    'Salve, di cosa hai bisogno?',
    'Buongiorno, in che modo posso aiutarti?',
    'Ciao, posso aiutarti in qualche modo?',
    'Salve, di che hai bisogno?'
  ],
  'zh-TW': ['你好，有什麼可以幫助你的嗎？', '您好，需要我幫忙嗎？', '哈囉，有什麼我可以幫忙的嗎？', '您好，我能為您做些什麼？', '歡迎詢問，我有什麼可以幫忙的嗎？'],
  'zh-HK': ['你好，有什麼可以幫助你的嗎？', '您好，需要我幫忙嗎？', '哈囉，有什麼我可以幫忙的嗎？', '您好，我能為您做些什麼？', '歡迎詢問，我有什麼可以幫忙的嗎？'],
  'zh': [
    '你好，有什么需要帮助的吗？',
    '您好，需要我帮忙吗？',
    '你好，请问有什么可以帮您的？',
    '您好，我能为您提供什么服务？',
    '嗨，有什么我可以帮您的吗？'
  ],
  'ru': [
    'Здравствуйте, чем я могу вам помочь?',
    'Привет, чем я могу вам помочь?',
    'Здравствуйте, как я могу вам помочь?',
    'Приветствую, чем я могу быть полезен?',
    'Здравствуйте, чем я могу вам помочь сегодня?'
  ]
};

const statusDict = {
  'Error': {
    en: 'Error',
    es: 'Error',
    fr: 'Erreur',
    de: 'Fehler',
    ja: 'エラー',
    ko: '오류',
    pt: 'Erro',
    it: 'Errore',
    'zh-TW': '錯誤',
    'zh-HK': '錯誤',
    zh: '错误',
    ru: 'Ошибка'
  },
  'CustomerService': {
    en: 'Customer Service',
    es: 'Servicio al Cliente',
    fr: 'Service Client',
    de: 'Kundenservice',
    ja: 'カスタマーサービス',
    ko: '고객 서비스',
    pt: 'Atendimento ao Cliente',
    it: 'Assistenza Clienti',
    'zh-TW': '客戶服務',
    'zh-HK': '客戶服務',
    zh: '客户服务',
    ru: 'Обслуживание клиентов'
  },
  'SearchFTAPI': {
    en: 'Search FT',
    es: 'Buscar FT',
    fr: 'Rechercher FT',
    de: 'FT suchen',
    ja: 'FT検索',
    ko: 'FT 검색',
    pt: 'Pesquisar FT',
    it: 'Cerca FT',
    'zh-TW': '搜尋FT',
    'zh-HK': '搜尋FT',
    zh: '搜索FT',
    ru: 'Поиск FT'
  },
  'Other': {
    en: 'Just Chat',
    es: 'Solo Chat',
    fr: 'Discussion',
    de: 'Nur Chatten',
    ja: 'チャットのみ',
    ko: '채팅만',
    pt: 'Apenas Bate-papo',
    it: 'Solo Chat',
    'zh-TW': '隨便聊聊',
    'zh-HK': '隨便聊聊',
    zh: '随便聊聊',
    ru: 'Просто чат'
  },
  'Final Score': {
    en: 'Final Score',
    es: 'Puntuación Final',
    fr: 'Score Final',
    de: 'Endstand',
    ja: '最終スコア',
    ko: '최종 점수',
    pt: 'Pontuação Final',
    it: 'Punteggio Finale',
    'zh-TW': '最終得分',
    'zh-HK': '最終得分',
    zh: '最终得分',
    ru: 'Итоговый счет'
  },
  'Quiz Me': {
    en: 'Test my understanding.',
    es: 'Prueba mi comprensión.',
    fr: 'Testez ma compréhension.',
    de: 'Teste mein Verständnis.',
    ja: '私の理解をテストしてください。',
    ko: '내 이해를 테스트하세요.',
    pt: 'Teste a minha compreensão.',
    it: 'Testa la mia comprensione.',
    'zh-TW': '測試我的理解。',
    'zh-HK': '測試我的理解。',
    zh: '测试我的理解。',
    ru: 'Проверьте мое понимание.'
  },
  'China News': {
    en: 'What\'s news in China?',
    es: '¿Qué hay de nuevo en China?',
    fr: 'Quoi de neuf en Chine?',
    de: 'Was gibt es Neues in China?',
    ja: '中国での最新情報は何ですか？',
    ko: '중국에서는 무슨 일이 있고 있나요?',
    pt: 'O que há de novo na China?',
    it: 'Quali sono le novità in Cina?',
    'zh-TW': '中國有什麼新聞？',
    'zh-HK': '中國有什麼新聞？',
    zh: '中国有什么新闻？',
    ru: 'Какие новости из Китая?'
  },
  'AI News': {
    en: 'Show me latest news about AI.',
    es: 'Muéstrame las últimas noticias sobre IA.',
    fr: 'Montre-moi les dernières nouvelles sur l\'IA.',
    de: 'Zeige mir die neuesten Nachrichten über KI.',
    ja: 'AIに関する最新ニュースを表示してください。',
    ko: 'AI 최신 뉴스를 보여주세요.',
    pt: 'Mostre-me as últimas notícias sobre IA.',
    it: 'Mostrami le ultime notizie sull\'AI.',
    'zh-TW': '給我看看最新的人工智慧新聞。',
    'zh-HK': '給我看看最新的AI新聞。',
    zh: '给我看看最新的人工智能新闻。',
    ru: 'Покажите мне последние новости об искусственном интеллекте.'
  },
  'Subscription Problem': {
    en: 'I have a problem with my subscription.',
    es: 'Tengo un problema con mi suscripción.',
    fr: 'J\'ai un problème avec mon abonnement.',
    de: 'Ich habe ein Problem mit meinem Abonnement.',
    ja: '私は定期購読に問題があります。',
    ko: '내 구독에 문제가 있어요.',
    pt: 'Estou com um problema na minha assinatura.',
    it: 'Ho un problema con la mia iscrizione.',
    'zh-TW': '我的會員訂閱服務有點問題。',
    'zh-HK': '我的會員訂閱服務有點問題。',
    zh: '我的会员订阅服务有点问题。',
    ru: 'У меня проблема со своей подпиской.'
  },
  'Show Feature': {
    en: 'Show me the latest features.',
    es: 'Muéstrame las últimas características.',
    fr: 'Montrez-moi les dernières fonctionnalités.',
    de: 'Zeigen Sie mir die neuesten Funktionen.',
    ja: '最新の機能を表示してください。',
    ko: '최신 기능을 보여주세요.',
    pt: 'Mostre-me as últimas funcionalidades.',
    it: 'Mostrami le ultime funzionalità.',
    'zh-TW': '顯示最新功能。',
    'zh-HK': '顯示最新功能。',
    zh: '显示最新功能。',
    ru: 'Покажите мне последние возможности.'
  }
  
  // <a data-action="talk">I have a problem with my subscription.</a>
  
};

userInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    talk();
  }
});

chatSumit.addEventListener('click', function(event){
  talk();
});

userInput.addEventListener('input', () => {
    userInput.style.height = 'auto'; // reset the height
    userInput.style.height = userInput.scrollHeight + 'px'; // set new height based on the content
});

delegate.on('click', '[data-action="talk"]', async (event) => {
  const element = event.target;
  userInput.value = element.innerHTML;
  hideItemActions(element);
  talk();
});

delegate.on('click', '.chat-items-expand', async (event) => {
  const element = event.target;
  if (element.classList.contains('pending')) {
    return;
  }
  element.classList.add('pending');
  updateBotStatus('pending');
  try {
    const chunkSize = parseInt(element.getAttribute('data-chunk'), 10);
    const chatContainer = element.closest('.chat-talk');
    const hiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    const hiddenItemsArray = Array.from(hiddenItems);
    const selectedItems = hiddenItemsArray.slice(0, chunkSize);
    const language = element.getAttribute('data-lang');
    for (const item of selectedItems) {
      const id = item.getAttribute('data-id');
      let title = item.querySelector('.chat-item-title a').innerHTML;
      title = await translateFromEnglish(title, language);
      item.querySelector('.chat-item-title a').innerHTML = title;
      let lead = item.querySelector('.item-lead').innerHTML;
      lead = await translateFromEnglish(lead, language);
      item.querySelector('.item-lead').innerHTML = lead;
      item.classList.remove('hide');
    }
    const otherHiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    chatContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
  element.classList.add('pending');
  hideItemActions(element);
  try {
    const purpose = element.getAttribute('data-purpose');
    const language = element.getAttribute('data-lang') || 'English';
    const content = element.getAttribute('data-content');
    const prompt = element.innerHTML;
    updateBotStatus('pending');
    showUserPrompt(prompt);
    showBotResponse();
    userInput.value = '';
    userInput.style.height = 'auto';
    if (purpose && content && purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, language);
    }
  } catch (err) {
    console.log(err);
  }
  element.classList.remove('pending');
  updateBotStatus('waiting');
});

function hideItemActions(element) {
  let actionsEle = element.closest('.chat-item-actions');
  if (actionsEle) {
    actionsEle.remove();
  }
}

function localize(status) {
  if (!status) {return;}
  const language = navigator.language;
  const languagePrefix = language.replace(/\-.*$/g, '');
  let statusTitle = status;
  const s = statusDict[status];
  if (s) {
    statusTitle = s[language] || s[languagePrefix] || s.en;
  }
  return statusTitle;
}

function updateStatus(status) {
  if (!status) {return;}
  document.getElementById('current-chat-status').innerHTML = `<span>${localize(status)}</span>`;
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

function showBotResponse(placeholder) {
  const botResponse = document.createElement('DIV');
  botResponse.className = 'chat-talk chat-talk-agent chat-talk-agent-pending';
  botResponse.innerHTML = `<div class="chat-talk-inner">${placeholder || '...'}</div>`;
  chatContent.appendChild(botResponse);
  botResponse.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function showUserPrompt(prompt) {
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-user';
  newChat.innerHTML = `<div class="chat-talk-inner">${prompt}</div>`;
  chatContent.appendChild(newChat);
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
  showBotResponse();
  userInput.value = '';
  userInput.style.height = 'auto';
  // MARK: - Send the prompt to our API for response
  const newUserPrompt = {role: 'user', content: prompt};
  const messages = previousConversations.concat([newUserPrompt]);
  const intentions = previousIntentDections.concat([newUserPrompt]);
  let data = {
      messages: messages,
      temperature: 0,
      max_tokens: 300,
      intentions: intentions
  };
  // TODO: - Heroku has a 30 seconds hard limit for all requests. The best way is NOT to detect intention first (either locally or through a request to OpenAI), then deal with the intention (likely through OpenAI) because OpenAI's service is so slow that even one simple request will time out. The only way that works is to just post the task for the background to handle, then polling for the result, like what we did for the Quiz.  
  // const intention = await detectIntention(data);
  // console.log(`intention: ${intention}`);
  // data.intention = intention;
  const result = await createChatFromOpenAI(data);
  if (result.status === 'success' && result.text) {
      showResultInChat(result);
      // MARK: - Only keep the latest 5 conversations and 4 intentions
      previousConversations = previousConversations.slice(-5);
      previousIntentDections = previousIntentDections.slice(-5);
      // MARK: - Only keep the history if the intention is not a known one, in which case, OpenAI will need the contexts. 
      if (!result.intention || result.intention === 'Other') {
        previousConversations.push(newUserPrompt);
        previousConversations.push({role: 'assistant', content: result.text});
      }
      previousIntentDections.push(newUserPrompt);
      previousIntentDections.push({role: 'assistant', content: result.intention || 'Other'});
      updateStatus(result.intention);
      // MARK: - Check if the resultHTML has some prompt or request for the system
      await handleResultPrompt(result.text);
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
  const regex = /\n\s*\|(.+)\|[\s\n]*\|( *:?-+:? *\|)+\s*((.+\|)+\s*)+/gm;
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




function showResultInChat(result) {
  updateBotStatus('waiting');
  const newResult = document.createElement('DIV');
  newResult.className = 'chat-talk chat-talk-agent';
  // MARK: - Converting the HTML on the frontend
  const resultHTML = markdownToHtmlTable(result.text).replace(/\n/g, '<br>');
  newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
  chatContent.appendChild(newResult);
  if (newResult.querySelector('h1')) {
    newResult.querySelector('h1').scrollIntoView({ behavior: 'smooth', block: 'end' });
  } else {
    newResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }
}

const purposeToFunction = {
  'search-ft-api': searchFTAPI,
  // 'check-news': checkNews
  // 'purpose2': function2,
  // 'purpose3': function3,
  // ... add more purposes and functions here
};

// async function checkNews(content, language) {
//   console.log('Should Check News and Come Up with the search query! ');

// }

async function searchFTAPI(content, language) {
  // console.log(`running searchFTAPI... content: ${content}, language: ${language}`);
  updateBotStatus('pending');
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
      let titleAndSubheading = results
        .slice(0, itemChunk)
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
      // console.log('translations: ');
      // console.log(translations);
      let html = '';
      for (const [index, item] of results.entries()) {
        const id = item.id;
        let title = item.title.title || '';
        let subheading = item.editorial.subheading || item.summary.excerpt || '';
        const byline = item.editorial.byline;
        const excerpt = item.summary.excerpt;
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
        html += `<div data-id="${id}" data-lang="${lang}" class="chat-item-container${hideClass}"><div class="chat-item-title"><a data-action="show-article" target="_blank" title="${byline}: ${excerpt}">${title}</a></div><div class="item-lead">${subheading}</div></div>`;
      }
      newResultInner.innerHTML = html;
      newResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
      if (results.length > itemChunk) {
        const langProperty = (language && language !== 'English') ? ` data-lang=${language}` : '';
        newResultInner.innerHTML += `<div class="chat-items-expand" data-chunk="${itemChunk}" data-length="${results.length}"${langProperty}></div>`;
        newResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
      const n = 3;
      if (previousConversations.length > n) {
        previousConversations = previousConversations.slice(-n);
      }
    } else {
      //TODO: - Handle error
    }
  } catch (err){
    console.log('Error with searchFTAPI');
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
    const content = purposeEle.innerHTML;
    if (purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, language);
    }
  } catch(err) {

  }
}

function greet() {
  const language = navigator.language;
  const languagePrefix = language.replace(/\-.*$/g, '');
  const prompts = greetingDict[language] || greetingDict[languagePrefix] || greetingDict.en;
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const prompt = prompts[randomIndex];
  if (!chatContent.querySelector('.chat-talk')) {
      chatContent.innerHTML = '';
  }
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `
  <div class="chat-talk-inner">
    ${prompt}
    <div class="chat-item-actions">
      <a data-purpose="search-ft-api" data-lang="${language}" data-content="regions:China">${localize('China News')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content="topics:Artificial Intelligence">${localize('AI News')}</a>
      <a data-purpose="search-ft-api" data-lang="${language}" data-content="genre:Feature">${localize('Show Feature')}</a>
      <a data-action="talk">${localize('Subscription Problem')}</a>
    </div>
  </div>
  `;
  // <a data-id="" data-action="developing">What are the top stories of the day on FT?</a>
  // <a data-id="" data-action="developing">Recommend some good reads to me.</a>
  // <a data-id="" data-action="developing">I'd like to improve my English.</a>
  chatContent.appendChild(newChat);
}

function showError(message) {
  updateBotStatus('waiting');
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `<div class="chat-talk-inner error">${message}</div>`;
  chatContent.appendChild(newChat);
}

// MARK: Chat page Related functions
function initChat() {
  window.shouldPromptLogin = true;
  localStorage.setItem('pagemark', window.location.href);
  var script = document.createElement('script');
  script.src = '/powertranslate/scripts/register.js';
  document.head.appendChild(script);
  const urlParams = new URLSearchParams(window.location.search);
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
      console.log('No .scrollable-block! ');
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
        // console.log(slideId);
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

initChat();
chatContent.addEventListener('scroll', function() {
  checkScrollyTellingForChat();
});


/* jshint ignore:end */