/* jshint ignore:start */

const readIdsKey = 'readids';
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
        trackEvent('show-article', 'chatbot', ftid);
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
        trackEvent('show-article-later', 'chatbot', ftid);
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
        trackEvent('jump-to-article', 'chatbot', ftid);
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
    const ftcRegex = /^.*\/(interactive|story)\/([\d]+).*$/;
    const isFTC = ftcRegex.test(link);
    if (isFTContent) {
        event.preventDefault();
        const ftid = link.replace(ftContentRegex, '$1');
        const language = preferredLanguage;
        openFTContent(ftid, language);
    } else if (isFTC) {
        event.preventDefault();
        const type = link.replace(ftcRegex, '$1');
        const id = link.replace(ftcRegex, '$2');
        const language = preferredLanguage;
        await openFTCContent(type, id, language);
    }
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




function showUpdateButton(event) {
    const element = event.target;
    const container = element.closest('.chat-talk-inner');
    if (!container) {return;}
    let chatItemActions = container.querySelector('.chat-item-actions');
    if (!chatItemActions) {return;}
    if (chatItemActions.querySelector('[data-action="edit-ai-translation"]')) {return;}
    let editAITranslationButton = document.createElement('A');
    editAITranslationButton.setAttribute('data-action', 'edit-ai-translation');
    editAITranslationButton.innerHTML = 'Update';
    chatItemActions.append(editAITranslationButton);
}

delegate.on('input', '[contenteditable="true"]', (event) => {
    showUpdateButton(event);
});


delegate.on('paste', '[contenteditable="true"]', (event) => {
    
    event.preventDefault();
    // Get the text content from the Clipboard
    const text = (event.clipboardData || window.clipboardData).getData('text');
    console.log(`inserting: ${text}`);
    // Create a text node from the plain text
    const textNode = document.createTextNode(text);
    // Get the current selection
    const selection = window.getSelection();
    if (!selection.rangeCount) return; // Don't proceed if there's no selection

    // Get the first range of the selection
    const range = selection.getRangeAt(0);
    range.deleteContents(); // Remove the contents of the current selection

    // Insert the new text node at the cursor's position
    range.insertNode(textNode);

    // Move the cursor to the end of the inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges(); // Remove all ranges (clears the current selection)
    selection.addRange(range); // Add the new range (sets the new cursor position)

    showUpdateButton(event);
});

