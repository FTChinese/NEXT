/* jshint ignore:start */

delegate.on('click', '[data-action="show-article"]', async (event) => {
    const element = event.target;
    if (element.classList.contains('pending')) {
        return;
    }
    element.classList.add('pending');
    updateBotStatus('pending');
    try {
        const chatItemContainer = element.closest('.chat-item-container');
        const ftid = chatItemContainer.getAttribute('data-id');
        const language = chatItemContainer.getAttribute('data-lang') || 'English';
        showBotResponse('Getting Article...');
        const info = await getArticleFromFTAPI(ftid, language);
        const article = info.results;
        if (info.status === 'success' && article && article.bodyXML) {
            const actions = `<div class="chat-item-actions" data-lang="${language}"><a data-id="${ftid}" data-action="quiz" title="Test my understanding of the article">${localize('Quiz Me')}</a></div>`;
            let image = '';
            if (article.mainImage && article.mainImage.members && article.mainImage.members.length > 0) {
                image = article.mainImage.members[0].binaryUrl;
                image = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(image)}?fit=scale-down&source=next&width=700`;
                image = `<div class="story-image image"><figure class=""><img src="${image}"></figure></div>`;
            }
            const date = new Date(article.publishedDate || article.firstPublishedDate);
            const localizedDate = date.toLocaleString();
            let html = `
                    <div class="article-container">
                        <h1 class="story-headline story-headline-large">${article.title || ''}</h1>
                        <div class="story-lead">${article.standfirst || ''}</div>
                        ${image}
                        <div class="story-byline">
                            <span class="story-time">${localizedDate}</span>
                            <span class="story-author">${article.byline || ''}</span>
                        </div>
                        <div class="story-body"><div id="story-body-container">${article.bodyXML || ''}</div></div>
                    </div>
                    ${actions}
                `.replace(/[\r\n]+/g, '');
            html += `<button class="quiz-next hide">NEXT</button>`;
            const result = {text: html};
            showResultInChat(result);
        }
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});


delegate.on('click', '[data-action="quiz"]', async (event) => {
    const element = event.target;
    if (element.classList.contains('pending')) {
        return;
    }
    element.classList.add('pending');
    element.classList.add('hide');
    updateBotStatus('pending');
    try {
        const id = element.getAttribute('data-id') || '';
        const language = element.closest('.chat-item-actions').getAttribute('data-lang') || 'English';
        showUserPrompt(element.innerHTML);
        showBotResponse('Creating Quiz For You...');
        let articleEle = element.closest('.chat-talk-inner').querySelector('.article-container');
        const title = articleEle.querySelector('.story-headline').innerHTML;
        const standFirst = articleEle.querySelector('.story-lead').innerHTML;
        const storyBody = articleEle.querySelector('.story-body').innerHTML;
        const articleContextAll = `${title}\n${standFirst}\n${storyBody}`
            .replace(/<\/p><p>/g, '\n')
            .replace(/(<([^>]+)>)/gi, '')
            .replace(/\[MUSIC PLAYING\]/g, '');
        const articleContextChunks = textToChunks(articleContextAll, 1000);
        const randomString = (Math.floor(Math.random() * 90000) + 10000).toString();
        const quizId = id + randomString;
        let isQuizDisplayed = false;
        // MARK: Send the requests in chunks
        for (const articleContext of articleContextChunks) {
            const quizInfo = await getQuizFromFTAPI(id, language, articleContext);
            if (quizInfo.status === 'success' && quizInfo.results) {
                let html = '';
                for (const [index, quiz] of quizInfo.results.entries()) {
                    const answer = quiz.answer || '';
                    const explanation = quiz.explanation || '';
                    let allOptions = quiz.options || [];
                    // MARK: - OpenAI doesn't get it right all the time, especially when you prompt it to translate a quiz. So you need to verify on the frontend. 
                    if (allOptions.indexOf(answer) === -1) {
                        allOptions.push(answer);
                    }
                    allOptions = shuffle(allOptions);
                    let options = '';
                    for (const option of allOptions) {
                        const className = (option === answer) ? 'is-correct' : 'is-wrong';
                        options += `<div class=${className}>${option}</div>`; 
                    }
                    const hideClass = (index === 0 && !isQuizDisplayed) ? '' : ' hide'; 
                    html += `
                        <div class="quiz-container${hideClass}" data-score="0">
                            <div class="quiz-question">${quiz.question}</div>
                            <div class="quiz-options">${options}</div>
                            <div class="quiz-explanation">${explanation}</div>
                        </div>
                    `.replace(/[\r\n]+/g, '');
                }
                if (isQuizDisplayed === false) {
                    // MARK: - First valid chunk
                    isQuizDisplayed = true;
                    html = `<div id="${quizId}">${html}</div>`;
                    html += `<button class="quiz-next hide">NEXT</button>`;
                    const result = {text: html};
                    showResultInChat(result);
                } else {
                    document.getElementById(quizId).innerHTML += html;
                }

            }
        }
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});

delegate.on('click', '.quiz-options div', async (event) => {
    const element = event.target;
    try {
        let quizContainer = element.closest('.quiz-container');
        const newChat = quizContainer.closest('.chat-talk');
        if (quizContainer.classList.contains('is-done')) {return;}
        let isCorrect = element.classList.contains('is-correct');
        element.classList.add('is-selected');
        quizContainer.classList.add('is-done');
        const quizResultClass = (isCorrect) ? 'is-correct' : 'is-wrong';
        quizContainer.classList.add(quizResultClass);
        let currentScore = quizContainer.getAttribute('data-score') || '0';
        currentScore = parseInt(currentScore, 10) || 0;
        currentScore += (isCorrect) ? 1 : 0;
        quizContainer.setAttribute('data-score', currentScore);
        const nextQuiz = newChat.querySelector('.quiz-container.hide');
        if (nextQuiz ) {
            quizContainer.closest('.chat-talk').querySelector('.quiz-next').classList.remove('hide');
        } else {
            let chatTalkInner = quizContainer.closest('.chat-talk-inner');
            const all = chatTalkInner.querySelectorAll('.is-done.quiz-container').length;
            const correct = chatTalkInner.querySelectorAll('.is-correct.quiz-container').length;
            let finalScore = document.createElement('DIV');
            finalScore.className = 'chat-item-summary';
            finalScore.innerHTML = `${localize('Final Score')}: ${correct}/${all}`;
            quizContainer.append(finalScore);
        }
        newChat.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
    } catch (err) {
        console.log(err);
    }
});

delegate.on('click', '.quiz-next', async (event) => {
    const element = event.target;
    try {
        let nextQuiz = element.closest('.chat-talk').querySelector('.quiz-container.hide');
        if (nextQuiz) {
            nextQuiz.classList.remove('hide');
        }
        element.classList.add('hide');
        const newChat = element.closest('.chat-talk');
        newChat.scrollIntoView({ behavior: 'smooth', block: 'end' }); 
    } catch (err) {
        console.log(err);
    }
});

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function roughTokenCount(text) {
    // Replace all non-Western characters with two spaces
    const processedText = text.replace(/([^\u0000-\u007F])/g, ' $1 ');
    // Split the processed text into words by splitting on whitespace characters
    const words = processedText.split(/\s+/);
    let token = 0;
    for (const word of words) {
        if (word === '') {continue;}
        const isWordWestern = !/^[^\u0000-\u007F]$/.test(word);
        if (isWordWestern) {
            token += Math.ceil(word.length / 4);
        } else {
            token += word.length * 2.2;
        }
    }
    return Math.ceil(token);
}

function textToChunks(text, maxTokensPerChunk) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;
    for (const para of paragraphs) {
      const paraTokens = roughTokenCount(para);
      // If the current paragraph would push us over the token limit,
      // push the current chunk and start a new one
      if (currentTokens + paraTokens > maxTokensPerChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }
      // Add the current paragraph to the current chunk
      currentChunk += `${para}\n`;
      currentTokens += paraTokens;
    }
    // Push any remaining chunk at the end
    if (currentChunk !== '') {
      chunks.push(currentChunk.trim());
    }
    return chunks;
}
  
async function getArticleFromFTAPI(id, language) {
    try {
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        const data = {id: id, language: language};
        let url = (isPowerTranslate) ? '/openai/ft_article' : '/FTAPI/article.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/ft_article.json';
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            };
        }
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (results && results.bodyXML) {
            return {status: 'success', results: results};
        } else {
            return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

async function getQuizFromFTAPI(id, language, text) {
    try {
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        const data = {id: id, language: language, text: text};
        let url = (isPowerTranslate) ? '/openai/create_quiz' : '/FTAPI/create_quiz.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/create_quiz.json';
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            };
        }
        const response = await fetch(url, options);
        // let results = await response.json();

        // MARK: - Getting the results in chunks rather than 
        const reader = response.body.getReader();
        let quizzes = [];
        // TODO: - Should show the quizzes as soon as they are available
        while (true) {
            const { done, value } = await reader.read();
            if (done) {break;}
            const newQuizInfo = new TextDecoder().decode(value);
            try {
                const newQuizzes = JSON.parse(newQuizInfo);
                quizzes = quizzes.concat(newQuizzes);
            } catch(err) {
                console.log(`Can't parse new quiz info:`);
                console.log(newQuizInfo);
                console.log(err);
            }
        }
        const results = quizzes;
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (results && results.length > 0) {
            return {status: 'success', results: results};
        } else {
            return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}



/* jshint ignore:end */