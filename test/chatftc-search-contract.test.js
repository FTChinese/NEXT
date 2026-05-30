const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');

function readScript(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `${name} should exist`);

  const openBrace = source.indexOf('{', start);
  assert.notEqual(openBrace, -1, `${name} should have a body`);

  let depth = 0;
  for (let index = openBrace; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error(`${name} body is incomplete`);
}

function createClassList() {
  const values = new Set();
  return {
    add(value) {
      values.add(value);
    },
    remove(value) {
      values.delete(value);
    },
    contains(value) {
      return values.has(value);
    }
  };
}

function loadChatMyFT(preference) {
  const context = {
    console,
    preferredLanguage: 'zh-CN',
    navigator: { language: 'zh-CN' },
    document: {
      body: {},
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      }
    },
    Delegate: function Delegate() {
      return {
        on() {}
      };
    },
    getMyPreference() {
      return preference;
    },
    localize(key, fallback) {
      return fallback || key;
    },
    decodeHTMLEntitiesFrontend(value) {
      return value;
    },
    savePreference() {},
    isTouchDevice() {
      return false;
    },
    alert() {},
    setTimeout,
    clearTimeout
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(readScript('app/scripts/chat-my-ft.js'), context);
  return context;
}

function createLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    }
  };
}

function loadPreferenceScript(localStorage, fetch) {
  const context = {
    console,
    localStorage,
    fetch,
    setTimeout,
    clearTimeout
  };
  vm.createContext(context);
  vm.runInContext(readScript('app/scripts/get-my-preference.js'), context);
  return context;
}

test('ChatFTC right rail translates preference fields before building search actions', () => {
  const context = loadChatMyFT({
    Language: 'zh-CN',
    'My Interests': [
      { key: 'Explainer', display: 'Explainer', type: 'genres' },
      { key: 'Technology', display: 'Technology', type: 'industry' },
      { key: 'Legacy AI', display: 'Legacy AI', type: 'tag' }
    ],
    'My Custom Interests': []
  });

  const html = context.getMyFollowsHTML();

  assert.match(html, /data-content="genre: Explainer"/);
  assert.match(html, /data-content="topics: Technology"/);
  assert.match(html, /data-purpose="search-topic"[^>]+data-content="Legacy AI"/);
  assert.doesNotMatch(html, /data-content="genres: Explainer"/);
  assert.doesNotMatch(html, /data-content="industry: Technology"/);
  assert.doesNotMatch(html, /data-content="tag: Legacy AI"/);
});

test('ChatFTC annotation suggestions normalize genre aliases before follow and search markup', () => {
  const context = loadChatMyFT({
    Language: 'zh-CN',
    'My Interests': [],
    'My Custom Interests': []
  });
  const element = {
    classList: createClassList(),
    innerHTML: ''
  };

  context.renderShowIntention(element, [
    {
      name: 'Explainer',
      field: 'genres',
      score: 10,
      translations: { 'zh-CN': 'Explainer' }
    },
    {
      name: 'Legacy AI',
      field: 'tag',
      score: 10,
      translations: { 'zh-CN': 'Legacy AI' }
    }
  ]);

  assert.match(element.innerHTML, /data-content="genre: Explainer"/);
  assert.match(element.innerHTML, /data-type="genre"/);
  assert.match(element.innerHTML, /data-purpose="search-topic"[^>]+data-content="Legacy AI"/);
  assert.doesNotMatch(element.innerHTML, /data-content="genres: Explainer"/);
  assert.doesNotMatch(element.innerHTML, /data-content="tag: Legacy AI"/);
});

