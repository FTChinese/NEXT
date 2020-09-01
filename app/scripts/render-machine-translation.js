(function(){
    var translations = document.querySelector('#story-body-container #translations-ch');
    var original = document.querySelector('#story-body-container #translations-en');
    if (!translations || !original) {return;}
    var finalHTML = '';
    var originalText = original.value;
    var originalTextDiv = document.createElement('DIV');
    originalTextDiv.innerHTML = originalText;
    var translationArray = JSON.parse(translations.value);
    var originalCount = originalTextDiv.children.length;
    var translationCount = translationArray.length;
    var translationDict = {};
    for (var j=0; j<translationCount; j++) {
        var translationId = translationArray[j].id;
        translationDict[translationId] = translationArray[j].translations;
    }
    // var maxChildren = Math.max(originalCount, translationCount);
    var translationTextDiv = document.createElement('DIV');
    for (var i=0; i<originalCount; i++) {
        var leftEle = originalTextDiv.children[i];
        var leftHTML = leftEle.outerHTML;
        // var id = leftEle.id;
        finalHTML += '<div class="leftp">' + leftHTML + '</div>';
        translationTextDiv.innerHTML = leftHTML;
        var translationChildren = translationTextDiv.querySelectorAll('[id]');
        if (translationChildren.length > 0) {
            for (var k=0; k<translationChildren.length; k++) {
                var id = translationChildren[k].id;
                if (id && translationDict[id] && translationDict[id].length > 0) {
                    var translationIndex = (translationDict[id].length > 1) ? 1 : 0;
                    translationChildren[k].innerHTML = translationDict[id][translationIndex].replace(/<< \/ a>/g,'</a>');
                    translationChildren[k].setAttribute('current-index', translationIndex);
                    if (translationDict[id].length > 1) {
                        translationChildren[k].className += ' can-switch-translations';
                        translationChildren[k].setAttribute('title', '点击切换到不同的机器翻译');
                    }
                }
            }
        }
        var rightHTML = translationTextDiv.innerHTML;
        finalHTML += '<div class="rightp">' + rightHTML + '</div>';
        finalHTML += '<div class="clearfloat"></div>';
    }
    // MARK: Show the disclaimer for machine translation
    var storyContainer = document.getElementById('story-body-container');
    storyContainer.innerHTML = finalHTML;
    var storyTopper = document.querySelector('.story-topper');
    if (storyTopper) {
        var topDisclaimer = document.createElement('DIV');
        topDisclaimer.innerHTML = '中文为机器翻译，仅供参考';
        topDisclaimer.className = 'top-translation-disclaimer';
        storyTopper.insertBefore(topDisclaimer, storyTopper.children[0]);
    }
    // var storyHeadline = document.querySelector('.story-headline');
    if (storyContainer) {
        var translationDisclaimer = document.createElement('DIV');
        translationDisclaimer.className = 'translation-disclaimer';
        storyContainer.parentElement.insertBefore(translationDisclaimer, storyContainer);
    }

    // MARK: - Allow users to switch translations by clicking
    document.addEventListener('DOMContentLoaded', function() {
        delegate.on('click', '[current-index]', function() {
            var id = this.id;
            var counts = translationDict[id].length;
            if (counts<2) {return;}
            var currentIndex = parseInt(this.getAttribute('current-index'), 10);
            var newIndex = (currentIndex + 1) % counts;
            this.innerHTML = translationDict[id][newIndex];
            this.setAttribute('current-index', newIndex);      
        });
    });

})();