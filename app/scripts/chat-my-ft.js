/* jshint ignore:start */
const delegate = new Delegate(document.body);

const myInterestsKey = 'My Interests';
const myCustomInterestsKey = 'My Custom Interests';
const interestsInfos = [
    {id: myCustomInterestsKey, action: 'remove-custom-interest'},
    {id: myInterestsKey, action: 'add-interest'}
];
const populars = ['China', 'Companies', 'Markets', 'Opinion', 'VIDEOS', 'PODCASTS', 'Life & Arts', 'Work & Careers', 'Artificial intelligence', 'Electric vehicles', 'Technology Sector'];

const regions = ['China', 'Hong Kong', 'Taiwan', 'Singapore', 'Malaysia', 'Japan', 'United States', 'United Kingdom', 'India', 'Russia', 'Europe', 'Asia', 'Americas', 'Africa', 'Middle East'];

const sectors = ['Companies', 'Markets', 'Economy', 'Technology Sector', 'Politics', 'Investments', 'Management', 'Personal Finance', 'Education', 'Life & Arts', 'Work & Careers', 'Property', 'Science', 'Books', 'Sport'];

const genres = ['News', 'Feature', 'Opinion', 'Explainer', 'Obituary', 'VIDEOS', 'PODCASTS'];

const topics = ['Artificial intelligence', 'Electric vehicles', 'US presidential election', 'Israel-Hamas war', 'Climate change', 'Federal Reserve', 'Chinese economy', 'Semiconductors', 'Cryptocurrencies'];

const brands = ['The Big Read', 'FT Magazine', 'Unhedged', 'Undercover Economist', 'Lunch with the FT', 'The Weekend Essay', 'techAsia'];

const authors = ['Martin Wolf', 'Robert Armstrong', 'Madhumita Murgia', 'Richard Waters', 'Gillian Tett', 'Mohamed El-Erian', 'Stephen Roach', 'Lawrence Summers', 'George Soros'];

const customTopicType = 'CustomTopic';

const recommendedAnnotations = [
    {title: 'Regions', data: regions},
    {title: 'Sectors', data: sectors},
    {title: 'Genres', data: genres},
    {title: 'Columns', data: brands},
    {title: 'Popular', data: topics},
    {title: 'Authors', data: authors},
];

