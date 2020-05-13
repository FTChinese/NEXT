(function(){
    delegate.on('click', '.quizlist li', function(){
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
    });
    var checkButton = document.createElement('DIV');
    checkButton.className = 'centerButton check-quiz-container';
    checkButton.innerHTML = '<button class="ui-light-btn stress check-quiz-button">提交答案</button>';
    document.querySelector('.speedread-questions').insertBefore(checkButton, null);
})();