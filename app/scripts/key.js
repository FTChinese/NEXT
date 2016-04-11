/* exported addstoryfav, showOverlay, closeOverlay*/
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

function addstoryfav(storyid){
    if(username===''||username===null){
        alert('您必须登录后能才能收藏文章!');
        return;
    }
    document.getElementById('addfavlink').innerHTML = '保存...';
    /*
    $.post('/users/addfavstory/'+storyid, {
        storyid: storyid
    }, function(data){
        if(data === 'ok') {
            document.getElementById('addfavlink').innerHTML = '已收藏';
        }
    });
    */
    var xhr1 = new XMLHttpRequest();
    xhr1.open('POST', '/users/addfavstory/'+storyid);
    xhr1.setRequestHeader('Content-Type', 'application/text');
    xhr1.onload = function() {
        if (xhr1.status === 200) {
            var data = xhr1.responseText;
            if (data === 'ok') {
                document.getElementById('addfavlink').innerHTML = '已收藏';
            }
        } else if (xhr1.status !== 200) {
            //alert('Request failed.  Returned status of ' + xhr.status);
        }
    };
    xhr1.send(JSON.stringify({
        storyid: storyid
    }));

}

function showOverlay(overlayId) {
    document.getElementById(overlayId).className = 'overlay-container on';
}

function closeOverlay(overlayId) {
    document.getElementById(overlayId).className = 'overlay-container';
}

/* jshint ignore:start */
function logout() {
    DeleteCookie ("USER_NAME");
    window.location.href += "?logout=y";
}
var user_name=GetCookie ("USER_NAME");
if (user_name !== null) {
    document.documentElement.className += ' is-member';
}
/* jshint ignore:end */