const recommendedAnnotationsByIndustry = [{"title":"Accountancy & tax advisory","data":["Accountancy","International tax","Tax evasion and avoidance","Financial & markets regulation","Mergers & Acquisitions"]},{"title":"Aerospace & defence","data":["Aircraft manufacturing","Drones","Terrorism","Virtual and Augmented Reality","Space industry"]},{"title":"Automobiles","data":["Electric vehicles","Hydrogen vehicles","Driverless vehicles","Batteries","Artificial intelligence"]},{"title":"Banking","data":["Investment Banking","Fintech","Central banks","Financial & markets regulation","Mergers & Acquisitions"]},{"title":"Basic resources/Mining","data":["Industrial metals","Renewable energy","Oil","Shale Oil & Gas","Coal"]},{"title":"Chemicals","data":["Chemicals","Renewable energy","Dow Chemical Co","Batteries","Shale Oil & Gas"]},{"title":"Comms/Publishing/Media","data":["Digital Media","Social Media","Advertising","Lunch with the FT","Luxury goods"]},{"title":"Consulting/Business services","data":["Management consulting","Innovation","Corporate culture","Managing yourself","Women in business"]},{"title":"Education/Academia","data":["Work & Careers","Education","Business education","Online learning","Economics books"]},{"title":"Energy/Utilities","data":["Batteries","Renewable energy","Shale Oil & Gas","Nuclear energy","Climate change"]},{"title":"Engineering/Construction","data":["Infrastructure investment","Urban planning","Renewable energy","Architecture","UK housebuilding"]},{"title":"Financial services","data":["Fintech","Hedge funds","Private equity","Investment Banking"]},{"title":"Food & beverages","data":["Food Prices","Food diet","Beer and spirits","Agricultural production","Ecommerce"]},{"title":"Fund/Asset management","data":["Hedge funds","Private equity","Investment Banking","Emerging market investing"]},{"title":"Govt/Public service/NGOs","data":["Geopolitics","Populism","Globalisation","United Nations","Political books"]},{"title":"Health & pharmaceuticals","data":["Digital health","Drugs research","Drug prices","Medical science","Disease control and prevention"]},{"title":"Industrial goods & services","data":["Industrials","Industrial goods","Global economic growth","US economy","Eurozone economy"]},{"title":"Insurance","data":["Cyber Security","Fintech","Pensions crisis","Personal Insurance"]},{"title":"IT/Computing","data":["Artificial intelligence","Virtual and Augmented Reality","Science","Blockchain","Fintech"]},{"title":"IT/Tech/Telecoms","data":["Cyber Security","Internet of things","Artificial intelligence","Social Media","Fintech"]},{"title":"Legal services","data":["Law","Innovation","Financial & markets regulation","Corporate governance","Data protection"]},{"title":"Oil/Gas/Mining","data":["Oil","Natural gas","Mining","Renewable energy","Batteries"]},{"title":"Personal & household goods","data":["Consumer trends","Digital Media","Ecommerce","Luxury goods","UK retail sales"]},{"title":"Property","data":["Commercial property","Residential property","Global property","Property funds","Property"]},{"title":"Retail","data":["Consumer trends","Ecommerce","Digital Media","Wearable technology","Luxury goods"]},{"title":"Telecommunications","data":["Internet of things","Virtual and Augmented Reality","Mobile devices","Ecommerce","Cyber Security"]},{"title":"Trade/Import/Export","data":["Global trade","FT Commodities Global Summit","Artificial intelligence","Climate change"]},{"title":"Transport/Logistics","data":["Global trade","Globalisation","Electric vehicles","Container shipping"]},{"title":"Travel & Leisure","data":["Travel & leisure industry","Work-life balance","Lunch with the FT","Luxury goods"]}];


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
const genresSet = new Set(['Opinion', 'Explainer', 'News', 'Explainer', 'Obituary', 'Feature']);

const curationsSet = new Set(['VIDEOS', 'PODCASTS']);

const brandsSet = new Set(window.brands);

const organisationsSet = new Set(['Federal Reserve']);

const authorsSet = new Set(window.authors);

async function savePreference(myPreference) {
    let p = JSON.parse(JSON.stringify(myPreference));
    p.time = new Date();
    localStorage.setItem('preference', JSON.stringify(p));
    updateNavigation().catch(error => {
        console.error('Failed to updateNavigation: ', error);
    });
    debouncedSyncPreferences(p);
}


async function syncPreferencesWithServer(preference) {
    console.log(`syncPreferencesWithServer running...`);
    const token = GetCookie('accessToken');
    if (!token) {return;}
    try {
        const response = await fetch('/save_preference', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming the JWT is stored in a secure cookie
            },
            body: JSON.stringify(preference)
        });
    } catch (error) {
        console.error('Failed to sync preferences with the server: ', error);
    }
}

// MARK: - debounce the syncPreferencesWithServer to avoid firing large amount of network requests in a short time
const debouncedSyncPreferences = debounce(syncPreferencesWithServer, 5000);

async function clearAllPreferences() {

    try {
        localStorage.removeItem('preference');
        const token = GetCookie('accessToken');
        if (!token) {return;}
        await fetch('/delete_preference', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming the JWT is stored in a secure cookie
            }
        });
    } catch(err) {
        console.error('clearAllPreferences error: ');
        console.log(err);
    }

}


