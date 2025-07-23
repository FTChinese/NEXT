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
    
    try {
        // const token = (isPowerTranslate) ? localStorage.getItem('accessToken') : 'sometoken';
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';

        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        // MARK: - OpenAI's API can't reliably return in 30 seconds, which is a hard time-out for Heroku. So here we need to hand over the task to a background process. 
        let response;
        let url;

        // MARK: - 1. Check if there's a cached result
        const hash = await generateHash(JSON.stringify(data));
        data.hash = hash;
        const key = data?.key ?? '';

        // const queryData = {hash: hash, type: 'chat'};
        const queryData = {hash, key};
        url = (isPowerTranslate) ? '/openai/check_cache' : '/FTAPI/check_cache.php';
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                        errorResult.message = localize('chat_error_content_filter');
                    } else {
                        errorResult.message = localize('chat_error_other');
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
                'Content-Type': 'application/json'
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
            url = `${url}?request_id=${_id}&key=${key}`;
            let options = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
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
                                errorResult.message = localize('chat_error_content_filter');
                            } else {
                                errorResult.message = localize('chat_error_other');
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
        } else if (saveResult) {
            // MARK: Pass some quick results to be handled 
            if (['PermissionRequired', 'rateLimit'].includes(saveResult?.status ?? '')) {
                results = saveResult;
            }
        }

        if (response.status >= 400 && typeof results === 'object') {
            return {status: 'failed', detail: results, message: results?.message ?? 'unknow error'};
        }

        if (typeof results === 'object' && results.length > 0 && results[0].message && results[0].message.content) {
            const message = results[0].message
            const text = message.content.trim();
            const intention = message.intention || 'Other';
            const sources = message.sources || [];
            const result = {status: 'success', text: text, intention: intention, sources: sources};
            return result;
        } else if (typeof results === 'object' && results.status === 'rateLimit' ) {
            const minutes = Math.ceil((results.remainingTime || 0) / 60000);
            const waitMessage = localize('WaitMessage', undefined, {minutes});
            const reminder = localize('RateLimitReminder');
            const otherFeatures = localize('OtherFeaturesReminder');
            const message = `${reminder}${waitMessage}${otherFeatures}`;
            return {status: 'failed', message: message};
        } else {
            console.log(`results: `);
            console.log(results);
            return {status: 'failed', message: localize('chat_error_network')};
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
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        // console.log(`key word: `, keyword);
        const contentParameter = `?language=${language || 'English'}&keyword=${encodeURIComponent(keyword)}&field=`;
        let url = (isPowerTranslate) ? '/openai/searchftapi' : '/FTAPI/content.php';
        url += contentParameter;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
        // console.log(`url: `, url);
        const response = await fetch(url, options);
        let results = await response.json();
        // console.log(`response status: ${response.status}, results: `);
        // console.log(results);
        if (response.status >= 400) {
            const message = results?.message ?? 'unknow error';
            return {status: 'failed', message, detail: results};
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
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        let url = (isPowerTranslate) ? `/ftpage/${name}?language=${language}` : `/FTAPI/ft-${name}.php`;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
            return {status: 'failed', message: results.message, results};
        }
        return {status: 'success', results};
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
    
}

async function getEmbedding(content) {
    const dbName = "Embeddings";
    const storeName = "Embeddings";
    try {
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        const resultsFromIndexedDB = await getFromDB(dbName, storeName, content);
        if (resultsFromIndexedDB && typeof resultsFromIndexedDB === 'object' && resultsFromIndexedDB.length > 0) {
            // console.log(`Got embedding from indexed DB. No need to make a request! `);
            return resultsFromIndexedDB;
        }
        let url = '/ai/get_embedding';
        const queryData = {content: content};
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return null;
        }
        await saveToDB(dbName, storeName, content, results);
        return results;
    } catch(err) {
        console.log(err);
        return null;
    }
}

async function getIdsFromVectorDB(vector) {
    try {
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        let url = '/ai/get_ids_from_vector_db';
        const queryData = {vector: vector, namespace: 'content', topK: 50, minScore: 0.78};
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return null;
        }
        return results;
    } catch(err) {
        console.log(err);
        return null;
    }
}

async function getMatchesFromVectorDB(vector, language) {
    try {
        // const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        // if (!token || token === '') {
        //     return {status: 'failed', message: 'You need to sign in first! '};
        // }
        let url = '/ai/get_vector_matches';
        const queryData = {vector: vector, namespace: 'content', topK: 50, minScore: 0.7, language: language};
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}`
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
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return null;
        }
        return results;
    } catch(err) {
        console.log(err);
        return null;
    }
}


/* jshint ignore:end */