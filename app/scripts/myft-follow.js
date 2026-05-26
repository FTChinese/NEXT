/* global isMyFTInterestPreferenceMode, clearLegacyMyFTFollowStorage, checkPreferencesFromServer */
// Global Constants
const key = 'my-ft-follow';
const keyForLocal = 'my-ft-follow-ftc';
const keyForMyInterests = 'My Interests';
const keyForpreference = 'preference';
const last_sync_time_key = 'last_sync_time';
const last_preference_follow_check_key = 'myft_preference_follow_check_time';
const webPushPromptCooldownKey = 'ftc:webpushPromptNextAt';
const webPushPromptAcceptedKey = 'ftc:webpushPromptAccepted';
const webPushPromptCooldownMs = 30 * 24 * 60 * 60 * 1000;

function decodeHTMLEntitiesForMyFT(value) {
    if (typeof value !== 'string' || value.indexOf('&') === -1) {
        return value;
    }
    if (typeof window !== 'undefined' && typeof window.decodeHTMLEntitiesFrontend === 'function') {
        return window.decodeHTMLEntitiesFrontend(value);
    }
    if (typeof document === 'object' && document.createElement) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }
    return value
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&#x27;/g, '\'')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function normalizeFollowValue(value) {
    value = decodeHTMLEntitiesForMyFT(value);
    if (typeof value !== 'string') {
        return value;
    }
    if (value.indexOf('%') === -1) {
        return value;
    }
    try {
        return decodeURIComponent(value);
    } catch (ignore) {
        return value;
    }
}

function getLegacyFollowCategoriesForField(field) {
    const normalizedField = normalizeFollowValue(field || '').toLowerCase();
    const fieldMap = {
        byline: ['author'],
        genre: ['genre'],
        genres: ['genre'],
        industry: ['industry'],
        industries: ['industry'],
        region: ['area'],
        regions: ['area'],
        organisation: ['organisation', 'organisations', 'organization', 'organizations'],
        organisations: ['organisation', 'organisations', 'organization', 'organizations'],
        organization: ['organisation', 'organisations', 'organization', 'organizations'],
        organizations: ['organisation', 'organisations', 'organization', 'organizations'],
        topic: ['topic'],
        topics: ['topic', 'industry']
    };
    return fieldMap[normalizedField] || [];
}

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

function getMappedFollowFromPreference(prefKey, prefField, prefDisplay) {
    const key = normalizeFollowValue(prefKey);
    if (!key) {
        return null;
    }

    const preferredCategories = getLegacyFollowCategoriesForField(prefField);
    const categories = preferredCategories.concat(Object.keys(ftAnnotationsMap).filter(category => preferredCategories.indexOf(category) === -1));

    for (const category of categories) {
        const mapping = ftAnnotationsMap[category];
        if (!mapping || !Object.prototype.hasOwnProperty.call(mapping, key)) {
            continue;
        }
        const mappedValue = normalizeFollowValue(mapping[key]);
        if (mappedValue) {
            return {type: category, name: mappedValue};
        }
    }

    const normalizedField = normalizeFollowValue(prefField || '').toLowerCase();
    const display = normalizeFollowValue(prefDisplay) || key;
    if (normalizedField === 'byline') {
        return {type: 'author', name: display};
    }

    return {type: 'tag', name: display};
}

