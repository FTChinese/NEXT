/* exported DeleteCookie,isHidden,username,userId,guid,ccodeCookie,addstoryfav, showOverlay, closeOverlay, w, isTouchDevice, trackerNew, paravalue, trackAdClic, checkUserWarnings, binding, phoneLogin, resetPhoneLogin, showPhoneFTCBinding, showPhoneLogin*/
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var ua = navigator.userAgent || navigator.vendor || '';
var gUserType = 'visitor';
// Measurement ID for New GA4 property: G-2MCQJHGE8J
var gaMeasurementId = 'G-2MCQJHGE8J';
// var gaMeasurementId = 'UA-1608715-1';
var gaMeasurementId2 = 'G-PDY0XG13PH';

function GetCookie(name) {
    const cookieName = `${name}=`;
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      if (cookie.startsWith(cookieName)) {
        const cookieValue = cookie.substring(cookieName.length);
        return decodeURIComponent(cookieValue);
      }
    }  
    return null;
}

function SetCookie(name, value, sec, path, domain, secure) {
    const expires = new Date();
    path = path || '/';
    domain = domain || null;
    const expireMiniSeconds = (sec > 0) ? 1000 * sec : 600 * 24 * 60 * 60 * 1000;
    expires.setTime(expires.getTime() + expireMiniSeconds);
    document.cookie = `${name}=${encodeURIComponent(value)}${expires === null ? '' : `; expires=${expires.toGMTString()}`}; path=${path}${domain ? `; domain=${domain}` : ''}${secure ? '; secure' : ''}`;
}

function DeleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

