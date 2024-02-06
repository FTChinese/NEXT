/* jshint ignore:start */
const delegate = new Delegate(document.body);

const myInterestsKey = 'My Interests';
const myCustomInterestsKey = 'My Custom Interests';
const interestsInfos = [
    {id: myCustomInterestsKey, action: 'remove-custom-interest'},
    {id: myInterestsKey, action: 'add-interest'}
];
const populars = ['China', 'Companies', 'Markets', 'Opinion', 'VIDEOS', 'PODCASTS', 'Life & Arts', 'Work & Careers', 'Artificial intelligence', 'Electric vehicles', 'Technology Sector'];

const regions = ['China', 'United States', 'United Kingdom', 'India', 'Europe', 'Asia', 'Americas', 'Africa', 'Middle East'];

const countryMapping = {
    US: 'United States',
    CN: 'China',
    JP: 'Japan',
    DE: 'Germany',
    IN: 'India',
    FR: 'France',
    BR: 'Brazil',
    RU: 'Russia',
    GB: 'United Kingdom',
    CA: 'Canada',
    AU: 'Australia',
    ZA: 'South Africa',
    KR: 'South Korea',
    ES: 'Spain',
    IT: 'Italy',
    MX: 'Mexico',
    ID: 'Indonesia',
    TR: 'Turkey',
    NL: 'Netherlands',
    SA: 'Saudi Arabia',
    CH: 'Switzerland',
    SE: 'Sweden',
    NG: 'Nigeria',
    PL: 'Poland',
    AR: 'Argentina',
    NO: 'Norway',
    IR: 'Iran',
    EG: 'Egypt',
    BE: 'Belgium',
    BD: 'Bangladesh',
    TH: 'Thailand',
    GR: 'Greece',
    PK: 'Pakistan',
    VN: 'Vietnam',
    PH: 'Philippines',
    NZ: 'New Zealand',
    MY: 'Malaysia',
    UA: 'Ukraine',
    SG: 'Singapore',
    IL: 'Israel',
    PT: 'Portugal',
    AE: 'United Arab Emirates',
    HK: 'Hong Kong',
    CO: 'Colombia',
    DK: 'Denmark',
    FI: 'Finland',
    IE: 'Ireland',
    AT: 'Austria',
    TW: 'Taiwan'
};

let regionsSet = new Set(regions);
for (const key of Object.keys(countryMapping)) {
    regionsSet.add(countryMapping[key]);
}
const genresSet = new Set(['Opinion', 'Explainer']);

const curationsSet = new Set(['VIDEOS', 'PODCASTS']);

function getMyFollowsHTML() {

    const my = getMyPreference();
    const follows = (my[myInterestsKey] || []).filter(x => typeof x === 'object');

    let allIndex = 0;
    const interests = follows.map(info=>{
        const index = info.index || 0;
        allIndex += index;
        const key = info.key;
        const fallback = (/^(en|English)/gi.test(preferredLanguage)) ? key : info.display;
        const display = localize(key, fallback);
        let field = info.type || '';
        if (field === '') {
            field = checkType(key);
        }
        let content = `${field}: ${key}`;
        if (field === 'curations') {
            content = key;
        }
        return {index: index, html: `<a data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${content}" data-reply="${localize('Finding')}">${display}</a>`};
    });
    const customTopics = (my[myCustomInterestsKey] || []).filter(x=>typeof x === 'object');
    const topics = customTopics.map(info=>{
        const index = info.index || 0;
        allIndex += index;
        const key = info.key;
        const display = localize(key, info.display);
        return {index: index, html: `<a data-purpose="search-topic" data-lang="${preferredLanguage}" data-content="${key}" data-reply="${localize('Finding')}">${display}</a>`};
    });
    let allItems = topics.concat(interests);
    if (allIndex > 0) {
        allItems = allItems.sort((a, b) => a.index - b.index);
    }
    return allItems.map(x=>x.html).join('');

}

