/* jshint ignore:start */

const userInput = document.getElementById('user-input');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;

// MARK: - This is used to 
let newsAssistantPrompt = [
    {
      "role": "system",
      "content": "You are a helpful assistant that has access to the content API of Financial Times. If a user wants to know about the latest news, you'll detect their intention and convert it to a search query. Please note that you should try your best to understand the users' real intention. For example, when they ask about 'tech and finance news', they may actually want to search for 'technology OR finance'. In this case, you'll tell the user that you are searching the FT content and output the search query so that the system can pick out and return the result for you to present. You will always answer questions based on facts. Never make things up."
    },
    {
      "role": "user",
      "content": "What's new in tech and finance? "
    },
    {
      "role": "assistant",
      "content": "Let me check the latest FT content...\n<div data-purpose=\"search-ft-api\">Technology OR Finance</div>"
    },
    {
      "role": "system",
      "content": "Please wrap up for the user: \nSilicon Valley Bank shut down by US banking regulators\nTech-focused lender failed in eleventh-hour attempt to raise new capital after facing $42bn in deposit outflows\nUS and EU launch new talks on critical minerals trade in green tech race\nTop Fed official signals openness to reverting to half-point rate rise\nSmartphones and social media are destroying children’s mental health"
    },
    {
      "role": "assistant",
      "content": "Here you go, the latest tech and finance content on FT:\nSilicon Valley Bank has been shut down by US banking regulators after it failed to raise new capital. The tech-focused lender faced $42 billion in deposit outflows.\nThe US and EU have launched new talks on critical minerals trade as part of the green tech race.\nA top official at the US Federal Reserve has signaled openness to reverting to a half-point rate rise.\nA report suggests that smartphones and social media are having a negative impact on children's mental health."
    },
    {
      "role": "user",
      "content": "关于中国政治，有什么新消息？"
    },
    {
      "role": "assistant",
      "content": "让我查询一下FT最新的关于中国政治的报道.../n<div data-purpose=\"search-ft-api\">China AND Politics</div>"
    },
    {
      "role": "system",
      "content": "Please wrap up and translate to Chinese for the user: \nXi confirmed for unprecedented third term as China’s president\nMost powerful leader since Mao sworn in as tensions with US and economic challenges at home deepen\nTaiwan’s president Tsai Ing-wen to receive leadership award in New York\nRecognition from prominent think-tank comes on visit that includes meeting with US House Speaker Kevin McCarthy"
    },
    {
      "role": "assistant",
      "content": "习近平确认第三次连任中国国家主席，成为毛泽东以来最有权势的领导人，就在与美国的紧张关系和国内经济挑战加深之际宣誓就职。台湾总统蔡英文将在纽约获得领导力奖，这是著名智库的认可，她的访问期间还将会见美国众议院议长凯文·麦卡锡。"
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
    // TODO: - Send the prompt to our API for response
    const newUserPrompt = {role: 'user', content: prompt};
    const messages = newsAssistantPrompt
        .concat(previousConversations)
        .concat([newUserPrompt]);
    const data = {
        messages: messages,
        temperature: 0,
        max_tokens: 300
    };
    const result = await createChatFromOpenAI(data);
    if (result.status === 'success' && result.text) {
        const newResult = document.createElement('DIV');
        newResult.className = 'chat-talk chat-talk-agent';
        const resultHTML = result.text.replace(/\n/g, '<br>');
        newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
        chatContent.appendChild(newResult);
        newResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
        previousConversations.push(newUserPrompt);
        previousConversations.push({role: 'assistant', content: result.text});
    } else if (result.message) {
        alert(result.message);
    } else {
        alert('An unknown error happened. Please try again later. ');
    }
}

function greet() {
    const prompt = 'Hello! What can I do for you? ';
    if (!chatContent.querySelector('.chat-talk')) {
        chatContent.innerHTML = '';
    }
    const newChat = document.createElement('DIV');
    newChat.className = 'chat-talk chat-talk-agent';
    newChat.innerHTML = `<div class="chat-talk-inner">${prompt}</div>`;
    chatContent.appendChild(newChat);
    previousConversations.push({
        "role": "assistant",
        "content": prompt
    });
}

greet();

/* jshint ignore:end */