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
                image = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(image)}?fit=scale-down&source=next&width=1920`;
                image = `<div class="story-image image"><figure class=""><img src="${image}"></figure></div>`;
            }
            const date = new Date(article.publishedDate || article.firstPublishedDate);
            const localizedDate = date.toLocaleString();
            let html = `
                    <div class="article-container">
                        <div class="story-header-container">
                            <h1 class="story-headline story-headline-large">${article.title || ''}</h1>
                            <div class="story-lead">${article.standfirst || ''}</div>
                            ${image}
                            <div class="story-byline">
                                <span class="story-time">${localizedDate}</span>
                                <span class="story-author">${article.byline || ''}</span>
                            </div>
                        </div>
                        <div class="story-body"><div id="story-body-container">${article.bodyXML || ''}</div></div>
                    </div>
                    ${actions}
                `.replace(/[\r\n]+/g, '');
            html += `<button class="quiz-next hide">NEXT</button>`;
            const result = {text: html};
            showResultInChat(result);
            checkScrollyTellingForChat();
            checkFullGridBlocks();
            initScrollyTelling();
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
        for (const [index, articleContext] of articleContextChunks.entries()) {
            const quizInfo = await getQuizFromFTAPI(id, index, language, articleContext, articleContextChunks.length);
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
                        options += `<div class=${className}>${option.trim().replace(/[\.。]+$/g, '')}</div>`; 
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
  

function imagesToHtml(embed) {
    let html = '<picture>';
    const images = embed.members;
    if (images.length === 0) {return '';}
    let hasDefaultImage = false;
    let deskTopImage = '';
    images.forEach((image) => {
      let imageUrl = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(image.binaryUrl)}`;
      deskTopImage = `<img src="${imageUrl}?source=next&amp;width=2400">`;
      if (image.format === 'desktop' || image.minDisplayWidth === '980px') {
        html += `<source media="screen and (min-width: 980px)" srcset="${imageUrl}?source=next&amp;width=2400">`;
      } else if (image.format === 'mobile' || image.maxDisplayWidth === '490px') {
        html += `<source media="screen and (max-width: 490px)" srcset="${imageUrl}?source=next&amp;width=980">`;
      } else {
        hasDefaultImage = true;
        html += deskTopImage;
      }
    });
    if (hasDefaultImage === false) {
        html += deskTopImage;
    }
    html += '</picture>';
    // MARK: - FT didn't specify when a graphic should be displayed as a small pic, this is the best guess so far. 
    const picClass = (images.length === 1 && images[0].format === 'standardInline' && /\/Graphic$/.test(images[0].type)) ? ' leftPic' : '';
    const description = embed.description || images[0].title || '';
    return `<div class="pic${picClass}">${html}${description}</div>`;
}

const layoutDict = {
    card: 'card-container',
    auto: '',
    timeline: 'timeline-container'
}
  
