
const appMap = {
News: {
    title: 'FT中文网',
    icon_title: '新闻',
    'title-image': { day: 'FTC-Header', night: 'FTC-Header-Night' },
    'title-image_big5': { day: 'FTC-Header-Big5', night: 'FTC-Header-Night-Big5' },
    navColor: { day: '#333333', night: '#AAAAAA' },
    navBackGroundColor: { day: '#f7e9d8', night: '#000000' },
    navBorderColor: { day: '#d5c6b3', night: '#000000' },
    navBorderWidth: '1',
    isNavLightContent: false,
    navRightItem: 'Search',
    navLeftItem: 'Chat',
    Channels: [
    {
        title: '首页',
        url: 'http://www.ftchinese.com/?webview=ftcapp',
        listapi:
        'https://www.ftchinese.com/?webview=ftcapp&bodyonly=yes&maxB=1&backupfile=localbackup&showIAP=yes&pagetype=home',
        compactLayout: 'home',
        coverTheme: 'Classic',
        screenName: 'homepage',
        'Insert Content': 'home',
        highlight: 'follow'
    },
    {
        title: '中国',
        listapi: 'https://www.ftchinese.com/channel/china.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/china.html?webview=ftcapp',
        regularLayout: '',
        screenName: 'homepage/china',
        coverTheme: 'Wheat'
    },
    {
        title: '标准订阅',
        listapi:
        'https://www.ftchinese.com/channel/standardsubscription.html?webview=ftcapp&bodyonly=yes&ad=no&001',
        url: 'http://www.ftchinese.com/channel/standardsubscription.html?webview=ftcapp&ad=no',
        regularLayout: '',
        screenName: 'homepage/exclusive',
        coverTheme: 'Wheat'
    },
    {
        title: '高端订阅',
        listapi:
        'https://www.ftchinese.com/channel/premiumsubscription.html?webview=ftcapp&bodyonly=yes&ad=no&showEnglishAudio=yes&018',
        url: 'http://www.ftchinese.com/channel/premiumsubscription.html?webview=ftcapp&ad=no',
        screenName: 'homepage/editorchoice',
        coverTheme: ''
    },
    {
        title: '全球',
        listapi: 'https://www.ftchinese.com/channel/world.html?webview=ftcapp&bodyonly=yes&002',
        url: 'http://www.ftchinese.com/channel/world.html?webview=ftcapp',
        screenName: 'homepage/world',
        coverTheme: 'Pink'
    },
    {
        title: '观点',
        listapi: 'https://www.ftchinese.com/channel/opinion.html?webview=ftcapp&bodyonly=yes&ad=no',
        url: 'http://www.ftchinese.com/channel/opinion.html?webview=ftcapp',
        screenName: 'homepage/opinion',
        coverTheme: 'Opinion'
    },
    {
        title: '专栏',
        listapi: 'https://www.ftchinese.com/channel/column.html?webview=ftcapp&bodyonly=yes&ad=no',
        url: 'http://www.ftchinese.com/channel/column.html?webview=ftcapp',
        screenName: 'homepage/column',
        coverTheme: 'Opinion'
    },
    {
        title: '金融市场',
        listapi: 'https://www.ftchinese.com/channel/markets.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/markets.html?webview=ftcapp',
        screenName: 'homepage/markets',
        coverTheme: 'OutOfBox'
    },
    {
        title: '商业',
        listapi: 'https://www.ftchinese.com/channel/business.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/business.html?webview=ftcapp',
        screenName: 'homepage/business',
        coverTheme: 'OutOfBox'
    },
    {
        title: '经济',
        listapi: 'https://www.ftchinese.com/channel/economy.html?webview=ftcapp&bodyonly=yes&001',
        url: 'http://www.ftchinese.com/channel/economy.html?webview=ftcapp',
        screenName: 'homepage/economy',
        coverTheme: 'OutOfBox'
    },
    {
        title: '科技',
        listapi:
        'https://www.ftchinese.com/channel/technology.html?webview=ftcapp&bodyonly=yes&001',
        url: 'http://www.ftchinese.com/channel/technology.html?webview=ftcapp',
        screenName: 'homepage/technology',
        coverTheme: 'OutOfBox'
    },
    {
        title: '教育',
        listapi:
        'https://www.ftchinese.com/channel/education.html?webview=ftcapp&bodyonly=yes&001',
        url: 'http://www.ftchinese.com/channel/education.html?webview=ftcapp',
        screenName: 'homepage/education',
        coverTheme: 'OutOfBox'
    },
    {
        title: '管理',
        listapi: 'https://www.ftchinese.com/channel/management.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/management.html?webview=ftcapp',
        screenName: 'homepage/management',
        coverTheme: 'Blue'
    },
    {
        title: '生活时尚',
        listapi: 'https://www.ftchinese.com/channel/lifestyle.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/lifestyle.html?webview=ftcapp',
        screenName: 'homepage/lifestyle',
        compactLayout: 'OutOfBox',
        coverTheme: 'OutOfBox-LifeStyle'
    },
    {
        title: '特别报导',
        listapi:
        'https://www.ftchinese.com/channel/special.html?webview=ftcapp&bodyonly=yes&ad=no&001',
        url: 'http://www.ftchinese.com/channel/special.html?webview=ftcapp&ad=no&keeplinks=yes',
        screenName: 'homepage/special',
        coverTheme: 'Opinion'
    },
    {
        title: '热门文章',
        listapi: 'https://www.ftchinese.com/channel/weekly.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/weekly.html?webview=ftcapp',
        compactLayout: 'OutOfBox',
        regularLayout: '',
        coverTheme: 'OutOfBox',
        screenName: 'homepage/mostpopular'
    },
    {
        title: '换脑ReWired',
        listapi: 'https://www.ftchinese.com/channel/rewired.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/rewired.html?webview=ftcapp',
        screenName: 'homepage/rewired',
        compactLayout: 'OutOfBox',
        coverTheme: 'OutOfBox'
    },
    {
        title: '艺术及文化活动',
        listapi:
        'https://www.ftchinese.com/channel/art_culture.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/art_culture.html?webview=ftcapp',
        screenName: 'homepage/art_culture',
        compactLayout: 'OutOfBox',
        coverTheme: 'OutOfBox'
    },
    {
        title: '会议活动',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=events&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/events/event.html?webview=ftcapp',
        screenName: 'homepage/events'
    },
    {
        title: '文章收藏',
        frame: '/saved_content',
        screenName: 'homepage/saved_content',
    },
    // {
    //     title: 'FT电子书',
    //     type: 'iap',
    //     subtype: 'ebook',
    //     compactLayout: 'books',
    //     screenName: 'homepage/ebook'
    // }
    ]
},

English: {
    title: '每日英语',
    navColor: '#FFFFFF',
    navBackGroundColor: '#a84358',
    isNavLightContent: true,
    navRightItem: 'Search',
    navLeftItem: 'Chat',
    intent: 'DailyEnglish',
    Channels: [
    {
        title: '最新',
        listapi:
        'https://www.ftchinese.com/channel/english.html?webview=ftcapp&bodyonly=yes&backupfile=dailyenglishbackup&001',
        url: 'http://www.ftchinese.com/channel/english.html?webview=ftcapp',
        screenName: 'english',
        coverTheme: '',
        teaser: '好好学习，天天向上'
    },
    {
        title: '英语电台',
        listapi: 'https://www.ftchinese.com/channel/radio.html?webview=ftcapp&bodyonly=yes&001',
        url: 'http://www.ftchinese.com/channel/radio.html?webview=ftcapp',
        screenName: 'english/radio',
        coverTheme: '',
        teaser: '英语听力训练利器'
    },
    {
        title: '金融英语速读',
        listapi: 'https://www.ftchinese.com/channel/speedread.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/speedread.html?webview=ftcapp',
        screenName: 'english/speedread',
        coverTheme: '',
        teaser: '英语阅读提分神器'
    },
    {
        title: '音乐之生',
        listapi:
        'https://www.ftchinese.com/channel/lifeofasong.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/lifeofasong.html?webview=ftcapp',
        screenName: 'english/lifeofasong',
        coverTheme: '',
        teaser: '欣赏音乐，学习英语，一举两得'
    },
    {
        title: '麦可林学英语',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=learnenglish&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/corp/preview.html?pageid=learnenglish&webview=ftcapp',
        screenName: 'english/learnenglish',
        coverTheme: ''
    },
    {
        title: '双语阅读',
        listapi: 'https://www.ftchinese.com/channel/ce.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/ce.html?webview=ftcapp',
        screenName: 'english/read',
        coverTheme: ''
    },
    {
        title: '每日一词',
        listapi:
        'https://www.ftchinese.com/channel/dailyword.html?webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/dailyword.html?webview=ftcapp',
        screenName: 'english/dailyword',
        coverTheme: ''
    },
    {
        title: '原声视频',
        listapi: 'https://www.ftchinese.com/channel/ev.html?webview=ftcapp&bodyonly=yes&001',
        url: 'http://www.ftchinese.com/channel/ev.html?webview=ftcapp',
        screenName: 'english/video',
        coverTheme: ''
    }
    ]
},

Academy: {
    title: 'FT商学院',
    navColor: '#FFFFFF',
    navBackGroundColor: '#057b93',
    isNavLightContent: true,
    navLeftItem: 'Chat',
    navRightItem: 'Search',
    intent: 'FTAcademy',
    Channels: [
    {
        title: '最新',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=mba&webview=ftcapp&bodyonly=yes&backupfile=mbabackup',
        url: 'http://www.ftchinese.com/channel/mba.html?webview=ftcapp',
        screenName: 'ftacademy/mba',
        compactLayout: 'OutOfBox',
        coverTheme: 'OutOfBox'
    },
    {
        title: '深度阅读',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=mbaindepth&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/channel/mba.html?webview=ftcapp',
        screenName: 'ftacademy/read',
        compactLayout: 'OutOfBox',
        coverTheme: 'OutOfBox'
    },
    {
        title: '视频',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=mbavideos&webview=ftcapp&bodyonly=yes',
        url: 'https://www.ftchinese.com/m/corp/preview.html?pageid=mbavideo&webview=ftcapp',
        screenName: 'ftacademy/video',
        coverTheme: ''
    }
    ]
},

Video: {
    title: '视•听',
    navColor: '#FFFFFF',
    navBackGroundColor: '#008280',
    isNavLightContent: true,
    navRightItem: 'Audio',
    navLeftItem: 'Chat',
    intent: 'VideoAudio',
    Channels: [
    {
        title: '最新',
        listapi:
        'https://www.ftchinese.com/channel/audiovideo.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/audiovideo.html?webview=ftcapp',
        coverTheme: 'Video',
        compactLayout: 'Video',
        screenName: 'audiovideo'
    },
    {
        title: '高端视点',
        listapi:
        'https://www.ftchinese.com/channel/viewtop.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/viewtop.html?webview=ftcapp&norepeat=no',
        screenName: 'video/viewtop',
        coverTheme: 'Video',
        compactLayout: 'Video'
    },
    {
        title: 'i听粉',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=iTF&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/corp/preview.html?pageid=iTF&webview=ftcapp',
        screenName: 'audio/iTF',
        coverTheme: ''
    },
    {
        title: '一波好书',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=yibohaoshu&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/corp/preview.html?pageid=yibohaoshu&webview=ftcapp',
        screenName: 'audio/yibohaoshu',
        coverTheme: ''
    },
    {
        title: '麦可林学英语',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=learnenglish&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/corp/preview.html?pageid=learnenglish&webview=ftcapp',
        screenName: 'audio/learnenglish',
        coverTheme: ''
    },
    {
        title: '秒懂',
        listapi:
        'https://www.ftchinese.com/channel/explainer.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/explainer.html?webview=ftcapp',
        screenName: 'video/business',
        coverTheme: 'Video',
        compactLayout: 'Video'
    },
    {
        title: 'FT看见',
        listapi:
        'https://www.ftchinese.com/channel/vfeatures.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/vfeatures.html?webview=ftcapp',
        screenName: 'video/features',
        coverTheme: 'Video',
        compactLayout: 'Video'
    },
    {
        title: '有色眼镜',
        listapi:
        'https://www.ftchinese.com/channel/videotinted.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/videotinted.html?webview=ftcapp',
        screenName: 'video/tinted',
        coverTheme: 'Video',
        compactLayout: 'Video'
    },
    {
        title: 'BoomEar艺术播客',
        listapi:
        'https://www.ftchinese.com/m/corp/preview.html?pageid=boomear&webview=ftcapp&bodyonly=yes',
        url: 'http://www.ftchinese.com/m/corp/preview.html?pageid=boomear&webview=ftcapp',
        screenName: 'audio/boomear',
        coverTheme: ''
    }
    ]
},

MyFT: {
    title: '我的FT',
    navColor: '#FFFFFF',
    navBackGroundColor: '#5a8caf',
    isNavLightContent: true,
    navRightItem: 'Search',
    navLeftItem: 'Chat',
    intent: 'CustomerService',
    Channels: [
    { title: '账户', frame: '/myaccount'},
    { title: '会员订阅', frame: '/subscription'},
    {
        title: '关注',
        listapi: 'http://www.ftchinese.com/channel/myftfollow.html?webview=ftcapp&bodyonly=yes',
        screenName: 'channel/myftfollow.html',
    },
    // { title: '已读', type: 'read', screenName: 'myft/read', compactLayout: '' },
    {
        title: '收藏',
        frame: '/saved_content',
        screenName: 'myft/saved_content',
    },
    { title: '设置', type: 'setting'},

    // { title: '消息', type: 'notifications', screenName: 'myft/notifications', compactLayout: '' },
    // {
    //     title: '已购电子书',
    //     type: 'iap',
    //     subtype: 'ebook',
    //     compactLayout: 'books',
    //     screenName: 'myft/ebook',
    //     include: 'purchased'
    // },
    // {
    //     title: '已购单品',
    //     listapi:
    //     'https://www.ftchinese.com/channel/myproducts.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
    //     url: 'http://www.ftchinese.com/channel/myproducts.html?webview=ftcapp',
    //     screenName: 'myft/myproducts'
    // },
    // {
    //     title: 'FT商城',
    //     url: 'https://h5.youzan.com/v2/showcase/homepage?alias=16e315o1t',
    //     doNotConvert: 'yes',
    //     screenName: 'myft/shop'
    // }
    ]
}
};