function checkType(key) {

    if (regionsSet.has(key)) {
        return 'regions';
    }
    if (genresSet.has(key)) {
        return 'genre';
    }
    if (curationsSet.has(key)) {
        return 'curations';
    }
    return 'topics';

}

function createHTMLFromNames(names) {

    const myPreference = getMyPreference();
    const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    return names
    .map(name=>{
        let buttonClass = 'plus';
        let buttonHTML = localize('Follow');
        if (myInterestsKeys.indexOf(name)>=0) {
            buttonClass = 'tick';
            buttonHTML = localize('Unfollow');
        }
        const type = checkType(name);
        return `
        <div class="input-container">
            <div class="input-name">${localize(name)}</div>
            <button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${name}" data-type="${type}">${buttonHTML}</button>
        </div>`;
    })
    .join('');

}

function getAnnotaionsInfo(content, language) {

    // ['http://www.ft.com/ontology/annotation/about', 'http://www.ft.com/ontology/annotation/mentions', 'http://www.ft.com/ontology/implicitlyClassifiedBy', 'http://www.ft.com/ontology/classification/isClassifiedBy', 'http://www.ft.com/ontology/implicitlyAbout', 'http://www.ft.com/ontology/annotation/hasAuthor', 'http://www.ft.com/ontology/hasDisplayTag']
    const usefulPredicates = new Set(['http://www.ft.com/ontology/annotation/about', 'http://www.ft.com/ontology/classification/isClassifiedBy', 'http://www.ft.com/ontology/annotation/hasAuthor', 'http://www.ft.com/ontology/hasDisplayTag']);
    const myPreference = getMyPreference();
    const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    const annotations = content.annotations;
    if (!annotations || annotations.length === '') {
        return {storyTheme: '', annotations: ''};
    }
    let storyTheme = '';
    let annotationsHTML = '';
    let annotationsHTMLMentions = '';
    let genreClass = '';
    // let predicates = new Set();
    // .filter(x => x.predicate && usefulPredicates.has(x.predicate))
    for (const annotation of annotations) {
        
        if ('GENRE' === annotation.type && annotation.prefLabel && annotation.prefLabel !== '') {
            genreClass = ` genre-${annotation.prefLabel.toLowerCase().replace(/\s/g, '-')}`;
        }

        const predicate = annotation.predicate || '';
        // predicates.add(annotation.predicate || '');
        const isDisplayTag = /hasDisplayTag/.test(annotation.predicate || '') && storyTheme === '';

        let display = annotation.translation || localize(annotation.prefLabel || '') || annotation.prefLabel || '';
        if (['en', 'English'].indexOf(language) >= 0) {
            display = annotation.prefLabel || '';
        }
        const name = annotation.prefLabel || '';
        const field = annotation.field || '';
        let buttonClass = 'plus';
        let buttonSource = 'Follow';
        if (myInterestsKeys.indexOf(name)>=0) {
            buttonClass = 'tick';
            buttonSource = 'Followed';
        }
        const buttonHTML = localize(buttonSource);
        if (isDisplayTag) {
            storyTheme = `<div class="story-theme"><a href="./chat.html#field=${field}&key=${name}&language=${language}&action=search&display=${display}" target="_blank" data-content="${name}" data-display="${display}">${display}</a><button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${name}" data-type="${field}" data-display="${display}" data-source="${buttonSource}" data-target="${buttonHTML}">${buttonHTML}</button></div>`;
        } else {
            const html = `<li class="story-theme"><a href="./chat.html#field=${field}&key=${name}&language=${language}&action=search&display=${display}" target="_blank" data-content="${name}" data-content="${name}" data-display="${display}">${display}</a><button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${name}" data-type="${field}" data-display="${display}" data-source="${buttonSource}" data-target="${buttonHTML}">${buttonHTML}${localize('<!--space-->', ' ')}${capitalize(localize(field))}</button></li>`;
            if (usefulPredicates.has(predicate)) {
                annotationsHTML += html;
            }
        }
    }
    // console.log(Array.from(predicates));
    if (annotationsHTML !== '') {
        annotationsHTML = `
        <div class="story-annotations"><div class="story-box">
            <h2 class="box-title"><a>${localize('Follow the topics in this article')}</a></h2>
            <ul class="top10">${annotationsHTML}</ul>
        </div></div>`;
    }
    annotationsHTMLMentions = `
        <div class="story-side-ad-container"><div class="story-box">
        </div></div>`;

    
    return {
        storyTheme: storyTheme, 
        annotations: annotationsHTML, 
        mentions: annotationsHTMLMentions,
        genreClass: genreClass
    };
}

