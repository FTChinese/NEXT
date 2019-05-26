// follow and unfollow topic

// click events
try {
    //var eleFollow;
    var key = 'my-ft-follow';
    delegate.on('click', '.myft-follow', function(){
        // MARK: - Since our server side developers can't figure out why the server-based MyFT doesn't work, use client side technology to enable this. 
        var isFollowed = (this.className.indexOf(' plus')>0) ? false : true;
        //var currentButtonText = this.innerHTML;
        if (!localStorage) {
            alert ('亲爱的读者，您的浏览器不支持localStorage，请您更换现代浏览器来使用关注的功能。');
            return;
        }
        var savedFollowList = localStorage.getItem(key);
        var savedFollowListJSON = JSON.parse(savedFollowList) || {};
        var dataTag = this.getAttribute('data-tag') || '';
        var dataType = this.getAttribute('data-type') || 'tag';
        if (dataTag === '') {
            alert ('亲爱的读者，我们无法识别您关注的标签，请您刷新页面重新试试。');
            return;
        }
        if (typeof savedFollowListJSON[dataType] !== 'object') {
            savedFollowListJSON[dataType] = [];
        }
        if (isFollowed === false) {
            if (savedFollowListJSON[dataType].indexOf(dataTag)<0) {
                savedFollowListJSON[dataType].push(dataTag);
            }
        } else {
            var newSavedTags = [];
            for (var i=0; i<savedFollowListJSON[dataType].length; i++) {
                if (savedFollowListJSON[dataType][i] !== dataTag) {
                    newSavedTags.push(savedFollowListJSON[dataType][i]);
                }
            }
            savedFollowListJSON[dataType] = newSavedTags;
        }
        var newFollowList = JSON.stringify(savedFollowListJSON);
        localStorage.setItem(key, newFollowList);
        checkFollow();
        //console.log (savedFollowListJSON);
        // if(window.username === '' || window.username === null){
        //     document.getElementById('login-reason').innerHTML = '<b>请先登录再关注话题</b>';
        //     showOverlay('overlay-login');
        // } else {
        //     if (this.className.indexOf(' pending')>=0) {
        //         return;
        //     } else {
        //         this.className += ' pending';
        //     }
        //     var cmd = (this.className.indexOf(' plus')>0)?1:0;
        //     var currentButtonText = this.innerHTML;
        //     var cmdStatus = 'pending';
        //     var xhr = new XMLHttpRequest();
        //     var ajaxMethod;
        //     var ajaxUrl;
        //     var message = {};
        //     message.head = {};
        //     message.head.transactiontype = '31003';
        //     message.head.source = 'web';
        //     message.body = {};
        //     message.body.ielement = {};
        //     message.body.ielement.type = this.getAttribute('data-type');
        //     message.body.ielement.value = this.getAttribute('data-tag');
        //     message.body.ielement.cmd = cmd;
        //     if (/127\.0|localhost|192\.168/.test(window.location.href)) {
        //         ajaxMethod = 'GET';
        //         ajaxUrl = '/api/page/recommend.json';
        //     } else {
        //         ajaxMethod = 'POST';
        //         ajaxUrl = '/eaclient/apijson.php';
        //     }
        //     this.innerHTML = (this.className.indexOf(' plus')>0)?'关注...':'取消关注...';
        //     eleFollow = this;
        //     xhr.open(ajaxMethod, encodeURI(ajaxUrl));
        //     xhr.setRequestHeader('Content-Type', 'application/json');
        //     xhr.onload = function() {
        //         try {
        //             if (xhr.status === 200) {
        //                 var data = JSON.parse(xhr.responseText);
        //                 if (data.body.oelement.errorcode === '0') {
        //                     cmdStatus = 'success';
        //                 } else if (data.body.oelement.errorcode === '20101') {
        //                     cmdStatus = 'followed';
        //                 } else if (data.body.oelement.errorcode === '20100') {
        //                     cmdStatus = 'unfollowed';
        //                 } else {
        //                     cmdStatus = 'failed';
        //                 }
        //             } else if (xhr.status !== 200) {
        //                 this.innerHTML = '操作失败';
        //                 cmdStatus = 'failed';
        //                 //alert('Request failed.  Returned status of ' + xhr.status);
        //             }
        //         } catch(ignore) {
        //             cmdStatus = 'failed';
        //         }
        //         //alert (eleFollow.innerHTML);
        //         if (cmdStatus === 'success') {
        //             if (cmd === 1) {
        //                 eleFollow.innerHTML = '已关注';
        //                 eleFollow.className = eleFollow.className.replace(' plus', ' tick');
        //             } else {
        //                 eleFollow.innerHTML = '关注';
        //                 eleFollow.className = eleFollow.className.replace(' tick', ' plus');
        //             }
        //         } else if (cmdStatus === 'followed') {
        //             eleFollow.innerHTML = '已关注';
        //             eleFollow.className = eleFollow.className.replace(' plus', ' tick');
        //         } else if (cmdStatus === 'unfollowed') {
        //             eleFollow.innerHTML = '关注';
        //             eleFollow.className = eleFollow.className.replace(' tick', ' plus');
        //         } else {
        //             eleFollow.innerHTML = '操作失败';
        //             setTimeout(function(){
        //                 eleFollow.innerHTML = currentButtonText;
        //             },1000);
        //         }
        //         eleFollow.className = eleFollow.className.replace(/ pending/g, '');
        //     };
        //     xhr.send(JSON.stringify(message));
        // }
    });
} catch (ignore) {

}
/*
function contains(a, obj) {
    if (a && a.length>0 && obj && obj.value && obj.tag) {
        for (var i = 0; i < a.length; i++) {
            if (a[i].value === obj.value && a[i].tag === obj.tag) {
                // console.log ('yes:');
                // console.log (a[i]);
                // console.log (obj);
                return true;
            } else {
                // console.log ('no:');
                // console.log (a[i]);
                // console.log (obj);
            }
        }
    }
    return false;
}
*/

