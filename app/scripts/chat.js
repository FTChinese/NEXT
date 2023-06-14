/* jshint ignore:start */

const delegate = new Delegate(document.body);
const userInput = document.getElementById('user-input');
const switchIntention = document.getElementById('switch-intention');
const chatContent = document.getElementById('chat-content');
const chatSumit = document.getElementById('chat-submit');
const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
const isFrontendTest = location.href.indexOf('localhost') >= 0;
const isInNativeApp = location.href.indexOf('webview=ftcapp') >= 0;
const discussArticleOnly = location.href.indexOf('ftid=') >= 0;
let preferredLanguage = navigator.language;
let paramDict = {};
var previousConversations = [];
var previousIntentDections = []; 
var botStatus = 'waiting';
var intention;

// MARK: - scrollIntoView doesn't support offset
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
  'Introduction': {
    en: 'Welcome to your personal finance and business news assistant! My goal is to help you get the most value out of your subscription by providing customized recommendations and insights. ',
    es: '¡Bienvenido a tu asistente personal de finanzas y noticias empresariales! Mi objetivo es ayudarte a obtener el mayor valor de tu suscripción mediante recomendaciones e ideas personalizadas.',
    fr: 'Bienvenue à votre assistant personnel pour les actualités financières et commerciales ! Mon objectif est de vous aider à tirer le meilleur parti de votre abonnement en vous fournissant des recommandations et des informations personnalisées.',
    de: 'Willkommen bei Ihrem persönlichen Finanz- und Wirtschaftsnachrichtenassistenten! Mein Ziel ist es, Ihnen durch maßgeschneiderte Empfehlungen und Einblicke den größten Nutzen aus Ihrem Abonnement zu verschaffen.',
    ja: 'ファイナンシャル・タイムズのパーソナル・ファイナンス＆ビジネスニュース・アシスタントへようこそ！私の目標は、カスタマイズされた推奨事項と洞察力を提供することで、あなたのサブスクリプションから最大の価値を得ることをお手伝いすることです。',
    ko: '개인 맞춤형 금융 및 비즈니스 뉴스 어시스턴트에 오신 것을 환영합니다! 나의 목표는 맞춤형 추천 및 인사이트를 제공하여 구독에서 최대 가치를 끌어내는 것입니다.',
    pt: 'Bem-vindo ao seu assistente pessoal de finanças e notícias empresariais! Meu objetivo é ajudá-lo a obter o máximo valor da sua assinatura, fornecendo recomendações e insights personalizados.',
    it: 'Benvenuto nel tuo assistente personale per le notizie finanziarie e commerciali! Il mio obiettivo è aiutarti a ottenere il massimo valore dalla tua sottoscrizione fornendo raccomandazioni e informazioni personalizzate.',
    'zh-TW': '歡迎使用專屬於您的財經新聞助理！我的目標是透過提供量身定制的建議和深度分析，協助您充分利用您的訂閱。',
    'zh-HK': '歡迎使用專屬於您的財經新聞助理！我的目標是透過提供量身定制的建議和深度分析，協助您充分利用您的訂閱。',
    zh: '欢迎使用专属于您的财经新闻助理！我的目标是通过提供量身定制的推荐和深度分析，协助您充分利用您的订阅。',
    ru: 'Добро пожаловать в вашего персонального помощника по финансовым и бизнес-новостям! Моя цель - помочь вам получить максимальную пользу от вашей подписки, предоставляя настраиваемые рекомендации и аналитику.'
  },
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
  'DiscussContent': {
    en: 'Talk about FT Content',
    zh: '讨论FT内容',
    es: 'Hablar sobre el contenido de FT',
    fr: 'Parler du contenu de FT',
    de: 'Über FT-Inhalte sprechen',
    ja: 'FTコンテンツについて話す',
    ko: 'FT 콘텐츠에 대해 이야기하다',
    pt: 'Falar sobre o conteúdo do FT',
    it: 'Parlare del contenuto di FT',
    'zh-TW': '討論FT內容',
    'zh-HK': '討論FT內容',
    ru: 'Обсуждение контента FT'
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
    en: 'Test my understanding',
    es: 'Prueba mi comprensión',
    fr: 'Testez ma compréhension',
    de: 'Teste mein Verständnis',
    ja: '私の理解をテストしてください',
    ko: '내 이해를 테스트하세요',
    pt: 'Teste a minha compreensão',
    it: 'Testa la mia comprensione',
    'zh-TW': '測試我的理解',
    'zh-HK': '測試我的理解',
    zh: '测试我的理解',
    ru: 'Проверьте мое понимание'
  },
  'Socratic Method': {
    zh: '苏格拉底诘问',
    en: 'Socratic method',
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
    en: 'China',
    es: 'China',
    fr: 'Chine',
    de: 'China',
    ja: '中国',
    ko: '중국',
    pt: 'China',
    it: 'Cina',
    ru: 'Китай',
    'zh-TW': '中國',
    'zh-HK': '中國',
    zh: '中国'
  },
  'Companies': {
    en: 'Companies',
    es: 'Empresas',
    fr: 'Entreprises',
    de: 'Unternehmen',
    ja: '企業',
    ko: '회사',
    pt: 'Empresas',
    it: 'Aziende',
    ru: 'Компании',
    'zh-TW': '公司',
    'zh-HK': '公司',
    zh: '公司'
  },
  'Markets': {
    en: 'Markets',
    es: 'Mercados',
    fr: 'Marchés',
    de: 'Märkte',
    ja: '市場',
    ko: '시장',
    pt: 'Mercados',
    it: 'Mercati',
    ru: 'Рынки',
    'zh-TW': '市場',
    'zh-HK': '市場',
    zh: '市场'
  },
  'Opinion': {
    en: 'Opinion',
    es: 'Opinión',
    fr: 'Opinion',
    de: 'Meinung',
    ja: '意見',
    ko: '의견',
    pt: 'Opinião',
    it: 'Opinione',
    ru: 'Мнение',
    'zh-TW': '觀點',
    'zh-HK': '觀點',
    zh: '观点'
  },
  'Podcasts': {
    en: 'Podcasts',
    es: 'Podcasts',
    fr: 'Podcasts',
    de: 'Podcasts',
    ja: 'ポッドキャスト',
    ko: '팟캐스트',
    pt: 'Podcasts',
    it: 'Podcast',
    ru: 'Подкасты',
    'zh-TW': '播客',
    'zh-HK': '播客',
    zh: '播客'
  },
  'Videos': {
    en: 'Videos',
    es: 'Videos',
    fr: 'Vidéos',
    de: 'Videos',
    ja: 'ビデオ',
    ko: '동영상',
    pt: 'Vídeos',
    it: 'Video',
    ru: 'Видео',
    'zh-TW': '視頻',
    'zh-HK': '視頻',
    zh: '视频'
  },
  'Life & Arts': {
    en: 'Life & Arts',
    es: 'Estilo de vida y arte',
    fr: 'Art de vivre',
    de: 'Leben & Kunst',
    ja: 'ライフ＆アート',
    ko: '라이프 & 아트',
    pt: 'Estilo de vida e arte',
    it: 'Vita e arte',
    ru: 'Жизнь и искусство',
    'zh-TW': '生活與藝術',
    'zh-HK': '生活與藝術',
    zh: '生活与艺术'
  },
  'Work & Careers': {
    en: 'Work & Careers',
    es: 'Trabajo y carreras',
    fr: 'Travail et carrières',
    de: 'Arbeit & Karriere',
    ja: '仕事とキャリア',
    ko: '직업 및 경력',
    pt: 'Trabalho e carreiras',
    it: 'Lavoro e carriere',
    ru: 'Работа и карьера',
    'zh-TW': '工作與職涯',
    'zh-HK': '工作與職涯',
    zh: '工作与职业'
  },
  'AI News': {
    en: 'AI',
    es: 'IA',
    fr: 'IA',
    de: 'AI',
    ja: 'AI',
    ko: 'AI',
    pt: 'IA',
    it: 'IA',
    'zh-TW': '人工智慧',
    'zh-HK': 'AI',
    zh: '人工智能',
    ru: 'ИИ'
  },
  'Need Customer Service': {
    en: 'Customer Service',
    es: 'Servicio al Cliente',
    fr: 'Service Client',
    de: 'Kundenservice',
    ja: 'カスタマーサービス',
    ko: '고객 서비스',
    pt: 'Atendimento ao Cliente',
    it: 'Servizio Clienti',
    'zh-TW': '客服',
    'zh-HK': '客戶服務。',
    zh: '客户服务',
    ru: 'Служба поддержки'
  },
  'Discover and Explore': {
    en: 'Discover and Explore',
    es: 'Descubrir y explorar',
    fr: 'Découvrir et explorer',
    de: 'Entdecken und erkunden',
    ja: '発見と探索',
    ko: '발견과 탐험',
    pt: 'Descobrir e explorar',
    it: 'Scoprire ed esplorare',
    'zh-TW': '發現與探索',
    'zh-HK': '發現與探索',
    zh: '发现与探索',
    ru: 'Откройте для себя и исследуйте'
  },
  'Looking For News': {
    en: `What's news?`,
    es: `¿Qué hay de nuevo?`,
    fr: `Quoi de neuf?`,
    de: `Was gibt's Neues?`,
    ja: `何か新しいことはある？`,
    ko: `뭐가 새로운 소식이야?`,
    pt: `Quais são as novidades?`,
    it: `Quali sono le novità?`,
    'zh-TW': `今日要聞`,
    'zh-HK': `今日要聞`,
    zh: `今日要闻`,
    ru: `Что нового?`
  },
  'Deep Dive': {
    zh: '深度报道',
    en: 'In-depth reports',
    es: 'Reportajes en profundidad',
    fr: 'Reportages approfondis',
    de: 'Vertiefende Berichte',
    ja: '綿密な報道',
    ko: '심층 보도',
    pt: 'Reportagens em profundidade',
    it: 'Approfondimenti',
    'zh-TW': '深度報導',
    'zh-HK': '深度報導',
    ru: 'Глубокие репортажи'
  },
  'Tech News': {
    zh: '科技',
    en: 'Technology',
    es: 'Tecnología',
    fr: 'Technologie',
    de: 'Technologie',
    ja: 'テクノロジー',
    ko: '기술',
    pt: 'Tecnologia',
    it: 'Tecnologia',
    'zh-TW': '科技',
    'zh-HK': '科技',
    ru: 'Технологии'
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
  'What do you want to find?': {
    zh: '好的，您可以点击下面这些最为常见的查询，也可以告诉我您想找什么内容。',
    en: 'Okay, you can click on the most common queries below, or tell me what content you are looking for.',
    es: 'De acuerdo, puedes hacer clic en las consultas más comunes a continuación, o decirme qué contenido estás buscando.',
    fr: `D'accord, vous pouvez cliquer sur les requêtes les plus courantes ci-dessous, ou me dire quel contenu vous recherchez.`,
    de: 'Okay, Sie können auf die häufigsten Abfragen unten klicken oder mir sagen, wonach Sie suchen.',
    ja: 'わかりました。以下の最も一般的なクエリをクリックするか、お探しのコンテンツを教えてください。',
    ko: '알겠습니다. 가장 일반적인 쿼리를 아래에서 클릭하거나 찾으시는 콘텐츠를 말씀해주세요.',
    pt: 'Ok, você pode clicar nas consultas mais comuns abaixo ou me dizer que conteúdo está procurando.',
    it: 'Va bene, puoi cliccare sulle query più comuni qui sotto o dirmi quale contenuto stai cercando.',
    'zh-TW': '好的，您可以點擊下面這些最常見的查詢，或告訴我您要找什麼內容。',
    'zh-HK': '好嘢，您可以喺下面啲最常見嘅查詢入面揀一個，或者講俾我知您要搵咩嘢。',
    ru: 'Хорошо, вы можете нажать на наиболее распространенные запросы ниже или сообщить мне, какой контент вы ищете.'
  },
  'Find More': {
    zh: '您可以点击下面这些最为常见的查询，或者告诉我您想找什么内容。',
    en: 'You can click on these most common queries below, or tell me what content you are looking for.',
    es: 'Puede hacer clic en estas consultas más comunes a continuación, o decirme qué contenido está buscando.',
    fr: 'Vous pouvez cliquer sur ces requêtes les plus courantes ci-dessous, ou me dire quel contenu vous recherchez.',
    de: 'Sie können auf diese am häufigsten gestellten Abfragen unten klicken oder mir sagen, wonach Sie suchen.',
    ja: '以下の最も一般的なクエリをクリックするか、探しているコンテンツを教えてください。',
    ko: '가장 일반적인 쿼리 중 하나를 클릭하거나 찾으려는 콘텐츠를 알려주세요.',
    pt: 'Você pode clicar nas consultas mais comuns abaixo ou me dizer que conteúdo está procurando.',
    it: 'Puoi cliccare su queste query più comuni qui sotto, o dirmi quale contenuto stai cercando.',
    'zh-TW': '您可以點擊下面這些最常見的查詢，或告訴我您想要尋找什麼內容。',
    'zh-HK': '你可以按下面最常見的查詢，或者告訴我你想搵咩內容。',
    ru: 'Вы можете щелкнуть на эти самые распространенные запросы ниже или сообщить мне, какой контент вы ищете.'
  },
  'Discuss More': {
    zh: '如果有任何关于FT最新内容的问题，请立即问我。',
    en: 'If you have any questions about the latest FT content, please ask me immediately.',
    es: 'Si tiene alguna pregunta sobre el contenido más reciente de FT, pregúnteme de inmediato.',
    fr: 'Si vous avez des questions sur le contenu le plus récent de FT, demandez-moi immédiatement.',
    de: 'Wenn Sie Fragen zum neuesten FT-Inhalt haben, fragen Sie mich bitte sofort.',
    ja: '最新のFTコンテンツに関する質問がある場合は、すぐに私に尋ねてください。',
    ko: '최신 FT 콘텐츠에 대한 질문이 있으면 즉시 저에게 물어보세요.',
    pt: 'Se você tiver alguma dúvida sobre o conteúdo mais recente do FT, pergunte-me imediatamente.',
    it: 'Se hai domande sul contenuto più recente di FT, chiedimi immediatamente.',
    'zh-TW': '如果有關於FT最新內容的問題，請立即問我。',
    'zh-HK': '如果有關FT最新內容的問題，請立即問我。',
    ru: 'Если у вас есть вопросы о последних материалах FT, пожалуйста, спросите меня немедленно.'
  },
  'DoSomethingElse': {
    zh: '聊点别的',
    en: `Talk about something else`,
    es: 'Hablemos de algo más',
    fr: `Parlons d'autre chose`,
    de: 'Lass uns über etwas anderes sprechen',
    ja: '他の話題にしましょう',
    ko: '다른 얘기 좀 하자',
    pt: 'Vamos falar sobre outra coisa',
    it: `Parliamo d'altro`,
    'zh-TW': '聊點別的',
    'zh-HK': '傾下計啦',
    ru: 'Давайте поговорим о чем-то другом'
  },
  'Set Your Preferences': {
    zh: '您可以在这里修改您的偏好及设置',
    en: 'You can modify your preferences and settings here.',
    es: 'Puede modificar sus preferencias y configuraciones aquí.',
    fr: 'Vous pouvez modifier vos préférences et paramètres ici.',
    de: 'Sie können hier Ihre Einstellungen und Vorlieben ändern.',
    ja: 'ここで好みや設定を変更できます。',
    ko: '여기에서 선호도와 설정을 수정할 수 있습니다.',
    pt: 'Você pode modificar suas preferências e configurações aqui.',
    it: 'Puoi modificare le tue preferenze e impostazioni qui.',
    'zh-TW': '您可以在這裡修改您的偏好和設置。',
    'zh-HK': '您可以在這裡修改您的偏好和設置。',
    ru: 'Вы можете изменить свои предпочтения и настройки здесь.'
  },
  'Setting': {
    zh: '设置',
    en: 'Settings',
    es: 'Ajustes',
    fr: 'Paramètres',
    de: 'Einstellungen',
    ja: '設定',
    ko: '설정',
    pt: 'Configurações',
    it: 'Impostazioni',
    'zh-TW': '設定',
    'zh-HK': '設定',
    ru: 'Настройки'
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
  const language = preferredLanguage;
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
          url = '/api/page/ft_article_scrolly_telling.json';
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
          return {status: 'success', results: results};
      } else {
          return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
      }
  } catch(err) {
      console.log(err);
      return {status: 'failed', message: err.toString()};
  }
}