test('ChatFTC article annotation links normalize genre aliases in URL hashes', () => {
  const context = loadChatMyFT({
    Language: 'zh-CN',
    'My Interests': [],
    'My Custom Interests': []
  });

  const result = context.getAnnotaionsInfo({
    annotations: [
      {
        prefLabel: 'Explainer',
        field: 'genres',
        type: 'GENRE',
        predicate: 'http://www.ft.com/ontology/annotation/about'
      }
    ]
  }, 'zh-CN');

  assert.match(result.annotations, /#field=genre&key=Explainer/);
  assert.match(result.annotations, /data-type="genre"/);
  assert.doesNotMatch(result.annotations, /#field=genres&key=Explainer/);
});

test('ChatFTC hash and SearchFTAPI helpers normalize aliases and free-text tags', () => {
  const source = readScript('app/scripts/chat.js');
  const context = {};
  vm.createContext(context);
  vm.runInContext([
    extractFunction(source, 'normalizeFTSearchAPIField'),
    extractFunction(source, 'isFreeTextSearchField'),
    extractFunction(source, 'normalizeFTSearchAPIContent')
  ].join('\n'), context);

  assert.equal(context.normalizeFTSearchAPIField('genres'), 'genre');
  assert.equal(context.normalizeFTSearchAPIField('industry'), 'topics');
  assert.equal(context.normalizeFTSearchAPIField('area'), 'regions');
  assert.equal(context.normalizeFTSearchAPIField('organization'), 'organisations');
  assert.equal(context.normalizeFTSearchAPIField('author'), 'byline');
  assert.equal(context.isFreeTextSearchField('tag'), true);
  assert.equal(context.normalizeFTSearchAPIContent('genres: Explainer'), 'genre: Explainer');
  assert.equal(context.normalizeFTSearchAPIContent('industry: Technology'), 'topics: Technology');
  assert.equal(context.normalizeFTSearchAPIContent('tag: Legacy AI'), 'Legacy AI');
});

test('main search suggestions normalize annotation field aliases before SearchFTAPI links', () => {
  const source = readScript('app/scripts/main-search.js');
  const context = {};
  vm.createContext(context);
  vm.runInContext(extractFunction(source, 'normalizeFTSearchFieldForSearch'), context);

  assert.equal(context.normalizeFTSearchFieldForSearch('genres'), 'genre');
  assert.equal(context.normalizeFTSearchFieldForSearch('industry'), 'topics');
  assert.equal(context.normalizeFTSearchFieldForSearch('area'), 'regions');
  assert.equal(context.normalizeFTSearchFieldForSearch('organization'), 'organisations');
  assert.equal(context.normalizeFTSearchFieldForSearch('author'), 'byline');
});

test('preference save and sync preserve client MyFT type values', async () => {
  let requestBody = null;
  const localStorage = createLocalStorage();
  const context = loadPreferenceScript(localStorage, async (url, options) => {
    assert.equal(url, '/save_preference');
    requestBody = JSON.parse(options.body);
    return { ok: true };
  });

  await context.savePreference({
    'My Interests': [
      { key: 'Explainer', display: '解读', type: 'genre' },
      { key: 'Technology', display: '科技', type: 'industry' }
    ]
  }, { immediate: true });

  const storedPreference = JSON.parse(localStorage.getItem('preference'));
  assert.equal(storedPreference['My Interests'][0].type, 'genre');
  assert.equal(storedPreference['My Interests'][1].type, 'industry');
  assert.equal(requestBody['My Interests'][0].type, 'genre');
  assert.equal(requestBody['My Interests'][1].type, 'industry');
});

test('preference server sync preserves server type values when server is newer', async () => {
  const localStorage = createLocalStorage({
    preference: JSON.stringify({
      'My Interests': [],
      time: '2026-05-20T00:00:00.000Z'
    })
  });
  const context = loadPreferenceScript(localStorage, async () => ({
    ok: true,
    json: async () => ({
      status: 'OK',
      preference: {
        'My Interests': [
          { key: 'Explainer', display: '解读', type: 'genre' },
          { key: 'Technology', display: '科技', type: 'industry' }
        ],
        time: '2026-05-29T00:00:00.000Z'
      }
    })
  }));

  const updated = await context.checkPreferencesFromServer();
  const storedPreference = JSON.parse(localStorage.getItem('preference'));

  assert.equal(updated, true);
  assert.equal(storedPreference['My Interests'][0].type, 'genre');
  assert.equal(storedPreference['My Interests'][1].type, 'industry');
});

test('preference server sync ignores generated empty MyFT preference-mode documents', async () => {
  const requests = [];
  const localStorage = createLocalStorage({
    preference: JSON.stringify({
      Language: 'zh-CN',
      time: '2026-05-28T00:00:00.000Z'
    })
  });
  const context = loadPreferenceScript(localStorage, async (url, options) => {
    requests.push({ url, options });
    if (url === '/check_preference') {
      return {
        ok: true,
        json: async () => ({
          status: 'OK',
          preference: {
            'My Interests': [],
            'My Custom Interests': [],
            myft_interest_schema_version: 1,
            myft_interest_preference_mode: true,
            time: '2026-05-29T00:00:00.000Z'
          }
        })
      };
    }
    return { ok: true };
  });

  const updated = await context.checkPreferencesFromServer();
  const storedPreference = JSON.parse(localStorage.getItem('preference'));
  const syncRequest = requests.find(request => request.url === '/save_preference');

  assert.equal(updated, true);
  assert.equal(storedPreference.Language, 'zh-CN');
  assert.equal(storedPreference.myft_interest_schema_version, undefined);
  assert.ok(syncRequest);
  assert.equal(JSON.parse(syncRequest.options.body).Language, 'zh-CN');
});

test('recommendation follow buttons store the stable genre field', () => {
  const source = readScript('app/scripts/recommend.js');
  const context = {};
  vm.createContext(context);
  vm.runInContext(extractFunction(source, 'mapAnnotationField'), context);

  assert.equal(context.mapAnnotationField({ type: 'GENRE' }), 'genre');
  assert.equal(context.mapAnnotationField({ type: 'LOCATION' }), 'regions');
  assert.equal(context.mapAnnotationField({ type: 'TOPIC' }), 'topics');
});

test('generic follow buttons store genres as the stable genre field', () => {
  const source = readScript('app/scripts/myft-follow.js');
  const context = {};
  vm.createContext(context);
  vm.runInContext([
    extractFunction(source, 'decodeHTMLEntitiesForMyFT'),
    extractFunction(source, 'normalizeFollowValue'),
    extractFunction(source, 'getPreferenceSourceFromFollowButton'),
    extractFunction(source, 'normalizePreferenceTypeForStorage'),
    extractFunction(source, 'getPreferenceItemFromFollowButton')
  ].join('\n'), context);
  const attrs = {
    'data-tag': '深度解读',
    'data-key': 'Deep Dive',
    'data-field': 'genres',
    'data-display': '深度解读'
  };
  const button = {
    getAttribute(name) {
      return attrs[name] || '';
    }
  };

  const item = context.getPreferenceItemFromFollowButton(button);

  assert.equal(item.key, 'Deep Dive');
  assert.equal(item.type, 'genre');
  assert.equal(item.source, 'ft_annotation');
});
