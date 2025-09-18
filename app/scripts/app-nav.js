
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
        type: 'clip',
        url: 'http://www.ftchinese.com/users/favstorylist?webview=ftcapp',
        screenName: 'myft',
        compactLayout: ''
    },
    {
        title: 'FT电子书',
        type: 'iap',
        subtype: 'ebook',
        compactLayout: 'books',
        screenName: 'homepage/ebook'
    }
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
    { title: '设置', type: 'setting', compactLayout: '', screenName: 'myft/preference' },
    {
        title: '会员订阅',
        type: 'iap',
        subtype: 'membership',
        compactLayout: 'books',
        screenName: 'membrership'
    },
    {
        title: '账户',
        type: 'account',
        url: 'http://www.ftchinese.com/users/setting/index',
        screenName: 'myft/account'
    },
    {
        title: '关注',
        type: 'follow',
        screenName: 'myft/follow',
        'Insert Content': '', // inject
        compactLayout: ''
    },
    { title: '已读', type: 'read', screenName: 'myft/read', compactLayout: '' },
    {
        title: '收藏',
        type: 'clip',
        url: 'http://www.ftchinese.com/users/favstorylist?webview=ftcapp',
        screenName: 'myft/favstorylist',
        compactLayout: ''
    },
    { title: '消息', type: 'notifications', screenName: 'myft/notifications', compactLayout: '' },
    {
        title: '已购电子书',
        type: 'iap',
        subtype: 'ebook',
        compactLayout: 'books',
        screenName: 'myft/ebook',
        include: 'purchased'
    },
    {
        title: '已购单品',
        listapi:
        'https://www.ftchinese.com/channel/myproducts.html?webview=ftcapp&bodyonly=yes&norepeat=yes',
        url: 'http://www.ftchinese.com/channel/myproducts.html?webview=ftcapp',
        screenName: 'myft/myproducts'
    },
    {
        title: 'FT商城',
        url: 'https://h5.youzan.com/v2/showcase/homepage?alias=16e315o1t',
        doNotConvert: 'yes',
        screenName: 'myft/shop'
    }
    ]
}
};

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

async function renderChannel(channel) {
    try {
        const index = channel?.index;
        const title = channel?.title ?? '';
        // console.log(`render ${index}: ${title}`);
        const navDoms = document.querySelectorAll('.app-nav div');
        for (let navDom of navDoms) {
            const navIndex = parseInt(navDom.getAttribute('data-index', 10));
            navDom.classList.toggle('on', index === navIndex);
        }
        let targetDom = document.getElementById('app-main-content');
        let listapi = getRelativeLink(channel?.listapi);
        // console.log(`list api now:`, listapi);
        if (listapi && window.isFrontEndTest) {
            listapi = `/api/page/app_home.html`;
        }
        targetDom.innerHTML = await convertChinese(`加载${title}...`);
        if (listapi) {
            // console.log(`render the list api: ${listapi}`);
            // First request (or re-request if you call it again)
            const response = await fetch(listapi);
            if (!response.ok) {
                return;
            }
            // Get the raw text of the response
            const text = await response.text();
            targetDom.innerHTML = text;
        } else {
            console.log(`not a list api, need to deal with it. `);
        }
    } catch(err) {
        console.error(`render channel error: `, err);
    }
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

renderSection('News');