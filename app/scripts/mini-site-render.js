var delegate = new Delegate(document.body);
var tabsDict;
var infoDict;

delegate.on('click', '.header-nav', function(){
    var index = this.getAttribute('data-index');
    var currentTabs = document.querySelectorAll('.header-nav.is-current');
    for (var i=0; i<currentTabs.length; i++) {
        currentTabs[i].className = currentTabs[i].className.replace(' is-current', '');
    }
    this.className += ' is-current';
    var sections = document.querySelector('.sections');
    if (!sections) {return;}
    sections.innerHTML = renderSections(index);
    var tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) {return;}
    tabsContainer.className = tabsContainer.className.replace(' on', '');
});

delegate.on('click', '.tabs-switch', function(){
    var tabsContainer = document.querySelector('.tabs-container');
    if (!tabsContainer) {return;}
    var c = tabsContainer.className;
    if (c.indexOf(' on') >= 0) {
        tabsContainer.className = c.replace(' on', '');
    } else {
        tabsContainer.className = c + ' on';
    }
});

delegate.on('click', '.speaker', function(){
    var detail = document.getElementById('overlay-content');
    if (!detail) {return;}
    var content = detail.querySelector('.overlay-content-detail');
    if (!content) {return;}
    var key = this.querySelector('.speaker-name').innerHTML;
    if (!infoDict.speakers[key]) {return;}
    var name = '<div class="name">' + key + '</div>';
    var image = '<img src="' + infoDict.speakers[key].image + '">';
    var title = '<div class="title">' + infoDict.speakers[key].title + '</div>';
    var intro = '<div class="intro">' + infoDict.speakers[key].intro + '</div>';
    content.innerHTML = name + title + image + intro;
    detail.classList.add('on');
});


delegate.on('click', '.overlay-close, .overlay-bg', function(){
    var parentId = this.getAttribute('data-parentid');
    closeOverlay(parentId);
});

function updateInfoDict() {
    if (!infoDict) {infoDict = {};}
    var tabs = pageInfo.tabs;
    if (tabs && tabs.length > 0) {
        for (var i=0; i<tabs.length; i++) {
            var type = tabs[i].type;
            var sections = tabs[i].sections;
            if (!type || !sections) {continue;}
            for (var j=0; j<sections.length; j++) {
                var key = sections[j].name;
                if (!key) {continue;}
                if (!infoDict[type]) {
                    infoDict[type] = {};
                }
                infoDict[type][key] = sections[j];
            }
        }
    }
}

function renderHeader() {
    var headerHTML = '';
    // MARK: - Render Logos
    var defaultLogos = [{image: 'https://dhgxl8qk9zgzr.cloudfront.net/img/ipad_icon.png', url: '/'}];
    var logos = pageInfo.logos || defaultLogos;
    var logosHTML = '';
    for (var j=0; j<logos.length; j++) {
        var link = (logos[j].url) ? ' href="' + logos[j].url + '"' : '';
        logosHTML += '<a class="header-logo"' + link + '><img src="' + logos[j].image + '"></a>';
    }
    headerHTML += logosHTML;
    var tabSwitchHTML = '<div class="tabs-switch"></div>';
    headerHTML += tabSwitchHTML;
    var tabs = pageInfo.tabs;
    var tabsHTML = '';
    if (tabs) {
        for (var i=0; i<tabs.length; i++) {
            var isCurrent = (i===0) ? ' is-current' : '';
            tabsHTML += '<div class="header-nav' + isCurrent + '" data-index="' + i + '">' + tabs[i].title + '</div>';
        }
    }
    var buttons = pageInfo.buttons;
    var buttonHTML = '';
    if (buttons) {
        for (var k=0; k<buttons.length; k++) {
            buttonHTML += '<div class="header-button-container"><a class="header-button" href="' + buttons[k].url + '">' + buttons[k].title + '</a></div>';
        }
    }
    var loginHTML = '';
    if (window.username && window.username !== '') {
        loginHTML = '<a href="/users/logout" class="header-account">登出</a>';
    } else {
        loginHTML = '<a onclick="showOverlay(\'overlay-login\')" class="header-account">登入</a>';
    }
    // loginHTML = '<div class="header-account-container">' + loginHTML + '</div>';
    tabsHTML = '<div class="tabs-container">' + tabsHTML + loginHTML + buttonHTML + '</div>';
    headerHTML += tabsHTML;
    headerHTML = '<div class="header-placeholder"><div class="header-container"><div class="header-inner">' + headerHTML + '</div></div></div>';
    return headerHTML;
}

function renderSpeakers(speakers) {
    var speakersHTML = '';
    // var speakers = sections[j].speakers;
    if (speakers && infoDict.speakers) {
        for (var k=0; k<speakers.length; k++) {
            var speaker = infoDict.speakers[speakers[k]];
            speakersHTML += '<div class="speaker"><image src="' + speaker.image + '"/><div class="content"><div class="speaker-name">' + speaker.name + '</div><div class="speaker-intro">' + speaker.title + '</div></div></div>';
        }
    }
    if (speakersHTML !== '') {
        speakersHTML = '<div class="speakers-container">' + speakersHTML + '</div>';
    }
    return speakersHTML;
}

function renderPartners(partners) {
    var html = '';
    var hasMultiplePartners = '';
    if (partners && pageInfo.partners) {
        if (partners.length > 1) {
            hasMultiplePartners = ' multiple-partners';
        }
        for (var i=0; i<partners.length; i++) {
            var partner = pageInfo.partners[partners[i]];
            if (!partner) {continue;}
            var link = partner.url || '';
            var buttonHTML = '';
            if (link) {
                // buttonHTML = '<button>了解更多</button>';
                link = ' href="' + link + '"';
            }
            html += '<a class="partner"' + link + '><image src="' + partner.image + '"/>' + buttonHTML + '</a>';
        }
    }
    if (html !== '') {
        html = '<div class="partners-container' + hasMultiplePartners + '">' + html + '</div>';
    }
    return html;
}

