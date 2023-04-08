/* jshint ignore:start */
// const isPowerTranslate = location.href.indexOf('powertranslate') >= 0;
// const isFrontendTest = location.href.indexOf('localhost') >= 0;
async function createChatFromOpenAI(data) {
    try {
        const key = data.key || 'detect_intention';
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        let url = (isPowerTranslate) ? `/openai/${key}` : `/FTAPI/${key}.php`;
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/openai_chat.json';
            options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            };
        }
        const response = await fetch(url, options);
        const results = await response.json();
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (results.length > 0 && results[0].message && results[0].message.content) {
            const text = results[0].message.content.trim();
            let result = {status: 'success', text: text};
            const intention = results[0].message.intention;
            if (intention && intention !== '') {
                result.intention = intention.trim();
            }
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
    if (!language || language === 'English') {return text;}
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

async function getFTAPISearchResult(keyword) {
    try {
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        const contentParameter = `?keyword=${keyword}&field=`;
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

/* jshint ignore:end */