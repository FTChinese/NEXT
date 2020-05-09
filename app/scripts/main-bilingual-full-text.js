(function(){
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
                console.log (p);
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
            console.log (secondsDiff);
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
            console.log (display);
            timeContainers[m].innerHTML = '<div class="item-time highlight original">' + display.en + '</div><div class="item-time highlight">' + display.ch + '</div>';
        }
    }

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
})();