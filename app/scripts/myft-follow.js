// Global Constants
const key = 'my-ft-follow';
const keyForLocal = 'my-ft-follow-ftc';
const keyForMyInterests = 'My Interests';
const keyForpreference = 'preference';
const last_sync_time_key = 'last_sync_time';
const webPushPromptCooldownKey = 'ftc:webpushPromptNextAt';
const webPushPromptAcceptedKey = 'ftc:webpushPromptAccepted';
const webPushPromptCooldownMs = 30 * 24 * 60 * 60 * 1000;
const ftAnnotationsMap = {
    genre: {
        'News': 'news',
        'Feature': 'feature',
        'Brief': 'brief',
        'Analysis': 'analysis',
        'Opinion': 'comment',
        'Letter': 'letter',
        'Lex': 'lex',
        'Review': 'comment'
    },
    area: {
        'China': 'china',
        'US': 'usa',
        'UK': 'uk',
        'Asia': 'asiapacific',
        'Asia Pacific': 'asiapacific',
        'Asia-Pacific': 'asiapacific',
        'Europe': 'europe',
        'European Union': 'europe',
        'Americas': 'americas',
        'Africa': 'africa',
        'Middle East': 'middleeast',
        'Middle East & North Africa': 'middleeast',
        'Latin America': 'americas',
        'South America': 'americas',
        'Nepal': 'Nepal',
        'World': '',
        'Hong Kong': 'Hong Kong',
        'Taiwan': 'Taiwan',
        'Xinjiang': 'Xinjiang',
        'Beijing': 'Beijing',
        'Shanghai': 'Shanghai',
        'Shenzhen': 'Shenzhen',
        'Guangzhou': 'Guangzhou',
        'Chongqing': 'Chongqing',
        'Chengdu': 'Chengdu',
        'Tianjin': 'Tianjin',
        'Wuhan': 'Wuhan',
        'Japan': 'Japan',
        'South Korea': 'South Korea',
        'North Korea': 'North Korea',
        'Germany': 'Germany',
        'Vietnam': 'Vietnam',
        'France': 'France',
        'India': 'India',
        'Russia': 'Russia',
        'Brazil': 'Brazil',
        'Canada': 'Canada',
        'Singapore': 'Singapore',
        'Australia': 'Australia',
        'Ukraine': 'Ukraine',
        'Israel': 'Israel',
        'Argentina': 'Argentina'
    },
    topic: {
        'Politics': 'politics',
        'Books': 'book',
        'Companies': 'business',
        'Culture': 'culture',
        'Economy': 'economy',
        'Environment': 'environment',
        'EU trade': 'trade',
        'US-China trade dispute': 'trade',
        'Global trade': 'trade',
        'Trade disputes': 'trade',
        'Chinese trade': 'trade',
        'US trade': 'trade',
        'US society': 'society',
        'Chinese society': 'society',
        'Social affairs': 'society',
        'Markets': 'markets',
        'Management': 'management',
        'Work & Careers': 'career',
        'Lifestyle': 'lifestyle',
        'Life & Arts': 'lifestyle',
        'Arts': 'artstory',
        'Travel': 'travel',
        'How To Spend It': 'spend',
        'Education': 'education',
        'Business Education': 'businessedu',
        'Equities': 'stock',
        'Foreign exchange': 'forex',
        'Currencies': 'forex',
        'Commodities': 'commodity',
        'Sovereign bonds': 'bond',
        'Capital markets': 'bond',
        'US Treasury bonds': 'bond',
        'Leadership': 'leadership',
        'Interview': 'people',
        'Global Economy': 'economy'
    },
    industry: {
        'Banks': 'finance',
        'Financials': 'finance',
        'Technology': 'technology',
        'Technology sector': 'technology',
        'Automobiles': 'auto',
        'Property sector': 'property',
        'Property': 'property',
        'Energy sector': 'energy',
        'Energy': 'energy',
        'Industrials': 'industrials',
        'Mining': 'industrials',
        'Basic resources': 'industrials',
        'Airlines': 'airline',
        'Transport': 'airline',
        'Pharmaceuticals sector': 'pharma',
        'Agriculture': 'agriculture',
        'Agricultural trade': 'agriculture',
        'Agricultural commodities': 'agriculture',
        'Agricultural production': 'agriculture',
        'Forest Service': 'agriculture',
        'Retail & Consumer industry': 'consumer',
        'Media': 'media',
        'Health sector': 'pharma',
        'Aerospace & Defence': 'airline',
        'Financial services': 'finance',
        'Retail sector': 'consumer',
        'Telecoms': 'technology',
        'Industrial goods': 'industrials',
        'Travel & leisure industry': 'consumer'
    }
};
// follow and unfollow topic

