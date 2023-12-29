/* jshint ignore:start */

// MARK: - generate hash from the input
async function generateHash(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateRequestId() {
    const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, '0');
    const machineId = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    const processId = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0');
    const counter = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
    return timestamp + machineId + processId + counter;
}

async function wait(seconds) {
    return new Promise(resolve => {
        setTimeout(() => {
        resolve();
        }, seconds * 1000);
    });
}

async function createChatFromOpenAI(data) {
    const errorMessageDict = {
        content_filter: `<p>Our AI service vendor returns the following error: </p><p>The response was filtered due to the prompt triggering Azure OpenAI’s content management policy. Please modify your prompt and retry. </p><p>It's probably not your fault. But for the time being, please refresh and talk about other things with our chat bot. </p>`,
        other: `The AI model returns an error. It could be because of something in your prompt or the context that we provid. Sorry, please refresh and try something new. `
    };
    try {
        // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';

        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        // MARK: - OpenAI's API can't reliably return in 30 seconds, which is a hard time-out for Heroku. So here we need to hand over the task to a background process. 
        let response;
        let url;

        // MARK: - 1. Check if there's a cached result
        const hash = await generateHash(JSON.stringify(data));
        data.hash = hash;

        // const queryData = {hash: hash, type: 'chat'};
        const queryData = {hash: hash};
        url = (isPowerTranslate) ? '/openai/check_cache' : '/FTAPI/check_cache.php';
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
        try {
            response = await fetch(url, options);
            const cachedResult = await response.json();
            if (cachedResult) {
                // MARK: - If the cached result is good, use it immediately
                if (cachedResult.length > 0) {
                    if (cachedResult && cachedResult.length > 0) {
                        if (cachedResult[0].message && cachedResult[0].message.content) {
                            return {
                                status: 'success', 
                                text: cachedResult[0].message.content, 
                                intention: cachedResult[0].message.intention || 'Other',
                                sources: cachedResult[0].message.sources || []
                            };
                        }
                    }
                }
                // MARK: - If there's a cached error. 
                if (cachedResult.status === 'error') {
                    let errorResult = {status: 'failed'};
                    errorResult.code = cachedResult.code;
                    // MARK: - Show the known error messages in our own way
                    if (cachedResult.code === 'content_filter') {
                        errorResult.message = errorMessageDict.content_filter;
                    } else {
                        errorResult.message = errorMessageDict.other;
                    }
                    return errorResult;
                }
            }
        } catch(err){
            console.log(err);
        }
        
        // MARK: - 2. Handle this as a background task
        const _id = generateRequestId();
        data._id = _id;
        url = (isPowerTranslate) ? '/openai/handle_intention' : '/FTAPI/handle_intention.php';
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

        // MARK: - 3. Poll our own (much much faster) APIs for finished task
        let results;
        if (saveResult && saveResult.status === 'success') {
            const timeoutSeconds = 120;
            const intervalSeconds = 5;
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
                url = '/api/page/openai_chat.json';
                options = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                };
            }
            for (let i=0; i<loops; i++) {
                response = await fetch(url, options);
                try {
                    const pollResults = await response.json();
                    if (typeof pollResults === 'object' && pollResults !== null) {
                        if (pollResults.length > 0) {
                            // MARK: - The results is a copy of OpenAI's return of `choices`
                            results = pollResults;
                            break;
                        }
                        
                        if (pollResults.status === 'error') {
                            let errorResult = {status: 'failed'};
                            errorResult.message = pollResults.message;
                            errorResult.code = pollResults.code;
                            // MARK: - Show the known error messages in our own way
                            if (pollResults.code === 'content_filter') {
                                errorResult.message = errorMessageDict.content_filter;
                            } else {
                                errorResult.message = errorMessageDict.other;
                            }
                            return errorResult;
                        }

                        const status = pollResults.status;
                        const responseStatusEle = document.querySelector('.chat-talk-response-status');
                        if (typeof status === 'string' && responseStatusEle) {
                            responseStatusEle.innerHTML = `${localize(status)}...`;
                        }
                    }
                } catch(err) {
                    console.log(`pollResults error: `);
                    console.log(err);
                }
                await wait(intervalSeconds);
            }
        }
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (typeof results === 'object' && results.length > 0 && results[0].message && results[0].message.content) {
            const message = results[0].message
            const text = message.content.trim();
            const intention = message.intention || 'Other';
            const sources = message.sources || [];
            const result = {status: 'success', text: text, intention: intention, sources: sources};
            return result;
        } else {
            return {status: 'failed', message: 'Something is wrong with our AI vendor, we can\'t seem to connect to it right now. Please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

async function generateTextFromOpenAI(prompt, requestCount, key) {
    // MARK: - For the first request, be stable. Then be creative. 
    const temperature = (requestCount === 0) ? 0 : 1;
    const max_tokens = prompt.length * 2;
    let data = {
        messages: [{role: 'user', content: prompt}],
        temperature: temperature,
        max_tokens: max_tokens
    };
    if (key) {
        data.key = key;
    }
    const result = await createChatFromOpenAI(data);
    return result;
}

async function translateFromEnglish(text, language) {
    if (!language || language === 'English' || /^en/.test(language)) {return text;}
    try {
        const result = await translateOpenAI(text, language);
        return result;
    } catch(err) {
        console.log(err);
    }
    return text;
}

async function translateOpenAI(text, target) {
    if (!target || target === '') {return text;}
    try {
        const result = await generateTextFromOpenAI(`Translate into ${target}\n${text}`, 0, 'create_chat');
        if (result.status === 'success' && result.text) {
            return result.text.trim();
        }
    } catch(err){
        console.log(err);
    }
    return text;
}

async function getFTAPISearchResult(keyword, language) {
    try {
        // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        const contentParameter = `?language=${language || 'English'}&keyword=${keyword}&field=`;
        let url = (isPowerTranslate) ? '/openai/searchftapi' : '/FTAPI/content.php';
        url += contentParameter;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/searchftapi.json';
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (results.results) {
            return {status: 'success', results: results.results};
        } else {
            return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}


async function getFTPageInfo(name, language) {
    try {
        // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        let url = (isPowerTranslate) ? `/ftpage/${name}?language=${language}` : `/FTAPI/ft-${name}.php`;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };
        if (isFrontendTest && !isPowerTranslate) {
            // url = '/api/page/ft-page.json';
            url = '/api/page/ft-page-chinese.json';
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        // TODO: Convert to TW or HK traditional Chinese only if needed
        if(identifyLanguage(language)===false){
            console.log(`current language no need to translate, directly show the result`)
            return {status: 'success', results: results};
        }
        try{
            console.log(`Converting fetched result\n`)
            const stringResult =await convertChinese(JSON.stringify(results),language);
            results = JSON.parse(stringResult);
        } catch(err){
            console.log(`Converting fail, return pre-translated result\n`)
        }
        return {status: 'success', results: results};
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}



/* jshint ignore:end */