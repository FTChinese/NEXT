(function(){
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
        console.log (score);
        var percentScore = Math.round(100 * score / all.length);
        console.log (percentScore + '%');
        var result = document.createElement('DIV');
        result.innerHTML = '<div class="subtitle">' + percentScore + '%</div>';
        document.querySelector('.speedread-questions').insertBefore(result, null);
        var newScrollY = findTop(result) - 100;
        if (typeof webkit !== 'undefined') {
			webkit.messageHandlers.scrollTo.postMessage(newScrollY);
		} else {
			window.scrollTo({'behavior': 'smooth', 'top': newScrollY});
		}
    });
    var checkButton = document.createElement('DIV');
    checkButton.className = 'centerButton check-quiz-container';
    checkButton.innerHTML = '<button class="ui-light-btn stress check-quiz-button">提交答案</button>';
    document.querySelector('.speedread-questions').insertBefore(checkButton, null);
})();