const appTypeMap = {
  'setting': [
    {
      'title': '订阅服务',
      'type': 'Group',
      'items': [
        {
          'headline': '我的订阅',
          'url': '/subscription'
        },
        {
          'headline': '客服',
          'url': '/m/corp/subscriber.html'
        }
      ]
    },
    {
      'title': '阅读偏好',
      'type': 'Group',
      'items': [
        {
          'id': 'font-setting',
          'headline': '字号设置',
          'type': 'setting'
        },
        {
          'id': 'language-preference',
          'headline': '语言偏好',
          'type': 'setting'
        },
        {
          'id': 'audio-preference',
          'headline': '语音偏好',
          'type': 'setting'
        },
        {
          'id': 'dark-mode',
          'headline': '深色模式',
          'type': 'setting'
        }
      ]
    },
    {
      'title': '流量与缓存',
      'type': 'Group',
      'items': [
        {
          'id': 'clear-cache',
          'headline': '清除缓存',
          'type': 'setting'
        },
        {
          'id': 'no-image-with-data',
          'headline': '使用数据时不下载图片',
          'type': 'setting'
        }
      ]
    },
    {
      'title': '服务与反馈',
      'type': 'Group',
      'items': [
        {
          'id': 'feedback',
          'headline': '反馈',
          'type': 'setting'
        },
        {
          'id': 'app-store',
          'headline': 'App Store评分',
          'type': 'setting'
        },
        {
          'id': 'privacy',
          'headline': '隐私协议',
          'type': 'setting'
        },
        {
          'id': 'about',
          'headline': '关于我们',
          'type': 'setting'
        },
        {
          'id': 'chat-customer-service',
          'headline': '常见问题',
          'type': 'setting'
        }
      ]
    },
    {
      'title': '诊断',
      'type': 'Group',
      'items': [
        {
          'id': 'ios-receipt',
          'headline': '购买信息诊断',
          'type': 'setting'
        },
        {
          'id': 'developer-info',
          'headline': '开发者诊断',
          'type': 'setting'
        }
      ]
    }
  ]
};

