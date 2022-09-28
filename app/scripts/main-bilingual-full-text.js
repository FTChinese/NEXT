(function(){
    var delegate = new Delegate(document.body);
    function getParagraphsArray(text, source) {
        var originalTextArray = text.split('\n');
        var newTextArray = [];
        var foundTitle = false;
        var foundByline = false;
        var linkTitle = (source === 'original') ? 'Related Link' : '相关链接';
        for (var i=0; i<originalTextArray.length; i++) {
            var p = originalTextArray[i]
            .replace(/\*/g, '')
            .replace(/^(http.+\.(jpeg|gif|jpg|png))$/g, '<img src="$1">')
            .replace(/\[[\s]*?(http[\S]+) (.*)\]/g, '<a href="$1" target="_blank">$2</a>')
            .replace(/^(http.*)$/g, '<a href="$1" target="_blank">' + linkTitle + '</a>')
            .replace(/^(&gt;|>)\s*(.*)$/g, '<blockquote class="n-content-blockquote"><p>$2</p></blockquote>');
            if (p.indexOf('ITV') >= 0) {
                //console.log (p);
            }
            if (/[\.。] *$/.test(p)) {
                foundTitle = true;
                foundByline = true;
                newTextArray.push(p);
            } else if (foundTitle === false && p !== '' && !/^[\s]+$/.test(p)) {
                foundTitle = true;
            } else if (foundTitle && foundByline === false && p !== '' && !/^[\s]+$/.test(p)) {
                foundByline = true;
            } else if (p !== '' && !/^[\s]+$/.test(p)) {
                newTextArray.push(p);
            }
        }
        return newTextArray;
    }

    function updateTimeStamps() {
        var timeContainers = document.querySelectorAll('.time-container');
        for (var m=0; m<timeContainers.length; m++) {
            var timeContainer = timeContainers[m];
            var publishTimeValue = timeContainer.getAttribute('data-original-time');
            if (publishTimeValue === '') {continue; }
            var publishTimeStamp = parseInt(publishTimeValue, 10);
            var nowTimeStamp = (new Date()).getTime()/1000;
            var secondsDiff = Math.floor(nowTimeStamp - publishTimeStamp);
            var display = {};
            var s = '';
            if (secondsDiff < 60) {
                display = {en: secondsDiff + ' seconds ago', ch: secondsDiff + '秒前'};
            } else if (secondsDiff < 60 * 60) {
                var minutesDiff = Math.floor(secondsDiff/60);
                s = (minutesDiff === 1) ? 's' : '';
                display = {en: minutesDiff + ' minute' + s + ' ago', ch: minutesDiff + '分钟前'};
            } else if (secondsDiff < 60 * 60 * 24) {
                var hoursDiff = Math.floor(secondsDiff/(60*60));
                s = (hoursDiff === 1) ? 's' : '';
                display = {en: hoursDiff + ' hour' + s + ' ago', ch: hoursDiff + '小时前'};
            } else if (secondsDiff < 60 * 60 * 24 * 7) {
                var daysDiff = Math.floor(secondsDiff/(60*60*24));
                s = (daysDiff === 1) ? 's' : '';
                display = {en: daysDiff + ' day' + s + ' ago', ch: daysDiff + '天前'};
            } else {
                var publishTime = new Date(publishTimeStamp * 1000);
                var year = publishTime.getFullYear();
                var month = publishTime.getMonth() + 1;
                var day = publishTime.getDate();
                display = {en: year + '-' + month + '-' + day, ch: year + '年' + month + '月' + day + '日'};
            }
            timeContainers[m].innerHTML = '<div class="item-time highlight original">' + display.en + '</div><div class="item-time highlight">' + display.ch + '</div>';
        }
    }

    function showPreference() {
        var userId = GetCookie('USER_ID');
        if (userId === null && location.hostname === 'www.chineseft.com') {return;}
        var translationPreference = GetCookie('translation');
        if (translationPreference) {
            setTranslation(translationPreference);
        } else {
            document.getElementById('overlay-news-preference').className += ' on';
            var preferenceElements = document.querySelectorAll('#translation-display-preference div');
            var confirmButton = document.getElementById('confirm-translation-preference');
            if (preferenceElements.length > 1 && confirmButton) {
                preferenceElements[1].className += ' selected';
                confirmButton.className = confirmButton.className.replace(/disabled/g, '').trim();
            }
        }
        document.querySelector('.cover-lead').innerHTML += '<div class="changePreference">修改我对译文的偏好</div>';
        var leftTopBoxes = document.querySelectorAll('.visitor-box, .member-box');
        for (var i=0; i<leftTopBoxes.length; i++) {
            leftTopBoxes[i].innerHTML = '<a class="change-translation-preference">译文偏好</a>' + leftTopBoxes[i].innerHTML;
        }
        var mobileTopRightButton = document.querySelector('.o-nav__search');
        if (mobileTopRightButton) {
            mobileTopRightButton.innerHTML = '<button class="btn-change-translation-preference"></button>';
        }
    }

    function setTranslation(p) {
        var prefix = 'translation-';
        var htmlClass = document.body.className;
        var translationPrefenceElements = document.querySelectorAll('#translation-display-preference div');
        for (var i=0; i<translationPrefenceElements.length; i++) {
            var preference = translationPrefenceElements[i].getAttribute('data-translation');
            htmlClass = htmlClass.replace(prefix + preference, '');
        }
        htmlClass = htmlClass.trim() + ' ' + prefix + p;
        document.body.className = htmlClass;
        var c = document.getElementById('confirm-translation-preference').className;
        document.getElementById('confirm-translation-preference').className = c.replace(/disabled/g, '');
    }

    delegate.on('click', '.preference-selection div', function(){
        var all = this.parentNode.querySelectorAll('div');
        for (var i=0; i<all.length; i++) {
            var c = all[i].className;
            all[i].className = c.replace(/ selected/g, '');
        }
        this.className += ' selected';
        var c1 = document.getElementById('confirm-translation-preference').className;
        document.getElementById('confirm-translation-preference').className = c1.replace(/disabled/g, '').trim();
    });

    delegate.on('click', '#confirm-translation-preference', function(){
        if (this.className.indexOf('disabled') >=0) {
            alert('您还没有选择您对译文的偏好！');
            this.value = '请先选择再确定';
            return;
        }
        var selectedPreference = document.querySelector('.preference-selection div.selected');
        var translationPreference = selectedPreference.getAttribute('data-translation');
        SetCookie('translation',translationPreference,'','/',null);
        setTranslation(translationPreference);
        var preferenceSetting = document.getElementById('overlay-news-preference');
        var c = preferenceSetting.className;
        preferenceSetting.className = c.replace(/ on/g, '');
    });

    delegate.on('click', '.changePreference, .change-translation-preference, .btn-change-translation-preference', function(){
        document.getElementById('overlay-news-preference').className += ' on';
        var translationPreference = GetCookie('translation');
        var preferenceElements = document.querySelectorAll('#translation-display-preference div');
        for (var i=0; i<preferenceElements.length; i++) {
            if (preferenceElements[i].getAttribute('data-translation') === translationPreference) {
                preferenceElements[i].className += ' selected';
            }
        }
    });

    var itemContainers = document.querySelectorAll('.item-container.bilingual-full-text');
    for (var j=0; j<itemContainers.length; j++) {
        var bodyContainerEle = itemContainers[j].querySelector('.body-container');
        var originalTextEle = itemContainers[j].querySelector('.body-container .original');
        var originalTextArray = getParagraphsArray(originalTextEle.innerHTML, 'original');
        var translationTextEle = itemContainers[j].querySelector('.body-container .translations');
        var translationTextsArray = translationTextEle.innerHTML.split('-|-');
        for (var i=0; i<translationTextsArray.length; i++) {
            translationTextsArray[i] = getParagraphsArray(translationTextsArray[i], 'translation');
        }
        var bodyHTML = '';
        for (var l=0; l<originalTextArray.length; l++) {
            var currentRow = '<div>' + originalTextArray[l] + '</div>';
            for (var k=0; k<Math.min(1, translationTextsArray.length); k++) {
                if (l<translationTextsArray[k].length) {
                    currentRow += '<div class="translations rendered">' + translationTextsArray[k][l] + '</div>';
                }
            }
            bodyHTML += '<div class="body-container">' + currentRow + '</div>';
        }
        bodyContainerEle.outerHTML = bodyHTML;
        var translationHeadlineEle = itemContainers[j].querySelector('.title-container .translations');
        var translationHeadlineArray = translationHeadlineEle.innerHTML.split('-|-');
        translationHeadlineEle.innerHTML = translationHeadlineArray[0];
        translationHeadlineEle.className += ' rendered';
    }



    updateTimeStamps();
    showPreference();
})();
