/* jshint ignore:start */

delegate.on('click', '.survey-options div[data-key]', async (event) => {
    const element = event.target;
    const surveyContainer = element.closest('.survey-container');
    const surveyItemContainer = element.closest('.survey-item-container');
    if (!surveyItemContainer || !surveyContainer) {return;}
    let max_options = parseInt((surveyItemContainer.getAttribute('data-max-options') || 1), 10);
    const submitButton = surveyContainer.querySelector('.survey-submit');
    submitButton.classList.remove('hide');
    if (max_options === 1) {
        // MARK: - Single Choice Question
        const surveyOptions = surveyItemContainer.querySelectorAll('.survey-options div[data-key]');
        for (const option of surveyOptions) {
            option.classList.remove('selected');
        }
        element.classList.add('selected');
    } else {
        // MARK: - Multiple Choices Question
        const selectedOptions = surveyItemContainer.querySelectorAll('.survey-options div[data-key].selected');
        const selectedOptionsCount = selectedOptions.length;
        if (selectedOptionsCount >= max_options && !element.classList.contains('selected')) {
            return;
        }
        element.classList.toggle('selected');
    }
});

// MARK: If input has changed, show the submit button
delegate.on('keyup', '.survey-options input', async (event) => {
    const element = event.target;
    if (element.value === '') {return;}
    const surveyContainer = element.closest('.survey-container');
    if (!surveyContainer) {return;}
    const submitButton = surveyContainer.querySelector('.survey-submit');
    submitButton.classList.remove('hide');
});

delegate.on('click', '.survey-submit', async (event) => {
    const element = event.target;
    const text = element.innerHTML;
    // MARK: - Send the data first and update the css to show it's pending
    element.classList.add('pending');
    element.innerHTML = 'CONFIRMING...';
    const surveyContainer = element.closest('.survey-container');
    const name = surveyContainer.getAttribute('data-name');
    const visibleSurveyItems = surveyContainer.querySelectorAll('.survey-item-container:not(.hide)');
    const currentSurveyItem = visibleSurveyItems[visibleSurveyItems.length - 1];
    const key = currentSurveyItem.getAttribute('data-key') || '';
    const selectedOptionsAll = currentSurveyItem.querySelectorAll('.survey-options [data-key].selected');
    let values = [];
    for (const option of selectedOptionsAll) {
        values.push(option.getAttribute('data-key'));
    }
    const note = currentSurveyItem.querySelector('.survey-options input')?.value ?? '';
    const user = paramDict.u;
    const surveyItemResult = {
        survey: name,
        question: key,
        values: values,
        user: user,
        note: note
    };
    let url = '/survey/submit';
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyItemResult)
    };
    if (isFrontendTest && !isPowerTranslate) {
        url = '/api/page/ft_survey_submit.json';
        options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
    const response = await fetch(url, options);
    let result = await response.json();
    console.log('result: ');
    console.log(result);
    element.classList.remove('pending');
    element.innerHTML = text;
    if (!result || result.status !== 'ok') {
        return;
    }
    console.log('submitted!')
    element.classList.add('hide');
    const nextSurvey = surveyContainer.querySelector('.survey-item-container.hide');
    if (nextSurvey === null) {
        const note = surveyContainer.getAttribute('data-ending-note') || '';
        const button = surveyContainer.getAttribute('data-ending-button') || '';
        const link = surveyContainer.getAttribute('data-ending-link') || '';
        let buttonHTML = '';
        if (button !== '') {
            buttonHTML = `<div class="survey-ending-container"><a href="${link}" target="_blank">${button}</a></div>`;
        }
        showResultInChat({text: `<div>${note}</div>${buttonHTML}`});
        return;
    }
    nextSurvey.classList.remove('hide');
    const chatContainer = element.closest('.chat-talk');
    chatContainer.scrollIntoView(scrollOptions);
});

async function showSurvey(name) {
    // console.log(`Show Survey: ${name}`);
    try {
        showBotResponse('Loading Survey Data...');
        // MARK: - It is important to set the current ft id here, because async request might not be returned in the expected sequence. 
        const surveyInfo = await getSurveyInfo(name);
        if (surveyInfo.status !== 'success' || !surveyInfo.results) {
            await showError(`Can't get the data for ${name}! `);
        }
        const data = surveyInfo.results;
        const intro = getLocalizedText(data.intro);
        const endingNote = getLocalizedText(data.ending?.note ?? '');
        const endingButton = getLocalizedText(data.ending?.button ?? '');
        const endingLink = data.ending?.link ?? '';
        const questionsHTML = data.questions.map((item, index) => {
            const question = getLocalizedText(item.question);
            let options = shuffle(item.options).map(option => {
                const key = option.key;
                const text = getLocalizedText(option.text);
                return `<div data-key="${key}">${text}</div>`;
            }).join('');
            if (item.allow_text_input) {
                options += `<div class="text-input"><input type="text" value="" placeholder="${localize('OtherReason')}"></div>`;
            }
            const firstItemClass = index === 0 ? ' is-first-item' : '';
            const hideClass = index === 0 ? '' : ' hide';
            const type = item.type || '';
            let maxOptions = item.max_options || 1;
            if (type === 'single_choice') {
                maxOptions = 1;
            }
            const itemKey = item.key;
            return `
                <div class="survey-item-container${firstItemClass}${hideClass}" data-type="${type}" data-max-options=${maxOptions} data-key="${itemKey}">
                    <div class="survey-question">${question}</div>
                    <div class="survey-options">${options}</div>
                </div>`.replace(/[\n\r]+/g, '');
        }).join('');
        const html = `<p>${intro}</p><div class="survey-container" data-name="${name}" data-ending-note="${endingNote}" data-ending-button="${endingButton}" data-ending-link="${endingLink}">${questionsHTML}<button class="survey-submit hide">CONFIRM</button></div>`;
        const result = {text: html};
        showResultInChat(result);
    } catch(err) {
        console.log(err);
    }
}

async function getSurveyInfo(name) {
    try {
        let url = `/survey/get/${name}`;
        let options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (isFrontendTest && !isPowerTranslate) {
            url = '/api/page/survey.json';
        }
        const response = await fetch(url, options);
        let results = await response.json();
        if (response.status >= 400 && results.message) {
            return {status: 'failed', message: results.message};
        }
        if (results) {
            results = await handleFTContent(results);
            return {status: 'success', results: results};
        } else {
            return {status: 'failed', message: 'Something is wrong with FT Search, please try later. '};
        }
    } catch(err) {
        console.log(err);
        return {status: 'failed', message: err.toString()};
    }
}

function getLocalizedText(obj) {
    return obj[preferredLanguage] || obj.en;
}

/* jshint ignore:end */