window.preferredLanguage = navigator.language;

async function renderSection(name) {
    try {
        renderBottomBar(name);
        const channels = appMap?.[name]?.Channels ?? [];
        let navHTML = '';
        for (let [index, channel] of channels.entries()) {
            channel.index = index;
            const title = channel?.title;
            if (!title) {continue;}
            navHTML += `<div class="app-channel" data-index=${index} data-section="${name}">${title}</div>`;
        }
        document.getElementById('app-nav').innerHTML = navHTML;
        await renderChannel(channels?.[0]);
    } catch(err) {
        console.error(`render section error:`, err);
    }
}

function renderBottomBar(name) {
    const bottomDom = document.getElementById('app-bottom');
    if (!bottomDom) {return;}
    if (bottomDom.innerHTML === '') {
        let bottomHTML = '';
        for (const key of Object.keys(appMap)) {
            const iconClass = `app-icon-${key.toLowerCase()}`;
            const title = appMap?.[key]?.icon_title ?? appMap?.[key]?.title ?? '';
            bottomHTML += `<div class="app-icon-container" data-section="${key}"><div class="app-icon ${iconClass}"></div><div class="icon-title">${title}</div></div>`;
        }
        bottomDom.innerHTML = bottomHTML;
    }
    for (let iconContainer of document.querySelectorAll('.app-bottom > div')) {
        const sectionName = iconContainer.getAttribute('data-section');
        iconContainer.classList.toggle('dim', name !== sectionName);
    }
}

