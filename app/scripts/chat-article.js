/* jshint ignore:start */

const calculateCosineSimilarity = (a, b) => a.reduce((acc, curr, i) => acc + curr * b[i], 0) / (Math.sqrt(a.reduce((acc, curr) => acc + curr ** 2, 0)) * Math.sqrt(b.reduce((acc, curr) => acc + curr ** 2, 0)));
var model = null;
var currentFTId;


delegate.on('click', '.machine-translation', async (event) => {
    let element = event.target;
    let allElements = element.parentNode.querySelectorAll('.machine-translation');
    if (allElements.length <= 1) {return;}
    let nextElement = element.nextSibling || allElements[0];
    if (nextElement) {
        element.classList.add('hide');
        nextElement.classList.remove('hide');
    } else {
        console.log(`Can't find next element`);
    }
});

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
        if(isArticleLoaded(ftid)){
            // MARK: - If the article is already loaded, scroll to it directly
            await showContent(ftid, language, false, false);
        } else {
            await showContent(ftid, language);
            // MARK: - If the user already reads the article, no need to show the "Show Later" buttons
            element.closest('.chat-item-container')?.querySelector('.show-article-later-container')?.remove();  
        }
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});

delegate.on('click', '.article-language-switch-container button', async (event) => {
    let element = event.target;
    const value = element.getAttribute('data-value');
    const container = element.closest('.article-container');
    await switchLanguage(container, value);
});

delegate.on('click', '[data-action="show-article-later"]', async (event) => {
    const element = event.target;
    if (element.classList.contains('pending')) {
        return;
    }
    element.classList.add('pending');
    updateBotStatus('pending');
    try {
        const chatItemContainer = element.closest('.chat-item-container');
        // console.log(chatItemContainer);
        const ftid = chatItemContainer.getAttribute('data-id');
        const language = chatItemContainer.getAttribute('data-lang') || 'English';
        element.innerHTML = '...';
        await showContent(ftid, language, false, true);
        const flagEle = element.parentNode?.querySelector('.show-article-later-flag');
        if (!flagEle) {return;}
        element.classList.add('hide');
        flagEle.classList.add('on');
        flagEle.addEventListener('animationend', () => {
            flagEle.classList.add('hide');
            const jumpButton = element.parentNode?.querySelector('.jump-to-article');
            jumpButton.style.display = 'block';
        });
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});

delegate.on('click', '[data-action="jump-to-article"]', async (event) => {
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
        await showContent(ftid, language, false, false);
        element.classList.add('hide');
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});




delegate.on('click', '.story-body a', async (event) => {
    let element = event.target;
    // MARK: - If you click on a link such as <a href="#"><strong></strong></a>, element will not be the <a>, but <strong>. 
    if (element.tagName !== 'A') {
        element = element.closest('a');
    }
    const link = element.href;
    if (!link) {return;}
    const ftContentRegex = /^https:\/\/www\.ft\.com\/content\/([A-z\d-]+)$/;
    const isFTContent = ftContentRegex.test(link);
    if (!isFTContent) {return;}
    event.preventDefault();
    const ftid = link.replace(ftContentRegex, '$1');
    const language = preferredLanguage;
    await showContent(ftid, language);
});

delegate.on('click', '.chat-citations a[data-id]', async (event) => {
    event.preventDefault();
    const element = event.target;
    if (element.classList.contains('pending')) {
        return;
    }
    element.classList.add('pending');
    updateBotStatus('pending');
    try {
        const ftid = element.getAttribute('data-id');
        const language = preferredLanguage || 'English';
        await showContent(ftid, language);
    } catch (err) {
        console.log(err);
    }
    element.classList.remove('pending');
    updateBotStatus('waiting');
});

delegate.on('click', '[data-action="show-transcript"]', async (event) => {
    const element = event.target;
    const container = element.closest('.article-container');
    const storyBody = container?.querySelector('.story-body');
    if (storyBody) {
        storyBody.classList.remove('hide');
    }
    element.classList.add('hide');
});


delegate.on('click', '[data-action="quiz"], [data-action="socratic"]', async (event) => {
    const element = event.target;
    await handleActionClick(element);
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
            const actions = moveStoryActions();
            finalScore.className = 'chat-item-summary';
            finalScore.innerHTML = `${localize('Final Score')}: ${correct}/${all}`;
            quizContainer.append(finalScore);
            quizContainer.closest('.chat-talk-inner').innerHTML += actions;
        }
        newChat.scrollIntoView(scrollOptions); 
    } catch (err) {
        console.log(err);
    }
});

