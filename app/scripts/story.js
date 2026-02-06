/*Global Variables*/
var fontOptionsEle;
var fs;

const tranditionalLanguages = ['zh-TW', 'zh-HK'];

function updateFontClass(currentClass) {
    var fontClasses = ['normal', 'bigger', 'biggest', 'smaller', 'smallest'];
    var storyContainers = document.querySelectorAll('.story-container');
    for (var i = 0; i < storyContainers.length; i++) {
        for (var k = 0; k < fontClasses.length; k++) {
            storyContainers[i].classList.remove(fontClasses[k]);
        }
        storyContainers[i].classList.add(currentClass);
    }
}

function changeFontSize() {
    // MARK: set font
    fontOptionsEle = document.getElementById('font-options');
    // MARK: click to change font size and set cookie (fs)
    // MARK: Dom Delegate doesn't work here on iOS
    fontOptionsEle.onclick = function (e) {
        var currentClass = e.target.className || '';
        var selectedClass;
        if (currentClass.indexOf('selected') === -1) {
            currentClass = currentClass.replace(/ .*$/g, '');
            if (fontOptionsEle.querySelector('.selected')) {
                selectedClass = fontOptionsEle.querySelector('.selected').className || '';
            } else {
                selectedClass = '';
            }
            selectedClass = selectedClass.replace(/ selected/g, '');
            if (fontOptionsEle.querySelector('.selected')) {
                fontOptionsEle.querySelector('.selected').className = selectedClass;
            }
            e.target.classList.add('selected');
            /* jshint ignore:start */
            SetCookie('fs',currentClass,'','/');
            /* jshint ignore:end */
            updateFontClass(currentClass);
            stickyBottomPrepare();
            stickyAdsPrepare();
            setResizeClass();
        }
    };
}

function checkFontSize(forceFontSize) {
    fs = forceFontSize || GetCookie('fs');
    SetCookie(fs);
    if (typeof fs === 'string' && fs !== null && fs !== '' && document.getElementById('font-options') && document.querySelector('.story-container')) {
        document.getElementById('font-options').querySelector('.' + fs.replace(/ /g, '.')).className = fs + ' selected';
        updateFontClass(fs);
        setResizeClass();
    } else {
        document.getElementById('font-setting').querySelector('.normal').className = 'normal selected';
    }
}


function handleLinks() {
    try {
        const links = document.querySelectorAll('#story-body-container a[href]');
        const fullHost = location.protocol + '//' + location.host;
        for (let link of links) {
            let href = link.getAttribute('href') || '';
            if (href.indexOf(fullHost) === 0) {return;}
            href = href.replace(/^http[s]*:\/\/www\.ftchinese\.com\//g, '/');
            // console.log(href);
            href = href.replace(/^http[s]*:\/\/www\.ft\.com\/content/g, '/content');
            link.setAttribute('href', href);
        }
    } catch(ignore){}
}

function getHashParam(param) {
    var hash = window.location.hash || '';
    if (hash.charAt(0) === '#') {
        hash = hash.slice(1);
    }
    if (!hash) {return '';}
    var parts = hash.split('&');
    for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split('=');
        if (kv[0] === param) {
            return decodeURIComponent(kv[1] || '');
        }
    }
    return '';
}