//TODO: - This should be very robust because it starts at the very beginning of the web page/app life cycle. 
async function checkPreferencesFromServer() {

    try {
        const token = GetCookie('accessToken');
        // MARK: - If there's no access token, no need to check further return now. 
        if (!token) {return;}
        const response = await fetch('/check_preference', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Assuming the JWT is stored in a secure cookie
            }
        });
        if (!response.ok) {return;}
        const results = await response.json();
        if (results?.status !== 'OK' || !results?.preference) {return;}
        const serverPreference = results?.preference;
        const localPreference = getMyPreference();
        const defaultTime = '2000-01-01 00:00:00';
        const serverTime = new Date(serverPreference?.time ?? defaultTime).getTime();
        const localTime = new Date(localPreference?.time ?? defaultTime).getTime();
        if (serverTime > localTime) {
            localStorage.setItem('preference', JSON.stringify(serverPreference));
            // MARK: - This is a good time to update the left-side navigation
            await updateNavigation();
        } else if (serverTime < localTime) {
            await syncPreferencesWithServer(localPreference);
        }
    } catch(err) {
        console.error('checkPreferencesFromServer error: ');
        console.log(err);
    }

}

async function updateNavigation() {

    const myFollowsHTML = await convertChinese(getMyFollowsHTML(), preferredLanguage);
    let myfollowsEle = document.querySelector('#current-chat-roles .drag-drop-container');
    if (myfollowsEle) {
        myfollowsEle.innerHTML = myFollowsHTML;
    }

}

