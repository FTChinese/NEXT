(function(){
    function scrollToTop(ele) {
        var newScrollY = findTop(ele) - 80;
        if (typeof webkit !== 'undefined') {
			webkit.messageHandlers.scrollTo.postMessage(newScrollY);
		} else if (typeof Android !== 'undefined') {
            Android.onScrollTo(0, newScrollY);
        } else {
            try {
                window.scrollTo({'behavior': 'smooth', 'top': newScrollY});
            } catch (ignore) {
                window.scrollTo(0, newScrollY);
            }
		}
    }
    delegate.on('click', '.quizlist li', function(){
        if (document.querySelector('.speedread-questions').className.indexOf('answered') >= 0) {
            return;
        }
        var all = this.parentElement.querySelectorAll('li');
        for (var i=0; i<all.length; i++) {
            all[i].className = '';
        }
        this.className = 'choosen';
    });
    delegate.on('click', '.rightanswer', function(){
        this.style.position = 'static';
    });
    

    delegate.on('click', '.check-quiz-button', function(){
        var all = document.querySelectorAll('.quizlist');
        var score = 0;
        for (var i=0; i<all.length; i++) {
            var options = all[i].querySelectorAll('li');
            for (var j=0; j<options.length; j++) {
                var option = options[j];
                var isChoosen = (option.className.indexOf('choosen')>=0) ? true : false;
                var value = parseInt(option.getAttribute('value'), 10);
                if (value > 0) {
                    option.className += ' right-answer';
                    if (isChoosen) {
                        score += value;
                    }
                } else if (isChoosen) {
                    option.className += ' is-wrong';
                }
            }
        }
        document.querySelector('.speedread-questions').className += ' answered';
        var percentScore = Math.round(100 * score / all.length);
        // MARK: - Calculate WPM
        var speedreadEndTime = new Date();
        var spentMinutes = (speedreadEndTime.getTime() - window.speedReadStartTime.getTime())/(1000 * 60);
        var wordCount = document.querySelector('.speedread-article-container').innerText.split(' ').length;
        var wpm = (percentScore >= 60) ? parseInt(wordCount/spentMinutes, 10) : 0;
        // MARK: - Create Feedback to User
        var speedreadFeedback = {
            bad:'壮士别灰心！功名不可一蹴而就！回答问题的正确率需要达到60%以上才会有WPM（每分钟阅读单词数）值。建议您点击后退，仔细查看答错的题目，并和原文对照，同时听读背诵生词部分。提高准确率和阅读理解能力是当下的首要目标，不可一味追求速度。成功没有捷径，江湖险恶，要记得“天天练功”哦！</b>',
            slow:'看得出你是非常认真来进行这次训练的，如果你坚持的话，你会获得非常大的提高。目前你的阅读速度偏低，可能是因为英文不是你的母语。不过，请不要放慢阅读速度。研究表明，阅读速度越快的人，其理解的正确率反而越高。因此，您可以同时提高您的阅读速度和理解能力。给你一点建议：<br><b>1. 一定要改掉默念的习惯<br>2. 不要一个词一个词的看，要学会把一个语义群当作一个整体来看。比如“an emergency $180bn injection of dollar”这个语义群，你要学会把他当作一个整体来看。<br>3. 看DVD的时候，切换到英文字幕。</b>',
            read:'用正常语速来朗读一篇文章，平均速度是每分钟140词。这说明你的阅读速度比朗读还要慢。建议您：<b>1. 每一段的第一句话往往是最重要的。<br>2. “速读”最忌讳的就是“读”，不要一边看一边默念。<br>3. 在今后的训练中，不要回头去看已经读过的部分。</b>',
            normal:'您的阅读速度已经超过了正常语速，说明你已经开始有些速读的感觉了。美国大学生的最低阅读速度为每分钟250词，加把劲你就可以赶上了。建议您：<b><br>1. 养成习惯，读过的部分不要回头去看，这样会影响速读。<br>2. 加强“扫描”的训练，让自己的眼睛能“一目一行”。</b>',
            fast:'您的阅读速度已经达到了美国大学生的水平，可喜可贺。',
            college:'厉害，您的阅读速度已经超过了美国大学生的水平。',
            crazy:'难以置信的超高速度！',
            cheat:'您看文章了么？我读书少，你别骗我...'
        };
        var speedreadComment = (wpm === 0) ? speedreadFeedback.bad 
                                       : (wpm < 75 ) ? speedreadFeedback.slow
                                       : (wpm < 100) ? speedreadFeedback.read
                                       : (wpm < 140) ? speedreadFeedback.normal
                                       : (wpm < 250) ? speedreadFeedback.fast
                                       : (wpm < 350) ? speedreadFeedback.college
                                       : (wpm < 1000) ? speedreadFeedback.crazy
                                       : speedreadFeedback.cheat;
        var speedreadCommentTitle = (wpm>0) ? '阅读速度：' + wpm : '';
        var wmpComment = (wpm>0) ? '<p>您的阅读速度是每分钟' + wpm + '个单词。</p>': '';
        var result = document.createElement('DIV');
        result.innerHTML = '<div class="speedread-feedback-container"><div class="speedread-feedback-title">' + speedreadCommentTitle + '</div>' + wmpComment +speedreadComment + '</div>';
        document.querySelector('.speedread-questions').insertBefore(result, null);
        scrollToTop(result);
    });
    delegate.on('click', '.start-reading-button', function(){
        this.style.display = 'none';
        document.getElementById('story-body-container').className += ' speedread-started';
        var articleEle = document.querySelector('.speedread-article-container');
        scrollToTop(articleEle);
        window.speedReadStartTime = new Date(); 
    });
    var checkButton = document.createElement('DIV');
    checkButton.className = 'centerButton check-quiz-container';
    checkButton.innerHTML = '<button class="ui-light-btn stress check-quiz-button">提交答案</button>';
    document.querySelector('.speedread-questions').insertBefore(checkButton, null);
    if (typeof window.gKeyTag === 'string' && window.gKeyTag.indexOf('速读')>=0) {
        var startButton = document.createElement('DIV');
        startButton.className = 'centerButton start-reading-container';
        startButton.innerHTML = '<button class="ui-light-btn stress start-reading-button">开始阅读</button>';
        document.getElementById('story-body-container').insertBefore(startButton, null);
    } else {
        // MARK: Shuffle all the options for non-speedread articles such as FT Academy or FT stories
        var quizes = document.querySelectorAll('.quizlist');
        for (var k=0; k<quizes.length; k++) {
            var ul = quizes[k];
            for (var i = ul.children.length; i >= 0; i--) {
                var j = Math.floor(Math.random() * i);
                ul.appendChild(ul.children[j]);
            }
        }
    }
})();