function initHsbcSelectCopyButton() {
    try {
        var marker = getHashParam('marker');
        if (marker !== 'hsbcselect') {return;}

        var styleId = 'hsbcselect-copy-style';
        if (!document.getElementById(styleId)) {
            var style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
            .copy-buttons {
                width: 100%;
                height: 80px;
                position: fixed;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.7);
                display: table;
                z-index: 1;
            }
            .copy-buttons-inner {
                display: table-cell;
                text-align: center;
                vertical-align: middle;
            }
            .copy-button {
                height: 60px;
                font-size: 20px;
                background-color: #0a5e66;
                color: white;
                margin: auto;
                padding: 0 15px;
            }
            .copy-button:hover, .copy-button:active {
                background-color: #0a5e66;
                color: white;
            }
            .none-ft-image {
                display: none;
            }
            `;
            document.head.appendChild(style);
        }

        var copyText = function(ele) {
            var headlineEle = document.querySelector('.story-headline');
            var bodyEle = document.getElementById('story-body-container');
            var headline = headlineEle ? headlineEle.innerText : '';
            var body = bodyEle ? bodyEle.innerText : '';
            if (body) {
                body = body.split(/\r?\n/).filter(function(line) {
                    return line.trim() !== '广告';
                }).join('\n');
            }
            var all = headline + '\n\n' + body;
            try {
                navigator.clipboard.writeText(all);
            } catch(err) {
                alert('文章无法复制到您的剪贴板，最为可能的原因是因为您的浏览器不支持。推荐使用chrome的最新版本。如有进一步的问题，请截屏和FT中文网的销售代表联系：' + err.toString());
            }
            var oldButtonText = ele.innerHTML;
            ele.innerHTML = '复制成功';
            setTimeout(function(){
                ele.innerHTML = oldButtonText;
            }, 3000);
        };

        var drawButton = function() {
            var existingButtons = document.querySelector('.copy-buttons');
            if (existingButtons && existingButtons.parentElement) {
                existingButtons.parentElement.removeChild(existingButtons);
            }
            var copyButtons = document.createElement('div');
            copyButtons.className = 'copy-buttons';
            copyButtons.innerHTML = '<div class="copy-buttons-inner"><button class="copy-button" id="copy-button">复制全文</button></div>';
            document.body.appendChild(copyButtons);
            var copyButton = document.getElementById('copy-button');
            if (copyButton) {
                copyButton.onclick = function() {
                    copyText(this);
                };
            }
        };

        drawButton();
    } catch (ignore) {}
}

async function checkSavedContent() {
    const accessTokenUpdateTime = GetCookie('accessTokenUpdateTime');
    
    if (accessTokenUpdateTime) {
        const button = document.querySelector('.save_content_button');
        // Prepare the content ID and type, assuming they are available in the DOM or JavaScript variables
        const id = button?.getAttribute('data-item-id');
        const type = button?.getAttribute('data-item-type');
      
        if (!id || !type) {
            console.error('Missing content ID or type');
            return;
        }
  
        try {
        // Fetch saved status from the backend
        const response = await fetch('/check_saved_content', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, type})
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update DOM based on result
            const saveButton = document.querySelector('.icon-save button');
            if (data.isSaved) {
            saveButton.classList.add('saved');
            saveButton.innerHTML = await convertChinese('删除', preferredLanguage);
            } else {
            saveButton.classList.remove('saved');
            saveButton.innerHTML = await convertChinese('收藏', preferredLanguage);
            }
        } else {
            console.error('Failed to check saved content. Status:', response.status);
        }
        } catch (error) {
        console.error('Error checking saved content:', error);
        }
    }
}

// MARK:Getting a random integer between two values.The maximum is exclusive and the minimum is inclusive


try {
    handleLinks();
    initHsbcSelectCopyButton();
    checkFontSize();
    changeFontSize();
    checkSavedContent();
} catch (ignore) {}

var subscribeNow = document.getElementById('subscribe-now');
var openApp = document.getElementById('open-app');

// MARK: subscribeNow might be null, for example, in iOS app. 
// MARK: never assume a dom exists. 
try {
    if(subscribeNow){
        var hrefLink = '/index.php/ft/subscription?el='+window.gSubscriptionEventLabel;
        var discountCode = paravalue(window.location.href, 'from');
        if (discountCode !== '') {
            hrefLink += '&from=' + discountCode;
        }
        subscribeNow.href = hrefLink;
        subscribeNow.onclick = function(){
            gtag('event', 'select_content', {
            promotions: [
              {
                'id': window.gSubscriptionEventLabel,
                'name': window.gSubscriptionEventLabel,
                'creative_name': location.href,
                'creative_slot': 'become a member'
              }
            ]
            });
            gtag('event', 'Tap', {'event_label': window.gSubscriptionEventLabel, 'event_category': 'Web Privileges'});
        };
        updateClientIdLinks();
    }
} catch(ignore) {

}

function getDeviceSpecie() {
    var uaString = navigator.userAgent || navigator.vendor || '';
    var deviceSpecie = 'PC';
    if (/iPad/i.test(uaString)) {
        deviceSpecie = 'iPad';
    } else if (/OS [0-9]+\_/i.test(uaString) && (/iPhone/i.test(uaString) || /iPod/i.test(uaString))) {
        deviceSpecie = 'iPhone';
    } else if (/Android|micromessenger/i.test(uaString) ) {
        deviceSpecie = 'android';
    }
    return deviceSpecie;
}

var deviceSpecie = getDeviceSpecie();
try {
    if (openApp){
        var pathname = window.location.pathname ;
        var paraArr = pathname.split('/');
        var storyId = paraArr[paraArr.length-1];
       if(deviceSpecie === 'iPad'|| deviceSpecie === 'iPhone') {
            openApp.innerHTML = 'App内打开';
            if  (storyId){
                openApp.href = '/startapp.html?id='+storyId;
            }  else{
                openApp.href = '/startapp.html';
            }
        }else{
            openApp.innerHTML = '下载应用&#x25BA;';
            openApp.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.ft';
        } 
    }
} catch (ignore) {

}


async function updateLiveBlogTimestamps() {
  var elements = document.querySelectorAll('.live-blog-container [data-publish-time]');
  var preferredLang = document.documentElement.getAttribute('data-preferred-language') || 'zh';
  var now = new Date();

  for (var i = 0; i < elements.length; i++) {
    var el = elements[i];
    var timestamp = parseInt(el.getAttribute('data-publish-time'), 10);
    var langAttr = el.getAttribute('data-language');
    var isChinese = langAttr === 'zh';
    var lang = isChinese ? preferredLang : 'en';

    if (isNaN(timestamp)) {
      continue;
    }

    var time = new Date(timestamp);
    var diffMs = now - time;
    var diffSeconds = Math.floor(diffMs / 1000);
    var diffMinutes = Math.floor(diffSeconds / 60);
    var diffHours = Math.floor(diffMinutes / 60);
    var diffDays = Math.floor(diffHours / 24);

    var humanReadable;

    if (diffDays > 7) {
      var y = time.getFullYear();
      var m = String(time.getMonth() + 1).padStart(2, '0');
      var d = String(time.getDate()).padStart(2, '0');
      humanReadable = y + '-' + m + '-' + d;
    } else if (diffDays >= 1) {
      if (lang === 'en') {
        if (diffDays === 1) {
          humanReadable = '1 day ago';
        } else {
          humanReadable = diffDays + ' days ago';
        }
      } else {
        humanReadable = diffDays + '天前';
      }
    } else if (diffHours >= 1) {
      if (lang === 'en') {
        if (diffHours === 1) {
          humanReadable = '1 hour ago';
        } else {
          humanReadable = diffHours + ' hours ago';
        }
      } else {
        humanReadable = diffHours + '小时前';
      }
    } else if (diffMinutes >= 1) {
      if (lang === 'en') {
        if (diffMinutes === 1) {
          humanReadable = '1 minute ago';
        } else {
          humanReadable = diffMinutes + ' minutes ago';
        }
      } else {
        humanReadable = diffMinutes + '分钟前';
      }
    } else {
      if (lang === 'en') {
        humanReadable = 'just now';
      } else {
        humanReadable = '刚刚';
      }
    }

    // Optional conversion to Traditional Chinese
    if (isChinese && (preferredLang === 'zh-TW' || preferredLang === 'zh-HK')) {
      try {
        humanReadable = await convertChinese(humanReadable, preferredLang);
      } catch (e) {
        console.warn('Chinese conversion failed:', e);
      }
    }

    el.innerHTML = humanReadable;
  }
}

async function checkLiveBlogUpdates(isDebug = false) {
  try {
    const id = window.ftid;
    if (!id) { return; }
    const blogsEles = document.querySelectorAll('.live-blog-container[data-id]');
    if (blogsEles.length === 0) { return; }
    let existingIds = [];
    for (const ele of blogsEles) {
      const id = ele.getAttribute('data-id');
      if (!id) { continue; }
      existingIds.push(id);
    }

    if (isDebug) {
      existingIds = existingIds.slice(0, 79);
    }

    const postData = { id, existingIds };
    const response = await fetch('/check_live_blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const updates = await response.json();
    // console.log('Live blog update check result:', JSON.stringify(updates, null, 2));
    
    if (updates && Array.isArray(updates) && updates.length > 0) {
    const container = document.querySelector('.live-blog-container')?.parentElement;
    if (!container) {return;}

    // Insert each new item at the top in reverse order to preserve chronological order
    for (let i = updates.length - 1; i >= 0; i--) {
      const update = updates[i];
      const div = document.createElement('div');
      div.className = 'live-blog-container';
      div.setAttribute('data-id', update.id);
      let preferedChineseLanguage = document.documentElement?.getAttribute('data-preferred-language') ?? '';
      if (!tranditionalLanguages.includes(preferedChineseLanguage)) {
        preferedChineseLanguage = 'zh';
      }
      let byline = update.byline;
      let title = update.titleTranslation;
      let bodyXML = update.bodyXMLTranslation;
      if (window.is_language_en) {
        byline = update.byline_original;
        title = update.title;
        bodyXML = update.bodyXML;
      } else if (tranditionalLanguages.includes(preferedChineseLanguage)) {
        byline = await convertChinese(byline, preferedChineseLanguage);
        title = await convertChinese(title, preferedChineseLanguage);
        bodyXML = await convertChinese(bodyXML, preferedChineseLanguage);
      }
      const language = window.is_language_en ? 'en' : 'zh';
      div.innerHTML = `
        <hr class="is-live-blog">
        <div class="time-byline-container">
          <div>
            <span class="story-time" data-publish-time="${new Date(update.publishedDate).getTime()}" data-language="${language}"></span>
          </div>
          <div class="story-author">${byline}</div>
        </div>
        <h1>${title}</h1>
        ${bodyXML}
      `;
      container.insertBefore(div, container.firstChild);
    }

    // Show a fixed message at the bottom
    let notice = document.getElementById('new-updates-notice');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'new-updates-notice';
      notice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ff0;padding:10px;text-align:center;cursor:pointer;z-index:9999;';
      notice.innerText = `有 ${updates.length} 条最新动态，点击查看`;
      document.body.appendChild(notice);
      notice.addEventListener('click', () => {
        const firstNew = document.querySelector(`.live-blog-container[data-id="${updates[0].id}"]`);
        if (firstNew) {
          firstNew.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        notice.remove();
      });
    }
  }

  } catch (err) {
    console.error(`checkLiveBlogUpdates error: `, err);
  } finally {
    updateLiveBlogTimestamps();
  }
}

async function updateLiveBlogLinks() {
  try {
    const eles = document.querySelectorAll('.live-blog-container[data-id]');
    if (eles.length === 0) {return;}
    // Use fetch get to check the endpoint, /show_detail_link_for_live_blog, it should return a json, if it has a property of show, and it is a bool true, then continue, other wise return immediately
    const response = await fetch('/show_detail_link_for_live_blog');
    const data = await response.json();
    if (!data?.show) {return;}
    let preferedChineseLanguage = document.documentElement?.getAttribute('data-preferred-language') ?? '';
    if (!tranditionalLanguages.includes(preferedChineseLanguage)) {
      preferedChineseLanguage = 'zh';
    }
    const isEnglish = document.querySelector('.story-container.en') ? true : false;
    const moreText = isEnglish ? 'More' : '更多';

    for (const ele of eles) {
      const id = ele.getAttribute('data-id');
      if (!id) {continue;}
      const linkEle = ele.querySelector('.detail-link');
      if (linkEle) {continue;}
      let link = document.createElement('P');
      link.innerHTML = `<a href="/powertranslate/chat.html#ftid=${id}&language=${preferedChineseLanguage}&action=read" target="_blank">${moreText}</a>`;
      link.className = 'detail-link';
      link.style.textAlign = 'right';
      ele.appendChild(link);
    }
  } catch(err) {
    console.error(`update live blog links error: `, err);
  }
}

function handleInlineVideos(ele) {
	//<div class='o-responsive-video-container'><div class='o-responsive-video-wrapper-outer'><div class='o-responsive-video-wrapper-inner'><script src='https://union.bokecc.com/player?vid=6358D162C6D0874A9C33DC5901307461&siteid=922662811F1A49E9&autoStart=false&width=100%&height=100%&playerid=3571A3BF2AEC8829&playertype=1'></script></div></div><a class='o-responsive-video-caption' href='/video/3009" vsource="' target='_blank'>中国科技巨头财富缩水的背后</a></div>
	//console.log (ele.innerHTML);
	var inlineVideos = ele.querySelectorAll('.inlinevideo');
	for (var i=0; i<inlineVideos.length; i++) {
		var thisVideo = inlineVideos[i];
		var w = thisVideo.offsetWidth || window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		var h = parseInt(w*9/16, 10);
		var ccVideoId = thisVideo.id || '';
		var ftcVideoId = thisVideo.getAttribute('vid') || '';
		var title = thisVideo.getAttribute('title') || '';
		var videoSrc = '';
		var videoHTML = '';
		if (ccVideoId !== '') {
			videoSrc = 'https://p.bokecc.com/playhtml.bo?vid='+ccVideoId+'&siteid=922662811F1A49E9&autoStart=false&playerid=3571A3BF2AEC8829&playertype=1';
		} else if (ftcVideoId !== '') {
			videoSrc = '/video/'+ftcVideoId+'?i=2&w='+w+'&h='+h+'&autostart=false';
		}
		if (videoSrc !== '') {
			videoHTML = '<div class="o-responsive-video-wrapper-outer"><div class="o-responsive-video-wrapper-inner"><iframe src="' + videoSrc + '" frameborder="0" style="width:100%;height:100%;" allowfullscreen="true"></iframe></div></div>';
		}
		var titleHTML = '';
		if (title !== '') {
			if (ftcVideoId !== '') {
				titleHTML = '<a class="o-responsive-video-caption" href="/video/'+ftcVideoId+'" target="_blank">' + title + '</a>';
			} else {
				titleHTML = '<div class="o-responsive-video-caption">' + title + '</div>';
			}
		}
		thisVideo.className = 'o-responsive-video-container';
		thisVideo.innerHTML = '<div class="o-responsive-video-wrapper-outer"><div class="o-responsive-video-wrapper-inner"><iframe src="https://p.bokecc.com/playhtml.bo?vid='+ccVideoId+'&siteid=922662811F1A49E9&autoStart=false&playerid=3571A3BF2AEC8829&playertype=1" frameborder="0" style="width:100%;height:100%;" allowfullscreen="true"></iframe></div></div>' + titleHTML;
	}
}


updateLiveBlogLinks();
// checkLiveBlogUpdates(true);

// Initial call
updateLiveBlogTimestamps();


handleInlineVideos(document.body);


// Re-run every 60 seconds
setInterval(function () {
  checkLiveBlogUpdates();
}, 60000);




// MARK: - When the user copied our story text, add some copyright info at the top of clipboardData
document.addEventListener('copy', function(e) {
    if (window.isReprint) {return;}
    var text = window.getSelection().toString();
    var copyTextLength = text.length;
    var copyRight = '请使用文章顶部或底部的共享按钮来进行共享文章的链接。未经允许复制文章内容分享给他人是违反FT中文网条款和条件以及版权政策的行为。发送电子邮件至licensing@ftchinese.com以购买其他权利。有关更多信息，请访问https://www.ftchinese.com/m/corp/copyright.html。\r\n\r\n' + location.href + '\r\n\r\n';
    // MARK: in the event label, only record up to 1000 to save quota
    var eventLabel = Math.min(Math.floor(copyTextLength/100) * 100, 1000);
    var parameters = {
        'copy_text': copyTextLength,
        'send_page_view': false
    };
    gtag('config', gaMeasurementId, parameters);
    gtag('event', ftItemId, {'event_label': eventLabel, 'event_category': 'Copy Story'});
    if (copyTextLength >= 200) {
        e.clipboardData.setData('text/plain', copyRight + text);
        e.preventDefault();
    }
});

// MARK: Language Switch
var languageSwitches = document.querySelectorAll('.language-switch');
for (var i=0; i<languageSwitches.length; i++) {
    languageSwitches[i].onclick = function() {
        var h = this.innerHTML;
        var index;
        switch (h) {
            case '对照': 
                index = 2;
                break;
            case '英文': 
                index = 1;
                break;
            default: 
                index = 0;
        }
        SetCookie('LanguagePreference',index,'','/');
    };
}