function getRelativeLink(input) {
  try {
    const parsed = new URL(input);
    return parsed.pathname + parsed.search;
  } catch (err) {
    // console.error("Invalid URL:", err.message);
    return null; // or return input if you want to keep it as-is
  }
}

function markUrlForPagination(targetDom, urlString) {
    if (!urlString) {return;}
    let paginationEle = targetDom?.querySelector('.pagination-inner');
    if (!paginationEle) {return;}
    paginationEle.setAttribute('data-page-url', urlString);



}

function markReadContent(targetDom) {
  try {
    const ftcreadids = localStorage.getItem('ftcreadids') ?? '[]';
    const ftcreadKeys = JSON.parse(ftcreadids);
    const readids = localStorage.getItem('readids') ?? '[]';
    const readKeys = JSON.parse(readids);
    let itemContainers = targetDom.querySelectorAll('.item-container');
    for (const itemContainer of itemContainers) {
      const type = itemContainer.getAttribute('data-type');
      const id = itemContainer.getAttribute('data-id');
      if (type && id) {
        const typeMap = {premium: 'story'};
        const finalType = typeMap?.[type] ?? type;
        const key = finalType + id;
        if (ftcreadKeys.includes(key)) {
          itemContainer.classList.add('visited');
          continue;
        }
      }
      if (id && readKeys.includes(id)) {

        itemContainer.classList.add('visited');
      }
    }
  } catch(err) {
    console.error(`markReadContent error:`, err);
  }
}



async function renderChannel(channel) {
    try {

        pushHistory('channel', channel);
        const index = channel?.index ?? 0;
        // const title = channel?.title ?? '';
        // console.log(`render ${index}: ${title}`);
        const navDoms = document.querySelectorAll('.app-nav div');
        for (let navDom of navDoms) {
            const navIndex = parseInt(navDom.getAttribute('data-index', 10));
            navDom.classList.toggle('on', index === navIndex);
        }
        const currentNavDom = navDoms[index];
        currentNavDom.scrollIntoView({
            behavior: 'smooth',       // enables smooth scrolling
            inline: 'center',         // centers horizontally in scrollable container
            block: 'nearest'          // prevents unnecessary vertical scrolling
        });
        let targetDom = document.getElementById('app-main-content');
        let listapi = getRelativeLink(channel?.listapi);
        // console.log(`list api now:`, listapi);
        if (listapi && window.isFrontEndTest) {
            listapi = `/api/page/app_home.html`;
        }
        targetDom.innerHTML = `<div class="app-loading"><div class="spinner"></div></div>`;
        targetDom.setAttribute('data-rendering-url', listapi);
        const type = channel.type;
        const iframeUrl = channel.frame;

        // console.log(`channel:`, channel, 'iframe url:', iframeUrl);
        // Fire this without waiting for the result
        if (typeof checkUserLogin === 'function') {
          checkUserLogin();
        }

        if (listapi) {
            // console.log(`render the list api: ${listapi}`);
            // First request (or re-request if you call it again)
            const response = await fetch(listapi);
            const renderingUrl = targetDom.getAttribute('data-rendering-url');
            if (listapi !== renderingUrl) {
              console.log(`the dom is not expecting ${listapi} any more! `);
              return;
            }
            if (!response.ok) {
                return;
            }
            // Get the raw text of the response
            const text = await response.text();
            targetDom.innerHTML = text;
            targetDom.setAttribute('data-url', listapi);
            markUrlForPagination(targetDom, listapi);
            markReadContent(targetDom);
            handleChannelUpdates();
        } else if (iframeUrl) {
            targetDom.innerHTML = '';
            targetDom.removeAttribute('data-rendering-url');
            loadIframe(targetDom, iframeUrl);
        } else if (type){
            const sections = appTypeMap[type];
            targetDom.removeAttribute('data-rendering-url');
            if (!sections) {
                console.log(`No data found for the type ${type}`, channel);
                return;
            }
            targetDom.innerHTML = generateHTMLFromData(sections);
        }
        
    } catch(err) {
        console.error(`render channel error: `, err);
    }
}

