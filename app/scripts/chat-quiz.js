
/* jshint ignore:start */


// MARK: - scrollIntoView doesn't support offset
const scrollOptions = { 
    behavior: 'smooth', 
    block: 'end',
};
const scrollOptionsStart = { 
    behavior: 'smooth', 
    block: 'start',
    inline: "nearest"
};

function trackEvent(action = '', category = '', label = '', value = 0, nonInteraction = false) {
    try {
      if (action === '') {return;}
      let options = {'event_label': label, 'event_category': category};
      if (nonInteraction) {
        options.non_interaction = true;
      }
      gtag('event', action, options);
    } catch(err) {
      console.log(err);
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getOffsetTop(element) {
    let offsetTop = 0;
    while (element) {
      offsetTop += element.offsetTop;
      element = element.offsetParent;
    }
    return offsetTop;
}


// MARK: - Accurately controll how an element should be scrolled into view so that it feels totally natural and convenient for users. 
function scrollIntoViewProperly(ele) {
    const eleHeight = ele.offsetHeight || 0;
    const windowHeight = window.innerHeight || 0;
  
    const isQuiz = ele.classList.contains('quiz-container') || ele.id === 'story-quiz-container';
    const hasStickyAudioPlaceHolder = ele.closest('.chat-talk-inner')?.querySelector('.audio-placeholder') ? true : false;
    const topBottomEdgeHeight = hasStickyAudioPlaceHolder ? 200 : 100;
    const visibleChatWindowHeight = windowHeight - topBottomEdgeHeight;
  
    // console.log('\n\n===========');
    // console.log(ele);
    // console.log(`isQuiz: ${isQuiz}, hasStickyAudioPlaceHolder: ${hasStickyAudioPlaceHolder}, eleHeight: ${eleHeight}, visibleChatWindowHeight: ${visibleChatWindowHeight}, topBottomEdgeHeight: ${topBottomEdgeHeight}`);
    if (eleHeight < visibleChatWindowHeight && !isQuiz) {
      // console.log('Default scroll which has less controle. ');
      ele.scrollIntoView(scrollOptions);
    } else {
      const offsetTop = getOffsetTop(ele);
      const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const hideTopNavWidth = 768;
      const topEdge = (w <= hideTopNavWidth ) ? 88 : 64;
      const offsetPosition = Math.max(0, offsetTop - topEdge);
      // console.log(`Count the scroll height: offsetTop: ${offsetTop}, topEdge: ${topEdge}, offsetPosition: ${offsetPosition}`);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    
    }
    
}
  
function scrollIntoViewProperlyForItems(eles) {
    let eleHeight = 0;
    for (const ele of eles || []) {
      eleHeight += ele.offsetHeight || 0;
    }
    const ele = eles[0];
    const windowHeight = window.innerHeight || 0;
    const topBottomEdgeHeight = 100;
    const visibleChatWindowHeight = windowHeight - topBottomEdgeHeight;
  
    if (eleHeight < visibleChatWindowHeight) {
      ele.scrollIntoView(scrollOptions);
    } else {
      const offsetTop = getOffsetTop(ele);
      const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const hideTopNavWidth = 768;
      const topEdge = (w <= hideTopNavWidth ) ? 88 : 44;
      const offsetPosition = Math.max(0, offsetTop - topEdge);
      // console.log(eles?.[0]?.innerHTML);
      console.log(`Count the scroll height: offsetTop: ${offsetTop}, offset position: ${offsetPosition}`);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
}


function showQuiz(result) {
    if (typeof showResultInChat === 'function') {
        showResultInChat(result);
        return;
    }
    // console.log(`Show Chat in Story: `, result);
    const storyQuizContainer = document.getElementById('story-quiz-container');
    if (storyQuizContainer) {
        storyQuizContainer.innerHTML = result?.text;
    }
}


function moveStoryActions() {
    let storyActions = document.querySelectorAll('.chat-item-actions[data-id]');
    if (storyActions.length === 0) {return '';}
    let lastActionContainer = storyActions[storyActions.length - 1];
    lastActionContainer.classList.remove('hide');
    const actions = lastActionContainer.outerHTML;
    storyActions[storyActions.length - 1].classList.add('hide');
    return actions;
}

async function displayCachedQuiz(ftid, language) {
    // console.log(`displayCachedQuiz: language: ${language}`)
    // MARK: - Check if there's a cached quiz
    const data = await checkQuiz(ftid, language);
    // console.log(`data: `, data);
    if (data?.status !== 'success') {return;}
    const randomString = (Math.floor(Math.random() * 90000) + 10000).toString();
    const quizId = 'quiz-' + ftid + randomString;
    const items = data.results || [];
    let results = [];
    for (const item of items) {
        results = results.concat(item.result || []);
    }
    const quizInfo = {status: 'success', results: results};
    renderQuizInfoAndUpdateDisplay(quizId, quizInfo, ftid, false, language, true);
    markQuizRequestAsFinished(ftid);
}


async function generateQuiz(ftid, language, articleContextChunks, action) {
    try {
        const minContextLength = 300;
        const randomString = (Math.floor(Math.random() * 90000) + 10000).toString();
        const quizId = 'quiz-' + ftid + randomString;
        let isQuizDisplayed = false;
        
        // MARK: Send the requests in chunks
        for (const [index, articleContext] of articleContextChunks.entries()) {
            const articleContextLength = articleContext.length;
            const isLastChunk = index === articleContextChunks.length - 1;
            if (isLastChunk && articleContextLength < minContextLength) {
                console.log(`There's no point in sending the last chunk of text for Quiz, as it's length is only ${articleContextLength} characters. It probably has no meaningful content: `);
                console.log(articleContext);
                break;
            }
            console.log(`requesting chunk ${index + 1} of ${articleContextChunks.length}`);
            const quizInfo = await promptOpenAIForArticle(ftid, index, language, articleContext, articleContextChunks.length, action);
            isQuizDisplayed = renderQuizInfoAndUpdateDisplay(quizId, quizInfo, ftid, isQuizDisplayed, language, false);
        }

        markQuizRequestAsFinished(ftid);

    } catch(err) {
        console.log(`generate quiz error: `);
        console.log(err);
    }
}

function markQuizRequestAsFinished(ftid) {
    let quizzesContainers = document.querySelectorAll(`.quizzes-container[data-id="${ftid}"]`);
    // console.log(`mark these quizzes as finished: .quizzes-container[data-id="${ftid}"]`);
    // console.log(quizzesContainers);
    for (let quizzesContainer of quizzesContainers) {
        quizzesContainer.classList.add('requests_finished');
    }
}


function renderQuizInfoAndUpdateDisplay(quizId, quizInfo, ftid, isQuizDisplayed, language, isAuto = false) {

    if (quizInfo.status !== 'success' || !quizInfo.results) {
        return true;
    }
    
    let html = '';
    const results = quizInfo.results || [];
    for (const [index, quiz] of results.entries()) {
        const answer = quiz.answer || '';
        const explanation = quiz.explanation || '';
        let allOptions = quiz.distractors || [];
        // MARK: - OpenAI doesn't get it right all the time, especially when you prompt it to translate a quiz. So you need to verify on the frontend. 
        if (allOptions.indexOf(answer) === -1) {
            allOptions.push(answer);
        }
        allOptions = shuffle(allOptions);
        let options = '';
        for (const option of allOptions) {
            const className = (option === answer) ? 'is-correct' : 'is-wrong';
            options += `<div class=${className}>${option.trim().replace(/[\.。]+$/g, '')}</div>`; 
        }
        let hideClass = (index === 0 && !isQuizDisplayed) ? '' : ' hide';

        // MARK: - If the user creates the quiz for the first time and is waiting for the next quiz
        let quizLoader = document.getElementById(quizId)?.querySelector('.quiz-loading');
        if (index === 0 && quizLoader) {
            quizLoader.remove();
            hideClass = '';
        }
        html += `
            <div class="quiz-container${hideClass}" data-score="0">
                <div class="quiz-question">${quiz.question}</div>
                <div class="quiz-options">${options}</div>
                <div class="quiz-explanation">${explanation}</div>
                <div class="quiz-end-for-scroll-alignment"></div>
            </div>
        `.replace(/[\r\n]+/g, '');
    }
    if (isQuizDisplayed === false) {
        // MARK: - First valid chunk
        const chatTalkInner = document.querySelector(`.article-container[data-id="${ftid}"]`)?.closest('.chat-talk-inner');
        let storyBodyContainer = chatTalkInner?.querySelector('.story-body-container');
        html = `<div id="${quizId}" data-id="${ftid}" class="quizzes-container">${html}</div>`;
        html += `<div class="quizzes-container"><button class="quiz-next hide" data-quiz-id="${quizId}">${localize('NEXT')}</button></div>`;
        const audioEle = document.querySelector(`[data-id="${ftid}"] .audio-placeholder.is-sticky-top`);
        let chatInnerEle = storyBodyContainer?.closest('.chat-talk-inner');
        // console.log(`is auto? ${isAuto}, storyBodyContainer: ${storyBodyContainer.innerHTML}, ftid: ${ftid}`);
        const quizHTML = `<div class="quizzes-container"><hr></div>${html}`;

        if (document.documentElement.classList.contains('discuss-article-only')) {
            const result = {text: quizHTML};
            showQuiz(result);
        } else if (audioEle && audioEle.parentElement) {

            // Get the parent element of the audio element
            let parentElement = audioEle.parentElement;

            let status = parentElement.querySelector('.quizzes-container');
            if (status) {
                status.remove();
            }

            // Create a new element for the quiz content
            let quizContainer = document.createElement('div');
            quizContainer.innerHTML = quizHTML;

            // Append the new quiz container to the parent element
            parentElement.appendChild(quizContainer);

            let quizContainerEle = quizContainer.querySelector('.quiz-container');
            if (quizContainerEle) {
                scrollIntoViewProperly(quizContainerEle);
            }

            // audioEle.parentElement.innerHTML += quizHTML;
        } else if (isAuto && storyBodyContainer) {
            storyBodyContainer.innerHTML += quizHTML;
        } else if (chatInnerEle) {
            let quizContainerEle = document.createElement('DIV');
            quizContainerEle.innerHTML = quizHTML;
            chatInnerEle.append(quizContainerEle);
            scrollIntoViewProperly(quizContainerEle);
        } else {
            const result = {text: quizHTML};
            showQuiz(result);
        }
        let button = chatTalkInner?.querySelector(`[data-action="quiz"][data-lang="${language}"]`);
        if (button) {
            button.classList.add('hide');
        }
        let status = chatTalkInner?.querySelector(`.quizzes-status`);
        if (status) {
            status.remove();
        }
    } else {
        document.getElementById(quizId).innerHTML += html;
    }

    return true;

}


async function checkQuiz(id, language) {
    try {
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        const queryData = {id: id, language: language};
        let url = '/ai/check_quiz';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(queryData)
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = `/api/page/quizzes.json`;
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            };
        }
        // MARK: - If there's valid result, return immediately
        let response;
        try {
            response = await fetch(url, options);
            let cachedResult = await response.json();
            if (['zh-TW', 'zh-HK', 'zh-MO', 'zh-SG'].includes(language ?? '')) {
                const cachedResultString = await convertChinese(JSON.stringify(cachedResult), language);
                cachedResult = JSON.parse(cachedResultString);
            }
            if (cachedResult && cachedResult.length > 0) {
                // console.log(`Found cached results: `);
                // console.log(cachedResult);
                return {status: 'success', results: cachedResult};
            } else if (cachedResult && cachedResult.status === 'error') {
                // MARK: - If there's a cached error, don't try the API again
                // console.log(`Found cached error: `);
                // console.log(cachedResult);
                return {status: 'failed', message: 'Cannot get the data from AI model'};
            }
        } catch(err){
            // console.log(err);
            return {status: 'failed', message: err.toString()};
        }
    } catch(err) {
        // console.log(err);
        return {status: 'failed', message: err.toString()};
    }
    return {status: 'failed', message: 'unknown error'};
}



delegate.on('click', '[data-action="quiz"], [data-action="socratic"]', async (event) => {
    const element = event.target;
    const action = element.getAttribute('data-action');
    trackEvent(action, 'chatbot');
    await handleActionClick(element);
});

delegate.on('click', '.quiz-options div', async (event) => {
    const element = event.target;
    try {
        let quizContainer = element.closest('.quiz-container');
        let quizzesContainer = element.closest('.quizzes-container');
        const quizzesId = quizzesContainer?.id;
        const newChat = quizContainer.closest('.chat-talk');
        if (quizContainer.classList.contains('is-done')) { return; }
        
        let isCorrect = element.classList.contains('is-correct');
        element.classList.add('is-selected');
        quizContainer.classList.add('is-done');
        const quizResultClass = (isCorrect) ? 'is-correct' : 'is-wrong';
        quizContainer.classList.add(quizResultClass);

        trackEvent('quiz-select', 'chatbot', quizResultClass);
        
        let currentScore = quizContainer.getAttribute('data-score') || '0';
        currentScore = parseInt(currentScore, 10) || 0;
        currentScore += (isCorrect) ? 1 : 0;
        quizContainer.setAttribute('data-score', currentScore);
        
        const nextQuiz = newChat.querySelector('.quiz-container.hide');
        if (nextQuiz) {
            let nextButtonEle = quizContainer.closest('.chat-talk')?.querySelector('.quiz-next');
            if (quizzesId) {
                nextButtonEle = document.querySelector(`button[data-quiz-id="${quizzesId}"]`) ?? nextButtonEle;
            }
            if (nextButtonEle) {
                nextButtonEle.classList.remove('hide');
            }
        } else if (quizzesContainer && quizzesContainer.classList && !quizzesContainer.classList.contains('requests_finished')) {
            let quizLoadingEle = document.createElement('DIV');
            quizLoadingEle.classList.add('quiz-loading');
            quizLoadingEle.innerHTML = '...';
            quizContainer.appendChild(quizLoadingEle);
        } else {
            let chatTalkInner = quizContainer.closest('.chat-talk-inner');
            const all = chatTalkInner.querySelectorAll('.is-done.quiz-container').length;
            const correct = chatTalkInner.querySelectorAll('.is-correct.quiz-container').length;
            const finalScorePercentage = Math.round((correct / all) * 100);
            let score_class = '';
            if (finalScorePercentage === 100) {
                score_class = 'gold';
            } else if (finalScorePercentage >= 50) {
                score_class = 'win';
            } else {
                score_class = 'lose';
            }
            const finalScoreString = `${localize('Final Score')}: ${finalScorePercentage} (${correct}/${all})`;
            let finalScoreHTML = `<div>${finalScoreString}</div>`;

            const storeName = quizContainer?.getAttribute('data-store');
            if (storeName) {
                const today = new Date().toISOString().split('T')[0];
                const dbName = 'Engagement';
                const previousBest = await getFromDB(dbName, storeName, today);
                if (!previousBest || finalScorePercentage > previousBest) {
                    await saveToDB(dbName, storeName, today, finalScorePercentage);
                }
                const pastScores = await queryFromDB(dbName, storeName, () => true);
                const stats = calculateStats(pastScores);


                // Assuming you're running this in a browser context, use the location object
                const eventUrl = `${window.location.origin}/powertranslate/chat.html#action=news-quiz`;
                const options = {
                    title: localize('FT Daily Quiz'),
                    description: localize('Quiz Description'),
                    durationMinutes: 10,
                    alertMinutes: 0,
                    prompt: localize('Quiz Prompt'),
                    eventUrl: eventUrl // Include the dynamically generated event URL
                };
                const calendarHTML = generateAddCalendarHTML(options);
                // finalScoreHTML += calendarHTML;


                finalScoreHTML = `
                    <div class="stats-container">
                        <h2 class="${score_class}">${finalScorePercentage}</h2>
                        <div>
                            <div class="stats-item">
                                <span>${localize('correct_vs_all')}</span>
                                <span class="stats-value">${correct}/${all}</span>
                            </div>
                            <div class="stats-item">
                                <span>${localize('average_score')}</span>
                                <span class="stats-value">${stats.average}</span>
                            </div>
                            <div class="stats-item">
                                <span>${localize('played')}</span>
                                <span class="stats-value">${stats.played}</span>
                            </div>
                            <div class="stats-item">
                                <span>${localize('current_streak')}</span>
                                <span class="stats-value">${stats.currentStreak}</span>
                            </div>
                            <div class="stats-item">
                                <span>${localize('max_streak')}</span>
                                <span class="stats-value">${stats.maxStreak}</span>
                            </div>
                        </div>
                        ${calendarHTML}
                    </div>`;
            }




            let finalScore = document.createElement('DIV');
            finalScore.className = 'chat-item-summary';
            finalScore.innerHTML = finalScoreHTML;
            quizContainer.append(finalScore);

            const actions = moveStoryActions();
            let fullStoryGrid = element.closest('.full-grid-story');
            if (!fullStoryGrid) {
                quizContainer.closest('.chat-talk-inner').innerHTML += actions;
            }
        }
    } catch (err) {
        console.log(err);
    }
});


delegate.on('click', '.quiz-next', async (event) => {

    const element = event.target;
    try {
        // MARK: - Use the unique quiz id to find the quizzes and it's next buttons, which is a more robust
        const quizId = element.getAttribute('data-quiz-id');
        // MARK: - This is the old way of getting the visible quizzes, keeping it in case other parts of the code are not updated
        let visibleQuizes = element.closest('.chat-talk').querySelectorAll('.quiz-container:not(.hide)');
        if (quizId) {
            visibleQuizes = document.querySelectorAll(`#${quizId} .quiz-container:not(.hide)`);
        }
        // let visibleQuizesCount = visibleQuizes.length;
        // MARK: - This is the old way of getting the hidden quizzes, keeping it in case other parts of the code are not updated
        let nextQuiz = element.closest('.chat-talk').querySelector('.quiz-container.hide');
        if (quizId) {
            nextQuiz = document.querySelector(`#${quizId} .quiz-container.hide`);
        }
        if (nextQuiz) {
            nextQuiz.classList.remove('hide');
            // nextQuiz.scrollIntoView(scrollOptionsStart);
            scrollIntoViewProperly(nextQuiz);
        }
        element.classList.add('hide');
        // if (visibleQuizesCount > 0) {
        //     visibleQuizes[visibleQuizesCount-1].querySelector('.quiz-end-for-scroll-alignment').scrollIntoView(scrollOptionsStart);
        // }
    } catch (err) {
        console.log(err);
    }

});




/* jshint ignore:end */