function paravalue(theurl, thep) {
    var k,thev;
    if (theurl.indexOf(thep + '=')>1) {
        k=theurl.indexOf(thep + '=') + thep.length + 1;
        thev=theurl.substring(k,theurl.length);
        thev=thev.replace(/[\&\#].*/g,'');
    } else {
        thev='';
    }
    return thev;
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function updateSubscriberStatus() {
    var paywall = null;
    var nowTimeStamp = new Date().getTime()/1000;
    // MARK: - On Android Native App, use window.androidUserInfo for subscription information
    if (window.androidUserInfo) {
        if (window.androidUserInfo.membership && window.androidUserInfo.membership.tier) {
            paywall = (window.androidUserInfo.membership.tier === 'premium') ? 'premium' : 'subscriber';
            var androidExpireDate = window.androidUserInfo.membership.expireDate;
            if (typeof androidExpireDate === 'string' && !window.androidUserInfo.membership.vip) {
                var androidExpireDateStamp = new Date(androidExpireDate).getTime() + 24 * 60 * 60 * 1000;
                if (nowTimeStamp > androidExpireDateStamp) {
                    var churnedUserType = (paywall === 'premium') ? 'VIP' : 'Subscriber';
                    return 'Churned' + churnedUserType;
                }
            }
        }
    }
    if (window._IS_NODEJS_SITE) {
        console.log('For the new site, no need to check cookie on frontend for update subscriber status! ');
        return;
    }
    // MARK: - Otherwise, use cookie for subscription information
    if (paywall === null) {
        paywall = GetCookie('paywall');
    }
    var subscriberClass = '';
    if (paywall !== null) {
        var result;
        if (paywall === 'premium') {
            subscriberClass = ' is-subscriber is-premium';
            result = 'VIP';
        } else {
            subscriberClass = ' is-subscriber is-standard';
            result = 'Subscriber';
        }
        // MARK: - Check the expire date to decide if the subscriber has churned. Since the cookie might not be reliable, we need to be very careful. 
        var expire = GetCookie('expire');
        if (typeof result === 'string' && typeof expire === 'string') {
            var expireTimeStamp = parseInt(expire, 10);
            if (expireTimeStamp > 0) {
                if (nowTimeStamp > expireTimeStamp) {
                    result = 'Churned' + result;
                    subscriberClass = '';
                }
            } 
        }
        document.documentElement.className += subscriberClass;
        if (result) {return result;}
    }
    return null;
}

function updateClientIdLinks() {
    window.gClientId = GetCookie('_ga');
    var clientIdLinks = document.querySelectorAll('.o-client-id-link');
    for (var k = 0; k < clientIdLinks.length; k++) {
        var ele = clientIdLinks[k];
        var link = ele.href;
        if (link && typeof link === 'string' && link.indexOf('/')>=0) {
            var connector = (link.indexOf('?') > 0) ? '&' : '?';
            var eleClass = ele.className;
            ele.href = link + connector + 'clientId=' + window.gClientId;
            ele.className = eleClass.replace(/o-client-id-link/g, '');
        }
    }
}

function trackerNew() {
    function sendData(gTagParameters, firebaseParameters) {
        gtag('config', gaMeasurementId, gTagParameters);
        gtag('config', gaMeasurementId2, firebaseParameters);
    }

    console.log('Tracker New!');

    var gTagParameters = {};
    var firebaseParameters = {};
    var l=window.location.href;
    var keyTag; 
    var vsource; 
    var vtype;
    var ccode='';
    var usource;
    var umedium;
    var pagetype='';
    var trackerpage; 
    var pagePara;
    var ftcteam1;
    var userProperties = {};
    var username=GetCookie('USER_NAME') || GetCookie('USER_NAME_FT') || '';
    var userId = GetCookie('USER_ID') || '';
    var ccodeCookie=GetCookie('ccode') || '';
    var screenType=0;
    var deviceName;
    var subscriberType = updateSubscriberStatus();
    if (window.languagePreference === undefined) {
        window.languagePreference = GetCookie('LanguagePreference') || 0;
    }
    gTagParameters.linker = {domains: ['ftacademy.cn', 'ft.com', 'ftchinese.com']};
    gTagParameters.custom_map = {
        'metric1': 'engagement_score',
        'metric2': 'copy_text',
        'metric4': 'read_to_half',
        'dimension2': 'user_type',
        'dimension4': 'page_type',
        'dimension5': 'ftc_team',
        'dimension6': 'author',
        'dimension7': 'phone_version',
        'dimension8': 'story_genre',
        'dimension9': 'story_area',
        'dimension10': 'story_industry',
        'dimension11': 'main_topic',
        'dimension12': 'sub_topic',
        'dimension13': 'visiting_source',
        'dimension14': 'cm_user_id',
        'dimension15': 'reader_type',
        'dimension16': 'use_block',
        'dimension17': 'prefer_language',
        'dimension18': 'screen_type',
        'dimension20': 'translation_preference'
    };
    if (w >0) {
        if (w>1220) {
            screenType = 'XL: above 1220';
        } else if (w>980) {
            screenType = 'Large: 981-1220';
        } else if (w>690) {
            screenType = 'Medium: 691-981';
        } else if (w>490) {
            screenType = 'Small: 491-690';
        } else {
            screenType = 'Phone: under 491';
        }
        gTagParameters.screen_type = screenType;
    }
    
    if (/ipad/i.test(ua)) {
        deviceName = 'iPad';
    } else if (/OS [0-9]+\_/i.test(ua) && /iphone|ipod/i.test(ua)) {
        deviceName = 'iPhone';
    } else if (/android/i.test(ua)) {
        deviceName = 'Android';
    } else if (isTouchDevice() === true){
        deviceName = 'Other Touch Device';
    } else {
        deviceName = 'Desktop';
    }
    deviceName = 'Page by ' + deviceName;
    gTagParameters.contentGroup4 = deviceName;
    ccode = paravalue(l,'ccode');
    if (l.indexOf('gift_id')>0) {
        vsource='marketing';
        ccode='GiftArticle';
    } else if (l.indexOf('isappinstalled')>0  && l.indexOf('code')<0) {
        vsource='marketing';
        ccode='2G178002';
    } else if (l.indexOf('#s=d')>0) {
        vsource='DailyEmail';
        ccode='1D110215';
    } else if (l.indexOf('#s=n')>0) {
        vsource='DailyEmail';
        ccode='1D130201';
    } else if (l.indexOf('#s=o')>0) {
        vsource='DailyEmail';
        ccode='1D130202';
    } else if (l.indexOf('#s=p')>0) {
        vsource='PMEmail';
        ccode='1P110215';
    } else if (l.indexOf('#s=w')>0) {
        vsource='WeeklyEmail';
        ccode='1W110215';
    } else if (l.indexOf('?wt')>0) {
        vsource='Marketing';
        ccode='WeChatNewsQuiz';
    } else if (ccode==='1D110215') {
        vsource='DailyEmail';
    } else if (ccode==='1P110215') {
        vsource='PMEmail';
    } else if (ccode==='1W110215') {
        vsource='WeeklyEmail';
    } else if (ccode==='1R110215') {
        vsource='RSS';
    } else if (ccode==='1Z120420') {
        vsource='Zacker';
    } else if (l.indexOf('utm_campaign')>=0) {
        ccode=paravalue(l,'utm_campaign');
        vsource=paravalue(l,'utm_source');
    } else if (ccode==='') {
        ccode=GetCookie('ccode') || '';
        vsource='Other';
    } else {
        vsource='Other';
    }
    try {
        if (ccode!=='' && ccode!==ccodeCookie) {
            SetCookie('ccode',ccode,86400*100,'/','.ftchinese.com');
            SetCookie('ccode',ccode,86400*100,'/');
        }
    } catch (ignore) {
    
    }
    usource='marketing';
    umedium='campaign';
    if (/micromessenger/i.test(ua)) {
        usource='WeChat';
        umedium='Social';
    } else if (vsource.indexOf('Email')>=0) {
        usource='EmailNewsletter';
        umedium='referral';
    } else if (vsource.indexOf('RSS')>=0) {
        usource='RSS';
        umedium='referral';
    } else if (vsource.indexOf('Zacker')>=0) {
        usource='Zacker';
        umedium='referral';
    } 
    try {
        gTagParameters.AllowAnchor = true;
        if (ccode !== '' && l.indexOf('utm_campaign') < 0) {
            gTagParameters.campaign = {name: ccode, source: usource, medium: umedium};
            gTagParameters.campaign_name = ccode;
            gTagParameters.campaign_source = usource;
            gTagParameters.campaign_medium = umedium;
            l=window.location.href;
        }
    } catch(ignore) {}
    if (typeof window.interactiveType === 'string') {
        try{
            gTagParameters.contentGroup1 = window.interactiveType;
        }catch(ignore){
        
        }
    }
    if (subscriberType && typeof subscriberType === 'string' && subscriberType !== '') {
        vtype = subscriberType;
    } else if (username === '') {
        vtype = 'visitor';
    } else {
        vtype = 'member';
    }
    // MARK: Android native app will pass user info by injecting a javascript object. 
    if (window.androidUserInfo) {
        userId = window.androidUserInfo.id || userId;
        username = window.androidUserInfo.userName || username;
        vtype = 'member';
        if (window.androidUserInfo.membership && window.androidUserInfo.membership.tier) {
            vtype = (window.androidUserInfo.membership.tier === 'premium') ? 'VIP' : 'Subscriber';
            var androidExpireDate = window.androidUserInfo.membership.expireDate;
            if (typeof androidExpireDate === 'string' && !window.androidUserInfo.membership.vip) {
                var androidExpireDateStamp = new Date(androidExpireDate).getTime() + 24 * 60 * 60 * 1000;
                var nowTimeStamp = new Date().getTime();
                if (nowTimeStamp > androidExpireDateStamp) {
                    vtype = 'Churned' + vtype;
                }
            }
        }
    }
    gUserType = vtype;
    if (userId !== '') {
        gTagParameters.user_id = userId;
        gTagParameters.cm_user_id = userId;
        firebaseParameters.user_id = userId;
    }
    gTagParameters.user_type = gUserType;
    gTagParameters.visiting_source = vsource;
    try {
        keyTag=window.gKeyTag;
        keyTag=keyTag.replace(/白底|靠右|单页|插图|透明|高清|置顶|沉底|资料|突发|NoCopyrightCover|IsEdited/g,'').replace(/,+/g,',');
    } catch(ignore){}
    pagetype='';
    ftcteam1='';
    if (l.indexOf('story')>=0) {
        pagetype='Story';
    } else if (l.indexOf('interactive')>=0){
        pagetype='Interactive';
        ftcteam1='product';
    } else if (l.indexOf('photo')>=0){
        pagetype='Photo';
        ftcteam1='product';
    } else if (l.indexOf('video')>=0){
        pagetype='Video';
        ftcteam1='video';
    } else if (l.indexOf('search')>=0){
        pagetype='Search';
    } else if (l.indexOf('channel')>=0){
        pagetype='Channel';
    } else if (l.indexOf('comment')>=0){
        pagetype='coment';
    } else if (l.indexOf('column')>=0){
        pagetype='Column';
    } else if (l.indexOf('tag')>=0){
        pagetype='Tag';
    } else if (l.indexOf('topic')>=0){
        pagetype='Topic';
    } else if (l==='/' || l==='/?refresh=' || l.indexOf('index.php')>=0){
        pagetype='Home';
    } else {
        pagetype='Other';
    }
    gTagParameters.page_type = pagetype;

    if (window.ftcteam === undefined || window.ftcteam === null || window.ftcteam === '') {
        if (ftcteam1!==''){
            gTagParameters.ftc_team = ftcteam1;
        }
    } else {
        gTagParameters.ftc_team = window.ftcteam;
    }
    if (window.gauthor !== undefined && window.gauthor !== null && window.gauthor !== '') {
        gTagParameters.author = window.gauthor;
    }
    if (window.storyGenre !== undefined && window.storyGenre !== null && window.storyGenre !== '') {
        gTagParameters.story_genre = window.storyGenre;
    }
    if (window.storyArea !== undefined && window.storyArea !== null && window.storyArea !== '') {
        gTagParameters.story_area = window.storyArea;
    }
    if (window.storyIndustry !== undefined && window.storyIndustry !== null && window.storyIndustry !== '') {
        gTagParameters.story_industry = window.storyIndustry;
    }
    if (window.mainTopic !== undefined && window.mainTopic !== null && window.mainTopic !== '') {
        gTagParameters.main_topic = window.mainTopic;
    }
    if (window.subTopic !== undefined && window.subTopic !== null && window.subTopic !== '') {
        gTagParameters.sub_topic = window.subTopic;
    }
    updateClientIdLinks();
    userProperties = {
       'UserType': vtype
    };
    gtag('set', 'user_properties', userProperties);
    if (window.isBlocked === 'yes' || window.bBlocked === 'yes') {
        gTagParameters.use_block = 'yes';
    } else if (window.isBlocked === 'no'){
        gTagParameters.use_block = 'no';
    }
    var translationPreference = GetCookie('translation');
    if (translationPreference) {
        gTagParameters.translation_preference = translationPreference;
    }
    // MARK: - Experiments
    if (typeof window.gExperiments === 'object' && window.gExperiments.length > 0) {
        gtag('set', {experiments: window.gExperiments});
    }

    // gTagParameters.debug_mode = true;

    // console.log('gTagParameters: ');
    // console.log(JSON.stringify(gTagParameters));


    if (window.bpage !== undefined && window.bpage !== 0 && window.bpage !== null) {
        trackerpage=l;
        if (window.virtualPage !== undefined){
            trackerpage=window.virtualPage;
        } else {
            trackerpage=trackerpage.replace(/^.*\/story/g,'story');
        }
        if (window.metaInfo !== undefined){
            trackerpage=trackerpage + '?' + window.metaInfo;
        }
        trackerpage='/barrier/'+window.bpage+'/'+trackerpage;
        sendData(gTagParameters, firebaseParameters);
    } else if (window.virtualPage !== undefined){
        pagePara=l;
        pagePara=pagePara.replace(/^.*\/(story|video|interactive)\/[0-9]+/g,'').replace(/^.*\.com[\/]*/g,'').replace(/search\/.*$/g,'');
        if (window.metaInfo !== undefined){            
            if (/\?.*\#/i.test(pagePara)) {
                pagePara=pagePara.replace(/#/g,'&' + window.metaInfo +'#');
            } else if (pagePara.indexOf('?') >=0){
                pagePara=pagePara + '&' + window.metaInfo;
            } else if (pagePara.indexOf('#') >=0) {
                pagePara=pagePara.replace(/#/g,'?' + window.metaInfo +'#');
            }else {
                pagePara=pagePara + '?' + window.metaInfo;
            }
        } else {
            if (/\?/i.test(pagePara)) {
                pagePara=pagePara.replace(/\?/g,'&');
            }
        }
        if (window.gAutoStart === undefined) {
            gTagParameters.page_path = window.virtualPage+pagePara;
            sendData(gTagParameters, firebaseParameters);
        }
    } else {
        if (window.gAutoStart === undefined) {
            sendData(gTagParameters, firebaseParameters);
            // console.log(firebaseParameters);
        }
    }
}


function isTouchDevice() {
 return (('ontouchstart' in window) || (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
}

function showOverlay(overlayId) {
    document.getElementById(overlayId).className = 'overlay-container on';
}

function closeOverlay(overlayId) {
    if (overlayId !== undefined) {
        document.getElementById(overlayId).className = 'overlay-container';        
    } else {
        document.getElementById('pop-ad').style.display = 'none';
        document.getElementById('pop-ad').innerHTML = '';
    }

}

function showWarningMessage(warningType) {
    var promptId = (warningType === 'red') ? 'membership-red-card-prompt' : 'membership-yellow-card-prompt';
    var promptDiv = document.getElementById(promptId);
    if (promptDiv) {
        promptDiv.className = promptDiv.className.replace(/ hide/g, '');
        var emailLink = promptDiv.querySelector('.email-link');
        if (emailLink) {
            emailLink.href = 'mailto: subscriber.service@ftchinese.com?subject=Appeal For ' + window.userId;
        }
        gtag('event', 'Show', {'event_label': window.userId, 'event_category': 'Subscription Warning: ' + warningType, 'non_interaction': true});
    }
}

function checkUserWarnings() {
    // MARK: show warnings for those suspected of foul play
    if (window.userId === '') {
        return;
    }
    var yellowCardUserIds = window.gYellowCardUserIds || '';
    var redCardUserIds = window.gRedCardUserIds || '';
    window.cardType = 'clear';
    if (redCardUserIds.indexOf(window.userId)>=0) {
        showWarningMessage('red');
        window.cardType = 'red';
        DeleteCookie('paywall');
        DeleteCookie('paywall_expire');
    } else if (yellowCardUserIds.indexOf(window.userId)>=0) {
        window.cardType = 'yellow';
        showWarningMessage('yellow');
    }
    try {
        var card = {
            'userId': window.userId,
            'cardType': window.cardType
        };
        webkit.messageHandlers.card.postMessage(card);
    } catch (ignore) {

    }
}



function parseUrlSearch(){
    var para = location.search;
    if(para){
        para = para.substring(1);
        para = decodeURIComponent(para);
        var paraArr = para.split('&');
        return paraArr;
    }
    return undefined;
}

function getUrlParams(key){
    var value = '';
    var paraArr = parseUrlSearch();
    if (paraArr && paraArr.length>0){
        var arr = [];
        for(var i=0,len=paraArr.length; i<len; i++){
            if(paraArr[i].indexOf(key)>-1){
                arr = paraArr[i].split('=');
                if(arr.length>1){
                    value = arr[1];
                }
            }
        }
        return value;
    }
    return value;
}
window.ccodeValue = getUrlParams('ccode') || getUrlParams('utm_campaign') || GetCookie('ccode');
window.addEventListener('message', function(event){
    var ec = event.data.ec;
    var ea = event.data.ea;
    var el = event.data.el;
    if (ec && ea && el) {
        gtag('event', ea, {'event_label': el, 'event_category': ec, 'non_interaction': true});
    }
}, false);


// MARK: - SMS login and binding will be used in every page
var phoneLoginStatusDict = {
    start: 'start',
    login: 'login',
    sendingVerification: 'sending request for verification',
    sendingLoginInfo: 'sending login information'
};
var phoneLoginStatus = phoneLoginStatusDict.start;

function binding(from) {
    var status = document.getElementById(from + '-binding-status');
    var email = document.getElementById(from + '-binding-email').value;
    var password = document.getElementById(from + '-binding-password').value;
    status.innerHTML = '正在向服务器发送信息...';
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/index.php/jsapi/' + from + 'Binding');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var userInfo = JSON.parse(xhr.responseText);
            if (userInfo.status && userInfo.status === 'success') {
                status.innerHTML = '绑定成功';
                var loginEle = document.querySelector('.logincomment');
                if (loginEle) {
                    loginEle.style.display = 'block';
                }
                var queries = ['#' + from + '-ftc-binding-container', '#' + from + '-ftc-binding'];
                hideElements(queries);
                try {window.updateSubscriberStatus();} catch (ignore) {}
                try {window.payWall();} catch (ignore) {}
                try {window.closeOverlay('overlay-login');} catch(ignore){}
            } else if (userInfo.errmsg) {
                status.innerHTML = '服务器返回错误信息：' + userInfo.errmsg + '，请重新尝试';
            } else {
                status.innerHTML = '服务器返回未知错误：' + xhr.responseText;
            }
        } else {
            status.innerHTML = '服务器返回错误代码：' + xhr.status;
        }
    };
    xhr.onerror = function(err) {
        status.innerHTML = err.toString();
    };
    xhr.send(JSON.stringify({
        email: email,
        password: password
    }));
}

function getCapchaForPhoneLogin() {
    var statusEle = document.getElementById('phone-login-status');
    var phone = document.getElementById('phone-number').value;
    statusEle.innerHTML = '发送信息中，请注意查看短信...';
    phoneLoginStatus = phoneLoginStatusDict.sendingVerification;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/users/login/captcha');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
            var result = JSON.parse(xhr.responseText);
            if (!result.status || result.status !== 'success') {
                var errorMessage = result.errmsg || '出现未知错误，但服务器返回的信息不包含错误详情(errmsg)，如多次出现这种情况，请截屏给客服';
                statusEle.innerHTML = '服务器返回错误信息，请您重试一次：' + errorMessage;
                phoneLoginStatus = phoneLoginStatusDict.start;
            }
            statusEle.innerHTML = '验证码已经成功发送，请注意检查您的短信，在5分钟内完成登录';
            document.getElementById('phone-captcha').style.display = 'block';
            document.getElementById('phone-login-submit-button').value = '登录';
            phoneLoginStatus = phoneLoginStatusDict.login;
         } else {
            statusEle.innerHTML = '服务器返回错误代码：' + xhr.status + '，请重新尝试';
            phoneLoginStatus = phoneLoginStatusDict.start;
        }
    };
    xhr.onerror = function(err) {
        var isTypeError = typeof err === 'object' && err.type === 'error';
        var errInfo = '您现在无法连接登录的服务器，请稍后尝试，如果此情况多次出现，请求助我们的客服。';
        errInfo += isTypeError ? '' : '错误详情：' + err.toString(); 
        statusEle.innerHTML = errInfo;
    };
    xhr.send(JSON.stringify({
        mobile_phone_no: phone
    }));
}

function submitPhoneLogin() {
    function reportLoginToNative() {
        var data = {action: 'login', userId: window.userId, method: 'phone'};
        try {
            if (typeof webkit === 'object') {
                webkit.messageHandlers.login.postMessage(data);
            } else if (Android) {
                Android.onPageLoaded(JSON.stringify(data));
            }
        } catch (ignore) {}
    }
    var u, p;
    u = document.querySelector('#phone-number').value;
    p = document.querySelector('#phone-captcha').value;
    var statusMsgDiv = document.getElementById('phone-login-status');
    statusMsgDiv.innerHTML = '正在登录中...';
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState !== 4) { return;}
        if (this.status !== 200) {
            statusMsgDiv.innerHTML = '<div class="highlight">对不起，网络故障。请过一段时间再重新尝试。</div>';
            return;
        }
        var l = JSON.parse(this.responseText);
        if (!l.status || l.status !== 'ok') {
            statusMsgDiv.innerHTML = '<div class="highlight">'+ l.msg + '</div>';
            return;
        }
        statusMsgDiv.innerHTML = '登录成功！';
        username = u;
        if (window.userId === undefined || window.userId === '') {
            window.userId = GetCookie('USER_ID') || '';
        }
        try {window.updateSubscriberStatus();} catch (ignore) {}
        try {window.payWall();} catch (ignore) {}
        try {window.closeOverlay('overlay-login');} catch(ignore){}
        try {window.checkLogin();window.paywall();} catch (ignore) {}
        reportLoginToNative();
        document.getElementById('phone-login-container').style.display = 'none';
        var loginContainer = document.getElementById('overlay-login-container');
        if (loginContainer) {loginContainer.style.display = 'block';}
        document.documentElement.classList.add('is-member');
    };
    var params = 'username='+ u + '&password=' + p + '&saveme=1';
    var randomNumber = parseInt(Math.random()*1000000, 10);
    xmlhttp.open('POST', '/index.php/users/login/ajax?' + randomNumber);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.send(params);
}

function phoneLogin() {
    if (phoneLoginStatus === phoneLoginStatusDict.start) {
        getCapchaForPhoneLogin();
    } else if (phoneLoginStatus === phoneLoginStatusDict.sendingVerification || phoneLoginStatus === phoneLoginStatusDict.sendingLoginInfo) {
        return;
    } else if (phoneLoginStatus === phoneLoginStatusDict.login) {
        submitPhoneLogin();
    }
}

function resetPhoneLogin() {
    if (phoneLoginStatusDict.start === phoneLoginStatus) {return;}
    phoneLoginStatus = phoneLoginStatusDict.start;
    document.getElementById('phone-login-submit-button').value = '获取验证码';
    document.getElementById('phone-login-status').innerHTML = '';
}

function cleanFields() {
    var ids = ['phone-binding-email', 'phone-binding-password', 'wechat-binding-email', 'wechat-binding-password', 'phone-number', 'phone-captcha'];
    for (var i=0; i<ids.length; i++) {
        var ele = document.getElementById(ids[i]);
        if (!ele) {continue;}
        ele.value = '';
    }
}

function hideElements(queries) {
    for (var i=0; i<queries.length; i++) {
        var ele = document.querySelector(queries[i]);
        if (!ele) {continue;}
        ele.style.display = 'none';
    }
}

function showPhoneFTCBinding() {
    var hideEles = ['.nologincomment', '.logincomment', '#overlay-login-container', '#overlay-login-form'];
    hideElements(hideEles);
    document.querySelector('#phone-ftc-binding-container').style.display = 'block';
    cleanFields();
}

function showPhoneLogin() {
    var hideEles = ['.nologincomment', '.logincomment', '#phone-captcha', '#overlay-login-container'];
    hideElements(hideEles);
    document.querySelector('#phone-login-container').style.display = 'block';
    phoneLoginStatus = 'start';
    cleanFields();
}



function checkUserLoginFromCookie() {
    if (window._IS_NODEJS_SITE) {
        // console.log('For the new site, no need to check cookie on frontend! ');
        return;
    }
    window.username = GetCookie('USER_NAME') || GetCookie('USER_NAME_FT') || '';
    window.userId = GetCookie('USER_ID') || '';
    window.ccodeCookie = GetCookie('ccode') || '';
    window.user_name = GetCookie('USER_NAME') || GetCookie('USER_NAME_FT');
    if (window.user_name !== null) {
        document.documentElement.className += ' is-member';
    }
}

checkUserLoginFromCookie();