async function showContent(ftid, language) {
  try {
      showBotResponse('Getting Article...');
      // MARK: - It is important to set the current ft id here, because async request might not be returned in the expected sequence. 
      currentFTId = ftid;
      const info = await getArticleFromFTAPI(ftid, language);
      const content = info.results;
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
          let bodyXML = content.bodyXML || content.transcript || '';
          let bodyXMLEnglish = '';
          if (content.bodyXMLTranslation && content.bodyXMLTranslation !== '') {
              bodyXMLEnglish = `<div class="hide story-body-english">${bodyXML}</div>`;
              bodyXML = content.bodyXMLTranslation;
          }
          let showTranscript = (bodyXML !== '' && ['Video', 'Audio'].indexOf(type) >= 0) ? `<a data-action="show-transcript">Show Transcript</a>` : '';
          let title = content.title || '';
          let titleEnglish = '';
          if (content.titleTranslation && content.titleTranslation !== '') {
              titleEnglish = `<div class="hide story-headline-english">${title}</div>`;
              title = content.titleTranslation;
          }
          let standfirst = content.standfirst || '';
          let standfirstEnglish = '';
          if (content.standfirstTranslation && content.standfirstTranslation !== '') {
              standfirstEnglish = `<div class="hide story-lead-english">${standfirst}</div>`;
              standfirst = content.standfirstTranslation;
          }
          let byline = content.byline || '';
          let bylineEnglish = '';
          if (content.bylineTranslation && content.bylineTranslation !== '') {
              bylineEnglish = `<div class="hide story-author-english">${byline}</div>`;
              byline = content.bylineTranslation;
          }
          let html = `
              <div class="article-container" data-id="${ftid}">
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
                  <div class="story-body${hideBodyClass}"><div id="story-body-container">${bodyXML}</div></div>
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
          showResultInChat(result);
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

function showBotResponse(placeholder) {
  const botResponse = document.createElement('DIV');
  botResponse.className = 'chat-talk chat-talk-agent chat-talk-agent-pending';
  botResponse.innerHTML = `<div class="chat-talk-inner">${placeholder || '...'}</div>`;
  // console.log(chatContent.innerHTML);
  // return;
  chatContent.appendChild(botResponse);
  botResponse.scrollIntoView(scrollOptions);
}

function showResultInChat(result) {
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
    setTimeout(function(){
      newResult.querySelector(inViewClass).scrollIntoView(scrollOptions);
    }, 0);
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
  'set-preference': setPreference
  // 'check-news': checkNews
  // 'purpose2': function2,
  // 'purpose3': function3,
  // ... add more purposes and functions here
};

// async function checkNews(content, language) {
//   console.log('Should Check News and Come Up with the search query! ');

// }

async function setPreference(category, language, reply) {
  console.log(`running setPreference\ncategory: ${category}, language: ${language}, reply: ${reply}`);
  if (reply && reply !== '') {
    const actions = getActionOptions();
    showResultInChat({text: `${reply}${actions}`});
  }
  // MARK: - Show the settings here
  

}

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
        const newHTML = `<div data-id="${id}" data-lang="${lang}" class="chat-item-container${hideClass}"><div><span class="story-time">${timeStamp}</span></div><div class="chat-item-title"><a data-action="show-article" target="_blank" title="${byline}: ${excerpt}">${title}</a></div><div class="item-lead">${subheading}</div></div>`;
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
      // MARK: - Use English text to create quiz and questions, which saves tokens and gets best quality
      let title = '';
      if (articleEle.querySelector('.story-headline-english')) {
          title = articleEle.querySelector('.story-headline-english').innerHTML;
      } else {
          title = articleEle.querySelector('.story-headline').innerHTML;
      }
      let byline = '';
      if (articleEle.querySelector('.story-author-english')) {
          byline = articleEle.querySelector('.story-author-english').innerHTML;
      } else {
          byline = articleEle.querySelector('.story-author').innerHTML;
      }
      let standfirst = '';
      if (articleEle.querySelector('.story-lead-english')) {
          standfirst = articleEle.querySelector('.story-lead-english').innerHTML;
      } else {
          standfirst = articleEle.querySelector('.story-lead').innerHTML;
      }
      let storyBody = '';
      if (articleEle.querySelector('.story-body-english')) {
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
          groupHTML += `
            <div data-id="${id}" data-lang="${lang}" class="chat-item-container">
              ${primaryTheme}
              <div class="chat-item-title">
                <a data-action="show-article" target="_blank" title="${byline}: ${excerpt}">${title}</a>
              </div>
              <div class="item-lead">${subheading}</div>
              <span class="story-time">${timeStamp}</span>
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
  }
  window.shouldPromptLogin = true;
  localStorage.setItem('pagemark', window.location.href);
  var script = document.createElement('script');
  script.src = '/powertranslate/scripts/register.js';
  document.head.appendChild(script);
  document.getElementById('current-chat-status').innerHTML += `
    <a data-purpose="set-intention" data-content="CleanSlate" data-reply="${localize('Offer Help')}">${localize('BackToTop')}</a>
    <a data-purpose="set-intention" data-content="DiscussContent" data-reply="${localize('Discuss More')}">${localize('DiscussContent')}</a>
    <a data-purpose="set-intention" data-content="SearchFTAPI" data-reply="${localize('Offer Help For Search')}">${localize('SearchFT')}</a>
    <a data-purpose="set-intention" data-content="CustomerService" data-reply="${localize('Offer Help')}">${localize('CustomerService')}</a>
    <a data-purpose="set-intention" data-content="Other" data-reply="${localize('Offer Help')}">${localize('Other')}</a>
  `;
}

