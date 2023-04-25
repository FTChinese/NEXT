/* jshint ignore:start */

const delegate = new Delegate(document.body);
const userInput = document.getElementById('user-input');
const switchIntention = document.getElementById('switch-intention');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;
var previousConversations = [];
var previousIntentDections = []; 
var botStatus = 'waiting';
var intention;

const scrollOptions = { 
  behavior: 'smooth', 
  block: 'end',
};

const randomPromptDict = {
  greeting: {
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
  },
  ending: {
    'en': [
    'What else can I do for you?',
    'Is there anything else I can assist you with?',
    'Do you require any further assistance from me?',
    'Are there any other ways I can be of service to you?',
    'Would you like me to do anything else for you?'
    ],
    'es': [
    '¿Qué más puedo hacer por ti?',
    '¿Hay algo más en lo que pueda ayudarte?',
    '¿Necesitas alguna otra asistencia de mi parte?',
    '¿Hay alguna otra manera en la que pueda ser de servicio para ti?',
    '¿Te gustaría que hiciera algo más por ti?'
    ],
    'fr': [
    `Que puis-je faire d'autre pour vous ?`,
    'Est-ce que je peux vous aider avec autre chose ?',
    `Avez-vous besoin d'une assistance supplémentaire de ma part ?`,
    `Y a-t-il d'autres moyens par lesquels je peux être utile pour vous ?`,
    'Voulez-vous que je fasse autre chose pour vous ?'
    ],
    'de': [
    'Was kann ich noch für Sie tun?',
    'Kann ich Ihnen noch in anderer Weise behilflich sein?',
    'Benötigen Sie weitere Unterstützung von mir?',
    'Gibt es noch andere Möglichkeiten, wie ich Ihnen dienen kann?',
    'Möchten Sie, dass ich noch etwas anderes für Sie tue?'
    ],
    'ja': [
    '他に何かご用件はありますか？',
    '他に何かお手伝いできることはありますか？',
    '私に他に何かお力になることはありますか？',
    '他にも何かお役に立てる方法はありますか？',
    '他に何かしてほしいことはありますか？'
    ],
    'ko': [
    '더 도와 드릴 게 있나요?',
    '다른 무언가 도와 드릴 수 있나요?',
    '제가 더 도움을 드릴 수 있는 것이 있나요?',
    '다른 방법으로도 봉사할 수 있는 게 있나요?',
    '제가 더 해 줄 일이 있나요?'
    ],
    'pt': [
    'O que mais posso fazer por você?',
    'Existe algo mais em que posso ajudá-lo?',
    'Você precisa de mais alguma assistência minha?',
    'Existem outras maneiras pelas quais posso ser útil para você?',
    'Você gostaria que eu fizesse algo mais por você?'
    ],
    'it': [
    'Cosa altro posso fare per te?',
    `C'è qualcos'altro in cui posso aiutarti?`,
    'Hai bisogno di ulteriore assistenza da parte mia?',
    'Ci sono altri modi in cui posso esserti utile?',
    'Desideri che io faccia altro per te?'
    ],
    'zh-TW': [
    '還有什麼我可以為您做的嗎？',
    '還有什麼我可以幫您的嗎？',
    '您需要我提供什麼其他的協助嗎？',
    '還有其他什麼方式我可以為您服務嗎？',
    '您還需要我為您做些什麼嗎？'
    ],
    'zh-HK': [
    '我還可以為您做些什麼嗎？',
    '還有什麼我可以協助您的嗎？',
    '您需要我提供其他的幫助嗎？',
    '還有其他方法可以令我為您服務嗎？',
    '您還需要我為您做其他事嗎？'
    ],
    'zh': [
    '还有什么我可以为您做的吗？',
    '还有什么我可以帮您的吗？',
    '您需要我提供什么其他的协助吗？',
    '还有其他什么方式我可以为您服务吗？',
    '您还需要我为您做些什么吗？'
    ],
    'ru': [
    'Чем еще я могу Вам помочь?',
    'Нужна ли Вам еще какая-либо помощь с моей стороны?',
    'Требуется ли Вам дополнительная помощь от меня?',
    'Есть ли другие способы, которыми я могу быть Вам полезен?',
    'Хотели бы Вы, чтобы я что-то еще сделал для Вас?'
    ]
  }
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
  'BackToTop': {
    zh: '从头开始',
    en: 'Start Over',
    es: 'Empezar de nuevo',
    fr: 'Recommencer',
    de: 'Von vorn beginnen',
    ja: '最初からやり直す',
    ko: '처음부터 다시 시작',
    pt: 'Começar de novo',
    it: 'Ricominciare',
    'zh-TW': '',
    'zh-HK': '',
    ru: 'Начать заново'
  },
  'DiscussArticle': {
    zh: '讨论文章',
    en: 'Discuss Article',
    es: 'Discutir Artículo',
    fr: `Discuter de l'article`,
    de: 'Artikel diskutieren',
    ja: '記事を議論する',
    ko: '글 논의',
    pt: 'Discutir Artigo',
    it: 'Discutere Articolo',
    'zh-TW': '討論文章',
    'zh-HK': '討論文章',
    ru: 'Обсудить статью'
  },
  'ChangeSubject': {
    en: 'Change Subject',
    zh:'改变话题',
    es: 'Cambiar Tema',
    fr: 'Changer de sujet',
    de: 'Thema ändern',
    ja: '話題を変える',
    ko: '주제 변경',
    pt: 'Mudar de assunto',
    it: 'Cambiare argomento',
    'zh-TW': '改變話題',
    'zh-HK': '改變話題',
    ru: 'Изменить тему'
  },
  'socratic': {
    zh: '苏格拉底诘问',
    en: 'Socratic Method',
    es: 'Método socrático',
    fr: 'Méthode socratique',
    de: 'Sokratische Methode',
    ja: 'ソクラテス式問い掛け法',
    ko: '소크라테스적 방법',
    pt: 'Método socrático',
    it: 'Metodo socratico',
    'zh-TW': '蘇格拉底質問',
    'zh-HK': '蘇格拉底式質問',
    ru: 'Сократический метод'
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
  'Socratic Method': {
    en: 'Use the Socratic method to help me learn and understand the content above.',
    zh: '用苏格拉底诘问来帮我学习和理解上面的内容。',
    es: 'Utiliza el método socrático para ayudarme a aprender y entender el contenido de arriba.',
    fr: `Utilisez la méthode socratique pour m'aider à apprendre et comprendre le contenu ci-dessus.`,
    de: `Verwenden Sie die sokratische Methode, um mir beim Lernen und Verstehen des obigen Inhalts zu helfen.`,
    ja: '上記の内容を学習し理解するためにソクラテス式問答法を使用してください。',
    ko: '위의 내용을 학습하고 이해하는 데 소크라테스식 문답법을 사용하세요.',
    pt: 'Use o método socrático para me ajudar a aprender e entender o conteúdo acima.',
    it: 'Usa il metodo socratico per aiutarmi ad imparare e comprendere il contenuto sopra.',
    'zh-TW': '使用蘇格拉底式的詰問法來幫助我學習並理解上面的內容。',
    'zh-HK': '用蘇格拉底式的質問法來幫助我學習和理解上面的內容。',
    ru: 'Используйте сократический метод, чтобы помочь мне учиться и понимать вышеупомянутое содержание.'
  },
  'Socratic Method Explained': {
    en: 'The Socratic Method is a way of questioning and discussing ideas to challenge assumptions and arrive at a better understanding. It involves asking questions to uncover underlying beliefs and test the logic of responses given. It is used to promote critical thinking, problem-solving, and creativity in various fields.',
    zh: '苏格拉底诘问方法是一种质疑和讨论观念的方式，旨在挑战假设并达到更好的理解。它涉及提出问题以揭示潜在信念并测试所给出的响应的逻辑。它用于在各个领域中促进批判性思维、问题解决和创造力。',
    es: 'El Método Socrático es una forma de cuestionar y discutir ideas para desafiar suposiciones y llegar a una mejor comprensión. Implica hacer preguntas para descubrir creencias subyacentes y poner a prueba la lógica de las respuestas dadas. Se utiliza para promover el pensamiento crítico, la resolución de problemas y la creatividad en varios campos.',
    fr: 'La méthode socratique est une façon de questionner et de discuter des idées afin de remettre en question les hypothèses et parvenir à une meilleure compréhension. Elle consiste à poser des questions pour découvrir les croyances sous-jacentes et tester la logique des réponses données. Elle est utilisée pour promouvoir la pensée critique, la résolution de problèmes et la créativité dans différents domaines.',
    de: 'Die sokratische Methode ist eine Art des Fragens und Diskutierens von Ideen, um Annahmen herauszufordern und zu einem besseren Verständnis zu gelangen. Es beinhaltet Fragen, um zugrunde liegende Überzeugungen aufzudecken und die Logik der gegebenen Antworten zu prüfen. Es wird verwendet, um kritisches Denken, Problemlösung und Kreativität in verschiedenen Bereichen zu fördern.',
    ja: 'ソクラテスの方法は、仮定に挑戦し、より良い理解に到達するための問いかけと議論の方法です。潜在的な信念を明らかにするために質問し、回答の論理をテストすることが含まれます。さまざまな分野で批判的思考、問題解決、創造性を促進するために使用されています。',
    ko: '소크라테스 방법은 가정을 도전하고 더 나은 이해를 도출하기 위해 아이디어에 대한 질문과 토론하는 방법입니다. 대답의 논리를 검증하고, 깔끔하지 않은 논리를 깨우쳐 신념을 드러냅니다. 다양한 분야에서 비판적 사고, 문제 해결 및 창의성을 촉진하는 데 사용됩니다.',
    pt: 'O Método Socrático é uma maneira de questionar e discutir ideias para desafiar pressupostos e chegar a uma melhor compreensão. Envolve fazer perguntas para descobrir crenças subjacentes e testar a lógica das respostas dadas. É usado para promover o pensamento crítico, a resolução de problemas e a criatividade em várias áreas.',
    it: `Il Metodo Socratico è un modo di interrogare e discutere le idee per mettere in discussione le assunzioni e arrivare ad una migliore comprensione. Comprende l'arte di porre domande per scoprire le credenze sottostanti e testare la logica delle risposte date. È utilizzato per promuovere il pensiero critico, la risoluzione dei problemi e la creatività in vari campi.`,
    'zh-TW': '蘇格拉底詰問方法是一種質疑和討論觀念的方式，旨在挑戰假設並達到更好的理解。它涉及提出問題以揭示潛在信念並測試所給出的回應的邏輯。它用於在各個領域中促進批判性思維、問題解決和創造力。',
    'zh-HK': '蘇格拉底詰問方法是一種質疑和討論觀念的方式，旨在挑戰假設並達到更好的理解。它涉及提出問題以揭示潛在信念並測試所給出的回應的邏輯。它用於在各個領域中促進批判性思維、問題解決和創造力。',
    ru: 'Метод Сократа - это способ вопросительного и обсуждающего подхода к идеям, направленный на оспаривание предположений и достижение лучшего понимания. Он включает в себя задавание вопросов, чтобы раскрыть скрытые убеждения и проверить логику полученных ответов. Используется для развития критического мышления, решения проблем и креативности в различных областях.'
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
  'Deep Dive': {
    zh: '我想阅读FT最新的深度报道',
    en: `I'd like to read some in-depth reports from FT.`,
    es: 'Me gustaría leer informes detallados de FT.',
    fr: 'Je voudrais lire des rapports approfondis de FT.',
    de: 'Ich möchte einige ausführliche Berichte von FT lesen.',
    ja: 'FTから詳細なレポートを読みたいです。',
    ko: 'FT의 심층 보도를 읽고 싶습니다.',
    pt: 'Eu gostaria de ler relatórios aprofundados da FT.',
    it: 'Vorrei leggere alcuni rapporti approfonditi da FT.',
    'zh-TW': '我想閱讀FT最新的深度報導',
    'zh-HK': '我想閱讀FT最新的深度報導',
    ru: 'Я бы хотел прочитать некоторые подробные отчеты от FT.'
  },
  'Offer Help': {
    zh: '好的，需要我怎么帮助您？',
    en: 'Sure, how can I help you?',
    es: 'Claro, ¿en qué puedo ayudarle?',
    fr: 'Bien sûr, comment puis-je vous aider?',
    de: 'Ja, wie kann ich Ihnen helfen?',
    ja: '承知しました。何かお力になれることはありますか？',
    ko: '네, 무엇을 도와드릴까요?',
    pt: 'Claro, como posso ajudá-lo?',
    it: 'Certamente, in che modo posso aiutarti?',
    'zh-TW': '好的，有什麼我能幫到您的嗎？',
    'zh-HK': '好的，有什麼我能幫到您的嗎？',
    ru: 'Конечно, в чем я могу вам помочь?'
  },
  'Discuss Article': {
    zh: '关于这篇文章，如果您有任何问题，可以现在问我。',
    en: "If you have any questions about this article, feel free to ask me now.",
    es: "Si tienes alguna pregunta sobre este artículo, no dudes en preguntarme ahora.",
    fr: "Si vous avez des questions sur cet article, n'hésitez pas à me demander maintenant.",
    de: "Wenn Sie Fragen zu diesem Artikel haben, fragen Sie mich gerne jetzt.",
    ja: "この記事についての質問があれば、遠慮なくお聞きください。",
    ko: "이 기사에 대해 궁금한 점이 있으면 지금 저에게 물어보세요.",
    pt: "Se você tiver alguma dúvida sobre este artigo, sinta-se à vontade para me perguntar agora.",
    it: "Se hai domande su questo articolo, sentiti libero di chiedermi ora.",
    'zh-TW': "關於這篇文章，如果您有任何問題，可以現在問我。",
    'zh-HK': "關於呢篇文章，如果你有咩問題，可以即刻問我。",
    ru: "Если у вас есть вопросы по этой статье, не стесняйтесь спрашивать меня сейчас."
  },
  Finding: {
    zh: '好的，我来帮您查询...',
    en: 'Okay, let me help you search...',
    es: 'De acuerdo, déjame ayudarte a buscar...',
    fr: `D'accord, laissez-moi vous aider à chercher...`,
    de: 'Okay, ich helfe Ihnen gerne bei der Suche...',
    ja: '了解しました、検索をお手伝いします...',
    ko: '알겠습니다. 검색을 도와드리겠습니다...',
    pt: 'Certo, deixe-me ajudá-lo a pesquisar...',
    it: 'Va bene, lascia che ti aiuti a cercare...',
    'zh-TW': '好的，我來幫您查詢...',
    'zh-HK': '好的，我來幫您查詢...',
    ru: 'Хорошо, я помогу вам найти...'
  },
  'DoSomethingElse': {
    zh: '聊点别的。',
    en: `Let's talk about something else.`,
    es: 'Hablemos de algo más.',
    fr: `Parlons d'autre chose.`,
    de: 'Lass uns über etwas anderes sprechen.',
    ja: '他の話題にしましょう。',
    ko: '다른 얘기 좀 하자.',
    pt: 'Vamos falar sobre outra coisa.',
    it: `Parliamo d'altro.`,
    'zh-TW': '聊點別的。',
    'zh-HK': '傾下計啦。',
    ru: 'Давайте поговорим о чем-то другом.'
  }
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

switchIntention.addEventListener('click', ()=>{
  switchIntention.classList.toggle('on');
});

chatSumit.addEventListener('click', function(event){
  talk();
});

delegate.on('click', '[data-action="talk"]', async (event) => {
  const element = event.target;
  userInput.value = element.innerHTML;
  hideItemActions(element);
  talk();
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
  element.classList.add('pending');
  hideItemActions(element);
  try {
    const purpose = element.getAttribute('data-purpose');
    const language = element.getAttribute('data-lang') || 'English';
    const content = element.getAttribute('data-content');
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

function hideItemActions(element) {
  let actionsEle = element.closest('.chat-item-actions');
  if (actionsEle) {
    actionsEle.classList.add('hide');
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
  if (status === 'CleanSlate') {
    status = 'Ready To Chat';
  }
  document.querySelector('#current-chat-status span').innerHTML = `${localize(status)}`;
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
            role: 'assistant',
            content: window.socracticInfo[window.socracticIndex].question
        },
        {
            role: 'system',
            content: `You should evaluate the user's answer based on this context: ${window.socracticInfo[window.socracticIndex].excerpt}`
        }
      ];
      previousConversations = previousConversations.concat(startConversations);
    }
    if (window.socracticInfo.length === window.socracticIndex) {
      await setIntention('DiscussArticle', undefined, `${getRandomPrompt('ending')}`);
    }
  } else if (['DiscussArticle', 'CustomerService'].indexOf(window.intention) >= 0) {
    console.log(`This is where you'd need to provide a back to clean sheet button! `)
    const actions = getActionOptions();
    showActions(actions);
    // showResultInChat({text: actions});
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

function showBotResponse(placeholder) {
  const botResponse = document.createElement('DIV');
  botResponse.className = 'chat-talk chat-talk-agent chat-talk-agent-pending';
  botResponse.innerHTML = `<div class="chat-talk-inner">${placeholder || '...'}</div>`;
  chatContent.appendChild(botResponse);
  botResponse.scrollIntoView(scrollOptions);
}

function showResultInChat(result) {
  updateBotStatus('waiting');
  const newResult = document.createElement('DIV');
  newResult.className = 'chat-talk chat-talk-agent';
  // MARK: - Converting the HTML on the frontend
  if (!result || !result.text || typeof result.text !== 'string') {return;}
  const resultHTML = markdownToHtmlTable(result.text).replace(/\n/g, '<br>');
  // console.log(`actions: ${actions}`);
  newResult.innerHTML = `<div class="chat-talk-inner">${resultHTML}</div>`;
  chatContent.appendChild(newResult);
  if (newResult.querySelector('h1, .story-header-container')) {
    newResult.classList.add('full-grid-story');
    newResult.querySelector('h1, .story-header-container').scrollIntoView(scrollOptions);
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
  const context = await getContextByIntention(prompt);
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
      context: context // Send context such as article text so that the chat bot can respond more accurately
  };
  // MARK: - Heroku has a 30 seconds hard limit for all requests. The best way is NOT to detect intention first (either locally or through a request to OpenAI), then deal with the intention (likely through OpenAI) because OpenAI's service is so slow that even one simple request will time out. The only way that works is to just post the task for the background to handle, then polling for the result, like what we did for the Quiz.
  const result = await createChatFromOpenAI(data);
  if (result.status === 'success' && result.text) {
      showResultInChat(result);
      // MARK: - Only keep the latest 5 conversations and 4 intentions
      previousConversations = previousConversations.slice(-5);
      previousIntentDections = previousIntentDections.slice(-5);
      // MARK: - Only keep the history if the intention is not a known one, in which case, OpenAI will need the contexts. 
      if (!result.intention || ['Other', 'CustomerService', 'DiscussArticle'].indexOf(result.intention) >= 0) {
        previousConversations.push(newUserPrompt);
        previousConversations.push({role: 'assistant', content: result.text});
      }
      previousIntentDections.push(newUserPrompt);
      previousIntentDections.push({role: 'assistant', content: result.intention || 'Other'});
      updateStatus(result.intention);
      // MARK: - Check if the resultHTML has some prompt or request for the system
      await handleResultPrompt(result.text);
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

const purposeToFunction = {
  'search-ft-api': searchFTAPI,
  'set-intention': setIntention
  // 'check-news': checkNews
  // 'purpose2': function2,
  // 'purpose3': function3,
  // ... add more purposes and functions here
};

// async function checkNews(content, language) {
//   console.log('Should Check News and Come Up with the search query! ');

// }

async function setIntention(newIntention, language, reply) {
  console.log(`running setIntention... content: ${newIntention}, language: ${language}`);
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
      newResult.scrollIntoView(scrollOptions);
      if (results.length > itemChunk) {
        const langProperty = (language && language !== 'English') ? ` data-lang=${language}` : '';
        newResultInner.innerHTML += `<div class="chat-items-expand" data-chunk="${itemChunk}" data-length="${results.length}"${langProperty}></div>`;
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
    const reply = purposeEle.getAttribute('data-reply');
    const content = purposeEle.innerHTML;
    if (purposeToFunction.hasOwnProperty(purpose)) {
      await purposeToFunction[purpose](content, language, reply);
    }
  } catch(err) {

  }
}

function getRandomPrompt(purpose) {
  const language = navigator.language;
  const languagePrefix = language.replace(/\-.*$/g, '');
  const dict = randomPromptDict[purpose];
  if (!dict) {return 'Hello, How can I help you?';}
  const prompts = dict[language] || dict[languagePrefix] || dict.en;
  const randomIndex = Math.floor(Math.random() * prompts.length);
  const prompt = prompts[randomIndex];
  return prompt;
}

function getActionOptions() {
  const language = navigator.language;
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
  } else if (intention === undefined || intention === '') {
    result = `
      <div class="chat-item-actions">
        <a data-purpose="search-ft-api" data-lang="${language}" data-content="regions:China" data-reply="${localize('Finding')}">${localize('China News')}</a>
        <a data-purpose="search-ft-api" data-lang="${language}" data-content="topics:Artificial Intelligence" data-reply="${localize('Finding')}">${localize('AI News')}</a>
        <a data-purpose="search-ft-api" data-lang="${language}" data-content='genre:"Deep Dive" OR genre:"News in-depth" OR genre:"Explainer"' data-reply="${localize('Finding')}">${localize('Deep Dive')}</a>
        <a data-purpose="set-intention" data-lang="${language}" data-content="CustomerService" data-reply="${localize('Offer Help')}">${localize('Subscription Problem')}</a>
      </div>
    `;
  }
  return result.replace(/[\n\r]+/g, '');
    // News in-depth, Deep Dive
  // <a data-id="" data-action="developing">What are the top stories of the day on FT?</a>
  // <a data-id="" data-action="developing">Recommend some good reads to me.</a>
  // <a data-id="" data-action="developing">I'd like to improve my English.</a>
}

function greet() {
  const prompt = getRandomPrompt('greeting');
  if (!chatContent.querySelector('.chat-talk')) {
      chatContent.innerHTML = '';
  }
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `<div class="chat-talk-inner">${prompt}${getActionOptions()}</div>`
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
  document.getElementById('current-chat-status').innerHTML += `
  <a data-purpose="set-intention" data-content="CleanSlate" data-reply="${localize('Offer Help')}">${localize('BackToTop')}</a>
  <a data-purpose="set-intention" data-content="SearchFTAPI" data-reply="${localize('Offer Help For Search')}">${localize('SearchFT')}</a>
  <a data-purpose="set-intention" data-content="CustomerService" data-reply="${localize('Offer Help')}">${localize('CustomerService')}</a>
  <a data-purpose="set-intention" data-content="Other" data-reply="${localize('Offer Help')}">${localize('Other')}</a>
  `;
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

initChat();
chatContent.addEventListener('scroll', function() {
  checkScrollyTellingForChat();
});


/* jshint ignore:end */