// click events
try {
    if (typeof delegate === 'undefined') { 
        window.delegate = new Delegate(document.body);
    }

    delegate.on('click', '.myft-follow', async function () {
        const isFollowed = !this.classList.contains('plus');

        const dataTag = this.getAttribute('data-tag') || '';
        const dataType = this.getAttribute('data-type') || 'tag';
        if (!dataTag) {
            alert('亲爱的读者，我们无法识别您关注的标签，请您刷新页面重新试试。');
            return;
        }

        // Update local storage immediately
        const savedFollowList = localStorage.getItem(key);
        let savedFollowListJSON = JSON.parse(savedFollowList) || {};

        if (!Array.isArray(savedFollowListJSON[dataType])) {
            savedFollowListJSON[dataType] = [];
        }

        const savedTagsSet = new Set(savedFollowListJSON[dataType]);

        if (isFollowed) {
            savedTagsSet.delete(dataTag);
        } else {
            savedTagsSet.add(dataTag);
        }

        savedFollowListJSON[dataType] = [...savedTagsSet];
        localStorage.setItem(key, JSON.stringify(savedFollowListJSON));

        // Keep preference-based follows in sync when canonical annotation data is available
        const prefKey = this.getAttribute('data-key');
        const prefField = this.getAttribute('data-field');
        const prefDisplay = this.getAttribute('data-display');
        if (prefKey && prefField && prefDisplay) {
            try {
                const preferenceJSONString = localStorage.getItem('preference') || '{}';
                const preferenceJSON = JSON.parse(preferenceJSONString) || {};
                let myInterests = Array.isArray(preferenceJSON[keyForMyInterests]) ? preferenceJSON[keyForMyInterests] : [];
                myInterests = myInterests.filter(x => x && typeof x === 'object');
                const index = myInterests.findIndex(x => x.key === prefKey);

                if (isFollowed) {
                    if (index > -1) {
                        myInterests.splice(index, 1);
                    }
                } else if (index === -1) {
                    myInterests.push({ key: prefKey, display: prefDisplay, type: prefField });
                }

                preferenceJSON[keyForMyInterests] = myInterests;
                updatePreference(preferenceJSON);
            } catch (err) {
                console.error('MyFT preference update error: ', err);
            }
        }

        // Optimistically update UI immediately
        if (isFollowed) {
            this.classList.add('plus');
            this.classList.remove('tick');
            this.innerHTML = '关注';
        } else {
            this.classList.remove('plus');
            this.classList.add('tick');
            this.innerHTML = '已关注';
            maybePromptWebPush();
        }

        // Send follow/unfollow request to the server in the background
        if (hasLoggedIn()) {
            try {
                const action = isFollowed ? 'unfollow' : 'follow';
                const url = `/myft_follow`;
                const payload = { type: dataType, name: dataTag, action };
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    console.warn('Server failed to process follow/unfollow action:', await response.text());
                }
            } catch (err) {
                console.error(`MyFT follow error: `, err);
            }
        }

        // Sync follows after the update
        await checkFollow();
    });

} catch (ignore) {}

function shouldPromptWebPush() {
    try {
        const standalone = (typeof isStandalone === 'function') ? isStandalone() : false;
        const appShell = isAppShellContext();
        if (!standalone && !appShell) {
            return false;
        }
        if (!('PushManager' in window)) {
            return false;
        }
        if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
            return false;
        }
        if (localStorage.getItem(webPushPromptAcceptedKey) === '1') {
            return false;
        }
        const nextAt = parseInt(localStorage.getItem(webPushPromptCooldownKey) || '0', 10);
        if (nextAt && Date.now() < nextAt) {
            return false;
        }
        if (typeof toggleWebPush !== 'function') {
            return false;
        }
        return true;
    } catch (err) {
        return false;
    }
}

