/* exported addstoryfav, showOverlay, closeOverlay, w, isTouchDevice*/
/* jshint ignore:start */


function GetCookie(name){
    var start = document.cookie.indexOf(name+"="),
        len = start+name.length+1,
        end = document.cookie.indexOf(";",len);
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
   if(sec === null || sec === "") {sec = 600 * (24 * 60 * 60 * 1000);}
    else {sec = 1000*sec;}
    expires.setTime (expires.getTime() + sec);
    document.cookie = name + "=" + escape (value) +((expires === null) ? "" : ("; expires=" + expires.toGMTString())) +((path === null) ? "/" : ("; path=" + path)) +((domain === null) ? "" : ("; domain=" + domain)) +((secure === true) ? "; secure" : "");  
}

function DeleteCookie (name) {  
    var exp = new Date(),cval = GetCookie (name);
    exp.setTime (exp.getTime() - 1);
    document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
}
var username=GetCookie('USER_NAME') || '';
var userId = GetCookie('USER_ID') || '';
var ccodeCookie=GetCookie('ccode') || '';
/* jshint ignore:end */

var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
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
    document.getElementById(overlayId).className = 'overlay-container';
}

/* jshint ignore:start */
var user_name=GetCookie ("USER_NAME");
if (user_name !== null) {
    document.documentElement.className += ' is-member';
}
/* jshint ignore:end */