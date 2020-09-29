var delegate = new Delegate(document.body);
var tabsDict;
var infoDict;
var host = (window.location.host.indexOf('localhost') === 0) ? 'http://www.ftchinese.com' : '';
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
    // if (!infoDict.speakers[key]['intro'] || infoDict.speakers[key]['intro'] === '') {return;}
    var name = '<div class="name">' + key + '</div>';
    var image = '<img src="' + infoDict.speakers[key].image + '">';
    var title = '<div class="title">' + infoDict.speakers[key].title + '</div>';
    var intro = '<div class="intro">' + infoDict.speakers[key].intro + '</div>';
    var sessions = [];
    if (pageInfo.tabs) {
        for (var i=0; i<pageInfo.tabs.length; i++) {
            if (!pageInfo.tabs[i].sections) {continue;}
            for (var j=0; j<pageInfo.tabs[i].sections.length; j++) {
                var section = pageInfo.tabs[i].sections[j];
                if (section.style !== 'session') {continue;}
                var speakers = section.speakers;
                if (!speakers) {continue;}
                if (speakers.indexOf(key) < 0) {continue;}
                sessions.push(section);
            }
        }
    }
    var sessionsHTML = '';
    for (var k=0; k<sessions.length; k++) {
        sessionsHTML += '<a class="speaker-session" href="' + sessions[k].url + '" target="_blank">' + sessions[k].title + '</a>';
    }
    if (sessionsHTML !== '') {
        sessionsHTML = '<b class="speaker-session-title">相关议程：</b>' + sessionsHTML;
    }
    content.innerHTML =  image + name + title + intro + sessionsHTML;
    detail.classList.add('on');
});

delegate.on('click', '.overlay-close, .overlay-bg', function(){
    var parentId = this.getAttribute('data-parentid');
    closeOverlay(parentId);
});