function renderDetails(details) {
    if (!details) {return '';}
    var type = details.type;
    var items = details.items;
    if (!items) {return '';}
    if (type === 'partners') {
        return renderPartners(items);
    } else if (type === 'speakers') {
        return '<div class="speakers-section-container">' + renderSpeakers(items) + '</div>';
    }
    return '';
}

function renderSections(index) {
    // MARK: - Only create the tabs dict once
    if (!tabsDict) {
        tabsDict = {};
        var tabs = pageInfo.tabs;
        if (tabs) {
            for (var i=0; i<tabs.length; i++) {
                tabsDict[i] = tabs[i];
            }
        }
    }
    var tabHTML = '';
    var tab = tabsDict[index];
    var sections = tab.sections;
    if (sections) {
        if (tab.type === 'speakers') {
            var speakers = [];
            for (var m=0; m<sections.length; m++) {
                if (!sections[m].name) {continue;}
                speakers.push(sections[m].name);
            }
            return '<div class="speakers-section-container">' + renderSpeakers(speakers) + '</div>';
        }
        var dateStamp = '';
        for (var j=0; j<sections.length; j++) {
            var type = sections[j].style || 'default';
            var url = sections[j].url;
            var link = '';
            if (type === 'session' && url) {
                var id = url.replace(/^.*\//g, '').replace(/\?.*$/g, '');
                if (/^[0-9]+$/.test(id)) {
                    link = '<a href="/interactive/' + id + '" class="watch-button">观看</a>';
                }
            }
            var title = sections[j].title || '';
            if (title !== '') {
                title = '<div class="section-title">'+title+'</div>';
            }
            var subtitle = sections[j].subtitle || '';
            if (subtitle !== '') {
                subtitle = '<div class="section-subtitle">'+subtitle+'</div>';
            }
            var question = sections[j].question || '';
            if (question !== '') {
                question = '<div class="section-question">'+question+'</div>';
            }
            var answer = sections[j].answer || '';
            if (answer !== '') {
                answer = '<div class="section-answer">'+answer+'</div>';
            }
            
            var video = sections[j].video || '';
            if (video !== '') {
                var host = (window.location.host.indexOf('localhost') === 0) ? 'http://www.ftchinese.com' : '';
                var videoWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                videoWidth = parseInt(Math.min(1200-60, videoWidth), 10);
                var videoHeight = parseInt(videoWidth * 9 / 16, 10);
                video = '<iframe class="section-video-frame" src="' + host + '/m/corp/video.html?vid=' + video + '&w=' + videoWidth + '&h=' + videoHeight + '" width="' + videoWidth + '" height="' + videoHeight + '"  frameBorder="0" scrolling="no">' + '</iframe>';
                hasMoreContent = true;
            }
            var dateTime = sections[j].time;
            var timeStamp = '';
            var startTime = '';
            var currentDateStamp = '';
            if (dateTime) {
                currentDateStamp = '<div class="speaker-date-stamp">' + dateTime.replace(/ .*$/g, '') + '</div>';
                if (currentDateStamp !== dateStamp) {
                    dateStamp = currentDateStamp;
                } else {
                    currentDateStamp = '';
                }
                timeStamp = '<div class="time-stamp">' + dateTime.replace(/^.*? /g, '') + '</div>';
                startTime = '<div class="start-time">' + dateTime.replace(/^.*? /g, '').replace(/\-.*$/g, '') + '</div>';
            }
            var style = (sections[j].background) ? ' style="background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + sections[j].background + ')"' : '';
            var speakersHTML = renderSpeakers(sections[j].speakers);
            var details = renderDetails(sections[j].details);
            var hasMoreContent = '';
            if (details !== '' || video !== '') {
                hasMoreContent = ' has-more-content';
            }
            tabHTML += currentDateStamp + '<div class="section-container section-' + type + hasMoreContent + '"' + style + '>' + startTime + '<div class="section-inner">' + timeStamp + title + link + subtitle + question + answer + speakersHTML + '</div></div>' + video + details;
        }
    }
    return tabHTML;
}

function renderFooter() {
    var decoration = '';
    var items = '';
    if (pageInfo.footer) {
        if (pageInfo.footer.decoration) {
            decoration = '<div class="footer-decoration" style="background-image: url('+ pageInfo.footer.decoration +')"></div>';
        }
        if (pageInfo.footer.items) {
            for (var i=0; i<pageInfo.footer.items.length; i++) {
                var item = pageInfo.footer.items[i];
                items += '<a href="' + item.url +'">' + item.title + '</a>';
            }
            items = '<div>' + items + '</div>';
        }
    }
    var copyright = '<p><span class="copyright"><b>© The Financial Times Ltd '+ (new Date()).getFullYear() +'</b></span><span><acronym title="Financial Times">FT</acronym> and \'Financial Times\' are trademarks of The Financial Times Ltd.</span></p>';
    return decoration + '<div class="footer-container" data-id="footer-1"><div class="footer-inner">' + items + copyright + '</div></div>';
}

function renderPage() {
    updateInfoDict();
    var finalHTML = renderHeader();
    var sectionsHTML = '';
    var tabs = pageInfo.tabs;
    if (tabs && tabs.length > 0) {
        sectionsHTML = renderSections(0);
    }
    finalHTML += '<div class="sections">' + sectionsHTML + '</div>';
    finalHTML += renderFooter();
    document.getElementById('mini-site-content').innerHTML = finalHTML;
}

renderPage();