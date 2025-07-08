
// === Attribute Mapping ===
const attributeMap = [
  ['data-ft-id', 'ftid'],
  ['data-id', 'id'],
  ['data-type', 'type'],
  ['data-update', 'update'],
  ['data-keywords', 'keywords'],
  ['data-annotations-main', 'annotationsMain'],
  ['data-annotations-secondary', 'annotationsSecondary'],
  ['data-editorial-score', 'editorialScore'],
  ['data-popularity-score', 'popularityScore'],
  ['data-sub-type', 'subtype']
];

const GENRE_SCORE_MAP = {
  Feature: 1.0,
  Opinion: 0.8,
  News: 0.8,
  Other: 0.8
};

const attrToKeyMap = Object.fromEntries(attributeMap);

let follows = new Set();

// === Recommendation Weights ===
const recommendationWeights = {
  editorial: 20,
  popularity: 10,
  relevance: 30,
  readPenalty: true,
  freshnessBonus: true
};


// === Kickstart ===
runRecommendationForDoms();


// === Main Flow ===
function runRecommendationForDoms() {
  const lists = document.querySelectorAll('.list-reorder');
  if (lists.length === 0) {return;}

  updateFollows();
  updateWeights();


  for (const [listIndex, list] of lists.entries()) {
    let items = [];

    for (const [itemIndex, item] of list.querySelectorAll('.item-container').entries()) {
      const viewId = `reorder-item-${listIndex}-${itemIndex}`;
      item.style.viewTransitionName = viewId;
      item.id = viewId;

      const itemData = { viewId };

      for (const attr of item.getAttributeNames()) {
        const key = attrToKeyMap[attr];
        if (!key) {continue;}
        const val = item.getAttribute(attr);
        itemData[key] = ['editorialScore', 'popularityScore'].includes(key) ? parseFloat(val) : val;
      }

      items.push(itemData);
    }

    items = calculateScores(items);
    reorderListWithScores(list, items);
    // TODO: show a description just about the list container, saying things like "The items are reordered based on your interests, editorial recommendation and other factors, click here to customise" in Chinese. 
    showCustomisation(list);
  }
}