async function createHTMLFromCustomTopics() {

    const myPreference = getMyPreference();
    const myInterests = myPreference[myCustomInterestsKey] || [];
    return myInterests
    .filter(x => typeof x === 'object')
    .map(x=>{
        const buttonClass = 'tick';
        const buttonHTML = localize('Unfollow');
        return `
        <div class="input-container">
            <div class="input-name">${x.display}</div>
            <button class="myft-follow ${buttonClass}" data-action="remove-custom-interest" data-name="${x.key}" data-type="${x.type}">${buttonHTML}</button>
        </div>`;
    })
    .join('');

}

function isItemFollowed(item, interests, vectorHighScoreIds) {

    const annotations = new Set();
    let metadata = item.metadata || {};
    const title = item.en?.title ?? item.title?.title ?? '';
    const subheading = item.en?.subheading ?? item.editorial?.subheading ?? '';
    const description = (title + subheading).toUpperCase();
    for (const key of Object.keys(metadata)) {
      const term = metadata[key];
      if (typeof term !== 'object') {continue;}
      if (term.term) {
        const name = term.term?.name;
        if (!name) {continue;}
        annotations.add(name);
      } else if (term.length > 0) {
        for (const termItem of term) {
          const termName = termItem.term?.name;
          if (!termName) {continue;}
          annotations.add(termName);
        }
      }
    }
    const upperCaseAnnotations = new Set(Array.from(annotations).map(x=>x.toUpperCase()));
    for (const info of interests) {
        const key = info.key || '';
        if (key === '') {continue;}
        const display = info.display;
        const type = info.type;
        const interestUpperCase = key.toUpperCase();
        if (upperCaseAnnotations.has(interestUpperCase)) {
            return {followed: true, annotation: key, display: display, type: type};
        }
        // MARK: - If the FT editorial forget to add proper meta, check the title and subheading
        if (description.indexOf(interestUpperCase) >= 0) {
            return {followed: true, annotation: key, display: display, type: type};
        }
    }

    const id = item.id;
    if (id && vectorHighScoreIds[id]) {
        const info = vectorHighScoreIds[id];
        const key = info.key;
        const display = info.display;
        const type = info.type;
        const followInfo = {followed: true, annotation: key, display: display, type: type};
        return followInfo;
    }
    return {followed: false};

}

function updateAnnotationsContainer(myPreference) {

    const followedAnnotations = getFollowedAnnotations(myPreference, interestsInfos);
    let eles = document.querySelectorAll(`.annotations-container`);
    for (let ele of eles) {
        ele.innerHTML = followedAnnotations;
    }

}

async function getHighScoreIdsFromVectorDB(content) {

    if (content !== 'home') {return {};}
    const myPreference = getMyPreference();
    const myTopics = myPreference[myCustomInterestsKey] || [];
    let dict = {};
    for (const myTopic of myTopics) {
        const key = myTopic.key;
        if (!key) {continue;}
        const embedding = await getEmbedding(key);
        const infos = await getIdsFromVectorDB(embedding);
        for (const info of infos) {
            const id = info.id;
            const score = info.score;
            if (!id || !score) {continue;}
            const existingScore = dict[id]?.score ?? 0;
            if (score >= existingScore) {
                dict[id] = myTopic;
                dict[id].score = score;
            }            
        }
    }
    return dict;

}