function generateHTMLFromData(sections) {
  if (!Array.isArray(sections)) {
    return '';
  }

  let html = '';

  for (const section of sections) {
    const title = section.title || '';
    const items = Array.isArray(section.items) ? section.items : [];

    let itemsHTML = '';
    for (const item of items) {
      const headline = item.headline || '';
      const id = item.id || '';
      const type = item.type || '';
      const url = item.url || '';

      if (url) {
        itemsHTML += `<a class="settings-item" href="${url}">${headline}</a>`;
      } else {
        itemsHTML += `<li class="settings-item"><button class="settings-button" type="button" data-id="${id}" data-type="${type}">${headline}</button></li>`;
      }
    }

    html += `<section class="settings-group">${title ? `<h2 class="settings-title">${title}</h2>` : ''}<ul class="settings-items">${itemsHTML}</ul></section>`;
  }

  return `<div class="settings-container">${html}</div>`;
}


// After the channel dom is updated, we need to execute some tasks including loading images, refresh ads etc...
async function handleChannelUpdates() {
    try {
        runLoadImages();
        refreshAllAds();
        renderPaginationHTML();

        // TODO: other things such as sending a page view count, render calendar for the home page, render the promo box etc...
    } catch(err) {
        console.error(`handleChannelUpdates error:`, err);
    }
}

async function refreshAllAds() {
    try {
        document.querySelectorAll('.o-ads').forEach(el => el.remove());
    } catch(err) {
        console.error(`refreshAllAds error:`, err);
    }
}


function getPathWithWebviewParams(link, extraParams) {
  try {
    const u = new URL(link, window.location.href); // handles absolute/relative/protocol-relative

    // required params
    u.searchParams.set('webview', 'ftcapp');
    u.searchParams.set('bodyonly', 'yes');

    // optional extras (overwrites existing keys)
    if (extraParams && typeof extraParams === 'object') {
      for (const [k, v] of Object.entries(extraParams)) {
        u.searchParams.set(k, String(v));
      }
    }

    // return only path + query (no origin, no hash)
    return u.pathname + (u.search || '');
  } catch (e) {
    return '';
  }
}


function handleLink(ele) {

    const link = getPathWithWebviewParams(ele.href);
    const title = ele?.innerText ?? '';
    // Return true if this link was handled here, false if browser should handle
    if (/p=[\d]/gi.test(link)) {
        // handlePageData({link, title});
        handlePaginationReload(ele, {link, title});
        return true;
    } else if (/^\/(tag|m\/corp|m\/marketing|channel|archive|archiver)\//gi.test(link)) {
        handlePageData({link, title});
        return true;
    }  else if (/^\/(subscription)/gi.test(link)) {
        handleSeamlessFrame({link, title});
        return true;//
    } else if (/\/(story|premium|interactive|content|video)/gi.test(link)) {
        const u = new URL(link, window.location.href);
        const segments = u.pathname.split('/').filter(Boolean);
        const allowed = new Set(['story', 'premium', 'interactive', 'content', 'video']);
        const idx = segments.findIndex(s => allowed.has(s.toLowerCase()));
        const type = idx !== -1 ? segments[idx].toLowerCase() : '';
        const id = idx !== -1 ? (segments[idx + 1] || '') : '';
        const subtype = u.searchParams.get('subtype') || '';
        const data = {
            id,
            type,
            ...subtype && {subtype}
        };
        handleContentData(data);
        const itemContainer = ele?.closest('.item-container');
        if (itemContainer) {
          itemContainer.classList.add('visited');
        }
        return true;
    }
    // return true when testing so that when I click, the browser won't go to the link
    return false;
}


async function handlePageData(data) {
  try {
    const { link, title } = data;
    const appDetailEle = document.createElement('div');
    appDetailEle.className = 'app-detail-view';
    appDetailEle.innerHTML = `
      <div class="app-detail-navigation">
        <div class="app-detail-back"></div>
        <div class="app-detail-title">${title}</div>
        <div class="app-detail-share"></div>
      </div>
      <div class="app-detail-content api-detail-content-page"></div>
    `;
    const stackDepth = document.querySelectorAll('.app-detail-view').length;
    appDetailEle.style.zIndex = String(2 + stackDepth);
    document.body.appendChild(appDetailEle);
    void appDetailEle.offsetHeight;
    appDetailEle.classList.add('on');

    // Build URL robustly (preserves existing params/fragments)
    let urlString;
    if (window.isFrontEndTest) {
      urlString = '/api/page/app_home.html';
    } else {
      if (typeof URL === 'function') {
        const u = new URL(link, window.location.href); // supports relative links
        u.searchParams.set('webview', 'ftcapp');
        u.searchParams.set('bodyonly', 'yes');
        urlString = u.toString();
      } else {
        // Very old browsers fallback: append safely
        var sep = (link.indexOf('?') === -1) ? '?' : '&';
        urlString = link + sep + 'webview=ftcapp&bodyonly=yes';
      }
    }

    const contentEl = appDetailEle.querySelector('.app-detail-content');
    const response = await fetch(urlString);
    if (!response.ok) { return; }
    const html = await response.text();
    contentEl.innerHTML = html;


    markUrlForPagination(contentEl, urlString);
    markReadContent(contentEl);

    // Kick lazy media loader for newly injected content
    if (typeof runLoadImages === 'function') {
      runLoadImages();
    }
  } catch (err) {
    console.error('handle content data error:', err);
  }
}