function isAppShellContext() {
    try {
        const path = window?.location?.pathname || '';
        if (/\/app\.html$/i.test(path) || /\/app\//i.test(path)) {
            return true;
        }
        const href = window?.location?.href || '';
        if (/webview=ftcapp/i.test(href)) {
            return true;
        }
        if (typeof document !== 'undefined') {
            if (document.querySelector('.app-root-view') ||
                document.getElementById('app-main-content') ||
                document.getElementById('app-nav')) {
                return true;
            }
        }
        return false;
    } catch (ignore) {
        return false;
    }
}

function deferWebPushPrompt() {
    try {
        localStorage.setItem(webPushPromptCooldownKey, String(Date.now() + webPushPromptCooldownMs));
    } catch (ignore) {}
}

function markWebPushPromptAccepted() {
    try {
        localStorage.setItem(webPushPromptAcceptedKey, '1');
    } catch (ignore) {}
}

function updateWebPushToggleUI(isOn) {
    const toggle = document.querySelector('.settings-toggle-input[data-type="toggle_web_push"]');
    if (!toggle) {
        return;
    }
    const parent = toggle.closest('.settings-toggle');
    toggle.checked = Boolean(isOn);
    if (parent) {
        parent.setAttribute('data-state', isOn ? 'on' : 'off');
    }
}

function maybePromptWebPush() {
    if (!shouldPromptWebPush()) {
        return;
    }
    const ok = confirm('是否开启通知，接收你关注内容的更新？');
    if (!ok) {
        deferWebPushPrompt();
        return;
    }
    markWebPushPromptAccepted();
    try {
        updateWebPushToggleUI(true);
        toggleWebPush();
    } catch (ignore) {}
}

function hasLoggedIn() {
    return typeof GetCookie('subscription_type') === 'string';
}

function updatePreference(preference) {
    try {
        if (!preference || typeof preference !== 'object') {
            return;
        }
        let p = JSON.parse(JSON.stringify(preference));
        if (typeof deepSanitizeFrontend === 'function') {
            p = deepSanitizeFrontend(p);
        }
        p.time = new Date();
        localStorage.setItem('preference', JSON.stringify(p));
        if (hasLoggedIn()) {
            fetch('/save_preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p)
            }).catch(err => {
                console.error('Failed to sync preferences with the server: ', err);
            });
        }
    } catch (err) {
        console.error('Update preference error: ', err);
    }
}

function timeToSync() {
    try {
        const last_sync_unix_time_stamp_string = localStorage.getItem(last_sync_time_key);
        if (!last_sync_unix_time_stamp_string) {
            return true; // Sync if there's no recorded sync time
        }

        const last_sync_unix_time_stamp = parseInt(last_sync_unix_time_stamp_string, 10);
        return new Date().getTime() - last_sync_unix_time_stamp > 3 * 60 * 1000;
    } catch (ignore) {
        return true; // Default to true if an error occurs
    }
}

async function syncLocalFollowsWithServer() {
    try {
        const savedFollowList = localStorage.getItem(key);
        const savedFollowListJSON = JSON.parse(savedFollowList) || {};

        if (!savedFollowListJSON || Object.keys(savedFollowListJSON).length === 0) {
            return;
        }

        // Send the local follows to the server for syncing
        const response = await fetch('/sync_myft_follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedFollowListJSON),
        });

        if (response.ok) {
            console.log('Local follows synced successfully');
            localStorage.setItem(last_sync_time_key, new Date().getTime()); // Update only if sync is successful
        } else {
            console.warn('Failed to sync follows:', await response.text());
        }
    } catch (err) {
        console.error(`Sync follow error: `, err);
    }
}