// MARK: Set up guard rails based on the initial settings
async function setGuardRails() {
  if (isInNativeApp) {
    document.documentElement.classList.add('is-in-native-app');
  }
  if (discussArticleOnly) {
    document.documentElement.classList.add('discuss-article-only');
  }
  const ftid = paramDict.ftid;
  if (ftid && ftid !== '') {
    await showContent(ftid, preferredLanguage);
    const action = paramDict.action;
    if (action && action !== '') {
      const element = document.querySelector(`[data-action="${action}"]`);
      if (element) {
        await handleActionClick(element);
      }
    }
  }
  const intent = paramDict.intent;
  if (intent && intent !== '') {
    document.documentElement.classList.add('intention-fixed');
    await setIntention(intent);
  }

}

function greet() {
  const introduction = `<p>${localize('Introduction')}</p>`;
  const prompt = (discussArticleOnly) ? '' : `<p>${getRandomPrompt('greeting')}</p>`;
  if (!chatContent.querySelector('.chat-talk')) {
      chatContent.innerHTML = '';
  }
  const newChat = document.createElement('DIV');
  newChat.className = 'chat-talk chat-talk-agent';
  newChat.innerHTML = `<div class="chat-talk-inner">${introduction}${prompt}${getActionOptions()}</div>`
  chatContent.appendChild(newChat);
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

initChat();

(async()=>{
  await registerServiceWorker();
})();

(async()=>{
  await setGuardRails();
})();

chatContent.addEventListener('scroll', function() {
  checkScrollyTellingForChat();
});
// console.log('main-chat.js version: 27');


/* jshint ignore:end */