async function handleSeamlessFrame(data) {
  try {
    const { link, title } = data;
    const appDetailEle = document.createElement('div');
    appDetailEle.className = 'app-detail-view';
    appDetailEle.innerHTML = `
      <div class="app-detail-navigation">
        <div class="app-detail-back"></div>
        <div class="app-detail-title">${title}</div>
        <div class="app-detail-share"></div>
      </div>
      <div class="app-detail-content api-detail-content-page"></div>
    `;
    const stackDepth = document.querySelectorAll('.app-detail-view').length;
    appDetailEle.style.zIndex = String(2 + stackDepth);
    document.body.appendChild(appDetailEle);
    void appDetailEle.offsetHeight;
    appDetailEle.classList.add('on');

    // Build URL robustly
    let urlString;
    if (window.isFrontEndTest) {
      urlString = '/api/page/app_home.html';
    } else {
      if (typeof URL === 'function') {
        const u = new URL(link, window.location.href);
        u.searchParams.set('source', 'webapp');
        urlString = u.toString();
      } else {
        const sep = (link.indexOf('?') === -1) ? '?' : '&';
        urlString = link + sep + 'source=webapp';
      }
    }

    const contentEl = appDetailEle.querySelector('.app-detail-content');
    loadIframe(contentEl, urlString);

  } catch (err) {
    console.error('handle content data error:', err);
  }
}


// --- helper: safe viewport height (handles iOS toolbars better) ---
function getViewportHeight() {
  try {
    if (window.visualViewport && typeof window.visualViewport.height === 'number') {
      return Math.floor(window.visualViewport.height);
    }
  } catch (_) {}
  return Math.floor(window.innerHeight || 0);
}

// --- helper: compute available height for the iframe ---
function computeIframeHeight(contentEl) {
  // contentEl is .app-detail-content (the container we append the iframe into)
  const overlay = contentEl.closest('.app-detail-view');
  const header = overlay ? overlay.querySelector('.app-detail-navigation') : null;
  const bottomBar = document.getElementById('app-bottom'); // your global bottom bar

  const vh = getViewportHeight();

  const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
  // only subtract bottom bar if it’s rendered/visible
  const bottomH = (bottomBar && bottomBar.offsetParent !== null) ?
    Math.ceil(bottomBar.getBoundingClientRect().height) :
    0;


  // Optional container paddings (kept minimal/safe)
  const cs = getComputedStyle(contentEl);
  const padT = parseInt(cs.paddingTop, 10) || 0;
  const padB = parseInt(cs.paddingBottom, 10) || 0;

  // Guard against negatives
  return Math.max(0, vh - headerH - bottomH - padT - padB);
}

function loadIframe(contentEl, urlString, options) {
  const opts = options || {};
  const iframe = document.createElement('iframe');

  iframe.src = urlString;
  iframe.style.width = '100%';
  iframe.style.display = 'block';
  iframe.style.border = 'none';
  iframe.style.overflowY = 'auto';           // key: let iframe scroll itself
  iframe.removeAttribute('scrolling');       // ensure not forced to "no"
  iframe.setAttribute('allowtransparency', 'true');
  iframe.setAttribute('frameborder', '0');

  contentEl.innerHTML = '';
  contentEl.appendChild(iframe);

  // size once + on viewport changes
  const sizeNow = () => {
    try {
      iframe.style.height = computeIframeHeight(contentEl) + 'px';
    } catch (_) {}
  };

  sizeNow();

  // keep height in sync with viewport changes (keyboard, rotation, resize)
  const onResize = () => sizeNow();
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  if (window.visualViewport && typeof window.visualViewport.addEventListener === 'function') {
    window.visualViewport.addEventListener('resize', onResize);
  }

  // optional cleanup hook if you remove .app-detail-view dynamically
  // (call this before removing the element)
  iframe.__cleanup = () => {
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
    if (window.visualViewport && typeof window.visualViewport.removeEventListener === 'function') {
      window.visualViewport.removeEventListener('resize', onResize);
    }
  };

  iframe.onload = function () {
    // Same-origin niceties preserved
    try {
      const win = iframe.contentWindow;
      const doc = win && win.document;
      if (!doc) { return; }

      if (opts.hideChrome !== false && !doc.body.classList.contains('iframe-cleaned')) {
        const hideElements = doc.querySelectorAll('.header-container, .footer-container');
        let i = 0;
        while (i < hideElements.length) {
          hideElements[i].style.display = 'none';
          i += 1;
        }
        doc.body.classList.add('iframe-cleaned');
        if (!doc.body.style.paddingBottom) {
          doc.body.style.paddingBottom = '44px';
        }
      }

      if (opts.wireNav !== false) {
        tryWireIframeNavigation(iframe);
      }
    } catch (_) {
      // cross-origin: fine
    }

    // after load, recalc (fonts/assets may change header height)
    sizeNow();
  };
}


// function loadIframe(contentEl, urlString) {