delegate.on('click', '[data-action="edit-ai-translation"]', async (event) => {
    // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
    // if (!token || token === '') {
    //     return {status: 'failed', message: 'You need to sign in first! '};
    // }
    const element = event.target;
    try {
        const container = element.closest('.chat-talk-inner')?.querySelector('.article-container');
        if (!container) {return;}
        const id = container.getAttribute('data-id');
        if (!id) {return;}
        const title = container.querySelector('[data-translation-property="title"]')?.innerText ?? '';
        if (title === '') {return;}
        const standfirst = container.querySelector('[data-translation-property="standfirst"]')?.innerText ?? '';
        // if (standfirst === '') {return;}
        const eles = container.querySelectorAll('.story-body-container .rightp[id]');
        let bodyInfo = {};
        for (const ele of eles) {
            const id = ele.id;
            if (!id) {continue;}
            const html = ele.innerHTML;
            if (!html) {continue;}
            bodyInfo[id] = html;
        }
        const info = {
            id: id,
            title: title,
            ...standfirst && {standfirst},
            body: bodyInfo,
            language: preferredLanguage
        };
        const response = await fetch('/aitranslation/update', {
            method: 'POST', // Method itself
            headers: {
                'Content-Type': 'application/json', // Indicates the content 
                // 'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(info) // We send data in JSON format
        });
        if (response.ok) {
            alert('Updated!');
            trackEvent('edit-ai-translation', 'chatbot', id);
        } else {
            alert('Failed!');
        }
    } catch (err) {
        console.log(err);
    }
});



function generateAddCalendarHTML(options) {
    const title = encodeURIComponent(options?.title ?? 'Daily Quiz');
    const description = encodeURIComponent(options?.description ?? '');
    const durationMinutes = options?.durationMinutes ?? 10;
    const prompt = options.prompt ?? 'Add a reminder to your calendar to get notified at the same time tomorrow!';
    const eventUrl = encodeURIComponent(options.eventUrl ?? '');
    const alertMinutes = options?.alertMinutes ?? 0;

    const calendarUrl = `/calendar_event?title=${title}&description=${description}&durationMinutes=${durationMinutes}&alertMinutes=${alertMinutes}&eventUrl=${eventUrl}`;
    
    const calendarHTML = `
        <div class="add-to-calendar">
            <span class="calendar-icon">🗓️</span>
            ${prompt}
            <a href="${calendarUrl}" download="quiz_reminder.ics" data-ea="download" data-ec="Calendar" data-el="Daily Quiz" data-ev=1>
            ${localize('Add to Calendar')}
            </a>
        </div>`;
    return calendarHTML;
}



// Function to calculate stats (make sure it's the same robust version)
function calculateStats(values) {
    if (!values || values.length === 0) {
        return {
            average: 0,
            played: 0,
            currentStreak: 0,
            maxStreak: 0
        };
    }

    // Sort values by date (key)
    values.sort((a, b) => new Date(a.key) - new Date(b.key));

    let total = 0;
    let streak = 0;
    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate = null;

    values.forEach((scoreObj) => {
        const { key: date, value: score } = scoreObj;
        total += score;

        if (lastDate) {
            const differenceInDays = (new Date(date) - new Date(lastDate)) / (1000 * 3600 * 24);

            if (differenceInDays === 1) {
                streak++;
            } else {
                streak = 1; // Reset streak if the dates are not consecutive
            }
        } else {
            streak = 1; // Start the first streak
        }

        // Update the max streak
        if (streak > maxStreak) {
            maxStreak = streak;
        }

        lastDate = date; // Set the last date to the current date
    });

    // The current streak is the streak calculated from the last date in the dataset
    currentStreak = streak;

    const average = Math.round(total / values.length);

    return {
        average, // rounded to the nearest integer
        played: values.length, // number of items in the array
        currentStreak,
        maxStreak
    };
}

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

async function openFTCContent(type, id, language) {
    let url = `/get_ftid_from_ftc/${type}/${id}`;
    if (isFrontendTest && !isPowerTranslate) {
        url = `/api/page/get_ftid.json`;
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.ftid) {
        const ftid = data.ftid;
        openFTContent(ftid, language)
    }
}

function openFTContent(ftid, language) {
    const url = `/powertranslate/chat.html#ftid=${ftid}&language=${language}&action=read`;
    window.open(url, '_blank');
    const win = window.open(url, '_blank');
    win.focus();
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

// MARK: - This mainly works for the English body XML, for Chinese translation body XML, the image HTML is already generated. 
function imagesToHtml(embed) {
    let html = '<picture>';
    const images = embed.members;
    if (images.length === 0) {return '';}
    let hasDefaultImage = false;
    let deskTopImage = '';
    let isSmallImage = true;
    images.forEach((image) => {
        const pixelWidth = Math.min(1200, image.pixelWidth || 1200);
        if (pixelWidth > 450) {
            isSmallImage = false;
        }
        const actualWidth = pixelWidth * 2;
        let imageUrl = `https://www.ft.com/__origami/service/image/v2/images/raw/${encodeURIComponent(image.binaryUrl)}`;
        deskTopImage = `<img src="${imageUrl}?source=next&amp;width=${actualWidth}">`;
        if (image.format === 'desktop' || image.minDisplayWidth === '980px') {
            html += `<source media="screen and (min-width: 980px)" srcset="${imageUrl}?source=next&amp;width=${actualWidth}">`;
        } else if (image.format === 'mobile' || image.maxDisplayWidth === '490px') {
            html += `<source media="screen and (max-width: 490px)" srcset="${imageUrl}?source=next&amp;width=${actualWidth}">`;
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
    const isGraphic = (images.length === 1 && images[0].format === 'standardInline' && /\/Graphic$/.test(images[0].type));
    const picClass = isGraphic || isSmallImage ? ' leftPic' : '';
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
    for (let ele of container.querySelectorAll('[data-asset-type="video"]')) {
        const href = ele.href || '';
        if (href === '') {continue;}
        const youtubeRegex = /^https:\/\/www\.youtube\.com\/watch\?v=([A-z\d]+)$/g;
        if (youtubeRegex.test(href)) {
            const youtubeId = href.replace(youtubeRegex, '$1');
            ele.outerHTML = `<div class="n-content-video n-content-video--youtube"><div class="n-content-video__placeholder"><iframe class="n-content-video__embedded" frameBorder="0" allowfullscreen="" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" src="https://www.youtube.com/embed/${youtubeId}?rel=0"></iframe></div></div>`;
        } else {
            console.log(`This is not Youtube video. Please ask the developer to handle it! `);
            continue;
        }
    }
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
    // if (hasFlourish) {
    //     const script = document.createElement('script');
    //     script.src = 'https://public.flourish.studio/resources/embed.js';
    //     document.head.appendChild(script);
    // }
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
        const actionSuffix = (action === 'quiz') ? '' : `_${action}`;
        // MARK: - 1. Check if there's a cached result
        const queryData = {id: id, index: index, language: language, type: action};
        let url = (isPowerTranslate) ? '/openai/check_cache' : '/FTAPI/check_cache.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
                    // 'Authorization': `Bearer ${token}`
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

function checkStoryImages() {
    const storyContainers = document.querySelectorAll('.show-hero-header');
    for (let storyContainer of storyContainers) {
        const storyHeaderImage = storyContainer.querySelector('.story-header-container .story-image figure img');
        if (!storyHeaderImage) {
            storyContainer.classList.remove('show-hero-header');
        }
    }
}

function initScrollyTelling(ftid) {
    if (!ftid || ftid === '') {return;}
    var scrollableBlocks = document.querySelectorAll(`[data-id="${ftid}"] .scrollable-block`);
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
            var scrollableSectionText = (scrollableSection.innerText || '').trim().replace(/[\r\n]+/, '<br>');
            var scrollTextEles = scrollableSection.querySelectorAll('scrollable-text');
            if (scrollTextEles.length === 0) {
                var scrollTextEleNew = document.createElement('DIV');
                scrollTextEleNew.innerHTML = scrollableSectionText;
                scrollTextEles = [scrollTextEleNew];
            }
            var scrollTextHTML = '';
            for (var scrollTextEle of scrollTextEles) {
                scrollTextHTML = scrollTextEle.innerHTML;
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
            }
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



// MARK: - Add the ft id to read in local storage
function addStoryToRead(ftid) {

  let readIds = getReadStories();
  readIds = readIds.filter(x=>x !== ftid);
  readIds.unshift(ftid);
  readIds = readIds.slice(0, 300);
//   console.log(`There are now ${readIds.length} ids in local storage! `);
  localStorage.setItem(readIdsKey, JSON.stringify(readIds));

}

function getReadStories() {

    let readIdsString = localStorage.getItem(readIdsKey) || '[]';
    let readIds = [];
    try {
        readIds = JSON.parse(readIdsString);
    } catch(err) {
        console.log(`addStoryToRead parsing JSON error: `);
        console.log(err);
    }
    return readIds;
}

function reorderFTResults(results, vectorHighScoreIds) {

    // console.log(`There are ${Object.keys(vectorHighScoreIds)} vector matches! `);

    const myPreference = getMyPreference();
    const myAnnotationInterests = new Set(myPreference[myInterestsKey] || []);
    const myCustomInterests = new Set(myPreference[myCustomInterestsKey] || []);
    const myInterests = new Set([...myAnnotationInterests, ...myCustomInterests]);
      
    // MARK: Handle Read Articles Preference
    const readArticle = myPreference[readArticlesKey] || 'collapse';
    const collapseReadArticles = readArticle === 'collapse';

    // MARK: - The articles that you've read should go to a READ group at the bottom of the results list
    const readIds = new Set(getReadStories() || []);

    let newResults = [];
    let follows = [];
    let reads = [];
  
    for (const group of results) {
      const name = group.group;
      let newGroup = {group: name};
      let newItems = [];
      const items = group.items || [];
      for (let item of items) {
        const id = item.id;
        const isArticleRead = id && readIds.has(id);
        item.read = isArticleRead;
        // MARK: Use vectorHighScoreIds to reorder
        const isFollowedInfo = isItemFollowed(item, myInterests, vectorHighScoreIds);
        const isFollowed = isFollowedInfo.followed;
        if (isFollowed) {
            item.follow = isFollowedInfo.annotation;
        }
        if (isArticleRead && collapseReadArticles) {
            reads.push(item);
        } else if (isFollowed) {
            follows.push(item);
        } else {
            newItems.push(item);
        }
      }
      if (newItems.length > 0) {
            newGroup.items = newItems;
            newResults.push(newGroup);
      }
    }
  
    if (newResults.length > 0 && newResults[0].items) {
      newResults[0].items = follows.concat(newResults[0].items);
    }

    if (reads && reads.length > 0) {
        newResults.push({group: localize('Read'), items: reads});
    }
  
    return newResults;
  
}

/* jshint ignore:end */