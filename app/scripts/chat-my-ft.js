/* jshint ignore:start */
const delegate = new Delegate(document.body);

const myInterestsKey = 'My Interests';

const populars = ['China', 'Companies', 'Markets', 'Opinion', 'Podcasts', 'Videos', 'Life & Arts', 'Work & Careers', 'Artificial Intelligence', 'Technology Sector'];

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

function getMyFollowsHTML() {

    const regions = new Set(Object.keys(countryMapping).map(key => countryMapping[key]));
    console.log(regions);
    const my = getMyPreference();
    const follows = my[myInterestsKey] || [];
    const interests = follows.map(key=>{
        const field = (regions.has(key)) ? 'regions' : 'topics';
        return `<a data-purpose="search-ft-api" data-lang="${preferredLanguage}" data-content="${field}: ${key}" data-reply="${localize('Finding')}">${localize(key)}</a>`;
    }).join('');
    return interests;
    
}




function createHTMLFromNames(names) {
    const myPreference = getMyPreference();
    const myInterests = myPreference[myInterestsKey] || [];
    return names
    .map(name=>{
        let buttonClass = 'plus';
        let buttonHTML = localize('Follow');
        if (myInterests.indexOf(name)>=0) {
            buttonClass = 'tick';
            buttonHTML = localize('Unfollow');
        }
        return `
        <div class="input-container">
            <div class="input-name">${localize(name)}</div>
            <button class="myft-follow ${buttonClass}" data-action="add-interest" data-name="${name}">${buttonHTML}</button>
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

// MARK: - The Follow button in the overlay interface
delegate.on('click', '[data-action="add-interest"]', async (event) => {
    const ele = event.target;
    const name = ele.getAttribute('data-name');
    if (!name) {return;}
    
    let myPreference = getMyPreference();
    let myInterests = myPreference[myInterestsKey] || [];
    // MARK: - There might be duplicated buttons with the same names
    let allButtons = document.querySelectorAll(`[data-action="add-interest"][data-name="${name}"]`);
    for (let button of allButtons) {
        if (button.classList.contains('plus')) {
            if (myInterests.indexOf(name) === -1) {
                myInterests.push(name);
            }
            button.innerHTML = localize('Followed');
            button.classList.remove('plus');
            button.classList.add('tick');
        } else {
            const index = myInterests.indexOf(name);
            if (index > -1) {
                myInterests.splice(index, 1);
            }
            button.innerHTML = localize('Follow');
            button.classList.add('plus');
            button.classList.remove('tick');
        }
    }
    myPreference[myInterestsKey] = myInterests;
    console.log('Update myPreference');
    console.log(myPreference);
    localStorage.setItem('preference', JSON.stringify(myPreference));
    const followedAnnotations = getFollowedAnnotations(myPreference, myInterestsKey);
    let eles = document.querySelectorAll(`.annotations-container[data-id="${myInterestsKey}"]`);
    console.log(eles);
    for (let ele of eles) {
        ele.innerHTML = followedAnnotations;
    }
});

delegate.on('click', '[data-action="close-overlay"]', async (event) => {
    const overlayContainers = document.querySelectorAll('.overlay-container'); 
    for (let i = 0; i < overlayContainers.length; i++) {
      overlayContainers[i].remove();
    }
});

/* jshint ignore:end */