function isArticleLoaded(ftid) {
    if (document.querySelector(`.article-container[data-id="${ftid}"]`)) {
        return true;
    }
    return false;
}

function getContentType(content) {
    const types = content.types;
    if (!types || types.length < 0) {return '';}
    const type = types[0].replace(/^.*\//g, '');
    return type;
}

function getAudioHTML(content) {
    const type = getContentType(content);
    if (type !== 'Audio') {return '';}
    let dataSource = content.dataSource;
    if (!dataSource) {return '';}
    dataSource = dataSource
        .filter(x=>x.mediaType === 'audio/mpeg');
    // MARK: - There will always be a video based on past experience. 
    if (dataSource.length === 0) {return '';}
    const audio = dataSource[0];
    return `
<div class="audio-placeholder is-sticky-top" id="audio-placeholder">
    <div class="audio-container">
        <div class="audio-controls">
            <button class="audio-control control__play">Play</button>
            <button class="audio-control control__pause" disabled="true">Pause</button>
            <span class="audio-time-text__current audio-time-text">00:00</span><span class="audio-time-text__total audio-time-text"></span>
            <div class="audio-time-progress">
                <span class="audio-time-progress__background"></span>
                <span class="audio-time-progress__fill" style="transform: scaleX(0);"></span>
                <span class="audio-time-progress__scrub" style="transform: scaleX(0);"></span>
            </div>
        </div>
        <audio class="audio-player hide" ontimeupdate="updateAudioTime(this)" oncanplay="updateTotalTime(this)" src="${audio.binaryUrl}" preload="auto"></audio>
    </div>
</div>
    `;
}



function getVideoHTML(content) {
    const type = getContentType(content);
    if (type !== 'Video') {return '';}
    let dataSource = content.dataSource;
    if (!dataSource) {return '';}
    const w = Math.min(768, window.innerWidth);
    dataSource = dataSource
        .filter(x=>x.mediaType === 'video/mp4' && x.pixelWidth >= w);
    // MARK: - There will always be a video based on past experience. 
    if (dataSource.length === 0) {return '';}
    const video = dataSource[0];
    let track = '';
    if (content.captions && content.captions.length > 0 && content.captions[0].url) {
        const id = content.captions[0].url.replace(/^.*\//g, '').replace(/\..*$/g, '');
        track = `<track src="/vtt/${id}" kind="subtitles" srclang="en" label="English" default>`;
    }
    return `
        <div style="width: 100%; max-width: 768px;">
            <video style="width: 100%; height: 100%; object-fit: cover;" controls>
            <source src="${video.binaryUrl}" type="video/mp4">
            ${track}
            Your browser does not support the video tag.
            </video>
        </div>
    `;
}



delegate.on('click', '.quiz-next', async (event) => {
    const element = event.target;
    try {
        let visibleQuizes = element.closest('.chat-talk').querySelectorAll('.quiz-container:not(.hide)');
        let visibleQuizesCount = visibleQuizes.length;
        let nextQuiz = element.closest('.chat-talk').querySelector('.quiz-container.hide');
        if (nextQuiz) {
            nextQuiz.classList.remove('hide');
            // quiz-end-for-scroll-alignment
            // nextQuiz.scrollIntoView(scrollOptionsStart);
        }
        element.classList.add('hide');
        if (visibleQuizesCount > 0) {
            visibleQuizes[visibleQuizesCount-1].querySelector('.quiz-end-for-scroll-alignment').scrollIntoView(scrollOptionsStart);
        }

        // const newChat = element.closest('.chat-talk');
        // newChat.scrollIntoView(scrollOptions); 
        // newChat.scrollIntoView(scrollOptionsStart);

    } catch (err) {
        console.log(err);
    }
});

async function generateSocratic(id, language, articleContextChunks, action) {
    try {        
        let isConversationDisplayed = false;
        window.socracticInfo = [];
        window.socracticIndex = 0;
        showResultInChat({text: localize('Socratic Method Explained')});
        showBotResponse(`Creating ${action} data for you...`);
        // MARK: Send the requests in chunks
        for (const [index, articleContext] of articleContextChunks.entries()) {
            const info = await promptOpenAIForArticle(id, index, language, articleContext, articleContextChunks.length, action);
            if (info.status === 'success' && info.results && info.results.length > 0) {
                window.socracticInfo = window.socracticInfo.concat(info.results);
                if (isConversationDisplayed === false) {
                    isConversationDisplayed = true;
                    await setIntention(action, language, `<strong>${window.socracticInfo[0].question}</strong>`);
                    const startConversations = [
                        {
                            role: 'system',
                            // content: `You should evaluate the user's answer based on this context: ${window.socracticInfo[0].answer}`,
                            content: `Evaluate the user's answer based only on this context, which is delimited with triple backticks: '''${window.socracticInfo[0].answer}'''`
                        },
                        {
                            role: 'assistant',
                            content: window.socracticInfo[0].question
                        }
                    ]
                    previousConversations = previousConversations.concat(startConversations);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    userInput.focus();
                }
            }
        }
    } catch(err) {
        console.log(`generateSocratic error: `);
        console.log(err);
    }
}

async function generateQuiz(id, language, articleContextChunks, action) {
    try {
        const randomString = (Math.floor(Math.random() * 90000) + 10000).toString();
        const quizId = id + randomString;
        let isQuizDisplayed = false;
        // MARK: Send the requests in chunks
        for (const [index, articleContext] of articleContextChunks.entries()) {
            const quizInfo = await promptOpenAIForArticle(id, index, language, articleContext, articleContextChunks.length, action);
            if (quizInfo.status === 'success' && quizInfo.results) {
                let html = '';
                for (const [index, quiz] of quizInfo.results.entries()) {
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
                    const hideClass = (index === 0 && !isQuizDisplayed) ? '' : ' hide'; 
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
    } catch(err) {
        console.log(`generate quiz error: `);
        console.log(err);
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

function textToChunks(text, maxTokensPerChunk, contextPrefix) {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const chunks = [];
    let currentChunk = '';
    let currentTokens = 0;
    for (const [index, paraText] of paragraphs.entries()) {
      const prefix = (index === 0) ? contextPrefix : '';
      const para = prefix + paraText;
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
    let bodyXML = contentData.bodyXML || contentData.transcript || '';
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
        for (const image of images) {
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
        ele.outerHTML = `<div class="n-content-pullquote"><div class="n-content-pullquote__content">${quoteText}</p><footer class="n-content-pullquote__footer">${quoteSource}</footer></div></div>`;
    }
    for (let ele of container.querySelectorAll('blockquote')) {
        ele.classList.add('n-content-blockquote');
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
    for (let ele of container.querySelectorAll('recommended')) {
        ele.remove();
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
    // MARK: - If the article content starts with a image, don't show main image
    if (container.children.length > 0 && container.children[0].classList.contains('pic')) {
        delete contentData.mainImage;
    }
    if (hasFlourish) {
        const script = document.createElement('script');
        script.src = 'https://public.flourish.studio/resources/embed.js';
        document.head.appendChild(script);
    }
    contentData.bodyXML = bodyXML;
    return contentData;
}


async function convertFTContentForChinese(results, language) {
    async function convertArrayOfStrings(stringArray) {
        if (!stringArray) {return [];}
        let newArray = [];
        for (const s of stringArray) {
            const newS = await convertChinese(s, language);
            newArray.push(newS);
        }
        return newArray;
    }
    async function convertMTBodyXML(bodyXML){
        if (!bodyXML) {return [];}
        for (let blockOfBodyXML of bodyXML) {
            blockOfBodyXML.translations = await convertArrayOfStrings(blockOfBodyXML.translations, language)
        }
        return bodyXML;
    }
    let newResults = JSON.parse(JSON.stringify(results));
    newResults.bodyXMLTranslation = await convertChinese(newResults.bodyXMLTranslation, language);
    newResults.titleTranslation = await convertChinese(newResults.titleTranslation, language);
    newResults.bylineTranslation = await convertChinese(newResults.bylineTranslation, language);
    newResults.standfirstTranslation = await convertChinese(newResults.standfirstTranslation, language);
    if (newResults.machineTranslation) {
        if (newResults.machineTranslation.titleTranslation) {
            newResults.machineTranslation.titleTranslation = await convertChinese(newResults.machineTranslation.titleTranslation, language);
        }
        if (newResults.machineTranslation.standfirstTranslation) {
            newResults.machineTranslation.standfirstTranslation = await convertChinese(newResults.machineTranslation.standfirstTranslation, language);
        }
        if (newResults.machineTranslation.bodyXMLTranslation) {
            newResults.machineTranslation.bodyXMLTranslation = await convertChinese(newResults.machineTranslation.bodyXMLTranslation, language);
        }
        if (newResults.machineTranslation.byline) {
            newResults.machineTranslation.byline = await convertChinese(newResults.machineTranslation.byline, language);
        }
        if (newResults.machineTranslation.titles) {
            newResults.machineTranslation.titles = await convertArrayOfStrings(newResults.machineTranslation.titles);
        }
        if (newResults.machineTranslation.standfirsts) {
            newResults.machineTranslation.standfirsts = await convertArrayOfStrings(newResults.machineTranslation.standfirsts);
        }
        if (newResults.machineTranslation.bodyXMLTranslations) {
            newResults.machineTranslation.bodyXMLTranslations = await convertMTBodyXML(newResults.machineTranslation.bodyXMLTranslations);
        }
    }
    // console.log('convertFTContentForChinese new result: ');
    // console.log(newResults);
    return newResults;
}

async function promptOpenAIForArticle(id, index, language, text, chunks, action) {
    try {
        // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        const actionSuffix = (action === 'quiz') ? '' : `_${action}`;
        // MARK: - 1. Check if there's a cached result
        const queryData = {id: id, index: index, language: language, type: action};
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
            url = `/api/page/poll_request_result${actionSuffix}.json`;
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
            } else if (cachedResult && cachedResult.status === 'error') {
                // MARK: - If there's a cached error, don't try the API again
                console.log(`Found cached error: `);
                console.log(cachedResult);
                return {status: 'failed', message: 'Cannot get the data from AI model'};
            }
        } catch(err){
            console.log(err);
        }
        // MARK: - 2. Handle this over as a background task
        const _id = generateRequestId();
        const data = {id: id, index: index, language: language, text: text, _id: _id, chunks: chunks, action: action};
        url = (isPowerTranslate) ? '/openai/create_info' : '/FTAPI/create_info.php';
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
                url = `/api/page/poll_request_result${actionSuffix}.json`;
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                };
            }
            for (let i=0; i<loops; i++) {
                console.log(`loop for promptOpenAIForArticle ${action} ${_id}: ${i}, url: ${url}`);
                response = await fetch(url, options);
                try {
                    const results = await response.json();
                    console.log('results: ');
                    console.log(results);
                    if (typeof results === 'object' && results !== null) {
                        // console.log(results);
                        if (results && results.length > 0) {
                            return {status: 'success', results: results};
                        }
                        if (results.status === 'error') {
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

function checkContentLinks() {
    const links = document.querySelectorAll('.story-body a');
    for (let link of links) {
        link.setAttribute('target', '_blank');
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
            if (figure) {
                figure.setAttribute('data-id', j);
                if (j === 0) {figure.classList.add('visible');}
                viewPort.appendChild(figure);
            }
        }
        scrollableBlock.appendChild(viewPort);
        for (var k = 0; k < scrollableSections.length; k++) {
            scrollableSection = scrollableSections[k];
            const themePosition = scrollableSection.getAttribute('theme-position');
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
                // MARK: - theme position 3 seems to be different an example is https://www.ft.com/content/0452cacc-26d4-409f-9ff6-cf5213c2987f
                if (themePosition === '3') {
                    scrollTextBlock.classList.add('scrollable-slide-theme-3');
                } else if (/strong/gi.test(scrollTextHTML)) {
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