// MARK: - Debounce function to limit the rate of invoking a function
function debounce(func, delay) {
    let debounceTimer;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
}

async function fetchSuggestions(query) {
    try {
        const token = (isPowerTranslate) ? GetCookie('accessToken') : 'sometoken';
        if (!token || token === '') {
            return {status: 'failed', message: 'You need to sign in first! '};
        }
        let url = '/ai/search_annotation';
        const data = {query: query, language: preferredLanguage, limit: 10};
        let options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
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
    }
    return null;

}

function hideEle(ele) {
    if (ele) {
        ele.classList.remove('on');
    }
}

function showEle(ele) {
    if (ele) {
        ele.classList.add('on');
    }
}

function capitalize(word) {
    if (word && typeof word === 'string') {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
}

function renderSuggestion(ele, suggestions) {
    if (!ele) {return;}
    console.log(suggestions);
    if (!suggestions || suggestions.length === 0) {
        console.log('No Suggestion!');
        hideEle(ele);
        return;
    }
    showEle(ele);
    const myPreference = getMyPreference();
    const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    ele.innerHTML = suggestions
        .map(suggestion=>{
            const key = suggestion.name;
            const field = suggestion.field;
            let buttonClass = 'plus';
            let buttonHTML = `${localize('Follow')}${localize('<!--space-->', ' ')}${capitalize(localize(field))}`;
            const name = suggestion.translations?.[preferredLanguage] ?? key;
            if (myInterestsKeys.indexOf(key)>=0) {
                buttonClass = 'tick';
                buttonHTML = localize('Unfollow');
            }
            const type = suggestion.field ?? checkType(key);
            const extra = (localize(name) === key) ? '' : `(${key})`;
            return `
            <div class="input-container">
                <div class="input-name-container">
                <span class="input-name">${localize(name)}</span>
                <span class="input-extra">${extra}</span>
                </div>
                <button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${key}" data-type="${type}">${buttonHTML}</button>
            </div>`;
        })
        .join('');

}

delegate.on('click', '[data-action="add-interests"]', async (event) => {

    let myRegions = regions;
    const languageCodes = (preferredLanguage || '').split('-');
    if (languageCodes.length === 2) {
        const countryCode = languageCodes[1];
        const country = countryMapping[countryCode];
        if (country) {
            myRegions = myRegions.filter(x=>x !== country);
            myRegions.unshift(country);
        }
    }

    const htmlFromCustomTopicsText = await createHTMLFromCustomTopics();
    const htmlFromCustomTopics = await convertChinese(htmlFromCustomTopicsText, preferredLanguage);    
    const ele = document.createElement('DIV');
    ele.classList.add('overlay-container');
    ele.classList.add('on');
    ele.innerHTML = `
    <div class="overlay-inner">
    <div class="overlay-bg" data-parentid="overlay-login"></div>
    <div class="overlay-content-outer">
    <div class="overlay-content-inner">
    <div class="overlay-content">
    <div class="overlay-title">${localize('Add Interests')}<i class="overlay-close" data-action="close-overlay">×</i></div>
    
    <div class="input-title">${localize('Topics')}</div>
    <div class="input-container">
        <div class="input-name">
            <input id="custom-topic-input" type="text" placeholder="${localize('Topic')}">
            <div class="custom-topic-suggestion"></div>
        </div>
        <button class="myft-follow plus" data-action="add-custom-interest">${localize('Follow')}</button>
    </div>
    ${htmlFromCustomTopics}
    <div class="input-title">${localize('Popular')}</div>
    ${createHTMLFromNames(populars)}
    <div class="input-title">${localize('Regions')}</div>
    ${createHTMLFromNames(myRegions)}
    </div>
    </div>
    </div>
    </div>`;
    document.body.append(ele);

});


// Event listener for input event with debounce
delegate.on('input', '#custom-topic-input', debounce(async (event) => {
    const ele = event.target;
    const value = ele.value.trim();
    const suggestionEle = ele.closest('.input-name')?.querySelector('.custom-topic-suggestion');

    if (value === '') {
        hideEle(suggestionEle);
        return;
    }

    const suggestions = await fetchSuggestions(value);
    // Logic to display suggestions
    // console.log(suggestions);
    renderSuggestion(suggestionEle, suggestions);


}, 300)); // 300 ms debounce time


delegate.on('click', '[data-action="add-custom-interest"]', async (event) => {

    const uplimit = 5;
    let myPreference = getMyPreference();
    let myInterests = (myPreference[myCustomInterestsKey] || []).filter(x => typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x !== '');
    if (myInterests.length >= uplimit) {
        alert(localize('Reached uplimit'));
        return;
    }
    const ele = event.target;
    const container = ele.closest('.input-container');
    const input = container?.querySelector('input');
    const name = input?.value ?? '';
    if (name === '') {
        alert(localize('Input Interest'));
        input.focus();
        return;
    }
    if (myInterestsKeys.indexOf(name) >= 0) {
        alert(localize('Topic already followed'));
        return;
    }
    const customTopicType = 'CustomTopic';
    myInterests.push({key: name, type: customTopicType, display: name});
    myPreference[myCustomInterestsKey] = myInterests;
    localStorage.setItem('preference', JSON.stringify(myPreference));
    // console.log('Updated myPreference: ');
    // console.log(myPreference);
    input.value = '';
    let suggestionEle = input.closest('.input-name')?.querySelector('.custom-topic-suggestion');
    if (suggestionEle) {
        hideEle(suggestionEle);
    }
    const createNewElement = ()=>{
        var newElement = document.createElement("div");
        newElement.classList.add('input-container');
        newElement.innerHTML = `
            <div class="input-name">${name}</div>
            <button class="myft-follow tick" data-action="remove-custom-interest" data-name="${name}" data-type="${customTopicType}">${localize('Unfollow')}</button>
        `;
        return newElement;
    };
    const newElement = createNewElement();
    container.parentNode.insertBefore(newElement, container.nextSibling);
    updateAnnotationsContainer(myPreference);

});


delegate.on('click', '[data-action="remove-custom-interest"]', async (event) => {

    let myPreference = getMyPreference();
    let myInterests = myPreference[myCustomInterestsKey] || [];
    const ele = event.target;
    const name = ele.getAttribute('data-name');
    myInterests = myInterests.filter(x=>x.key !== name);
    myPreference[myCustomInterestsKey] = myInterests;
    localStorage.setItem('preference', JSON.stringify(myPreference));
    console.log('Updated myPreference: ');
    console.log(myPreference);
    const allEles = document.querySelectorAll(`.input-container [data-name="${name}"]`);
    for (const ele of allEles) {
        const container = ele.closest('.input-container');
        if (container) {
            container.remove();
        }
    }
    updateAnnotationsContainer(myPreference);

});

// MARK: - The Follow button in the overlay interface
delegate.on('click', '[data-action="add-interest"]', async (event) => {

    const ele = event.target;
    const name = ele.getAttribute('data-name');
    if (!name) {return;}
    
    let myPreference = getMyPreference();
    let myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    let myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x !== '');

    // MARK: - There might be duplicated buttons with the same names
    let allButtons = document.querySelectorAll(`[data-action="add-interest"][data-name="${name}"]`);
    for (let button of allButtons) {
        const type = button.getAttribute('data-type') || 'Topics';
        const display = button.getAttribute('data-display') ?? button.closest('.input-container')?.querySelector('.input-name')?.innerText ?? localize(name);
        if (button.classList.contains('plus')) {
            if (myInterestsKeys.indexOf(name) === -1) {
                myInterests.push({key: name, display: display, type: type});
                myInterestsKeys.push(name);
            }
            button.innerHTML = localize('Unfollow');
            button.classList.remove('plus');
            button.classList.add('tick');
        } else {
            const index = myInterestsKeys.indexOf(name);
            if (index > -1) {
                myInterests.splice(index, 1);
            }
            button.innerHTML = localize('Follow');
            button.classList.add('plus');
            button.classList.remove('tick');
        }
    }
    myPreference[myInterestsKey] = myInterests;
    localStorage.setItem('preference', JSON.stringify(myPreference));
    // console.log('Update myPreference');
    // console.log(myPreference);
    updateAnnotationsContainer(myPreference);

});