// TODO: check function parseBodyXML() in translate.js for how to handle full-grid
async function handleFTContent(contentData) {
    let bodyXML = contentData.bodyXML || '';
    let mainImageId = '';
    if (contentData.mainImage && contentData.mainImage.id) {
        mainImageId = contentData.mainImage.id.replace(/^.*\//g, '');
    }
    const embeds = contentData.embeds || [];
    let embedDict = {};
    for (const embed of embeds) {
        const id = embed.id.replace(/^.*\//g, '');
        embedDict[id] = embed;
    }
    const container = document.createElement('DIV');
    container.innerHTML = bodyXML;
    let hasFlourish = false;
    for (let ele of container.querySelectorAll('ft-content')) {
        // console.log(ele.outerHTML);
        let type = ele.getAttribute('type');
        if (!type) {continue;}
        type = type.replace(/^.*\//g, '');
        const assetType = ele.getAttribute('data-asset-type');
        if (type === 'ImageSet') {
            // MARK: - Image Set
            const url = ele.getAttribute('url');
            if (!url) {continue;}
            const id = url.replace(/^.*\//g, '');
            if (id === mainImageId) {
                // MARK: - Don't show the main image in the text again. 
                ele.outerHTML = '';
                continue;
            }
            const embed = embedDict[id];
            if (!embed) {continue;}
            const members = embed.members;
            if (!members || members.length <= 0) {continue;}
            const html = imagesToHtml(embed);
            ele.outerHTML = html;
        } else if (type === 'Content' && assetType === 'flourish') {
            const flourishType = ele.getAttribute('data-flourish-type');
            const id = ele.getAttribute('id');
            const layoutWidth = ele.getAttribute('data-layout-width') || 'auto';

            if (!flourishType || !id) {continue;}
            hasFlourish = true;
            ele.outerHTML = `<div class="flourish-embed" data-src="${flourishType}/${id}?hideSignature" data-layout-width="${layoutWidth}"></div>`;
        } else {
            console.log(`unhandled type: ${type}`);
        }
    }
    for (let ele of container.querySelectorAll('experimental')) {
        // MARK: - Handle all the images in the block
        const images = ele.querySelectorAll('img');
        for (image of images) {
            const src = image.src;
            if (!src || src === '') {continue;}
            const imageUrl = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(src)}?source=next&amp;width=2400`;
            image.src = imageUrl;
            const description = image.getAttribute('longdesc') || '';
            image.outerHTML = `<picture>${image.outerHTML}${description}</picture>`;
        }
        // MARK: - Handle different types of block
        for (const layout of ele.querySelectorAll('.n-content-layout')) {
            const layoutName = layout.getAttribute('data-layout-name');
            if (!layoutName || layoutName === '') {continue;}
            const layoutClassName = layoutDict[layoutName];
            if (layoutClassName === undefined) {
                console.log(`Unhandled layout name: ${layoutName}`);
                continue;
            }
            if (layoutClassName === '') {continue;}
            layout.classList.add(layoutClassName);
        }
        ele.outerHTML = ele.innerHTML;
    }
    for (let ele of container.querySelectorAll('pull-quote')) {
        let quoteText = ''
        if (ele.querySelector('pull-quote-text')) {
            quoteText = ele.querySelector('pull-quote-text').innerHTML;
        }
        let quoteSource = '';
        if (ele.querySelector('pull-quote-source')) {
            quoteSource = ele.querySelector('pull-quote-source').innerHTML;
        }
        ele.outerHTML = `<blockquote class="n-content-pullquote"><div class="n-content-pullquote__content">${quoteText}</p><footer class="n-content-pullquote__footer">${quoteSource}</footer></div></blockquote>`;
    }
    for (let ele of container.querySelectorAll('big-number')) {
        let bigNumberHeadline = ''
        if (ele.querySelector('big-number-headline')) {
            bigNumberHeadline = ele.querySelector('big-number-headline').innerHTML;
        }
        let bigNumberIntro = '';
        if (ele.querySelector('big-number-intro')) {
            bigNumberIntro = ele.querySelector('big-number-intro').innerHTML;
        }
        ele.outerHTML = `<div class="n-content-big-number"><span class="n-content-big-number__title">${bigNumberHeadline}</span><span class="n-content-big-number__content">${bigNumberIntro}</span></div>`;
    }
    for (let ele of container.querySelectorAll('scrollable-block')) {
        const theme = ele.getAttribute('theme') || '0';
        ele.outerHTML = `<div class="scrollable-block" data-layout-width="full-grid" theme="${theme}">${ele.innerHTML}</div>`;
    }

    // MARK: - If there's already full grid items in the article, try to add more image sets
    if (container.querySelector('[data-layout-width="full-grid"]')) {
        for (const ele of container.querySelectorAll(':scope > div.pic')) {
            const sources = ele.querySelectorAll('picture > source');
            for (const source of sources) {
                const media = source.getAttribute('media');
                // MARK: - If you find the image targeting desktop, you can set it to large. 
                if (media === 'screen and (min-width: 980px)') {
                    ele.setAttribute('data-layout-width', 'full-grid');
                    break;
                }
            }
        }
    }

    bodyXML = container.innerHTML;
    if (hasFlourish) {
        const script = document.createElement('script');
        script.src = 'https://public.flourish.studio/resources/embed.js';
        document.head.appendChild(script);
    }
    return bodyXML;
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
            // url = '/api/page/ft_article.json';
            url = '/api/page/ft_article_scrolly_telling.json';
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
            results.bodyXML = await handleFTContent(results);
            return {status: 'success', results: results};
        } else {
            return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

async function getQuizFromFTAPI(id, index, language, text, chunks) {
    try {
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        // MARK: - 1. Check if there's a cached result
        const queryData = {id: id, index: index, language: language, type: 'quiz'};
        let url = (isPowerTranslate) ? '/openai/check_cache' : '/FTAPI/check_cache.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(queryData)
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/poll_request_result.json';
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
            const cachedResult = await response.json();
            if (cachedResult && cachedResult.length > 0) {
                console.log(`Found cached results: `);
                console.log(cachedResult);
                return {status: 'success', results: cachedResult};
            }
        } catch(err){
            console.log(err);
        }

        // MARK: - 2. Handle this over as a background task
        const _id = generateRequestId();
        const data = {id: id, index: index, language: language, text: text, _id: _id, chunks: chunks};
        url = (isPowerTranslate) ? '/openai/create_quiz' : '/FTAPI/create_quiz.php';
        options = {
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
        response = await fetch(url, options);
        const saveResult = await response.json();
        // MARK: - 3. Poll our own APIs for finished task
        if (saveResult && saveResult.status === 'success') {
            const timeoutSeconds = 120;
            const intervalSeconds = 10;
            const loops = Math.round(timeoutSeconds/intervalSeconds);
            let url = (isPowerTranslate) ? '/openai/poll_request_result' : '/FTAPI/poll_request_result.php';
            url = `${url}?request_id=${_id}`;
            let options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            };
            if (isFrontendTest && !isPowerTranslate) {
                url = '/api/page/poll_request_result.json';
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                };
            }
            for (let i=0; i<loops; i++) {
                console.log(`loop for getQuizFromFTAPI ${_id}: ${i}`);
                response = await fetch(url, options);
                try {
                    const results = await response.json();
                    if (typeof results === 'object' && results !== null) {
                        if (results && results.length > 0) {
                            return {status: 'success', results: results};
                        }
                        if (results.type === 'error') {
                            return {status: 'failed', message: 'Cannot get the data from AI model'};
                        }
                    }
                } catch(err) {
                    console.log(err);
                }
                await wait(intervalSeconds);
            }
            return {status: 'error', message: `No results in ${timeoutSeconds} seconds`};
        } else {
            return {status: 'error', message: 'Cannot save the task! '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

function checkFullGridBlocks() {
    const fullGridBlocks = document.querySelectorAll('[data-layout-width="full-grid"]');
    for (let block of fullGridBlocks) {
        let chatTalk = block.closest('.chat-talk');
        if (!chatTalk) {continue;}
        chatTalk.classList.add('full-grid-story');
    }
}

function initScrollyTelling() {
    var scrollableBlocks = document.querySelectorAll('.scrollable-block');
    if (!scrollableBlocks) {return;}
    var toggleOverlayOn = false;
    for (var i = 0; i < scrollableBlocks.length; i++) {
        var scrollableBlock = scrollableBlocks[i];
        var scrollableSections = scrollableBlock.querySelectorAll('scrollable-section, .scrollable-section');
        var viewPort = document.createElement('DIV');
        viewPort.classList.add('scrolly-telling-viewport');
        var scrollableSection;
        for (var j = 0; j < scrollableSections.length; j++) {
            scrollableSection = scrollableSections[j];
            scrollableSection.style.display = 'none';
            var figure = scrollableSection.querySelector('figure, picture');
            figure.setAttribute('data-id', j);
            if (figure) {
                if (j === 0) {figure.classList.add('visible');}
                viewPort.appendChild(figure);
            }
        }
        scrollableBlock.appendChild(viewPort);
        for (var k = 0; k < scrollableSections.length; k++) {
            scrollableSection = scrollableSections[k];
            var scrollableSectionText = (scrollableSection.innerText || '').trim();
            var scrollTextEle = scrollableSection.querySelector('scrollable-text');
            var scrollTextHTML = '';
            if (scrollTextEle && scrollTextEle.innerText !== '') {
                scrollTextHTML = scrollTextEle.innerHTML;
            } else if (scrollableSectionText && scrollableSectionText !== '') {
                scrollTextHTML = scrollableSectionText;
            }
            var scrollTextSlideIndex = k;
            if (scrollTextHTML !== '') {
                var scrollTextBlock = document.createElement('DIV');
                scrollTextBlock.classList.add('scrollable-slide-info');
                if (/strong/gi.test(scrollTextHTML)) {
                    scrollTextBlock.classList.add('scrollable-slide-detail');
                    scrollTextBlock.classList.add('scrollable-slide-overlay');
                } else {
                    if (toggleOverlayOn) {
                        scrollTextBlock.classList.add('scrollable-slide-overlay');
                    }
                    toggleOverlayOn = !toggleOverlayOn;
                }
                scrollTextBlock.setAttribute('data-id', k);
                scrollTextBlock.innerHTML = scrollTextHTML;
                scrollableBlock.appendChild(scrollTextBlock);
                scrollTextSlideIndex = Math.min(k + 1, scrollableSections.length - 1);
            }
            var scrollTextSlide = document.createElement('DIV');
            scrollTextSlide.classList.add('scrollable-slide');
            scrollTextSlide.setAttribute('data-id', scrollTextSlideIndex);
            scrollableBlock.appendChild(scrollTextSlide);
            // MARK: - Add the last scroll slide so that the last image will have longer scrolling distance
            if (k === scrollableSections.length - 1 && scrollTextHTML === '') {
                var lastScrollTextSlide = document.createElement('DIV');
                lastScrollTextSlide.classList.add('scrollable-slide');
                lastScrollTextSlide.setAttribute('data-id', k);
                scrollableBlock.appendChild(lastScrollTextSlide);
            }
        }
    }
}




  


/* jshint ignore:end */