function pad(str, max) {
    str = str.toString();
    return str.length < max ? pad('0' + str, max) : str;
}

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
            if (!speaker) {continue;}
            var image = '';
            if (speaker.image) {
                image = '<image src="' + speaker.image + '"/>';
            }
            speakersHTML += '<div class="speaker">' + image + '<div class="content"><div class="speaker-name">' + speaker.name + '</div><div class="speaker-intro">' + speaker.title + '</div></div></div>';
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
    var location = pageInfo.location || '';
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
            var dateTime = sections[j].time;
            var timeStamp = '';
            var startTime = '';
            var currentDateStamp = '';
            var follow = '';
            var title = '';
            var eventTitle = sections[j].title || '';
            var id = '';
            if (eventTitle !== '') {
                title = '<div class="section-title">'+eventTitle+'</div>';
            }
            var subtitle = '';
            var eventSubtitle = sections[j].subtitle || '';
            if (eventSubtitle !== '') {
                subtitle = '<div class="section-subtitle">'+eventSubtitle+'</div>';
            }
            var question = sections[j].question || '';
            if (question !== '') {
                question = '<div class="section-question">'+question+'</div>';
            }
            var answer = sections[j].answer || '';
            if (answer !== '') {
                answer = '<div class="section-answer">'+answer+'</div>';
            }
            var text = sections[j].text || '';
            if (text !== '') {
                var texts = text.split('\n');
                var textHTML = '';
                for (var n=0; n<texts.length; n++) {
                    textHTML += '<p>' + texts[n] + '</p>';
                }
                text = '<div class="section-text">' + textHTML + '</div>';
            }
            var signature = sections[j].signature || '';
            if (signature !== '') {
                signature = '<img class="section-signature" src="' + signature + '">';
            }
            var name = sections[j].name || '';
            if (name !== '') {
                name = '<div class="section-name">' + name + '</div>';
            }
            var jobTitle = sections[j].jobTitle || '';
            if (jobTitle !== '') {
                jobTitle = '<div class="section-job-title">' + jobTitle + '</div>';
            }
            var video = sections[j].video || '';
            if (video !== '') {
                var videoWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                videoWidth = parseInt(Math.min(1200-60, videoWidth), 10);
                var videoHeight = parseInt(videoWidth * 9 / 16, 10);
                video = '<iframe class="section-video-frame" src="' + host + '/m/corp/video.html?vid=' + video + '&w=' + videoWidth + '&h=' + videoHeight + '" width="' + videoWidth + '" height="' + videoHeight + '"  frameBorder="0" scrolling="no">' + '</iframe>';
            }


            var style = (sections[j].background) ? ' style="background-image: linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(' + sections[j].background + ')"' : '';
            var speakersHTML = renderSpeakers(sections[j].speakers);
            var details = renderDetails(sections[j].details);
            var hasMoreContent = '';
            if (details !== '' || video !== '') {
                hasMoreContent = ' has-more-content';
            }
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
            if (type === 'session' && url) {
                id = url.replace(/^.*\//g, '').replace(/\?.*$/g, '');
                if (/^[0-9]+$/.test(id)) {
                    link = '<a href="/interactive/' + id + '" class="watch-button" target="_blank">观看</a>';
                }
            }
            // MARK: - Assume all events are Beijing Time
            if (dateTime && type === 'session' && url) {
                var eventDate =  dateTime.replace(/ .*$/g, '').replace(/[年月]/g, '-').replace(/[日]/g, '').trim();
                var eventStartTime = dateTime.replace(/^.*? /g, '').replace(/\-.*$/g, '').trim();
                var eventEndTime = dateTime.replace(/^.*? /g, '').replace(/^.*\-/g, '').trim();
                // console.log(eventDate + ' ' + eventStartTime + ' GMT+0800');
                var eventStart = new Date(eventDate + ' ' + eventStartTime + ' GMT+0800');
                var eventEnd = new Date(eventDate + ' ' + eventEndTime + ' GMT+0800');
                var ymd = eventStart.getUTCFullYear() * 10000 + (eventStart.getUTCMonth() + 1) * 100 + eventStart.getUTCDate();
                var his = eventStart.getUTCHours() * 10000 + eventStart.getUTCMinutes() * 100 + eventStart.getUTCSeconds();
                his = pad(his, 6);
                var ymdend = eventEnd.getUTCFullYear() * 10000 + (eventEnd.getUTCMonth() + 1) * 100 + eventEnd.getUTCDate();
                var hisend = eventEnd.getUTCHours() * 10000 + eventEnd.getUTCMinutes() * 100 + eventEnd.getUTCSeconds();
                hisend = pad(hisend, 6);
                var eventUrl = host + '/event.php?ymd=' + ymd + '&his=' + his + '&ymdend=' + ymdend + '&hisend=' + hisend + '&event=' + encodeURIComponent(eventTitle) + '&id=' + id + '&location=' + location + '&description=' + encodeURIComponent(eventSubtitle);
                // console.log(eventUrl);
                //https://www.chineseft.com/event.php?ymd=20200928&his=100000&ymdend=20200928&hisend=110000&event=2020FT%E4%B8%AD%E6%96%87%E7%BD%91%E5%B9%B4%E5%BA%A6%E8%AE%BA%E5%9D%9B&id=200299&location=%E5%8D%83%E7%A6%A7%E5%A4%A7%E9%85%92%E5%BA%97&description=%E8%AF%B7%E4%B8%8D%E8%A6%81%E9%94%99%E8%BF%87
                follow = '<a class="section-follow" href="' + eventUrl + '" target="_blank"></a>';
            }
            tabHTML += currentDateStamp + '<div class="section-container section-' + type + hasMoreContent + '"' + style + '>' + startTime + '<div class="section-inner">' + follow + timeStamp + title + link + subtitle + text + signature + name + jobTitle + question + answer + speakersHTML + '</div></div>' + video + details;
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