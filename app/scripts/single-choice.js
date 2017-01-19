(function(){
	var optionsEle = document.querySelector('.quiz-container');
	var choicesArray = choices.split('|');
	var optionsHTML = '';
	var quizAnswered = false;

	function shuffle(array) {
	  var currentIndex = array.length, temporaryValue, randomIndex;
	  // While there remain elements to shuffle...
	  while (0 !== currentIndex) {

	    // Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
	  }
	  return array;
	}

	function checkAnwser(ele) {
		if (quizAnswered === true) {
			return;
		}
		var theAnswer = ele.innerHTML;
		var answerExplain = '';
		var rightOrWrong = '';
		theAnswer = theAnswer.replace(/\s+$/g, '');
		rightAnswer = rightAnswer.replace(/\s+$/g, '');
		if (theAnswer === rightAnswer) {
			//alert ('right');
			answerExplain = '<div class="answer-correct answer-title">回答正确</div>';
			ele.className += ' quiz-selected quiz-correct';
			rightOrWrong = theAnswer + '(Right)';
		} else {
			answerExplain = '<div class="answer-wrong answer-title">回答错误，正确答案应为' + rightAnswer +'</div>';
			ele.className += ' quiz-selected quiz-wrong';
			rightOrWrong = theAnswer + '(Wrong)';
		}
		if (typeof explainImage === 'string') {
			var storyWidth = ele.offsetWidth;
			var imageUrl = 'https://www.ft.com/__origami/service/image/v2/images/raw/' + encodeURIComponent(window.explainImage) + '?source=ftchinese&width=' + storyWidth;
			//alert (storyWidth);
			//answerExplain += '<img src="'+ imageUrl +'">';
			answerExplain += '<div class=" story-image image"><figure><img src="'+ imageUrl +'"></figure></div>';
		}
		answerExplain += '<div class="answer-explain-detail">' + explain + '</div>';
		quizAnswered = true;
		document.getElementById('answer-explain').innerHTML = answerExplain;
		try {
			ga('send','event', 'Quiz', document.querySelector('.story-headline').innerHTML + '(' + quizId + '/' + quizLevel + ')', rightOrWrong);
			stickyBottomPrepare();
			stickyAdsPrepare();
		} catch (ignore) {

		}
	}

	choicesArray.push(rightAnswer);
	shuffle(choicesArray);
	for (var i=0; i<choicesArray.length; i++) {
		optionsHTML += '<div class="single-choice">' + choicesArray[i] + '</div>';
	}
	optionsHTML += '<div id="answer-explain"></div>';
	optionsEle.innerHTML = optionsHTML;

	delegate.on('click', '.single-choice', function(){
		checkAnwser(this);
	});

})();

