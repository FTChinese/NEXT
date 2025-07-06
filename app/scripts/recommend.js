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


// === Kickstart ===
runRecommendationForDoms();


// === Main Flow ===
function runRecommendationForDoms() {
  const lists = document.querySelectorAll('.list-reorder');
  if (lists.length === 0) {return;}

  updateFollows();

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
  }
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
//   console.log(`read ids: `, readIds);

  const rawWeights = {
    editorial: 2,
    popularity: 1,
    relevance: 3,
    genre: 0.2
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
    const readMinusScore = read ? 1 : 0;
    item.readMinusScore = readMinusScore;


    // For unseen items, which are updated after the score is last calculated, we want to raise it up
    const lastVisitTs = parseInt(localStorage.getItem('ftc-last-recommendation-ts'), 10) || 0;
    const unSeenItemBonus = updateTimestamp > lastVisitTs ? 1 : 0;
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