function showCustomisation(list) {
  if (!list || list.parentNode.querySelector('.reorder-description')) {
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'items reorder-description';

  const container = document.createElement('div');
  container.className = 'no-image';

  const inner = document.createElement('div');
  inner.className = 'item-inner';

  const lead = document.createElement('div');
  lead.className = 'item-lead';

  const preferredLanguage = (window.preferredLanguage || 'zh-CN').toLowerCase();

  let langKey = 'zh';
  if (preferredLanguage.startsWith('zh-tw')) {
    langKey = 'zh-TW';
  } else if (preferredLanguage.startsWith('zh-hk') || preferredLanguage.startsWith('zh-mo')) {
    langKey = 'zh-HK';
  }

  const texts = {
    'zh-TW': `本列表已根據您的關注偏好、編輯推薦、內容熱度等因素重新排序。<a href="#">點擊這裡自訂</a>`,
    'zh-HK': `本列表已根據您的關注偏好、編輯推薦、內容熱度等因素重新排序。<a href="#">點擊這裡自定義</a>`,
    'zh': `本列表已根据您的关注偏好、编辑推荐、内容热度等因素重新排序。<a href="#">点击这里自定义</a>`
  };

  lead.innerHTML = texts[langKey] || texts.zh;

  inner.appendChild(lead);
  container.appendChild(inner);
  wrapper.appendChild(container);

  list.parentNode.insertBefore(wrapper, list);
}





// === Final Score Calculation ===
function calculateScores(items) {

  items = calculateRelevanceScores(items);

  let readIds = new Set();
  const readKeys = ['readids', 'ftcreadids'];
  for (const key of readKeys) {
    const readIdsString = localStorage?.getItem(key);
    if (!readIdsString) {continue;}
    try {
        const readFTIds = JSON.parse(readIdsString);
        if (readFTIds && readFTIds.length > 0) {
            for (const id of readFTIds) {
                readIds.add(id);
            }
        }
    } catch(err){
        console.error(`read ft ids error: `, err);
    }
  }

  const GENRE_WEIGHT_FRACTION = 0.01;
  const genreRawWeight = (
    recommendationWeights.editorial +
    recommendationWeights.popularity +
    recommendationWeights.relevance
  ) * GENRE_WEIGHT_FRACTION;

  const rawWeights = {
    editorial: recommendationWeights.editorial,
    popularity: recommendationWeights.popularity,
    relevance: recommendationWeights.relevance,
    genre: genreRawWeight
  };

  const WEIGHTS = normalizeWeights(rawWeights);

  const DECAY_HALFLIFE_IN_HOURS = {
    News: 6,
    Feature: 12,
    Opinion: 12,
    Other: 12
  };

  const now = Date.now();

  for (const item of items) {
    const rawUpdate = parseInt(item.update, 10);
    const updateTimestamp = !isNaN(rawUpdate) ? rawUpdate * 1000 : now - 3 * 24 * 60 * 60 * 1000;

    const ageMs = now - updateTimestamp;
    const genre = detectGenre(item.annotationsMain);
    const halfLifeMs = (DECAY_HALFLIFE_IN_HOURS[genre] || DECAY_HALFLIFE_IN_HOURS.Other) * 60 * 60 * 1000;

    // const subtype = item.subtype;
    // console.log(`subtype: `, subtype);

    const editorialScore = parseFloat(item.editorialScore) || 0;
    const popularityScore = parseFloat(item.popularityScore) || 0;
    const relevanceScore = parseFloat(item.relevanceScore) || 0;
    const genreScore = GENRE_SCORE_MAP[genre] || GENRE_SCORE_MAP.Other;

    const weightedScore =
      editorialScore * WEIGHTS.editorial +
      popularityScore * WEIGHTS.popularity +
      relevanceScore * WEIGHTS.relevance +
      genreScore * WEIGHTS.genre;

    const decayFactor = getDecayFactor(ageMs, halfLifeMs);
    const finalScore = weightedScore * decayFactor;

    item.genre = genre;
    item.updateTimestamp = updateTimestamp;
    item.decayFactor = decayFactor;

    const itemTypeMap = {premium: 'story'};
    const itemType = itemTypeMap[item?.type ?? ''] ?? item?.type;
    const itemTypeId = `${itemType}${item?.id ?? ''}`;
    const ftid = item?.ftid ?? '';
    const annotationsMain = item?.annotationsMain ?? '';
    const isUpdatingContent = /FT Live news/gi.test(annotationsMain);
    const read = !isUpdatingContent && (readIds.has(ftid) || readIds.has(itemTypeId));
    const readMinusScore = read ? (recommendationWeights.readPenalty ? 1 : 0) : 0;
    item.readMinusScore = readMinusScore;


    // For unseen items, which are updated after the score is last calculated, we want to raise it up
    const lastVisitTs = parseInt(localStorage.getItem('ftc-last-recommendation-ts'), 10) || 0;
    const unSeenItemBonus = updateTimestamp > lastVisitTs ? (recommendationWeights.freshnessBonus ? 1 : 0) : 0;

    item.unSeenItemBonus = unSeenItemBonus;


    item.finalScore = parseFloat(finalScore.toFixed(4)) - readMinusScore + unSeenItemBonus;


    localStorage.setItem('ftc-last-recommendation-ts', Date.now().toString());


  }

  return items;
}


function updateFollows() {
  const myFTFollows = localStorage.getItem('my-ft-follow-ftc');
  const preference = localStorage.getItem('preference');

  try {
    if (myFTFollows) {
      const parsedFollow = JSON.parse(myFTFollows);
      const tagCategories = ['tag', 'topic', 'area', 'author', 'authors'];
      for (const category of tagCategories) {
        const list = parsedFollow[category];
        if (Array.isArray(list)) {
          for (const value of list) {
            if (value) {follows.add(value);}
          }
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse my-ft-follow:', err);
  }

  try {
    if (preference) {
      const parsedPreference = JSON.parse(preference);
      const interestSources = [
        ...(parsedPreference['My Interests'] || []),
        ...(parsedPreference['My Custom Interests'] || [])
      ];
      for (const interest of interestSources) {
        if (interest?.key) {
          follows.add(interest.key);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse preference:', err);
  }

//   console.log(`follows: `, follows);
}


function updateWeights() {
  const preference = localStorage.getItem('preference');

  if (!preference) {
    console.warn('No preference found in localStorage. Using default weights.');
    return;
  }

  try {
    const parsedPreference = JSON.parse(preference);
    const weightsFromPref = parsedPreference?.recommendationWeights;

    if (!weightsFromPref || typeof weightsFromPref !== 'object') {
      console.warn('No valid recommendationWeights in preference. Skipping update.');
      return;
    }

    for (const key in recommendationWeights) {
      if (Object.prototype.hasOwnProperty.call(weightsFromPref, key)) {
        recommendationWeights[key] = weightsFromPref[key];
      }
    }

    // console.log(`recommendationWeights: `, recommendationWeights);
  } catch (err) {
    console.warn('Failed to parse or apply recommendationWeights from preference:', err);
  }
}


// === Relevance Calculation ===
function calculateRelevanceScores(items) {
  const WEIGHTS = {
    main: 3,
    secondary: 1,
    keywordPrimary: 2,
    keywordOther: 0.5
  };

  const BASE_MATCH_BOOST = {
    main: 0.5,
    secondary: 0.2
  };

  for (const item of items) {
    let score = 0;
    let hasMainMatch = false;
    let hasSecondaryMatch = false;

    const mainTags = item.annotationsMain?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const secondaryTags = item.annotationsSecondary?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const keywords = item.keywords?.split(',').map(t => t.trim()).filter(Boolean) || [];

    for (const tag of mainTags) {
      if (follows.has(tag)) {
        score += WEIGHTS.main;
        hasMainMatch = true;
      }
    }

    for (const tag of secondaryTags) {
      if (follows.has(tag)) {
        score += WEIGHTS.secondary;
        hasSecondaryMatch = true;
      }
    }

    for (const [i, tag] of keywords.entries()) {
      if (follows.has(tag)) {
        score += i === 0 ? WEIGHTS.keywordPrimary : WEIGHTS.keywordOther;
      }
    }

    if (hasMainMatch) {
      score += BASE_MATCH_BOOST.main;
    } else if (hasSecondaryMatch) {
      score += BASE_MATCH_BOOST.secondary;
    }

    item.relevanceRaw = score;
  }

  // Normalize to [0.5, 1.0] or 0 if no match
  let max = -Infinity;
  let min = Infinity;

  for (const item of items) {
    const r = item.relevanceRaw;
    if (r > 0) {
      max = Math.max(max, r);
      min = Math.min(min, r);
    }
  }

  const MIN_SCORE = 0.5;
  const MAX_SCORE = 1.0;

  

  for (const item of items) {
    const r = item.relevanceRaw || 0;
    if (r === 0) {
      item.relevanceScore = 0;
    } else if (max !== min) {
      item.relevanceScore = MIN_SCORE + (MAX_SCORE - MIN_SCORE) * ((r - min) / (max - min));
    } else {
      item.relevanceScore = MAX_SCORE;
    }
  }


  const regionMinScores = {
    zh: {
      'Chinese politics & policy': 1,
      'Chinese economy': 1,
      'China': 0.95,
      'Hong Kong': 0.7,
      'Taiwan': 0.75
    },
    'zh-CN': {
      'Chinese politics & policy': 1,
      'Chinese economy': 1,
      'China': 0.95,
      'Hong Kong': 0.7,
      'Taiwan': 0.75
    },
    'zh-HK': {
      'Chinese politics & policy': 0.9,
      'Chinese economy': 0.9,
      'Hong Kong': 0.95,
      'China': 0.75,
      'Taiwan': 0.75
    },
    'zh-TW': {
      'Chinese politics & policy': 0.9,
      'Chinese economy': 0.8,
      'Taiwan': 0.95,
      'China': 0.75,
      'Hong Kong': 0.7
    }
  };

  const preferredLanguage = window.preferredLanguage ?? 'zh-CN';

  const regionMinScore = regionMinScores[preferredLanguage];

  for (const item of items) {
    const tags = [
      ...(item.annotationsMain?.split(',') ?? []),
      ...(item.annotationsSecondary?.split(',') ?? [])
    ].map(t => t.trim()).filter(Boolean);

    let maxRegionMin = 0;

    for (const tag of tags) {
      const regionBoost = regionMinScore?.[tag];
      if (typeof regionBoost === 'number') {
        maxRegionMin = Math.max(maxRegionMin, regionBoost);
      }
    }

    if (maxRegionMin > item.relevanceScore) {
      item.relevanceScore = maxRegionMin;
      item.regionMinScoreApplied = true; // optional debug flag
    }
  }

  return items;
}

// === Score Utilities ===
function detectGenre(annotationsMain = '') {
  const tags = annotationsMain.split(',').map(t => t.trim());
  if (tags.includes('News')) {return 'News';}
  if (tags.includes('Feature') || tags.includes('Opinion')) {return 'Feature';}
  return 'Other';
}

function getDecayFactor(ageMs, halfLifeMs) {
  return Math.pow(0.5, ageMs / halfLifeMs);
}

function normalizeWeights(rawWeights) {
  const entries = Object.entries(rawWeights);
  const valid = entries.filter(([_, w]) => typeof w === 'number' && w >= 0 && w <= 1e6);
  const total = valid.reduce((sum, [_, w]) => sum + w, 0);
  if (total === 0) {
    console.warn('All weights are zero or invalid. Returning equal weights.');
    const equalWeight = 1 / valid.length;
    return Object.fromEntries(valid.map(([k]) => [k, equalWeight]));
  }
  return Object.fromEntries(valid.map(([k, w]) => [k, w / total]));
}



// === DOM Reordering ===
function reorderListWithScores(list, items) {
    const itemMap = new Map();
    for (const item of items) {
        itemMap.set(item.viewId, item);
    }

    const nodes = Array.from(list.children);
    const itemNodes = [];
    const otherNodes = [];

    for (const node of nodes) {
        if (node.classList?.contains('item-container') && itemMap.has(node.id)) {
            itemNodes.push(node);
        } else {
            otherNodes.push(node);
        }
    }

    itemNodes.sort((a, b) => {
        const scoreA = itemMap.get(a.id)?.finalScore ?? 0;
        const scoreB = itemMap.get(b.id)?.finalScore ?? 0;
        return scoreB - scoreA;
    });

    for (const node of itemNodes) {
        const item = itemMap.get(node.id);
        if (!item || typeof item.finalScore !== 'number') {
            console.warn(`Missing score for node ${node.id}`, item);
            continue;
        }
        node.setAttribute('data-score', item.finalScore.toFixed(4));
        node.setAttribute('data-editorial-score', (item.editorialScore ?? 0).toFixed(4));
        node.setAttribute('data-popularity-score', (item.popularityScore ?? 0).toFixed(4));
        node.setAttribute('data-relevance-score', (item.relevanceScore ?? 0).toFixed(4));
        node.setAttribute('data-read-minus-score', (item.readMinusScore ?? 0).toFixed(4));
        node.setAttribute('data-unseen-bonus-score', (item.unSeenItemBonus ?? 0).toFixed(4));
        node.setAttribute('data-genre-score', (GENRE_SCORE_MAP[item.genre] ?? 0).toFixed(2));
    }

    const newChildren = [];
    let itemIndex = 0;

    for (const node of nodes) {
        if (node.classList?.contains('item-container') && itemMap.has(node.id)) {
            newChildren.push(itemNodes[itemIndex++]);
        } else {
            newChildren.push(node);
        }
    }

    if (document.startViewTransition) {
        document.startViewTransition(() => {
            list.replaceChildren(...newChildren);
        });
    } else {
        list.replaceChildren(...newChildren);
    }

}


delegate.on('click', '.reorder-description a', function () {
  const preferredLanguage = (window.preferredLanguage || 'zh-CN').toLowerCase();
  let langKey = 'zh';
  if (preferredLanguage.startsWith('zh-tw')) {
    langKey = 'zh-TW';
  } else if (preferredLanguage.startsWith('zh-hk') || preferredLanguage.startsWith('zh-mo')) {
    langKey = 'zh-HK';
  }

  const labels = {
    'zh': {
      title: '内容推荐排序设置',
      editorial: '编辑推荐权重',
      popularity: '热门程度权重',
      relevance: '兴趣匹配权重',
      readPenalty: '已读内容靠后',
      freshnessBonus: '新内容提升优先级',
      save: '保存设置'
    },
    'zh-HK': {
      title: '內容推薦排序設定',
      editorial: '編輯推薦權重',
      popularity: '熱門程度權重',
      relevance: '興趣匹配權重',
      readPenalty: '已讀內容排後',
      freshnessBonus: '新內容提升優先級',
      save: '儲存設定'
    },
    'zh-TW': {
      title: '內容推薦排序設定',
      editorial: '編輯推薦權重',
      popularity: '熱門程度權重',
      relevance: '興趣匹配權重',
      readPenalty: '已讀內容往後排',
      freshnessBonus: '新內容優先顯示',
      save: '儲存設定'
    }
  };

  const t = labels[langKey] || labels.zh;

  const options = [
    { key: 'editorial', label: t.editorial, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'popularity', label: t.popularity, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'relevance', label: t.relevance, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'readPenalty', label: t.readPenalty, type: 'checkbox' },
    { key: 'freshnessBonus', label: t.freshnessBonus, type: 'checkbox' }
  ];

  // Remove existing
  document.querySelectorAll('.reorder-controls').forEach(e => e.remove());

  const wrapper = document.createElement('div');
  wrapper.className = 'items reorder-controls';

  const container = document.createElement('div');
  container.className = 'no-image';

  const inner = document.createElement('div');
  inner.className = 'item-inner';

  const lead = document.createElement('div');
  lead.className = 'item-lead';

  // Populate lead with settings
  const box = document.createElement('div');
  box.className = 'reorder-box';

  const title = document.createElement('h3');
  title.textContent = t.title;
  box.appendChild(title);

  options.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'reorder-row';

    if (opt.type === 'range') {
      const label = document.createElement('label');
      label.className = 'reorder-label';
      label.textContent = opt.label;

      const input = document.createElement('input');
      input.type = 'range';
      input.name = opt.key;
      input.min = opt.min;
      input.max = opt.max;
      input.step = opt.step;
      input.value = recommendationWeights[opt.key];
      input.className = 'reorder-slider';

      row.appendChild(label);
      row.appendChild(input);
    } else if (opt.type === 'checkbox') {
      const label = document.createElement('label');
      label.className = 'reorder-toggle-label';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = opt.key;
      input.checked = !!recommendationWeights[opt.key];
      input.className = 'reorder-toggle';

      label.appendChild(input);
      label.append(` ${opt.label}`);
      row.appendChild(label);
    }

    box.appendChild(row);
  });

  const buttonRow = document.createElement('div');
  buttonRow.className = 'reorder-row';
  const button = document.createElement('button');
  button.className = 'button button-primary reorder-save-button';
  button.dataset.action = 'reorderItems';
  button.textContent = t.save;
  buttonRow.appendChild(button);
  box.appendChild(buttonRow);

  lead.appendChild(box);
  inner.appendChild(lead);
  container.appendChild(inner);
  wrapper.appendChild(container);

  const desc = document.querySelector('.reorder-description');
  if (desc) {
    desc.parentNode.insertBefore(wrapper, desc.nextSibling);
  }
});




delegate.on('click', '[data-action="reorderItems"]', function () {
  // 1. Collect updated values
  const newWeights = {};

  document.querySelectorAll('.reorder-slider').forEach(input => {
    const key = input.name;
    const val = parseFloat(input.value);
    if (key && !isNaN(val)) {
      newWeights[key] = val;
    }
  });

  document.querySelectorAll('.reorder-toggle').forEach(input => {
    const key = input.name;
    newWeights[key] = !!input.checked;
  });

  // 2. Get existing preference
  let preference = {};
  try {
    preference = getMyPreference();
  } catch (err) {
    console.warn('Failed to read existing preference. Creating new one.', err);
    preference = {};
  }

  // 3. Merge weights and save
  preference.recommendationWeights = {
    ...preference.recommendationWeights,
    ...newWeights
  };

  try {
    localStorage.setItem('preference', JSON.stringify(preference));
  } catch (err) {
    console.error('Failed to save updated weights to localStorage', err);
  }

  // 4. Recalculate + reorder
  runRecommendationForDoms();

  // 5. Clean up UI
  document.querySelectorAll('.reorder-controls').forEach(e => e.remove());
});
