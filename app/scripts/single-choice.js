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
		if (theAnswer === rightAnswer) {
			//alert ('right');
			answerExplain = '<div class="answer-correct answer-title">回答正确</div>';
			ele.className += ' quiz-selected quiz-correct';
		} else {
			answerExplain = '<div class="answer-wrong answer-title">回答错误，正确答案应为' + rightAnswer +'</div>';
			ele.className += ' quiz-selected quiz-wrong';
		}
		if (typeof explainImage === 'string') {
			var storyWidth = ele.offsetWidth;
			var imageUrl = '//image.webservices.ft.com/v1/images/raw/' + encodeURIComponent(window.explainImage) + '?source=ftchinese&width=' + storyWidth;
			//alert (storyWidth);
			answerExplain += '<img src="'+ imageUrl +'">';
		}
		answerExplain += '<div class="answer-explain-detail">' + explain + '</div>';
		document.getElementById('answer-explain').innerHTML = answerExplain;
		quizAnswered = true;
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

