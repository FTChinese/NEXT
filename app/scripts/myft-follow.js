// follow and unfollow topic

// click events
try {
    //var eleFollow;
    var key = 'my-ft-follow';
    if (typeof delegate === 'undefined') { 
        window.delegate = new Delegate(document.body);
    }
    delegate.on('click', '.myft-follow', function(){
        // MARK: - Since our server side developers can't figure out why the server-based MyFT doesn't work, use client side technology to enable this. 
        var isFollowed = (this.className.indexOf(' plus')>0) ? false : true;
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
    });
} catch (ignore) {

}
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
        if (dataTag.indexOf('%')>=0) {
            dataTag = decodeURIComponent(dataTag);
            followButtons[i].setAttribute('data-tag', dataTag);
        }
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
}
checkFollow();