function getUniqueFollowRecords(records) {
    const seen = new Set();
    return records
        .filter(record => record && record.type && record.name)
        .filter(record => {
            const key = `${record.type}\u0000${record.name}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
}

function getFollowRecordVariantsFromPreference(prefKey, prefField, prefDisplay) {
    const key = normalizeFollowValue(prefKey);
    const field = normalizeFollowValue(prefField || '').toLowerCase();
    const display = normalizeFollowValue(prefDisplay) || key;
    const records = [];

    function addRecord(type, name) {
        if (type && name) {
            records.push({type, name});
        }
    }

    if (!key && !display) {
        return [];
    }

    if (field === 'byline') {
        addRecord('author', display);
        addRecord('author', key);
        addRecord('authors', display);
        addRecord('authors', key);
        return getUniqueFollowRecords(records);
    }

    addRecord('tag', display);
    addRecord('tag', key);

    const legacyCategories = getLegacyFollowCategoriesForField(field);
    for (const category of legacyCategories) {
        addRecord(category, key);
        addRecord(category, display);
    }

    return getUniqueFollowRecords(records);
}

function hasFollowRecord(collection, record) {
    if (!collection || !record || !record.type || !record.name || !Array.isArray(collection[record.type])) {
        return false;
    }
    return collection[record.type].some(value => getFollowValueAliases(value).includes(record.name));
}

function getFollowValueAliases(value) {
    if (typeof value === 'string') {
        const normalizedValue = normalizeFollowValue(value);
        return normalizedValue ? [normalizedValue] : [];
    }
    if (!value || typeof value !== 'object') {
        return [];
    }
    return [value.key, value.name, value.display]
        .map(normalizeFollowValue)
        .filter(Boolean);
}

function isButtonFollowedInCollection(btn, collection) {
    const dataType = normalizeFollowValue(btn.getAttribute('data-type') || 'tag');
    const dataTag = normalizeFollowValue(btn.getAttribute('data-tag') || '');
    const prefKey = normalizeFollowValue(btn.getAttribute('data-key'));
    const prefField = normalizeFollowValue(btn.getAttribute('data-field'));
    const prefDisplay = normalizeFollowValue(btn.getAttribute('data-display'));
    const canonicalFollowRecord = getMappedFollowFromPreference(prefKey, prefField, prefDisplay);
    const records = getUniqueFollowRecords([
        {type: dataType, name: dataTag},
        canonicalFollowRecord,
        ...getFollowRecordVariantsFromPreference(prefKey, prefField, prefDisplay)
    ]);

    return records.some(record => hasFollowRecord(collection, record));
}

function isMyFTPreferenceModeForFollow() {
    try {
        if (typeof isMyFTInterestPreferenceMode === 'function') {
            return isMyFTInterestPreferenceMode();
        }
        const preference = JSON.parse(localStorage.getItem(keyForpreference) || '{}') || {};
        return preference.myft_interest_preference_mode === true || Number(preference.myft_interest_schema_version || 0) > 0;
    } catch (ignore) {
        return false;
    }
}

function clearLegacyFollowStorageForPreferenceMode() {
    if (typeof clearLegacyMyFTFollowStorage === 'function') {
        clearLegacyMyFTFollowStorage();
        return;
    }
    try {
        localStorage.removeItem(key);
        localStorage.removeItem(keyForLocal);
        localStorage.removeItem(last_sync_time_key);
    } catch (ignore) {}
}

function getMyFTPreferenceSchemaVersionForFollow(preference) {
    const version = Number(preference?.myft_interest_schema_version || 0);
    return Number.isFinite(version) ? version : 0;
}

async function checkPreferenceModeFromServerForFollow() {
    if (typeof checkPreferencesFromServer === 'function') {
        await checkPreferencesFromServer();
        if (isMyFTPreferenceModeForFollow()) {
            return true;
        }
    }
    if (typeof fetch !== 'function') {
        return false;
    }
    try {
        const response = await fetch('/check_preference', {
            method: 'GET',
            credentials: 'same-origin',
            headers: {'Content-Type': 'application/json'}
        });
        if (!response.ok) {
            return false;
        }
        const results = await response.json();
        const serverPreference = results?.preference;
        if (results?.status !== 'OK' || !serverPreference || serverPreference.myft_interest_preference_mode !== true) {
            return false;
        }
        const localPreference = (typeof getMyPreference === 'function') ? getMyPreference() : (JSON.parse(localStorage.getItem(keyForpreference) || '{}') || {});
        const serverVersion = getMyFTPreferenceSchemaVersionForFollow(serverPreference);
        const localVersion = getMyFTPreferenceSchemaVersionForFollow(localPreference);
        if (serverVersion >= localVersion) {
            localStorage.setItem(keyForpreference, JSON.stringify(serverPreference));
            clearLegacyFollowStorageForPreferenceMode();
            return true;
        }
    } catch (err) {
        console.error('Failed to check MyFT preference mode:', err);
    }
    return false;
}

function getPreferenceItemFromFollowButton(btn) {
    const dataTag = normalizeFollowValue(btn.getAttribute('data-tag') || '');
    const prefKey = normalizeFollowValue(btn.getAttribute('data-key'));
    const prefField = normalizeFollowValue(btn.getAttribute('data-field'));
    const prefDisplay = normalizeFollowValue(btn.getAttribute('data-display'));
    const preferenceSource = getPreferenceSourceFromFollowButton(btn, prefField);
    if (prefKey && prefField && prefDisplay) {
        return {
            key: prefKey,
            display: prefDisplay,
            type: prefField,
            source: preferenceSource
        };
    }
    if (!dataTag) {
        return null;
    }
    return {
        key: dataTag,
        display: dataTag,
        type: 'tag',
        source: preferenceSource
    };
}

function getPreferenceSourceFromFollowButton(btn, prefField) {
    const normalizedField = normalizeFollowValue(prefField || '').toLowerCase();
    if (normalizedField && normalizedField !== 'tag') {
        return 'ft_annotation';
    }
    const dataSource = normalizeFollowValue(btn.getAttribute('data-source') || '').toLowerCase();
    if (dataSource) {
        return dataSource;
    }
    return 'ftc_tag';
}

function itemMatchesFollowPreference(item, preferenceItem, aliases) {
    if (!item || typeof item !== 'object' || !preferenceItem) {
        return false;
    }
    const itemAliases = [
        normalizeFollowValue(item.key),
        normalizeFollowValue(item.display)
    ].filter(Boolean);
    if (itemAliases.some(alias => aliases.has(alias))) {
        return true;
    }
    return normalizeFollowValue(item.key) === normalizeFollowValue(preferenceItem.key) &&
        normalizeFollowValue(item.type) === normalizeFollowValue(preferenceItem.type);
}

function updateLocalPreferenceFollow(btn, shouldFollow) {
    const preferenceItem = getPreferenceItemFromFollowButton(btn);
    if (!preferenceItem) {
        return;
    }
    try {
        const preferenceJSON = (typeof getMyPreference === 'function') ? getMyPreference() : (JSON.parse(localStorage.getItem('preference') || '{}') || {});
        let myInterests = Array.isArray(preferenceJSON[keyForMyInterests]) ? preferenceJSON[keyForMyInterests] : [];
        myInterests = myInterests.filter(x => x && typeof x === 'object');
        const aliases = new Set([
            normalizeFollowValue(preferenceItem.key),
            normalizeFollowValue(preferenceItem.display),
            normalizeFollowValue(btn.getAttribute('data-tag') || '')
        ].filter(Boolean));
        myInterests = myInterests.filter(item => !itemMatchesFollowPreference(item, preferenceItem, aliases));
        if (shouldFollow) {
            myInterests.unshift(preferenceItem);
        }
        preferenceJSON[keyForMyInterests] = myInterests;
        updatePreference(preferenceJSON, {immediate: true});
    } catch (err) {
        console.error('MyFT preference update error: ', err);
    }
}

function buildFollowRequestPayload(btn, records, action, canonicalFollowRecord) {
    const uniqueRecords = getUniqueFollowRecords(records);
    const dataTag = normalizeFollowValue(btn.getAttribute('data-tag') || '');
    const dataType = normalizeFollowValue(btn.getAttribute('data-type') || 'tag');
    const prefKey = normalizeFollowValue(btn.getAttribute('data-key'));
    const prefField = normalizeFollowValue(btn.getAttribute('data-field'));
    const prefDisplay = normalizeFollowValue(btn.getAttribute('data-display'));
    const preferenceSource = getPreferenceSourceFromFollowButton(btn, prefField);
    const aliases = [...new Set([
        dataTag,
        prefKey,
        prefDisplay,
        ...uniqueRecords.map(record => record.name)
    ].map(normalizeFollowValue).filter(Boolean))];
    return {
        action,
        type: canonicalFollowRecord?.type || dataType,
        name: canonicalFollowRecord?.name || dataTag,
        tag: dataTag,
        dataType,
        key: prefKey,
        field: prefField,
        display: prefDisplay || dataTag,
        source: preferenceSource,
        aliases,
        records: uniqueRecords
    };
}

function getFollowButtonStateText(btn, isFollowed) {
    const labelAttr = isFollowed ? 'data-following-label' : 'data-follow-label';
    const customLabel = normalizeFollowValue(btn.getAttribute(labelAttr) || '');
    if (customLabel) {
        return customLabel;
    }
    return isFollowed ? '已关注' : '关注';
}

function setFollowButtonState(btn, isFollowed) {
    btn.textContent = getFollowButtonStateText(btn, isFollowed);
    if (isFollowed) {
        btn.classList.remove('plus');
        btn.classList.add('tick');
        return;
    }
    btn.classList.add('plus');
    btn.classList.remove('tick');
}

// click events
try {
    if (typeof delegate === 'undefined') { 
        window.delegate = new Delegate(document.body);
    }

    delegate.on('click', '.myft-follow', async function () {
        const isFollowed = !this.classList.contains('plus');

        const dataTag = normalizeFollowValue(this.getAttribute('data-tag') || '');
        const dataType = normalizeFollowValue(this.getAttribute('data-type') || 'tag');
        if (!dataTag) {
            alert('亲爱的读者，我们无法识别您关注的标签，请您刷新页面重新试试。');
            return;
        }
        this.setAttribute('data-tag', dataTag);
        this.setAttribute('data-type', dataType);

        // Keep preference-based follows in sync when canonical annotation data is available
        const prefKey = normalizeFollowValue(this.getAttribute('data-key'));
        const prefField = normalizeFollowValue(this.getAttribute('data-field'));
        const prefDisplay = normalizeFollowValue(this.getAttribute('data-display'));
        const primaryFollowRecord = {type: dataType, name: dataTag};
        const canonicalFollowRecord = getMappedFollowFromPreference(prefKey, prefField, prefDisplay) || primaryFollowRecord;
        const followRecordVariants = getUniqueFollowRecords([
            primaryFollowRecord,
            canonicalFollowRecord,
            ...getFollowRecordVariantsFromPreference(prefKey, prefField, prefDisplay)
        ]);
        const followRecordsToRemove = followRecordVariants;
        const followRecordsToAdd = getUniqueFollowRecords([canonicalFollowRecord]);
        clearLegacyFollowStorageForPreferenceMode();
        updateLocalPreferenceFollow(this, !isFollowed);

        // Optimistically update UI immediately
        if (isFollowed) {
            setFollowButtonState(this, false);
        } else {
            setFollowButtonState(this, true);
            maybePromptWebPush();
        }

        // Send follow/unfollow request to the server in the background
        if (hasLoggedIn()) {
            try {
                const action = isFollowed ? 'unfollow' : 'follow';
                const url = `/myft_follow`;
                const serverFollowRecords = isFollowed ? followRecordsToRemove : followRecordsToAdd;
                const payload = buildFollowRequestPayload(this, serverFollowRecords, action, canonicalFollowRecord);
                await sendFollowRecordsToServer(payload, url);
            } catch (err) {
                console.error(`MyFT follow error: `, err);
            }
        }

        // Sync follows after the update
        await checkFollow({forceSync: true, skipLocalSync: true});
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

function updatePreference(preference, options) {
    try {
        if (!preference || typeof preference !== 'object') {
            return;
        }
        if (typeof savePreference === 'function') {
            savePreference(preference, options);
            return;
        }
        if (typeof localStorage === 'object') {
            let p = JSON.parse(JSON.stringify(preference));
            if (typeof deepSanitizeFrontend === 'function') {
                p = deepSanitizeFrontend(p);
            }
            p.time = new Date();
            localStorage.setItem('preference', JSON.stringify(p));
        }
    } catch (err) {
        console.error('Update preference error: ', err);
    }
}

async function sendFollowRecordsToServer(records, url) {
    const endpoint = url || '/myft_follow';
    const payload = Array.isArray(records) ? {
        action: 'follow',
        type: records[0]?.type,
        name: records[0]?.name,
        records: getUniqueFollowRecords(records)
    } : records;
    const response = await fetch(endpoint, {
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.warn('Server failed to process follow/unfollow action:', await response.text());
    }
}

function timeToSync() {
    try {
        const last_sync_unix_time_stamp_string = localStorage.getItem(last_preference_follow_check_key);
        if (!last_sync_unix_time_stamp_string) {
            return true; // Sync if there's no recorded sync time
        }

        const last_sync_unix_time_stamp = parseInt(last_sync_unix_time_stamp_string, 10);
        return new Date().getTime() - last_sync_unix_time_stamp > 3 * 60 * 1000;
    } catch (ignore) {
        return true; // Default to true if an error occurs
    }
}

function updateSavedFollows(savedFollows, myInterests) {

    // console.log('saved follows: ', JSON.stringify(savedFollows));
    // console.log('my interests: ', JSON.stringify(myInterests));

    if (!Array.isArray(myInterests)) {
        return savedFollows;
    }

    for (const type of ['tag', 'author', 'authors', 'byline']) {
        if (!Array.isArray(savedFollows[type])) {
            savedFollows[type] = [];
        }
    }

    for (const interest of myInterests) {
        const key = normalizeFollowValue(interest.key);
        const display = normalizeFollowValue(interest.display);
        const type = normalizeFollowValue(interest.type);
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
                    savedFollows.byline.push(key || tagValue);

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
                    return normalizeFollowValue(term);
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

async function checkFollow(options) {
    const opts = options || {};
    if (opts.skipPreferenceCheck !== true && hasLoggedIn() && isMyFTPreferenceModeForFollow() !== true) {
        await checkPreferenceModeFromServerForFollow();
    }
    const preferenceMode = isMyFTPreferenceModeForFollow();
    if (preferenceMode) {
        clearLegacyFollowStorageForPreferenceMode();
    }
    
    let savedFollows = {};

    // console.log('savedFollows 1: ', JSON.stringify(savedFollows, null, 2));

    const preferenceJSONString = localStorage.getItem(keyForpreference) || '';
    let myInterests = {};
    try {
        const preferenceJSON = (typeof getMyPreference === 'function') ? getMyPreference() : (JSON.parse(preferenceJSONString) || {});
        // console.log(`preferenceJSON:`, preferenceJSON);
        myInterests = preferenceJSON?.[keyForMyInterests];
        // console.log(`my interests:`, myInterests);
        savedFollows = updateSavedFollows(savedFollows, myInterests);
    } catch(ignore) {}

    // const myPreferenceString = localStorage.getItem('preference');

    if (hasLoggedIn() && (opts.forceSync === true || timeToSync())) {
        try {
            clearLegacyFollowStorageForPreferenceMode();
            const response = await fetch('/get_myft_follows');
            if (response.ok) {
                const serverData = await response.json();

                if (serverData && typeof serverData === 'object') {
                    savedFollows = serverData; // Only use valid server data
                    localStorage.setItem(last_preference_follow_check_key, new Date().getTime());
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
        const rawDataTag = btn.getAttribute('data-tag');
        if (!rawDataTag) {
            continue;
        }
        const dataType = normalizeFollowValue(btn.getAttribute('data-type') || 'tag');
        const dataTag = normalizeFollowValue(rawDataTag);
        btn.setAttribute('data-tag', dataTag);
        btn.setAttribute('data-type', dataType);

        const savedValues = Array.isArray(savedFollows[dataType]) ? savedFollows[dataType].map(normalizeFollowValue) : [];
        if (savedValues.includes(dataTag) || isButtonFollowedInCollection(btn, savedFollows)) {
            setFollowButtonState(btn, true);
        } else {
            setFollowButtonState(btn, false);
        }
    }
}

checkFollow();
