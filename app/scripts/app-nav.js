
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

function markUrlForPagination(targetDom, urlString) {
    if (!urlString) {return;}
    let paginationEle = targetDom?.querySelector('.pagination-inner');
    if (!paginationEle) {return;}
    paginationEle.setAttribute('data-page-url', urlString);
}

async function renderChannel(channel) {
    try {
        const index = channel?.index;
        // const title = channel?.title ?? '';
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
        targetDom.innerHTML = `<div class="app-loading"><div class="spinner"></div></div>`;
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
            targetDom.setAttribute('data-url', listapi);
            markUrlForPagination(targetDom, listapi);
            handleChannelUpdates();
        } else {
            console.log(`not a list api, need to deal with it. `);
        }
    } catch(err) {
        console.error(`render channel error: `, err);
    }
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

    // Kick lazy media loader for newly injected content
    if (typeof runLoadImages === 'function') {
      runLoadImages();
    }
  } catch (err) {
    console.error('handle content data error:', err);
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
        const {id, type} = data;
        if (!id || !type) {return;}

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
            <div class="app-detail-bottom"></div>
        `;

        // Optional: bump z-index per stack depth so newer views sit on top
        const stackDepth = document.querySelectorAll('.app-detail-view').length;
        appDetailEle.style.zIndex = String(2 + stackDepth);

        document.body.appendChild(appDetailEle);

        // -------- 11) Transition & initializers --------
        // reflow to ensure transition
        // eslint-disable-next-line no-unused-expressions
        void appDetailEle.offsetHeight;
        appDetailEle.classList.add('on');

        // console.log(`Now we need to handle ${type} / ${id}`);

        const typeMap = {premium: 'story'};
        const contentType = typeMap[type] ?? type;
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
        console.log(`data url:`, dataUrl);
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