function getMyFollowsHTML() {

    const my = getMyPreference();
    preferredLanguage = my['Language'];
    const follows = (my[myInterestsKey] || []).filter(x => typeof x === 'object');

    let allIndex = 0;
    const reorderButton = `<button class="reorder-button"></button>`;
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
        return {index: index, html: `<a class="for-long-press has-reorder-button" data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${content}" data-reply="${localize('Finding')}" data-name="${key}" data-type="${field}" draggable="true">${display}${reorderButton}</a>`};
    });
    const customTopics = (my[myCustomInterestsKey] || []).filter(x=>typeof x === 'object');
    const topics = customTopics.map(info=>{
        const index = info.index || 0;
        allIndex += index;
        const key = info.key;
        const display = localize(key, info.display);
        return {index: index, html: `<a class="for-long-press has-reorder-button" data-purpose="search-topic" data-lang="${preferredLanguage}" data-content="${key}" data-reply="${localize('Finding')}" draggable="true" data-name="${key}" data-type="${customTopicType}">${display}${reorderButton}</a>`};
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
    if (brandsSet.has(key)) {
        return 'brand';
    }
    if (organisationsSet.has(key)) {
        return 'organisations';
    }
    if (authorsSet.has(key)) {
        return 'byline';
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
            </div>`.replace(/[\n\r]/g, '');
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
    // console.log(suggestions);
    if (!suggestions || suggestions.length === 0) {
        console.log('No Suggestion!');
        hideEle(ele);
        return;
    }
    showEle(ele);
    const myPreference = getMyPreference();
    const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    const suggestionsHTML = suggestions
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
    ele.innerHTML = `<div class="hide-suggestions">X</div>${suggestionsHTML}`;
}



function followAnnotation(name, instruction = 'toggle') {

    if (!name) {return;}
    let myPreference = getMyPreference();
    let myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    let myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x !== '');

    // MARK: - There might be duplicated buttons with the same names
    let allButtons = document.querySelectorAll(`[data-action="add-interest"][data-name="${name}"]`);
    for (let button of allButtons) {
        const type = button.getAttribute('data-type') || 'Topics';
        const display = button.getAttribute('data-display') ?? button.closest('.input-container')?.querySelector('.input-name')?.innerText ?? localize(name);
        let action = instruction;
        if (instruction === 'toggle' || ['follow', 'unfollow'].indexOf(instruction) === -1) {
            action = button.classList.contains('plus') ? 'follow' : 'unfollow';
        }
        if (action === 'follow') {
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
    savePreference(myPreference);
    updateAnnotationsContainer(myPreference);

}


delegate.on('click', '.hide-suggestions', async (event) => {
    let ele = event.target.closest('.custom-topic-suggestion');
    hideEle(ele);
});

delegate.on('click', '.hide-intention', async (event) => {
    let ele = event.target.closest('.chat-topic-intention');
    hideEle(ele);
});

delegate.on('click', '[data-action="add-interests"]', async (event) => {
    //点击添加按钮触发
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
    const recommenedAnnotationsHTML = recommendedAnnotations.concat(recommendedAnnotationsByIndustry)
        .map(x => `<div class="input-title">${localize(x.title)}</div>${createHTMLFromNames(x.data)}`)
        .join('');
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
        ${recommenedAnnotationsHTML}
        </div>
        </div>
        </div>
        </div>`;
    document.body.append(ele);

});


// Event listener for input event with debounce
delegate.on('input', '#custom-topic-input', debounce(async (event) => {
    // 点击后触发
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


delegate.on('input', '#user-input', debounce(async (event) => {
    // 点击后触发
    if(window.intention){
        return ;
    }
    const ele = event.target;
    const value = ele.value.trim();
    const suggestionEle = ele.closest('.chat-input')?.querySelector('.chat-topic-intention');
    if (value === '') {
        hideEle(suggestionEle);
        return;
    }
    const intentions = await fetchSuggestions(value);
    // Logic to display suggestions
    console.log(intentions);
    console.log(suggestionEle);
    renderShowIntention(suggestionEle, intentions);

}, 300)); // 300 ms debounce time


function renderShowIntention(ele, intentions) {
    if (!ele) {return;}
    // console.log(suggestions);
    if (!intentions || intentions.length === 0) {
        console.log('No Suggestion!');
        hideEle(ele);
        return;
    }
    showEle(ele);
    const myPreference = getMyPreference();
    const myInterests = (myPreference[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const myInterestsKeys = myInterests.map(x=>x.key || '').filter(x=>x!=='');
    intentions = intentions.slice(0, 1);
    const intentionsHTML = intentions
        .map(intention=>{
            const key = intention.name;
            const field = intention.field;
            let buttonClass = 'plus';
            let buttonHTML = `${localize('Follow')}${localize('<!--space-->', ' ')}${capitalize(localize(field))}`;
            const name = intention.translations?.[preferredLanguage] ?? key;
            if (myInterestsKeys.indexOf(key)>=0) {
                buttonClass = 'tick';
                buttonHTML = localize('Unfollow');
            }
            const type = intention.field ?? checkType(key);
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
    ele.innerHTML = `<div class="hide-intention">X</div>${intentionsHTML}`;
}




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
    myInterests.push({key: name, type: customTopicType, display: name});
    myPreference[myCustomInterestsKey] = myInterests;
    savePreference(myPreference);
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
    savePreference(myPreference);
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
    followAnnotation(name);

});

delegate.on('click', '[data-action="add-interests-for-all"]', async (event) => {

    const ele = event.target;
    const buttons = ele.closest('.input-group')?.querySelectorAll('[data-action="add-interest"][data-name]') ?? [];
    const action = ele.classList.contains('plus') ? 'follow': 'unfollow';
    if (action === 'follow') {
        ele.classList.add('tick');
        ele.classList.remove('plus');
        ele.innerHTML = localize('Unfollow All');
    } else {
        ele.classList.remove('tick');
        ele.classList.add('plus');
        ele.innerHTML = localize('Follow All');
    }
    for (let button of buttons) {
        const name = button.getAttribute('data-name');
        if (!name) {continue;}
        followAnnotation(name, action);
    }
    
});

delegate.on('click', '[data-action="close-overlay"]', async (event) => {

    const overlayContainers = document.querySelectorAll('.overlay-container'); 
    for (let i = 0; i < overlayContainers.length; i++) {
      overlayContainers[i].remove();
    }

});




// MARK: - Drag and Drop to adjust sequence of follows

let draggingEle;
let lastEntered;

function updateMyPreferenceFromDragging(ele) {

    let myPreference = getMyPreference();

    let index = 0;
    let order = {};
    for (let child of ele.children) {
        const buttonEle = child.getAttribute('data-content') ? child : child.querySelector('[data-name]');
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
        if (myPreference[key] && typeof myPreference[key] === 'object' && myPreference[key].length > 0) {  // Check if the key exists in the myPreference object
            for (const item of myPreference[key]) {
                const orderKey = `${item.type}${item.key}`;
                const orderIndex = order[orderKey] || 0;
                item.index = orderIndex;
            }
            myPreference[key] = myPreference[key].sort((a, b) => a.index - b.index);
        }
    }

    savePreference(myPreference);

}

function handleDraggableClickOrPress(ele) {
    if (ele.classList.contains('myft-follow')) {
        cancelMoving();
        return;
    }
    let currentEle = ele.closest('[draggable]');
    if (!currentEle) {return;}
    if (!draggingEle) {
        draggingEle = currentEle;
        draggingEle.classList.add('moving');
        let allEles = currentEle.parentNode.children;
        let index = 0;
        for (let oneEle of allEles) {
            oneEle.setAttribute('data-index', index);
            index += 1;
        }
    } else {
        let droppingIndex = parseInt((currentEle?.getAttribute('data-index') ?? 0), 10);
        let draggingIndex = parseInt((draggingEle?.getAttribute('data-index') ?? 0), 10);
        if (draggingIndex >= droppingIndex) {
            currentEle.before(draggingEle);
        } else {
            currentEle.after(draggingEle);
        }
        updateMyPreferenceFromDragging(draggingEle.parentNode);
        setTimeout(()=>{
            cancelMoving();
        }, 500);
    }
}

function cancelMoving() {
    if (!draggingEle) {return;}
    draggingEle.classList.remove('moving');
    draggingEle = undefined;
}


if (isTouchDevice()) {

    // MARK: - It's too much trouble to support drag and drop on touch devices, just use click to make it easy for user to change the order of follows

    delegate.on('click', 'body', (event) => {
        if (event.target.closest('[draggable]')) {return;}
        cancelMoving();
    });


    delegate.on('click', '[draggable].for-click, [draggable].for-long-press.has-reorder-button button', (event) => {
        let ele = event.target.closest('[draggable');
        event.stopImmediatePropagation();
        // console.log('handleDraggableClickOrPress: ');
        // console.log(ele);
        handleDraggableClickOrPress(ele);
    });


    // MARK: - Handling Long Presses, now for the side bar items
    // Define the long press duration in milliseconds
    const longPressDuration = 500;
    let longPressTimer = null;
    let movedDuringPress = false;
    let isLongPressing = false;

    delegate.on('touchstart', '[draggable].for-long-press', (event) => {
        let ele = event.target;
        isLongPressing = false;
        movedDuringPress = false; // reset the flag for movement

        // Set a timeout to handle long press
        longPressTimer = setTimeout(() => {
            if (!movedDuringPress) {
                isLongPressing = true;
                handleDraggableClickOrPress(ele);
            }
        }, longPressDuration);
    });

    delegate.on('touchmove', '[draggable].for-long-press', (event) => {
        movedDuringPress = true;
    });

    delegate.on('touchend', '[draggable].for-long-press', (event) => {
        clearTimeout(longPressTimer);
        if (isLongPressing) {
            isLongPressing = false;
            console.log('Click [draggable].for-long-press fired! ');
            return;
        }
        if (draggingEle) {
            console.log('Click [draggable].for-long-press fired! ');
            event.stopImmediatePropagation();
            let ele = event.target;
            handleDraggableClickOrPress(ele);
        }
    });

    delegate.on('contextmenu', '[draggable].for-long-press', (event) => {
        event.preventDefault();
    });


} else {

    delegate.on('dragstart', '[draggable]', async (event) => {

        const ele = event.target;
        draggingEle = ele;
        let allEles = ele.parentNode.children;
        let index = 0;
        for (let oneEle of allEles) {
            oneEle.setAttribute('data-index', index);
            index += 1;
        }

    });

    delegate.on('dragend', '[draggable]', async (event) => {

        const ele = event.target;
        draggingEle = undefined;
        // Remove the visual effect from all elements
        const elementsWithEffect = document.querySelectorAll('.drag-over-effect');
        elementsWithEffect.forEach(ele => ele.classList.remove('drag-over-effect'));

    });

    delegate.on('drop', '.drag-drop-container', async (event) => {

        const ele = event.target;
        let droppingEle = ele.closest('[draggable]');
        if (!droppingEle) {return;}

        let droppingIndex = parseInt((droppingEle?.getAttribute('data-index') ?? 0), 10);

        let draggingIndex = parseInt((draggingEle?.getAttribute('data-index') ?? 0), 10);

        if (draggingIndex >= droppingIndex) {
            droppingEle.before(draggingEle);
        } else {
            droppingEle.after(draggingEle);
        }

        updateMyPreferenceFromDragging(draggingEle.parentNode);
        draggingEle = undefined;
        console.log(`set draggingEle as undefined! `);

    });

    delegate.on('dragover', '.drag-drop-container', async (event) => {

        event.preventDefault();

        const ele = event.target.closest('[draggable]');

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


    delegate.on('dragleave', '[draggable]', async (event) => {

        const ele = event.target.closest('[draggable]');
        if (ele) {
            ele.classList.remove('drag-over-effect');
        }

    });

}







// MARK - Induction
  
async function shouldShowInduction() {

    // MARK: - First quickly check local storage
    let myPreference = getMyPreference();

    // MARK: - If you already have a local storage of preference, you immediately know that you shouldn't show induction
    const accessToken = GetCookie('accessToken');

    // MARK: - If you haven't logged in, no need to do induction
    if (!accessToken) {
      return false;
    }

    if (myPreference['Language'] && accessToken) {
      return false;
    }

    // MARK: Only If there's no local storage, you should now try sync from the server
    await checkPreferencesFromServer();

    // MARK: - Now you check local storage again
    myPreference = getMyPreference();
    if (myPreference['Language'] && GetCookie('accessToken')) {
      return false;
    }

    // MARK: - If there's still no local storage of preference, you should now show induction
    return true;

}

async function showInduction() {
    const name = inductionData?.name;
    window[name] = inductionData;
    window[name].index = 0;
    const info = inductionData?.questions?.[0];
    if (info) {
        await renderSettingInfo(info, name);
    }
}

async function renderSettingInfo(info, name) {

    const index = window[name].index;    
    // let html = intro !== '' ? `<p>${intro}</p>` : '';
    let html = index === 0 && window[name].intro ? `<p>${localize(window[name]?.intro ?? '')}</p>` : '';
    const type = info.type;
    if (type === 'single_choice') {
        html += renderSingleChoice(info, name);
    } else if (type === 'multiple_choices') {
        html += renderMultipleChoices(info, name);
    } else if (type === 'custom_input') {
        html += renderCustomInput(info, name);
    }
    showResultInChat({text: html});
    if (info.disable_input) {
        window.userInput.disabled = true; 
    } else {
        window.userInput.disabled = false; 
    }

}

function renderSingleChoice(info, name) {

    let html = info.text ? `<div class="preference-question">${localize(info?.text ?? '')}</div>` : '';
    const key = info.key;
    const variable = info.variable;
    const type = info.type;
    let optionsHTML = '';
    // console.log(info.options);
    for (const option of info.options) {
        optionsHTML += `<div data-value="${option.value}">${option.name}</div>`;
    }
    optionsHTML = `<div class="preference-options" data-type="${type}" data-name="${name}" data-key="${key}" data-variable="${variable}">${optionsHTML}</div>`;
    html += optionsHTML;
    return html;

}


function renderMultipleChoices(info, name) {

    let html = info.text ? `<div class="preference-question">${localize(info?.text ?? '')}</div>` : '';
    const options = info.options;
    let optionsHTML = '';
    for (const option of options) {
        const followAllButton = info.follow_all ? `<button class="myft-follow plus" data-action="add-interests-for-all">${localize('Follow All')}</button>` : '';
        optionsHTML += `<div class="input-group"><div class="input-container"><div class="input-title">${localize(option.title)}</div>${followAllButton}</div>${createHTMLFromNames(option.data)}</div>`;
    }
    const l = window[name].questions.length;
    const index = window[name].index;
    const buttonHTML = index < l - 1 ? `<button class="setting-next" data-name="${name}">${localize('NEXT')}</button>` : '';
    const layoutStyle = info.isLayoutGrid ? ' multiple-setting-container-grid' : '';
    html += `<div class="multiple-setting-container${layoutStyle}">${optionsHTML}</div>${buttonHTML}`;
    return html;

}

function renderCustomInput(info, name) {

    let html = info.text ? `<div class="preference-question">${localize(info.text ?? '')}</div>` : '';
    html += `
        <div class="custom-setting-container">
            <div class="input-container">
                <div class="input-name">
                    <input id="custom-topic-input" type="text" placeholder="${localize('Topic')}">
                    <div class="custom-topic-suggestion"></div>
                </div>
                <button class="myft-follow plus" data-action="add-custom-interest">${localize('Follow')}</button>
            </div>
            <div class="custom-setting-detail">${localize(info.detail || '')}</div>
        </div>`.replace(/[\r\n]/g, '');
    const l = window[name].questions.length;
    const index = window[name].index;
    const buttonHTML = index < l - 1 ? `<button class="setting-next" data-name="${name}">${localize('NEXT')}</button>` : `<div class="chat-item-actions"><a data-purpose="start-over" data-content="start-over">${localize('ApplyAndStartOver')}</a></div>`;
    html += buttonHTML;
    return html;

}


async function renderNextSettingInfo(name) {

    if (!name) {return;}
    const nextIndex = window[name].index + 1;
    window[name].index = nextIndex;
    const l = window[name].questions.length;
    if (nextIndex < l) {
        const info = window[name].questions[nextIndex];
        await renderSettingInfo(info, name);
    } else {
        window.intention = undefined;
        const html = `<p>${localize(window[name].ending)}</p>${getActionOptions()}`;
        showResultInChat({text: html});
        userInput.disabled = false;
    }

}


delegate.on('click', '.preference-options [data-value]', async (event) => {

    const containerEle = event.target.closest('.preference-options');
    if (!containerEle) {return; }
    const targetEle = event.target;
    const value = targetEle.getAttribute('data-value');
    if (!value) {return;}
    for (let target of containerEle.querySelectorAll('[data-value]')) {
        target.classList.remove('selected');
    }
    targetEle.classList.add('selected');
    let myPreference = {};
    const myPreferenceString = localStorage.getItem('preference');
    if (myPreferenceString && myPreferenceString !== '') {
      try {
        myPreference = JSON.parse(myPreferenceString);
      } catch(ignore) {}
    }
    const key = containerEle.getAttribute('data-key');
    if (!key) {return;}
    myPreference[key] = value;
    savePreference(myPreference);
    const variable = containerEle.getAttribute('data-variable');
    if (variable) {
        window[variable] = value;    
    }
    const name = containerEle.getAttribute('data-name');
    if (containerEle.getAttribute('data-next-triggered')) {
        return;
    }
    await renderNextSettingInfo(name);
    containerEle.setAttribute('data-next-triggered', true);

});



delegate.on('click', '.setting-next', async (event) => {
    let ele = event.target;
    ele.classList.add('hide');
    const name = ele.getAttribute('data-name');
    if (!name) {return;}
    await renderNextSettingInfo(name);
});

/* jshint ignore:end */