
/*Global Variables*/
var fontOptionsEle;
var fs;

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
            console.log(currentClass);
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


// MARK:Getting a random integer between two values.The maximum is exclusive and the minimum is inclusive


try {
    checkFontSize();
    changeFontSize();
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

// MARK: - When the user copied our story text, add some copyright info at the top of clipboardData
document.addEventListener('copy', function(e) {
    if (window.isReprint) {return;}
    var text = window.getSelection().toString();
    var copyTextLength = text.length;
    var copyRight = '请使用文章顶部或底部的共享按钮来进行共享文章的链接。未经允许复制文章内容分享给他人是违反FT中文网条款和条件以及版权政策的行为。发送电子邮件至licensing@ftchinese.com以购买其他权利。有关更多信息，请访问http://www.ftchinese.com/m/corp/copyright.html。\r\n\r\n' + location.href + '\r\n\r\n';
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