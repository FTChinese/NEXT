
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
        targetDom.innerHTML = `<div class="app-loading"></div>`;
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

// function renderContentPage(info) {
//     console.log(info);
//     let appDetailEle = document.getElementById('app-detail-view');
//     appDetailEle.innerHTML = `
// <div class="story-hero-container <!--{Story-Header-Background}-->">
//     <div class="story-hero-inner">
//     <div class="story-hero-intro">
//     <div class="story-hero-intro-container">
//     <div class="story-hero-tag">{story-theme}</div>
//     <div class="story-hero-title">{story-headline}</div>
//     <div class="story-hero-content"><p>{story-lead}</p></div>
//     </div>
//     </div>
//     </div>
//     <div class="story-hero-image"><!--{story-image-no-container}--></div>
// </div>


// <div class="story-topper-container has-side"><div class="block-inner">
//     <div class="content-container"><div class="content-inner"><div class="story-container">
//     {story-theme}
//     <h1 class="story-headline">{story-headline}</h1>
//     <div class="story-lead">{story-lead}</div>
//     <div class="story-author">
//     {story-byline}
//     </div>
//     <div class="author-headshot"><!--{story-author-headcut}--></div>
//     </div></div></div>
//     <div class="clearfloat block-bottom"></div>
// </div></div>

// <div class="block-container has-side story-page">
//     <div class="block-inner">
//         <div class="content-container">
//             <div class="content-inner">
//                 <div class="story-container"{story-container-style}>
//                     <!--disclaimer-->
//                     <div class="story-topper">
//                         {story-theme}
//                         <h1 class="story-headline<!--{story-headline-class}-->" id="story-headline-ios">{story-headline}</h1>
//                         <div class="story-lead">{story-lead}</div>
//                         {story-image}
//                     </div>
//                     <div class="story-byline">
//                         <span class="story-time">{story-time}</span>
//                         <span class="story-author">{story-byline}</span>
//                     </div>
//                     <div class="story-body">
//                         <div id="ios-story-body">{story-body}</div>
//                         <div class="clearfloat"></div>
//                     </div>
//                     <div class="chat-talk"><div class="chat-talk-inner"><div id="story-quiz-container"></div></div></div>
//                     <div class="clearfloat block-bottom"></div>

//                     <!--DiscussContentWithAI-->
//                     {Bottom-Banner}

//                     <div class="{story-comments-container-class}">

//                         <div class="user_comments_container">
//                             <h2 class="box-title">
//                             <div class="comments-sort-container">
//                             <label>排序方式</label>
//                             <select class="commentsortby" id="commentsortby" data-id="{{id}}" data-type="{{type}}">
//                             <option value="1" selected>最新的在上方</option>
//                             <option value="2">最早的在上方</option>
//                             <option value="3">按热门程度</option>
//                             </select>
//                             </div>
//                             <a class="list-link" href="#">读者评论</a>
//                             </h2>
//                             <div id="allcomments" class="allcomments container"></div>
//                         </div>

//                         <div id="logincomment" class="logincomment">
//                             <form id="storyForm">
//                             <div class="comment-input-container">
//                             <div class=container>
//                             <div style="margin:5px 0;display:none;">
//                                 用户名：<span id="comment-user-name"></span>
//                                 <input type="checkbox" id="anonymous-checkbox" name="anonimous-checkbox" checked=true><label for="anonymous-checkbox">匿名发表</label>
//                             </div>
//                             <div style="margin:5px 0;">FT中文网欢迎读者发表评论，部分评论会被选进《读者有话说》栏目。我们保留编辑与出版的权利。</div>
//                             <textarea name="Talk" id="Talk" class="commentTextArea" width="100%" rows="3"></textarea>
//                             <span style="display:none">
//                             <input name="use_nickname" type="hidden" id="name" onclick="unuseit(this);"/>
//                             <label for="name" style="display:none">匿名</label>
//                             <input name="use_nickname" type="radio" id="userid" value="0" onclick="useit(this);" checked/>
//                             <input type="text"  autocorrect="off" class="user_id textinput nick_name" name="NickName" id="nick_name" value=""/>
//                             </span>
//                             <input type="button" value="提交评论" class="comment_btn submitbutton button ui-light-btn" id="addnewcomment"/>
//                             <input type="hidden" id="content_id" value="{{id}}"/>
//                             <input type="hidden" id="content_type" value="{{type}}"/>
//                             </div>
//                             </div>
//                             </form>
//                         </div>
//                         <div id="nologincomment" class="nologincomment">
//                             <div class="container">
//                                 <div class="username-label">用户名</div>
//                                 <input type="text"  autocorrect="off" name="username" id="username1" class="user_id textinput user-name"/>
//                                 <div class="password-label">密码</div>
//                                 <input type="password" name="password"  class="user_id textinput password" id="password1"/>
//                                 <input type="submit" value="登录后发表评论" class="comment_btn submitbutton button ui-light-btn" onclick="login(1)"/>
//                                 <div class="topmargin statusmsg"></div>
//                                 <a class="social-login-wechat" href="ftcregister://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn stress">免费注册</button></div></a>
//                                 <a class="social-login-wechat" href="weixinlogin://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn wechat-login">微信登录</button></div></a>
//                             </div>
//                         </div>

