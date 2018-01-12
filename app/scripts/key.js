/* exported DeleteCookie,username,userId,ccodeCookie,addstoryfav, showOverlay, closeOverlay, w, isTouchDevice, trackerNew, paravalue, trackAdClick*/
var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var ua = navigator.userAgent || navigator.vendor || '';
var gIsSpider = (/spider|baidu|bidu|bot|crawler|crawling/i.test(ua)) ? true: false;
var gUserType = 'visitor';


// MARK: - check for hard-to-find spiders such as those disguised as iOS 9 devices
function findMoreSpider() {
    if (gIsSpider === false && /iPhone OS 9\_1 /i.test(ua) && typeof httpspv !== 'function') {
        gIsSpider = true;
    }
}

function GetCookie(name){
    var start = document.cookie.indexOf(name+'='),
        len = start+name.length+1,
        end = document.cookie.indexOf(';',len);
    if ((!start) && (name !== document.cookie.substring(0,name.length))) {return null;}
    if (start === -1) {return null;}
    if (end === -1) {end = document.cookie.length; }
    return decodeURIComponent(document.cookie.substring(len,end));
}

function SetCookie (name, value , sec , path , domain) {  
    var argv = SetCookie.arguments,
        argc = SetCookie.arguments.length,
        expires = new Date(),
        secure = (argc > 5) ? argv[5] : false;
    path = (argc > 3) ? argv[3] : null;
    domain = (argc > 4) ? argv[4] : null;
   if(sec === null || sec === '') {sec = 600 * (24 * 60 * 60 * 1000);}
    else {sec = 1000*sec;}
    expires.setTime (expires.getTime() + sec);
    document.cookie = name + '=' + escape (value) +((expires === null) ? '' : ('; expires=' + expires.toGMTString())) +((path === null) ? '/' : ('; path=' + path)) +((domain === null) ? '' : ('; domain=' + domain)) +((secure === true) ? '; secure' : '');  
}

function DeleteCookie (name) {  
    var exp = new Date(),cval = GetCookie (name);
    exp.setTime (exp.getTime() - 1);
    document.cookie = name + '=' + cval + '; expires=' + exp.toGMTString();
}

function paravalue(theurl, thep) {
    var k,thev;
    if (theurl.indexOf(thep + '=')>1) {
        k=theurl.indexOf(thep) + thep.length + 1;
        thev=theurl.substring(k,theurl.length);
        thev=thev.replace(/[\&\#].*/g,'');
    } else {
        thev='';
    }
    return thev;
}

function trackerNew() {
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
    var i;
    var keyTagArray;
    var username=GetCookie('USER_NAME') || '';
    var userId = GetCookie('USER_ID') || '';
    var ccodeCookie=GetCookie('ccode') || '';
    var screenType=0;
    var deviceName;
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
        ga('set', 'dimension18', screenType);
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
    ga('set', 'contentGroup4', deviceName);

    //console.log (screenType);
    ccode=paravalue(l,'ccode');
    if (l.indexOf('isappinstalled')>0  && l.indexOf('code')<0) {
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
    }else {
        vsource='Other';
    }
    try{
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
    try{
        ga('set', 'AllowAnchor', true);
        if (ccode!=='' && l.indexOf('utm_campaign')<0) {
            ga('set', 'campaignName', ccode);
            ga('set', 'campaignSource', usource);
            ga('set', 'campaignMedium', umedium);
            l=window.location.href;
        }
    }catch(ignore){
    
    }
    if (typeof window.interactiveType === 'string') {
        try{
            ga('set', 'contentGroup1', window.interactiveType); 
        }catch(ignore){
        
        }
    }

    if (window.FTAdchID !== undefined && window.FTAdchID !== null && window.FTAdchID !== '') {
        ga('set', 'dimension1', window.FTAdchID);
    }

    if (gIsSpider === true) {
        vtype = 'spider';
    } else if (username === '') {
        vtype = 'visitor';
    } else {
        vtype = 'member';
    }

    gUserType = vtype;

    if (userId !== '') {
        ga('set', 'dimension14', userId);
        ga('set', 'userId', userId);
    }
    
    ga('set', 'dimension2', vtype);
    ga('set', 'dimension13', vsource);

    try {
        keyTag=window.gKeyTag;
        keyTag=keyTag.replace(/白底|靠右|单页|插图|透明|高清|置顶|沉底|资料|突发/g,'').replace(/,+/g,',');
    } catch(ignore){    
    }
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
    ga('set', 'dimension4', pagetype);

    if (window.ftcteam === undefined || window.ftcteam === null || window.ftcteam === '') {
        if (ftcteam1!==''){
            ga('set', 'dimension5', ftcteam1);
        }
    } else {
        ga('set', 'dimension5', window.ftcteam);
    }
    if (window.gauthor !== undefined && window.gauthor !== null && window.gauthor !== '') {
        ga('set', 'dimension6', window.gauthor);
    }
    if (window.storyGenre !== undefined && window.storyGenre !== null && window.storyGenre !== '') {
        ga('set', 'dimension8', window.storyGenre);
    }
    if (window.storyArea !== undefined && window.storyArea !== null && window.storyArea !== '') {
        ga('set', 'dimension9', window.storyArea);
    }
    if (window.storyIndustry !== undefined && window.storyIndustry !== null && window.storyIndustry !== '') {
        ga('set', 'dimension10', window.storyIndustry);
    }
    if (window.mainTopic !== undefined && window.mainTopic !== null && window.mainTopic !== '') {
        ga('set', 'dimension11', window.mainTopic);
    }
    if (window.subTopic !== undefined && window.subTopic !== null && window.subTopic !== '') {
        ga('set', 'dimension12', window.subTopic);
    }

    //Optimize trackNew
    //console.log('Optimize track new');
    setTimeout(function(){
        if (window.isBlocked === 'yes' || window.bBlocked === 'yes') {
            ga('set', 'dimension16', 'yes');
        } else if (window.isBlocked === 'no'){
            ga('set', 'dimension16', 'no');
        }

        // if (typeof window.bBlocked === 'string' ) {
        //     ga('send','event', 'home', 'In View Error Catch: 026', window.isBlocked + '/' + window.bBlocked, {'nonInteraction':1});
        // }

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
            ga('send', 'pageview', trackerpage);
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
            if (window.gAutoStart === undefined) {ga('send', 'pageview', window.virtualPage+pagePara);}
        } else {
            if (window.gAutoStart === undefined) {ga('send', 'pageview');}
        }
	    if (typeof window.FTStoryid === 'string' && typeof keyTag === 'string' && keyTag.indexOf(',')>=0) {
	        keyTagArray=keyTag.split(',');
	        for (i = 0; i < keyTagArray.length; i++) {
	            ga('send','event','Story Tag',keyTagArray[i],window.FTStoryid,{'nonInteraction':1});
	        }
	    }
    }, 1);//old 300
}

var username=GetCookie('USER_NAME') || '';
var userId = GetCookie('USER_ID') || '';
var ccodeCookie=GetCookie('ccode') || '';


function isTouchDevice() {
    var el = document.createElement('div');
    el.setAttribute('ongesturestart', 'return;');
    if (typeof el.ongesturestart === 'function') {
        return true;
    } else {
        return false;
    }
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



var user_name=GetCookie ('USER_NAME');
if (user_name !== null) {
    document.documentElement.className += ' is-member';
}
findMoreSpider();