function updateSavedFollows(savedFollows, myInterests) {

    // console.log('saved follows: ', JSON.stringify(savedFollows));
    // console.log('my interests: ', JSON.stringify(myInterests));

    for (const interest of myInterests) {
        const { key, display, type } = interest;
        let categoryMatch = null;
        let mappedValue = null;

        // Check for a mapping in ftAnnotationsMap
        for (const [category, mapping] of Object.entries(ftAnnotationsMap)) {
            if (Object.prototype.hasOwnProperty.call(mapping, key)) {
                categoryMatch = category;
                mappedValue = mapping[key];
                break;
            }
        }

        if (categoryMatch && mappedValue !== '') {
            // Ensure the array exists (e.g., genre, industry) and avoid duplicates
            if (!savedFollows[categoryMatch]) {
                savedFollows[categoryMatch] = [];
            }

            if (!savedFollows[categoryMatch].includes(mappedValue)) {
                savedFollows[categoryMatch].push(mappedValue);
                // console.log(`Matched: [${categoryMatch}] -> ${mappedValue}`);
            }
        } else {
            // Fallback to tag category
            const tagValue = display || key;
            if (!savedFollows.tag.includes(tagValue)) {
                if (type === 'byline') {
                    savedFollows.author.push(tagValue);
                    savedFollows.authors.push(tagValue);

                } else {
                    savedFollows.tag.push(tagValue);
                }
                // console.log(`Fallback: [tag] -> ${tagValue}`);
            }
        }
    }

    // Loop all the saved follows categories (tag, area, etc.)
    for (const key of Object.keys(savedFollows)) {
        let terms = savedFollows[key];
        
        if (Array.isArray(terms) && terms.length > 0) {
            // Map the terms and assign the new array back to the object
            savedFollows[key] = terms.map(term => {
                try {
                    // Only decode if it looks like it contains encoded characters (%)
                    return term.includes('%') ? decodeURIComponent(term) : term;
                } catch (e) {
                    return term; // Fallback to original if decoding fails
                }
            });
            // console.log(`Decoded ${key}:`, savedFollows[key]);
        }
    }
    // console.log(`saved follows: `, JSON.stringify(savedFollows, null, 2));
    return savedFollows;
}

async function checkFollow() {
    
    const savedFollowListJSONString = localStorage.getItem(key) || '{}';
    let savedFollows = {};
    try {
        savedFollows = JSON.parse(savedFollowListJSONString) || {};
    } catch(ignore) {}

    // console.log('savedFollows 1: ', JSON.stringify(savedFollows, null, 2));

    const preferenceJSONString = localStorage.getItem(keyForpreference) || '';
    let myInterests = {};
    try {
        const preferenceJSON = JSON.parse(preferenceJSONString) || {};
        // console.log(`preferenceJSON:`, preferenceJSON);
        myInterests = preferenceJSON?.[keyForMyInterests];
        // console.log(`my interests:`, myInterests);
        savedFollows = updateSavedFollows(savedFollows, myInterests);
    } catch(ignore) {}

    // const myPreferenceString = localStorage.getItem('preference');

    if (hasLoggedIn() && timeToSync()) {
        try {
            // console.log(`syncLocalFollowsWithServer...`);
            await syncLocalFollowsWithServer(); // Ensure local follows are synced first.
            const response = await fetch('/get_myft_follows');
            if (response.ok) {
                const serverData = await response.json();

                if (serverData && typeof serverData === 'object') {
                    savedFollows = serverData; // Only use valid server data

                    // console.log('Using server follow data:', savedFollowListJSON);
                    localStorage.setItem(keyForLocal, JSON.stringify(savedFollows));
                }
            } else {
                console.warn('Failed to fetch follows from server, falling back to local storage.');
            }
        } catch (err) {
            console.error(`check follow error: `, err);
        }
    }

    // Update UI based on final follow data (server preferred, local fallback)
    const followButtons = document.querySelectorAll('button.myft-follow');

    // console.log(savedFollows);

    // console.log(`saved follows final: `, JSON.stringify(savedFollows, null, 2));

    for (const btn of followButtons) {
        const dataType = btn.getAttribute('data-type');
        let dataTag = btn.getAttribute('data-tag');

        if (dataTag.includes('%')) {
            dataTag = decodeURIComponent(dataTag);
            btn.setAttribute('data-tag', dataTag);
        }

        if (!Array.isArray(savedFollows[dataType])) {
            continue;
        }

        if (savedFollows[dataType].includes(dataTag)) {
            btn.innerHTML = '已关注';
            btn.classList.remove('plus');
            btn.classList.add('tick');
        } else {
            btn.innerHTML = '关注';
            btn.classList.remove('tick');
            btn.classList.add('plus');
        }
    }
}

checkFollow();
