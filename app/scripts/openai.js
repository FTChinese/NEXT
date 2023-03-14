/* jshint ignore:start */
async function createChatFromOpenAI(data) {
    // MARK: - For the first request, be stable. Then be creative. 
    try {
        const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'ftccms123434344';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        let url = (isPowerTranslate) ? '/openai/create_chat' : '/FTAPI/create_chat.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        };
        if (isFrontendTest) {
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
            return {status: 'success', text: text};
        } else {
            return {status: 'failed', message: 'Something is wrong with OpenAI, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

async function generateTextFromOpenAI(prompt, requestCount) {
    // MARK: - For the first request, be stable. Then be creative. 
    const temperature = (requestCount === 0) ? 0 : 1;
    const max_tokens = prompt.length * 2;
    const data = {
        messages: [{role: 'user', content: prompt}],
        temperature: temperature,
        max_tokens: max_tokens
    };
    const result = await createChatFromOpenAI(data);
    return result;
}
/* jshint ignore:end */