function checkFollow() {
    if (!localStorage) {
        alert ('亲爱的读者，您的浏览器不支持localStorage，请您更换现代浏览器来使用关注的功能。');
        return;
    }
    var savedFollowList = localStorage.getItem(key);
    var savedFollowListJSON = JSON.parse(savedFollowList) || {};
    var followButtons = document.querySelectorAll('button.myft-follow');
    for (var i=0; i < followButtons.length; i++) {
        var dataType = followButtons[i].getAttribute('data-type');
        var dataTag = followButtons[i].getAttribute('data-tag');
        if (typeof savedFollowListJSON[dataType] !== 'object') {
            continue;
        }
        if (savedFollowListJSON[dataType].indexOf(dataTag)>=0) {
            followButtons[i].innerHTML = '已关注';
            followButtons[i].className = followButtons[i].className.replace(/ plus/g, ' tick');
        } else {
            followButtons[i].innerHTML = '关注';
            followButtons[i].className = followButtons[i].className.replace(/ tick/g, ' plus');            
        }
    }
    //console.log (savedFollowListJSON);
    // var xhr = new XMLHttpRequest();
    // var ajaxMethod;
    // var ajaxUrl;
    // var message = {};
    // message.head = {};
    // message.head.transactiontype = '31004';
    // message.head.source = 'web';
    // message.body = {};
    // message.body.ielement = {};
    // if (/127\.0|localhost|192\.168/.test(window.location.href)) {
    //     ajaxMethod = 'GET';
    //     ajaxUrl = '/api/page/recommend.json';
    // } else {
    //     ajaxMethod = 'POST';
    //     ajaxUrl = '/eaclient/apijson.php';
    // }
    // xhr.open(ajaxMethod, encodeURI(ajaxUrl));
    // xhr.setRequestHeader('Content-Type', 'application/json');
    // xhr.onload = function() {
    //     if (xhr.status === 200) {
    //         var data = JSON.parse(xhr.responseText);
    //         //console.log (data);
    //         var followButtons = document.querySelectorAll('button.myft-follow');
    //         for (var i=0; i < followButtons.length; i++) {
    //             var thisObj = {};
    //             thisObj.type = followButtons[i].getAttribute('data-type');
    //             thisObj.value = followButtons[i].getAttribute('data-tag');
    //             if (contains(data.body.odatalist, thisObj) === true) {
    //                 followButtons[i].innerHTML = '已关注';
    //                 followButtons[i].className = followButtons[i].className.replace(/ plus/g, ' tick');
    //             }
    //         }
    //     }
    // };
    // xhr.send(JSON.stringify(message));
}

checkFollow();