//   var iframe = document.createElement('iframe');
//   iframe.src = urlString;
//   iframe.style.width = '100%';
//   iframe.style.border = 'none';
//   iframe.style.overflow = 'hidden';
//   iframe.style.display = 'block';
//   iframe.setAttribute('scrolling', 'no');
//   iframe.setAttribute('allowtransparency', 'true');
//   iframe.setAttribute('frameborder', '0');
//   contentEl.appendChild(iframe);

//   function tidyUpIframe() {
//     try {
//       let win = iframe.contentWindow;
//       let doc = win && win.document;
//       if (!doc) { return; }

//       // Hide chrome (once)
//       if (!doc.body.classList.contains('iframe-cleaned')) {
//         let hideElements = doc.querySelectorAll('.header-container, .footer-container');
//         for (var i = 0; i < hideElements.length; i += 1) {
//           hideElements[i].style.display = 'none';
//         }
//         doc.body.classList.add('iframe-cleaned');
//         doc.body.style.paddingBottom = '44px';
//       }

//       // Defer measurement to next frame
//       win.requestAnimationFrame(function () {
//         try {
//           var h = doc.documentElement.scrollHeight;
//           iframe.style.height = String(h) + 'px';
//         } catch (err1) {
//           // swallow
//         }
//       });

//       // Wire navigation interception (same-origin only)
//       tryWireIframeNavigation(iframe);
//     } catch (err) {
//       // Cross-origin or timing issues — ignore silently (you said only same-origin is needed).
//     }
//   }

//   iframe.onload = function () {
//     tidyUpIframe();

//     try {
//       var win = iframe.contentWindow;
//       var doc = win && win.document;
//       if (doc) {
//         var observer = new win.MutationObserver(tidyUpIframe);
//         observer.observe(doc.body, { childList: true, subtree: true, attributes: true });
//         win.addEventListener('resize', tidyUpIframe);
//       }
//     } catch (err) {
//       // Ignore if observer cannot be attached.
//     }
//   };
// }

/**
 * Same-origin only: delegate clicks on <a href> inside the iframe
 * and route them through the parent's handleLink(). If handled,
 * prevent the iframe's default navigation.
 */
function tryWireIframeNavigation(iframe) {
  'use strict';

  try {
    var win = iframe.contentWindow;
    var doc = win && win.document;
    if (!doc) { return; }

    if (doc.__IFRAME_NAV_WIRED__) { return; }
    doc.__IFRAME_NAV_WIRED__ = true;

    doc.addEventListener('click', function (e) {
      try {
        var target = e.target;
        if (!target || typeof target.closest !== 'function') { return; }

        var anchor = target.closest('a[href]');
        if (!anchor) { return; }

        // Reuse existing parent router
        var handled = false;
        if (window.parent && typeof window.parent.handleLink === 'function') {
          handled = window.parent.handleLink(anchor) === true;
        }

        if (handled) {
          e.preventDefault();
          e.stopImmediatePropagation();
          e.stopPropagation();
        }
      } catch (err) {
        // Swallow any per-click issues to avoid breaking page interactions.
      }
    }, true);
  } catch (errOuter) {
    // If this throws, it's likely not same-origin; do nothing.
  }
}


async function handlePaginationReload(ele, data) {
  try {
    const { link, title } = data;

    const pageEle = ele?.closest('[data-url]');

    if (!pageEle) {return;}



    // Build URL robustly (preserves existing params/fragments)
    let urlString;
    let p = 1;
    if (window.isFrontEndTest) {
      urlString = '/api/page/app_home.html';
    } else {
      if (typeof URL === 'function') {
        const u = new URL(link, window.location.href); // supports relative links
        u.searchParams.set('webview', 'ftcapp');
        u.searchParams.set('bodyonly', 'yes');
        urlString = u.toString();
        p = u.searchParams.get('p');
      } else {
        // Very old browsers fallback: append safely
        var sep = (link.indexOf('?') === -1) ? '?' : '&';
        urlString = link + sep + 'webview=ftcapp&bodyonly=yes';
      }
    }

    const status = p === '1' ? '' : `<p>加载第${p}页...</p>`;
    pageEle.innerHTML = `<div class="app-loading">
        <div class="spinner"></div>
        <div class="status">${status}</div>
    </div>`;

    const response = await fetch(urlString);
    if (!response.ok) { return; }
    const html = await response.text();
    pageEle.innerHTML = html;

    let titleEle = pageEle.querySelector('.app-detail-title');
    if (titleEle) {
        titleEle.innerHTML = title;
    }
    pageEle.setAttribute('data-url', urlString);
    markUrlForPagination(pageEle, urlString);
    markReadContent(pageEle);
    handleChannelUpdates();

    // Kick lazy media loader for newly injected content
    if (typeof runLoadImages === 'function') {
      runLoadImages();
    }
  } catch (err) {
    console.error('handle content data error:', err);
  }
}

