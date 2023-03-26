/* jshint ignore:start */

const delegate = new Delegate(document.body);
const userInput = document.getElementById('user-input');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;

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


let newsAssistantPrompt = [
    {
      "role": "system",
      "content": "You are a helpful assistant that has access to the content API of Financial Times. If a user wants to know about the latest news, you'll detect their intention and convert it to a search query. Please note that you should try your best to understand the users' real intention. For example, when they ask about 'tech and finance news', they may actually want to search for 'technology OR finance'. In this case, you'll tell the user that you are searching the FT content and output the search query so that the system can pick out and return the result for you to present. You will always answer questions based on facts. Never make things up. In the output HTML, you should also output the user's current language in the 'data-lang' property. "
    },
    {
      "role": "user",
      "content": "What's new in tech and finance? "
    },
    {
      "role": "assistant",
      "content": "Let me check the latest FT content...<div data-purpose=\"search-ft-api\" data-lang=\"English\">Technology OR Finance</div>"
    },
    {
      "role": "user",
      "content": "关于中国政治，有什么新消息？"
    },
    {
      "role": "assistant",
      "content": "让我查询一下FT最新的关于中国政治的报道...<div data-purpose=\"search-ft-api\" data-lang=\"Chinese\">China AND Politics</div>"
    }
];

let previousConversations = [];


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

delegate.on('click', '.chat-items-expand', async function(){
  if (this.classList.contains('pending')) {return;}
  this.classList.add('pending');
  try {
    const chunkSize = parseInt(this.getAttribute('data-chunk'), 10);
    const chatContainer = this.closest('.chat-talk');
    const hiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    const hiddenItemsArray = Array.from(hiddenItems);
    const selectedItems = hiddenItemsArray.slice(0, chunkSize);
    const language = this.getAttribute('data-lang');
    let dict = {};
    selectedItems.forEach(item => {
      // item.classList.remove('hide');
      const id = item.getAttribute('data-id');
      dict[id] = `${item.querySelector('.chat-item-title a').innerHTML}\n${item.querySelector('.item-lead').innerHTML}`;
    });
    if (typeof language === 'string' && language !== 'English') {
      const translatedDict = await translateOpenAI(JSON.stringify(dict), language);
      dict = JSON.parse(translatedDict);
    }
    selectedItems.forEach(item => {
      const id = item.getAttribute('data-id');
      if (dict[id]) {
        const translations = dict[id].split('\n');
        if (translations.length > 0) {
          item.querySelector('.chat-item-title a').innerHTML = translations[0];
        }
        if (translations.length > 1) {
          item.querySelector('.item-lead').innerHTML = translations[1];
        }
      }
      item.classList.remove('hide');
    });
    const otherHiddenItems = chatContainer.querySelectorAll('.chat-item-container.hide');
    chatContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (otherHiddenItems.length === 0) {
      this.classList.add('hide');
    }
  } catch (err) {
    console.log(err);
  }
  this.classList.remove('pending');
});

async function talk() {
    const prompt = userInput.value;
    if (prompt === '') {return;}
    if (!chatContent.querySelector('.chat-talk')) {
        chatContent.innerHTML = '';
    }
    const newChat = document.createElement('DIV');
    newChat.className = 'chat-talk chat-talk-user';
    newChat.innerHTML = `<div class="chat-talk-inner">${prompt}</div>`;
    chatContent.appendChild(newChat);
    newChat.scrollIntoView({ behavior: 'smooth', block: 'end' });
    userInput.value = '';
    userInput.style.height = 'auto';
    // MARK: - Send the prompt to our API for response
    const newUserPrompt = {role: 'user', content: prompt};
    const messages = previousConversations.concat([newUserPrompt]);
    const data = {
        messages: messages,
        temperature: 0,
        max_tokens: 300
    };
    const result = await createChatFromOpenAI(data);
    if (result.status === 'success' && result.text) {
        showResultInChat(result);
        // MARK: - Only keep the latest 5 conversations
        previousConversations = previousConversations.slice(-5);
        previousConversations.push(newUserPrompt);
        previousConversations.push({role: 'assistant', content: result.text});
        // MARK: - Check if the resultHTML has some prompt or request for the system
        await handleResultPrompt(result.text);
    } else if (result.message) {
        alert(result.message);
    } else {
        alert('An unknown error happened. Please try again later. ');
    }
}

function showResultInChat(result) {
  const newResult = document.createElement('DIV');
  newResult.className = 'chat-talk chat-talk-agent';
  const resultHTML = result.text.replace(/\n/g, '<br>');
  newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
  chatContent.appendChild(newResult);
  newResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
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
  try {
    let result = await getFTAPISearchResult(content);
    if (result.results && result.results.length > 0 && result.results[0].results && result.results[0].results.length > 0) {
      let html = '';
      const itemChunk = 5;
      const results = result.results[0].results;
      let description = 'I found these results for you. You can click the titles for detail: ';
      let dict = {};
      for (const [index, item] of results.entries()) {
        if (index >= itemChunk) {break;}
        const id = item.id;
        let title = item.title.title || '';
        let subheading = item.editorial.subheading || item.summary.excerpt || '';
        dict[id] = `${title}\n${subheading}`;
      }
      if (language && language !== 'English') {
        try {
          description = await translateOpenAI(description, language);
          const translatedDict = await translateOpenAI(JSON.stringify(dict), language);
          dict = JSON.parse(translatedDict);
        } catch(err) {
          console.log(err);
        }
      }
      for (const [index, item] of results.entries()) {
        const id = item.id;
        let title = item.title.title || '';
        let subheading = item.editorial.subheading || item.summary.excerpt || '';
        if (dict[id]) {
          const translations = dict[id].split('\n');
          if (translations.length > 0) {
            title = translations[0];
          }
          if (translations.length > 1) {
            subheading = translations[1];
          }
        }
        const byline = item.editorial.byline;
        const excerpt = item.summary.excerpt;
        const hideClass = (index >= itemChunk) ? ' hide' : '';
        html += `<div data-id="${id}" class="chat-item-container${hideClass}"><div class="chat-item-title"><a href="https://www.ft.com/content/${id}" target="_blank" title="${byline}: ${excerpt}">${title}</a></div><div class="item-lead">${subheading}</div></div>`;
      }
      if (results.length > itemChunk) {
        const langProperty = (language && language !== 'English') ? ` data-lang=${language}` : '';
        html = `<div>${description}</div>${html}<div class="chat-items-expand" data-chunk="${itemChunk}" data-length="${results.length}"${langProperty}></div>`;
      }
      showResultInChat({text: html});
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
  newChat.innerHTML = `<div class="chat-talk-inner">${prompt}</div>`;
  chatContent.appendChild(newChat);
}

greet();


/* jshint ignore:end */