//                         <script>
//                         (function() {
//                             // Set up Intersection Observer with adjusted rootMargin
//                             var observer = new IntersectionObserver(function(entries, observer) {
//                             entries.forEach(function(entry) {
//                             if (entry.isIntersecting) {
//                                 console.log('should load comment! ');
//                             // Load comments when the div is 500px away from entering the viewport
//                             loadcomment('{{id}}', '{{type}}');
//                             clickToSubmitComment();
//                             // Stop observing after loading comments
//                             observer.unobserve(entry.target);
//                             }
//                             });
//                             }, {
//                             root: null,
//                             rootMargin: '0px 0px 500px 0px', // Expand the bottom margin by 500px
//                             threshold: 0 // Trigger as soon as any part of the target intersects
//                             });
//                             var target = document.querySelector('.user_comments_container');
//                             if (target) {
//                             observer.observe(target);
//                             } else {
//                             console.error('Could not find user_comments_container element.');
//                             }
//                         })();
//                         </script>
//                     </div>

//                 </div>



                

//                 <div class="items">
//                     <div
//                     data-o-ads-name="infoflow3"
//                     class="o-ads infoflow"
//                     data-o-ads-formats-default="false"
//                     data-o-ads-formats-small="FtcInfoFlow"
//                     data-o-ads-formats-medium="false"
//                     data-o-ads-formats-large="false"
//                     data-o-ads-formats-extra="false"
//                     data-o-ads-targeting="cnpos=info3;"
//                     >
//                     </div>
//                 </div>
//             </div>
//         </div>
//         <div class="side-container">
//             <div class="side-inner">
//                 <!--{column-html}-->
//                 {Right-1}
//                 {related-stories}
//                 <div class="story-box last-child"{story-container-style}>
//                 <h2 class="box-title"><a><!--{related-topics-title}--></a></h2>
//                 <div class="item-lead item-description"><!--{related-topics-description}--></div>
//                 <ul class="top10">
//                 {related-topics}
//                 </ul>
//                 </div>
//             </div>
//         </div>
//         <div class="clearfloat"></div>
//     </div>
// </div>



// <div class="block-container no-side story-recommend-container"><div class="block-inner">

//     <div class="content-container"><div class="content-inner" id="onward-journey"><div class="list-container"><div class="list-inner">
// 			<h2 class="list-title"><a class="list-link" href="/channel/mba.html">推荐阅读</a></h2>
// 			<div class="card-grid list-recommendation"></div>
// 	</div></div></div></div>

// 	<div class="clearfloat"></div>

// </div></div>`;
//     appDetailEle.classList.add('on');

// }

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


delegate.on('click', '.item-container-app', async function () {
    try {
        const id = this.getAttribute('data-id');
        const type = this.getAttribute('data-type');
        // const subtype = this.getAttribute('data-sub-type');
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
    } catch(err) {
        console.error(`render story error:`, err);
    }
});

delegate.on('click', '.app-detail-back', async function () {
    try {
        const view = this.closest('.app-detail-view');

        // Remove the "on" class → triggers your CSS transition/animation
        view.classList.remove('on');

        // Define a one-time listener for when the transition ends
        const handleTransitionEnd = (e) => {
            // Make sure it only reacts to the intended property if needed
            if (e.target === view) {
                view.removeEventListener('transitionend', handleTransitionEnd);
                view.remove(); // Remove the DOM element
            }
        };

        view.addEventListener('transitionend', handleTransitionEnd);

        // For animations instead of transitions, use 'animationend'
        // view.addEventListener('animationend', handleTransitionEnd);
    } catch (err) {
        console.error('render story error:', err);
    }
});




renderSection('News');