async function handleContentData(data) {
  try {
    const {id = '', type} = data;
    if (!type || !id) {return;}

    // Create a fresh detail-view layer and append to body (stackable)
    const appDetailEle = document.createElement('div');
    appDetailEle.className = 'app-detail-view';
    appDetailEle.innerHTML = `
        <div class="app-detail-navigation">
            <div class="app-detail-back"></div>
            <div class="app-detail-language-switch"></div>
            <div class="app-detail-audio"></div>
        </div>
        <div class="app-detail-content"></div>
        <div class="app-detail-bottom"></div>`;

    // Optional: bump z-index per stack depth so newer views sit on top
    const stackDepth = document.querySelectorAll('.app-detail-view').length;
    appDetailEle.style.zIndex = String(2 + stackDepth);

    document.body.appendChild(appDetailEle);

    // -------- 11) Transition & initializers --------
    // reflow to ensure transition
    // eslint-disable-next-line no-unused-expressions
    void appDetailEle.offsetHeight;
    appDetailEle.classList.add('on');

    const typeMap = {premium: 'story'};
    const contentType = typeMap[type] ?? type;
    window.type = contentType;
    window.id = id;
    let url = `/api/${contentType}/${id}`;
    if (window.isFrontEndTest) {
        url = '/api/page/app_content.json';
    }
    const response = await fetch(url);
    if (!response.ok) {return;}
    // Get the raw text of the response
    const info = await response.json();
    await renderContentPage(info, appDetailEle);
  } catch (err) {
    console.error('handle content data error:', err);
  }
}

function renderPaginationHTML() {
    let paginationEles = document.querySelectorAll('.pagination-inner[data-max-page-index]');
    for (let paginationEle of paginationEles) {
        const maxIndex = parseInt(paginationEle.getAttribute('data-max-page-index'), 10) ?? 0;
        if (maxIndex === 0) {continue;}
        var currentIndex = parseInt(paginationEle.getAttribute('data-page-index'), 10) ?? 1;
        var indexLength = (w && w > 490) ? 10 : 5;
        var startIndex = Math.max(1, currentIndex - Math.floor(indexLength / 2));
        var endIndex = startIndex + indexLength - 1;
        if (endIndex > maxIndex) {
          endIndex = maxIndex;
          startIndex = Math.max(1, endIndex - indexLength + 1);
        }
        var currentHTML = '';
        const dataUrl = paginationEle?.closest('[data-url]')?.getAttribute('data-url');
        // console.log(`data url:`, dataUrl);
        if (!dataUrl) {continue;}

        var currentUrl = dataUrl.replace(/p=[0-9]+/g, '');
        var connector = (currentUrl.indexOf('?') >= 0) ? '&' : '?';
        currentUrl = currentUrl + connector;
        currentUrl = currentUrl.replace(/\?&/g, '?').replace(/&+/g, '&');
        for (var i = startIndex; i <= endIndex; i++) {
            if (i === currentIndex) {
                currentHTML += '<span class="current">' + i + '</span>';
            } else {
                currentHTML += '<a href="' + currentUrl + 'p=' + i + '">' + i + '</a>';
            }
        }
        var nextIndex = currentIndex + 1;
        if (nextIndex <= maxIndex) {
          currentHTML += '<a href="' + currentUrl + 'p=' + nextIndex + '">&rsaquo;&rsaquo;下一页</a>';
        }
        if (endIndex < maxIndex) {
          currentHTML += '<a href="' + currentUrl + 'p=' + maxIndex + '">&rsaquo;|</a>';
        }
        var prevIndex = currentIndex - 1;
        if (prevIndex >= 1) {
          currentHTML = '<a href="' + currentUrl + 'p=' + prevIndex + '">上一页&lsaquo;&lsaquo;</a>' + currentHTML;
        }
        if (startIndex > 1) {
          currentHTML = '<a href="' + currentUrl + 'p=1">|&lsaquo;</a>' + currentHTML;
        }
        paginationEle.innerHTML = currentHTML;
        paginationEle.removeAttribute('data-max-page-index');
        paginationEle.removeAttribute('data-page-index');
    }
}


function pushHistory(type, value) {
  // Step 0: Fallback defaults
  const safeType = typeof type === 'string' && type.trim() ? type.trim() : 'section';
  const safeValue = typeof value === 'string' && value.trim() ? value.trim() : 'home';

  // Step 1: Build safe base URL (no hash)
  const baseUrl = location.pathname + location.search;

  // Step 2: Encode and build hash params
  const hashParams = new URLSearchParams();
  hashParams.set('type', safeType);
  hashParams.set('value', safeValue);

  // Step 3: Construct and push new URL
  const newUrl = `${baseUrl}#${hashParams.toString()}`;
  history.pushState(null, '', newUrl);
}


delegate.on('click', '.app-icon-container', async function () {
    if (!this.classList?.contains('dim')) {return;}
    const section = this.getAttribute('data-section');
    await renderSection(section);
});

delegate.on('click', '.app-channel', async function () {
    if (this.classList?.contains('on')) {return;}
    const section = this.getAttribute('data-section');
    const index = parseInt(this.getAttribute('data-index'), 10);
    const channel = appMap?.[section]?.Channels?.[index];
    await renderChannel(channel);
});

delegate.on('click', '.item-container-app', async function (event) {
    try {
        if (event?.defaultPrevented || event?.target?.closest('a[href]')) {return;}
        this.classList.add('visited');
        const id = this.getAttribute('data-id');
        const type = this.getAttribute('data-type');
        // const subtype = this.getAttribute('data-sub-type');
        await handleContentData({id, type});
    } catch(err) {
        console.error(`render story error:`, err);
    }
});

delegate.on('click', 'a[href]', function (event) {
    const linkHandled = handleLink(this);
    if (!linkHandled) {
        return; // early exit = browser takes over
    }
    event.preventDefault();         // stop browser navigation
    event.stopImmediatePropagation();
});

renderSection('News');