delegate.on('click', '[data-action="close-overlay"]', async (event) => {

    const overlayContainers = document.querySelectorAll('.overlay-container'); 
    for (let i = 0; i < overlayContainers.length; i++) {
      overlayContainers[i].remove();
    }

});


let draggingEle;
let lastEntered;

delegate.on('dragstart', '.input-container', async (event) => {

    const ele = event.target;
    draggingEle = ele;
    let allEles = ele.parentNode.children;
    let index = 0;
    for (let oneEle of allEles) {
        oneEle.setAttribute('data-index', index);
        index += 1;
    }

});


delegate.on('dragend', '.input-container', async (event) => {

    const ele = event.target;
    draggingEle = undefined;
    // Remove the visual effect from all elements
    const elementsWithEffect = document.querySelectorAll('.drag-over-effect');
    elementsWithEffect.forEach(ele => ele.classList.remove('drag-over-effect'));

});


function updateMyPreferenceFromDragging(ele) {

    let myPreference = getMyPreference();

    let index = 0;
    let order = {};
    for (let child of ele.children) {
        const buttonEle = child.querySelector('[data-name]');
        if (buttonEle) {
            const name = buttonEle.getAttribute('data-name') || '';
            const type = buttonEle.getAttribute('data-type') || '';
            const key = `${type}${name}`;
            order[key] = index;
        } 
        child.setAttribute('data-index', index);
        index += 1;
    }
    const keys = [myCustomInterestsKey, myInterestsKey];
    for (const key of keys) {
        for (const item of myPreference[key]) {
            const orderKey = `${item.type}${item.key}`;
            const orderIndex = order[orderKey] || 0;
            item.index = orderIndex;
        }
        myPreference[key] = myPreference[key].sort((a,b)=>a.index - b.index);
    }
    localStorage.setItem('preference', JSON.stringify(myPreference));

}

delegate.on('drop', '.annotations-container', async (event) => {

    const ele = event.target;
    let droppingEle = ele.closest('.input-container');
    if (!droppingEle) {return;}

    let droppingIndex = parseInt((droppingEle?.getAttribute('data-index') ?? 0), 10);

    let draggingIndex = parseInt((draggingEle?.getAttribute('data-index') ?? 0), 10);

    if (draggingIndex >= droppingIndex) {
        droppingEle.before(draggingEle);
    } else {
        droppingEle.after(draggingEle);
    }

    updateMyPreferenceFromDragging(draggingEle.parentNode);

});

delegate.on('dragover', '.annotations-container', async (event) => {

    event.preventDefault();

    const ele = event.target.closest('.input-container');

    // Ensure we are on a valid target
    if (!ele) return;

    // Add visual effect
    ele.classList.add('drag-over-effect');

    // Remove the effect from the last entered element if it's different
    if (lastEntered && lastEntered !== ele) {
        lastEntered.classList.remove('drag-over-effect');
    }
    lastEntered = ele; 

});


delegate.on('dragleave', '.input-container', async (event) => {

    const ele = event.target.closest('.input-container');
    if (ele) {
        ele.classList.remove('drag-over-effect');
    }

});








/* jshint ignore:end */