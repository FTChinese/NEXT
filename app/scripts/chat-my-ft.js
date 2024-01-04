/* jshint ignore:start */
const delegate = new Delegate(document.body);

const myInterestsKey = 'My Interests';
const myCustomInterestsKey = 'My Custom Interests';
const interestsInfos = [
    {id: myCustomInterestsKey, action: 'remove-custom-interest'},
    {id: myInterestsKey, action: 'add-interest'}
];
const populars = ['China', 'Companies', 'Markets', 'Opinion', 'VIDEOS', 'PODCASTS', 'Life & Arts', 'Work & Careers', 'Artificial Intelligence', 'Technology Sector'];

const regions = ['China', 'United States', 'United Kingdom', 'Europe', 'Asia', 'Americas', 'Africa', 'Middle East'];

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
    const follows = (my[myInterestsKey] || []).filter(x=>typeof x === 'object');
    const interests = follows.map(info=>{
        const key = info.key;
        const display = localize(key, info.display);
        let field = info.type || '';
        if (field === '') {
            field = checkType(key);
        }
        let content = `${field}: ${key}`;
        if (field === 'curations') {
            content = key;
        }
        console.log(content);
        return `<a data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${content}" data-reply="${localize('Finding')}">${display}</a>`;
    }).join('');
    return interests;
    
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
    return 'topics'
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

function createHTMLFromCustomTopics() {
    const myPreference = getMyPreference();
    const myInterests = myPreference[myCustomInterestsKey] || [];
    return myInterests
    .filter(x => typeof x === 'object')
    .map(x=>{
        buttonClass = 'tick';
        buttonHTML = localize('Unfollow');
        return `
        <div class="input-container">
            <div class="input-name">${x.display}</div>
            <button class="myft-follow ${buttonClass}" data-action="remove-custom-interest" data-name="${x.key}" data-type="${x.type}">${buttonHTML}</button>
        </div>`;
    })
    .join('');
}

function isItemFollowed(item, interests) {
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
    for (const interest of interests) {
        const interestUpperCase = interest.toUpperCase();
        if (upperCaseAnnotations.has(interestUpperCase)) {
            return {followed: true, annotation: interest};
        }
        // MARK: - If the FT editorial forget to add proper meta, check the title and subheading
        if (description.indexOf(interestUpperCase) >= 0) {
            return {followed: true, annotation: interest};
        }
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
        <div class="input-name"><input type="text" placeholder="${localize('Topic')}"></div>
        <button class="myft-follow plus" data-action="add-custom-interest">${localize('Follow')}</button>
    </div>
    ${createHTMLFromCustomTopics()}
    <div class="input-title">${localize('Popular')}</div>
    ${createHTMLFromNames(populars)}
    <div class="input-title">${localize('Regions')}</div>
    ${createHTMLFromNames(myRegions)}
    </div>
    </div>
    </div>
    </div>
    `;
    document.body.append(ele);

});


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
    customTopicType = 'CustomTopic';
    myInterests.push({key: name, type: customTopicType, display: name});
    myPreference[myCustomInterestsKey] = myInterests;
    localStorage.setItem('preference', JSON.stringify(myPreference));
    console.log('Updated myPreference: ');
    console.log(myPreference);
    input.value = '';
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
        const display = button.closest('.input-container')?.querySelector('.input-name')?.innerText ?? localize(name);
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
    console.log('Update myPreference');
    console.log(myPreference);
    updateAnnotationsContainer(myPreference);
});

delegate.on('click', '[data-action="close-overlay"]', async (event) => {
    const overlayContainers = document.querySelectorAll('.overlay-container'); 
    for (let i = 0; i < overlayContainers.length; i++) {
      overlayContainers[i].remove();
    }
});

/* jshint ignore:end */