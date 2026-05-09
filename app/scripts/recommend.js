/* global getMyPreference, savePreference, convertChinese, runLoadImages, markReadContent, GetCookie */
/* exported renderRecommendationForWebAppHome */

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
  ['data-sub-type', 'subtype'],
  ['data-ft-type', 'ft_type']
];

const CONTENT_CLASS_SCORE_MAP = {
  LiveBlogPackage: 1.0,
  LiveBlogPost: 1.0,
  Feature: 0.5,
  Opinion: 0.8,
  News: 1.0,
  Other: 0.5,
  Letter: 0.1,
  'Deep dive': 1.6
};

const TAG_DISPLAY_FALLBACKS = {
  Crossword: '填字游戏',
  'Deep dive': '深度解读',
  Explainer: '解读',
  Feature: '特写',
  Letter: '读者来信',
  News: '新闻',
  'News in-depth': '深度报道',
  Opinion: '观点',
  'The Big Read': 'FT大视野',
  'The Long View': '长线观点'
};

const attrToKeyMap = Object.fromEntries(attributeMap);

let followsSet = new Set();

const HOME_PAGE_RECOMMENDATION_CONTAINER_ID = 'home-page-recommendation-container';
const HOME_PAGE_RECOMMENDATION_LIMIT = 24;
// Keep raw recommendation objects out of DOM attributes. They include long annotations
// and scoring metadata, but are only needed in memory when users tweak ranking settings.
const recommendationItemsByContainer = new WeakMap();

// === Recommendation Weights ===
const recommendationWeights = {
  editorial: 20,
  popularity: 10,
  relevance: 30,
  readPenalty: true,
  tierPenalty: false,
  showAITranslation: false,
  freshnessBonus: true
};


// === Kickstart only for web page ===
if (!/^\/app/.test(top.location.pathname)) {
  console.log('recommending...');
  runRecommendationForDoms();
  displayRecommendationInContentPageLazy();
  displayHomePageRecommendation();
}


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

      if (item?.querySelector('.vip.locked')) {
        itemData.tier = 'premium';
      } else if (item?.querySelector('.locked')) {
        itemData.tier = 'standard';
      }

      items.push(itemData);
    }

    items = calculateScores(items);
    reorderListWithScores(list, items);
    showCustomisation(list);

    // Optional: show explanation reasons for reordered DOM lists too
    // (Safe to remove this line to disable reasons display)
    appendRecommendationReasons(list, items, window.preferredLanguage ?? 'zh-CN');
  }
}

function displayRecommendationInContentPageLazy(targetDom) {
  displayRecommendationLazy({
    targetDom,
    containerSelector: '.list-recommendation',
    limit: 6,
    filterCurrentContent: true
  });
}

function displayRecommendationLazy(options = {}) {
  const targetDom = options?.targetDom;
  const containerSelector = options?.containerSelector ?? '.list-recommendation';
  const limit = options?.limit ?? 6;
  const filterCurrentContent = options?.filterCurrentContent ?? true;
  const isInWebApp = options?.isInWebApp ?? false;
  const rootMargin = options?.rootMargin ?? '500px';
  const onEmpty = options?.onEmpty;

  let containers = document.querySelectorAll(containerSelector);
  if (targetDom) {
    containers = targetDom.querySelectorAll(containerSelector);
  }
  if (containers.length === 0) {return;}

  updateFollows();
  updateWeights();

  const observer = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {continue;}
      try {
        const source = getRecommendationSource(options);
        let items = await fetchRecommendations(source);
        if (filterCurrentContent) {
          items = filterOutCurrentContent(items);
        }
        items = selectRecommendations(items, { limit });

        if (items.length === 0) {
          if (typeof onEmpty === 'function') {
            onEmpty(entry.target);
          }
          observer.unobserve(entry.target);
          continue;
        }

        rememberRecommendationItems(entry.target, items);

        const html = await buildRecommendationHTML(items, window.preferredLanguage ?? 'zh-CN', isInWebApp);
        entry.target.innerHTML = html;

        appendRecommendationReasons(entry.target, items, window.preferredLanguage ?? 'zh-CN');
        showCustomisation(entry.target);
        if (options?.insertTitleForNextBlock) {
          insertTitleForNextHomeBlock();
        }

        observer.unobserve(entry.target);

        if (typeof runLoadImages === 'function') {
          runLoadImages();
        }
        if (typeof markReadContent === 'function') {
          markReadContent(entry.target);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    }
  }, { rootMargin });

  for (const container of containers) {
    observer.observe(container);
  }
}

function displayHomePageRecommendation() {
  const container = document.getElementById(HOME_PAGE_RECOMMENDATION_CONTAINER_ID);
  if (!container) {return;}
  if (!shouldShowHomePageRecommendation()) {
    container.hidden = true;
    container.innerHTML = '';
    return;
  }

  container.hidden = false;
  container.innerHTML = `
    <div class="block-container no-side home-page-recommendation-block">
      <div class="block-inner">
        <div class="content-container"><div class="content-inner">
          <div class="list-container"><div class="list-inner">
            <h2 class="list-title"><a class="list-link">我的FT</a></h2>
            <div class="card-grid list-recommendation home-page-recommendation-list"></div>
          </div></div>
        </div></div>
        <div class="clearfloat"></div>
      </div>
    </div>`;

  displayRecommendationLazy({
    targetDom: container,
    containerSelector: '.home-page-recommendation-list',
    limit: HOME_PAGE_RECOMMENDATION_LIMIT,
    source: 'all',
    filterCurrentContent: false,
    insertTitleForNextBlock: true,
    onEmpty: () => {
      container.hidden = true;
      container.innerHTML = '';
    }
  });
}

function insertTitleForNextHomeBlock() {
  const container = document.getElementById(HOME_PAGE_RECOMMENDATION_CONTAINER_ID);
  const nextBlock = container?.nextElementSibling;
  const listInner = nextBlock?.querySelector('.list-inner');
  if (!listInner || listInner.querySelector(':scope > .list-title')) {return;}

  const title = document.createElement('h2');
  title.className = 'list-title';
  title.innerHTML = '<a class="list-link">今日焦点</a>';
  listInner.insertBefore(title, listInner.firstChild);
}

function shouldShowHomePageRecommendation() {
  if (!isPremiumUser()) {return false;}
  const preference = getPreference();
  const showAITranslation =
    preference?.['Article Translation Preference'] === 'both' ||
    preference?.recommendationWeights?.showAITranslation === true;
  return preference?.['Home Page Preference'] === 'customized' &&
    showAITranslation;
}


// === Shared helpers for recommendation rendering ===
function getRecommendationSource(options = {}) {
  if (options?.source) {return options.source;}
  const preference = getPreference();
  const showAITranslation =
    preference?.['Article Translation Preference'] === 'both' ||
    preference?.recommendationWeights?.showAITranslation === true;
  return showAITranslation ? 'all' : 'ftchinese';
}

function getPreference() {
  if (typeof getMyPreference !== 'function') {return {};}
  return getMyPreference() ?? {};
}

function savePreferenceSafely(preference) {
  try {
    if (typeof savePreference === 'function') {
      savePreference(preference);
      return;
    }
    localStorage.setItem('preference', JSON.stringify(preference));
  } catch (err) {
    console.error('Failed to save preference:', err);
  }
}

function isPremiumUser() {
  if (window.gUserType === 'VIP') {return true;}
  if (typeof GetCookie !== 'function') {return false;}
  return GetCookie('paywall') === 'premium' || GetCookie('subscription_type') === 'premium';
}

async function fetchRecommendations(source = 'ftchinese') {
  let url = '/recommend';
  let method = 'POST';
  let body = JSON.stringify({ source });
  if (window.location.href.includes('localhost:3000/app.html')) {
    url = '/api/page/app-recommend.json';
    method = 'GET';
    body = undefined;
  }
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...body && {body}
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const items = await response.json();
  return Array.isArray(items) ? items : [];
}

function filterOutCurrentContent(items = []) {
  return (items ?? []).filter(item => item.type !== window.type || item.id !== window.id);
}

function selectRecommendations(items = [], { limit = 6 } = {}) {
  const scored = calculateScores(items).sort((a, b) => b.finalScore - a.finalScore);
  return scored.slice(0, limit);
}

async function buildRecommendationHTML(items = [], preferredLanguage = 'zh-CN', isInWebApp = false) {
  let html = '';
  for (const item of items) {
    const update = Math.round((item?.updateTimestamp ?? 0) / 1000);
    const type = item?.type ?? 'interactive';
    const id = item?.id ?? '';
    const ftid = item?.ftid ?? '';
    const keywords = item?.keywords ?? '';
    const cheadline = await convertRecommendationText(item?.cheadline ?? '', preferredLanguage);
    const clongleadbody = await convertRecommendationText(item?.clongleadbody ?? '', preferredLanguage);
    let lockClass = '';
    const tier = item?.tier ?? 'free';
    if (tier === 'premium') {
      lockClass = ' vip locked';
    } else if (tier === 'standard') {
      lockClass = ' locked';
    }

    const subtype = item?.subtype ?? '';
    const ftType = item?.ft_type ?? '';
    const subTypeMap = { FTArticle: 'bilingual' };
    const tierParameter = `?tier=${tier}`;
    const subtypeParameter = subtype !== '' && type === 'interactive' ? `&subtype=${subTypeMap[subtype] ?? subtype}` : '';
    const parameter = tierParameter + subtypeParameter;
    const articlePath = `/${type}/${id}${parameter}`;
    const linkHTML = isInWebApp ? '' : ` href="${articlePath}"`;
    const leadBodyHTML = `<div class="item-lead">${clongleadbody}</div>`;
    const leadHTML = isInWebApp ? leadBodyHTML : `<a ${linkHTML} target="_blank" class="item-lead-link">${leadBodyHTML}</a>`;
    const cardArticleUrlAttr = isInWebApp ? '' : ` data-article-url="${articlePath}"`;
    const ftTypeAttr = ftType ? ` data-ft-type="${ftType}"` : '';
    const scoreAttrs = buildRecommendationScoreAttrs(item);
    const imageUrl = item.pictures?.main ?? '';

    let imageHTML = '';
    let imageClass = 'no-image';

    if (imageUrl) {
      imageHTML = `<a ${linkHTML} class="image" target="_blank"><figure class="loading" data-url="${imageUrl}"></figure></a>`;
      imageClass = `has-image`;
    }

    // const mainTag = item?.matchedKeys?.[0] ?? keywords?.split(',').map(x=>x.trim()).filter(x => x)?.[0];
    // let themeHTML = '';
    // if (mainTag) {
    //   themeHTML = `<div class="item-tag"><a href="/tag/${mainTag}">${mainTag}</a><button class="myft-follow plus" data-tag="${mainTag}" data-type="tag">关注</button></div>`;
    // }

    const mainTag = item?.matchedKeys?.[0] ?? keywords?.split(',').map(x => x.trim()).filter(x => x)?.[0];

    let themeHTML = '';
    if (mainTag) {
      const escapedMainTag = escapeAttributeValue(mainTag);
      const tagHref = `/tag/${encodeURIComponent(mainTag)}`;
      const isFollowed = isRecommendationTagFollowed(item, mainTag);

      // minimal i18n for the button label
      const pl = (preferredLanguage || 'zh-CN').toLowerCase();
      const followText =
        pl.startsWith('zh-hk') ? (isFollowed ? '已關注' : '關注') :
        pl.startsWith('zh-tw') ? (isFollowed ? '已關注' : '關注') :
        (isFollowed ? '已关注' : '关注');

      // class mapping to match existing UI style: plus / tick
      const followClass = isFollowed ? 'tick' : 'plus';
      const preferenceAttrs = getFollowPreferenceAttrs(item, mainTag, preferredLanguage);

      themeHTML = `<div class="item-tag">
        <a href="${tagHref}">${escapedMainTag}</a>
        <button class="myft-follow ${followClass}" data-tag="${escapedMainTag}" data-type="tag"${preferenceAttrs}>${followText}</button>
      </div>`;
    }


    html += `<div class="item-container ${imageClass} item-container-app" data-id="${id}" data-type="${type}" data-sub-type="${subtype}" data-keywords="${keywords}" data-update="${update}" data-ft-id="${ftid}"${ftTypeAttr}${cardArticleUrlAttr}${scoreAttrs}>
      <div class="item-inner">
        <div class="item-headline-lead">
          <h2 class="item-headline">
            ${themeHTML}
            <a ${linkHTML} target="_blank" class="item-headline-link${lockClass}">${cheadline}</a>
          </h2>
          ${imageHTML}
          ${leadHTML}
          <div class="item-bottom"></div>
        </div>
      </div>
    </div>`;
  }
  return html;
}

function buildRecommendationScoreAttrs(item) {
  const scoreAttrs = [
    ['data-score', item?.finalScore, 4],
    ['data-editorial-score', item?.editorialScore, 4],
    ['data-popularity-score', item?.popularityScore, 4],
    ['data-relevance-score', item?.relevanceScore, 4],
    ['data-relevance-raw', item?.relevanceRaw, 4],
    ['data-read-minus-score', item?.readMinusScore, 4],
    ['data-unseen-bonus-score', item?.unSeenItemBonus, 4],
    ['data-decay-factor', item?.decayFactor, 4],
    ['data-content-class-score', CONTENT_CLASS_SCORE_MAP[item?.contentClass] ?? undefined, 2]
  ];

  let html = scoreAttrs.map(([name, value, precision]) => {
    const score = parseFloat(value);
    if (!Number.isFinite(score)) {return '';}
    return ` ${name}="${score.toFixed(precision)}"`;
  }).join('');

  if (item?.contentClass) {
    html += ` data-content-class="${escapeAttributeValue(item.contentClass)}"`;
  }
  if (Array.isArray(item?.matchedKeys) && item.matchedKeys.length > 0) {
    html += ` data-matched-keys="${escapeAttributeValue(item.matchedKeys.join(', '))}"`;
  }
  if (Array.isArray(item?.relevanceMatches) && item.relevanceMatches.length > 0) {
    html += ` data-relevance-matches="${escapeAttributeValue(item.relevanceMatches.map(formatRelevanceMatch).join('; '))}"`;
  }
  if (item?.regionMinScoreApplied === true) {
    html += ` data-region-min-score-applied="true"`;
  }
  return html;
}

function formatRelevanceMatch(match) {
  const key = match?.key ?? '';
  const display = match?.display ?? '';
  const label = display && display !== key ? `${display}(${key})` : key;
  const points = parseFloat(match?.points);
  const pointText = Number.isFinite(points) ? `+${points.toFixed(1)}` : '';
  return `${match?.source ?? 'match'}:${label}${pointText}`;
}

function escapeAttributeValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function rememberRecommendationItems(container, items) {
  if (!container || !Array.isArray(items)) {return;}
  recommendationItemsByContainer.set(container, items);
}

function getRememberedRecommendationItems(container) {
  return recommendationItemsByContainer.get(container) || [];
}

async function convertRecommendationText(text, preferredLanguage) {
  if (typeof convertChinese !== 'function') {return text;}
  return convertChinese(text, preferredLanguage);
}

/**
 * Recommendation cards are rendered from API data after page load.
 * On touch devices many taps land on image/lead/card whitespace instead of the headline text anchor.
 * We treat the card body as a navigation hit area while preserving dedicated controls (tag/follow).
 */
delegate.on('click', '.list-recommendation .item-container-app', function (event) {
  if (event?.defaultPrevented) {
    return;
  }
  // Web app shell has its own click routing in app-nav.js; avoid double handling.
  if (/^\/app/.test(top.location.pathname)) {
    return;
  }
  // Let native anchor/button behavior fire first so iOS/Android webviews see a true link activation.
  if (event?.target?.closest('a[href], button')) {
    return;
  }

  const href = this.getAttribute('data-article-url') || this.querySelector('.item-headline-link[href]')?.getAttribute('href');
  if (!href) {
    return;
  }
  event.preventDefault();
  if (typeof window.openLink === 'function') {
    window.openLink(href);
    return;
  }
  window.location.href = href;
});

function getFollowPreferenceAttrs(item, mainTag, preferredLanguage = 'zh-CN') {
  const annotation = findAnnotationForTag(item, mainTag);
  if (!annotation || !annotation.prefLabel) {return '';}

  const key = annotation.prefLabel;
  const field = annotation.field || mapAnnotationField(annotation);
  if (!field) {return '';}

  let display = getAnnotationDisplay(annotation);
  if (!display) {
    display = mainTag || key;
  }
  const lang = (preferredLanguage || '').toLowerCase();
  if (lang.startsWith('en')) {
    display = key;
  }

  return ` data-key="${escapeAttributeValue(key)}" data-field="${escapeAttributeValue(field)}" data-display="${escapeAttributeValue(display)}"`;
}

function findAnnotationForTag(item, mainTag) {
  if (!item || !mainTag) {return null;}
  const annotations = Array.isArray(item.annotations) ? item.annotations : [];
  if (annotations.length === 0) {return null;}

  const normalizedTag = normalizeAnnotationValue(mainTag);
  const normalizedTagUpper = normalizedTag.toUpperCase();
  let displayMatch = null;
  let prefMatch = null;

  for (const annotation of annotations) {
    const prefLabel = annotation?.prefLabel || '';
    if (!prefLabel) {continue;}
    const display = getAnnotationDisplay(annotation);
    const normalizedDisplay = normalizeAnnotationValue(display);
    if (normalizedDisplay && normalizedDisplay === normalizedTag) {
      if (/hasDisplayTag/i.test(annotation.predicate || '')) {
        return annotation;
      }
      displayMatch = displayMatch || annotation;
    }
    if (prefLabel.toUpperCase() === normalizedTagUpper) {
      prefMatch = prefMatch || annotation;
    }
  }

  return displayMatch || prefMatch;
}

function getAnnotationDisplay(annotation) {
  if (!annotation) {return '';}
  return annotation.display || annotation.translation || getFallbackTagDisplay(annotation.prefLabel);
}

function getFallbackTagDisplay(key) {
  return TAG_DISPLAY_FALLBACKS[key] || '';
}

function isRecommendationTagFollowed(item, tag) {
  if (!tag) {return false;}
  if (followsSet.has(tag)) {return true;}
  const annotation = findAnnotationForTag(item, tag);
  if (!annotation) {return false;}

  const candidates = [
    annotation.prefLabel,
    annotation.display,
    annotation.translation,
    getFallbackTagDisplay(annotation.prefLabel)
  ];

  for (const candidate of candidates) {
    if (candidate && followsSet.has(candidate)) {return true;}
  }

  return false;
}

function normalizeAnnotationValue(value) {
  if (!value || typeof value !== 'string') {return '';}
  let result = value;
  try {
    if (value.includes('%')) {
      result = decodeURIComponent(value);
    }
  } catch (err) {}
  return result.trim();
}

function mapAnnotationField(annotation) {
  const rawType = (annotation?.type || '').toString().trim();
  if (!rawType) {return '';}
  const type = rawType.toUpperCase();
  if (type === 'GENRE') {return 'genres';}
  if (type === 'LOCATION') {return 'regions';}
  if (type === 'ORGANISATION' || type === 'ORGANIZATION') {return 'organisations';}
  if (type === 'PERSON') {
    return /hasAuthor/i.test(annotation.predicate || '') ? 'byline' : 'topics';
  }
  if (type === 'TOPIC') {return 'topics';}
  if (type === 'BRAND') {return 'brand';}
  return '';
}

async function renderRecommendationForWebAppHome(targetDom) {
  if (!targetDom) { return; }
  try {
    targetDom.innerHTML = `<div class="app-loading"><div class="spinner"></div></div>`;
    updateFollows();
    updateWeights();

    const source = getRecommendationSource();
    let items = await fetchRecommendations(source);
    items = selectRecommendations(items, { limit: 36 });

    const html = await buildRecommendationHTML(items, window.preferredLanguage ?? 'zh-CN', true);
    const container = document.createElement('div');
    container.innerHTML = `<div class="block-container"><div class="block-inner"><div class="list-container"><div class="list-inner customisation-container"></div></div><div class="list-container"><div class="list-inner list-recommendation card-grid">${html}</div></div></div></div>`;

    targetDom.innerHTML = '';
    targetDom.appendChild(container);

    let customisationEle = container.querySelector('.customisation-container');
    showCustomisation(customisationEle);

    // ✅ Optional: show explanation reasons (safe to remove)
    const recList = container.querySelector('.list-recommendation');
    rememberRecommendationItems(recList, items);
    appendRecommendationReasons(recList, items, window.preferredLanguage ?? 'zh-CN');

    runLoadImages();
    if (typeof markReadContent === 'function') {
      markReadContent(container);
    }
  } catch (err) {
    console.error('render recommendation for home error:', err);
    targetDom.innerHTML = '<p class="highlight">加载推荐内容失败</p>';
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


// === Optional: explanation reasons (FT-style, fully removable) ===
function appendRecommendationReasons(container, items = [], preferredLanguage = 'zh-CN') {
  if (!container || !Array.isArray(items) || items.length === 0) { return; }

  // console.log(`items: `, JSON.stringify(items, null, 2));

  const lang = (preferredLanguage || 'zh-CN').toLowerCase();

  // FT-style wording (editorial tone, avoid product ambiguity)
  const TEXT = {
    zh: {
      editorial: '编辑推荐',
      popularity: '热门',
      scoop: '独家',
    },
    'zh-hk': {
      editorial: '編輯推薦',
      popularity: '熱門',
      scoop: '獨家',
    },
    'zh-tw': {
      editorial: '編輯推薦',
      popularity: '熱門',
      scoop: '獨家',
    }
  };


  const t =
    lang.startsWith('zh-hk') ? TEXT['zh-hk'] :
    lang.startsWith('zh-tw') ? TEXT['zh-tw'] :
    TEXT.zh;

  // Build quick lookup: type::id -> item
  const byKey = new Map();
  for (const item of items) {
    const key = `${item?.type ?? ''}::${item?.id ?? ''}`;
    byKey.set(key, item);
  }

  const nodes = container.querySelectorAll('.item-container');

  for (const node of nodes) {
    const id = node.getAttribute('data-id') || '';
    const type = node.getAttribute('data-type') || '';
    const item = byKey.get(`${type}::${id}`);
    if (!item) { continue; }

    const reasons = [];


    // 1 Interest match: show tag only (but avoid duplicating the Theme tag)
    if (item.matchedKeys && item.matchedKeys.length > 0) {
      const matched = item.matchedKeys[0];

      // Theme tag text (if any)
      const themeTagText = node.querySelector('.item-tag a')?.textContent?.trim() || '';

      if (!themeTagText || themeTagText !== matched) {
        reasons.push(matched);
      }
    }


    // 2 Editorial recommendation
    if ((parseFloat(item.editorialScore) || 0) >= 0.7) {
      reasons.push(t.editorial);
    }

    // 3 Popular / trending
    if ((parseFloat(item.popularityScore) || 0) >= 0.7) {
      reasons.push(t.popularity);
    }

    // 4 scoop
    if (item?.scoop === true) {
      reasons.push(t.scoop);
    }

    // If there is no meaningful reason, show nothing
    if (reasons.length === 0) {
      // If the DOM already has reasons from previous render, remove them
      const existing = node.querySelector('.recommendation-reasons');
      if (existing) { existing.remove(); }
      continue;
    }

    // Limit to 2 reasons max to avoid noise
    const limited = reasons.slice(0, 2);

    let box = node.querySelector('.recommendation-reasons');
    if (!box) {
      box = document.createElement('div');
      box.className = 'recommendation-reasons';

      // Place under lead (least intrusive)
      const lead = node.querySelector('.item-lead');
      if (lead && lead.parentNode) {
        lead.insertAdjacentElement('afterend', box);
      } else {
        // Fallback
        const target =
          node.querySelector('.item-headline-lead') ||
          node.querySelector('.item-inner') ||
          node;
        target.appendChild(box);
      }
    }

    // ✅ Rebuild children so the UI stays consistent after rerender
    box.innerHTML = '';
    for (const reason of limited) {
      const span = document.createElement('span');
      span.className = 'recommendation-reason';
      span.textContent = reason;
      box.appendChild(span);
    }
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

  const CONTENT_CLASS_HALFLIFE_IN_HOURS = {
    LiveBlogPackage: 1,
    LiveBlogPost: 1,
    News: 6,
    Feature: 12,
    Opinion: 12,
    'Deep dive': 48,
    Other: 12
  };

  const now = Date.now();
  const lastVisitTs = parseInt(localStorage.getItem('ftc-last-recommendation-ts'), 10) || 0;

  // ✅ Precompute updateTimestamp once + compute max once (O(n))
  let mostRecentUpdateTs = 0;
  for (const item of items) {
    const rawUpdate = parseInt(item.update, 10);
    const updateTimestamp = !isNaN(rawUpdate) ? rawUpdate * 1000 : now - 3 * 24 * 60 * 60 * 1000;
    item.updateTimestamp = updateTimestamp;
    if (updateTimestamp > mostRecentUpdateTs) { mostRecentUpdateTs = updateTimestamp; }
  }

  for (const item of items) {
    const updateTimestamp = item.updateTimestamp || (now - 3 * 24 * 60 * 60 * 1000);
    const ageMs = now - updateTimestamp;
    const contentClass = detectContentClass(item.annotationsMain, item.subtype, item.ft_type);

    const halfLifeMs = (CONTENT_CLASS_HALFLIFE_IN_HOURS[contentClass] || CONTENT_CLASS_HALFLIFE_IN_HOURS.Other) * 60 * 60 * 1000;

    const editorialScore = parseFloat(item.editorialScore) || 0;
    const popularityScore = parseFloat(item.popularityScore) || 0;
    const relevanceScore = parseFloat(item.relevanceScore) || 0;
    const contentClassScore = CONTENT_CLASS_SCORE_MAP[contentClass] || CONTENT_CLASS_SCORE_MAP.Other;



    const weightedScore =
      editorialScore * WEIGHTS.editorial +
      popularityScore * WEIGHTS.popularity +
      relevanceScore * WEIGHTS.relevance +
      contentClassScore * WEIGHTS.genre;

    const decayFactor = getDecayFactor(ageMs, halfLifeMs);
    const finalScore = weightedScore * decayFactor;

    item.contentClass = contentClass;
    item.decayFactor = decayFactor;

    const itemTypeMap = {premium: 'story'};
    const itemType = itemTypeMap[item?.type ?? ''] ?? item?.type;
    const itemTypeId = `${itemType}${item?.id ?? ''}`;
    const ftid = item?.ftid ?? '';
    const id = item?.id ?? '';

    const read = readIds.has(ftid) || readIds.has(itemTypeId) || readIds.has(id);
    const readMinusScore = read ? (recommendationWeights.readPenalty ? 1 : 0) : 0;
    item.readMinusScore = readMinusScore;

    let tierPenalty = 0;
    const contentTier = item.tier;
    if (contentTier) {
      const userTier = GetCookie('subscription_type');
      if (userTier === 'standard') {
        tierPenalty = contentTier === 'premium' ? 1 : 0;
      } else if (userTier !== 'premium') {
        tierPenalty = 1;
      }
    }

    const unSeenItemBonus = updateTimestamp > lastVisitTs ? (recommendationWeights.freshnessBonus ? 1 : 0) : 0;
    item.unSeenItemBonus = unSeenItemBonus;

    item.finalScore = parseFloat(finalScore.toFixed(4)) - readMinusScore - tierPenalty + unSeenItemBonus;


    // if (contentClass === 'LiveBlogPost') {
    //   console.log(`LiveBlogPost item: ${contentClassScore}, final: ${item.finalScore}, `, item, );
    // }
  }

  // ✅ One write (same semantics)
  localStorage.setItem('ftc-last-recommendation-ts', String(mostRecentUpdateTs));

  return items;
}


function updateFollows() {
  // ✅ Reset to avoid stale or ever-growing follows in this module
  followsSet = new Set();

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
            if (value) {followsSet.add(value);}
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
          followsSet.add(interest.key);
        }
      }
    }
  } catch (err) {
    console.warn('Failed to parse preference:', err);
  }
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
    let matchedKeys = [];
    let relevanceMatches = [];

    const mainTags = splitUniqueTags(item.annotationsMain);
    const secondaryTags = splitUniqueTags(item.annotationsSecondary);
    const keywords = splitUniqueTags(item.keywords);

    for (const tag of mainTags) {
      if (followsSet.has(tag)) {
        score += WEIGHTS.main;
        hasMainMatch = true;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, 'main', tag, WEIGHTS.main);
      }
    }

    for (const tag of secondaryTags) {
      if (followsSet.has(tag)) {
        score += WEIGHTS.secondary;
        hasSecondaryMatch = true;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, 'secondary', tag, WEIGHTS.secondary);
      }
    }

    for (const [i, tag] of keywords.entries()) {
      if (followsSet.has(tag)) {
        const points = i === 0 ? WEIGHTS.keywordPrimary : WEIGHTS.keywordOther;
        score += points;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, i === 0 ? 'keywordPrimary' : 'keywordOther', tag, points);
      }
    }

    if (hasMainMatch) {
      score += BASE_MATCH_BOOST.main;
      relevanceMatches.push({
        source: 'mainBoost',
        key: 'base',
        display: 'main match boost',
        points: BASE_MATCH_BOOST.main
      });
    } else if (hasSecondaryMatch) {
      score += BASE_MATCH_BOOST.secondary;
      relevanceMatches.push({
        source: 'secondaryBoost',
        key: 'base',
        display: 'secondary match boost',
        points: BASE_MATCH_BOOST.secondary
      });
    }

    item.relevanceRaw = score;
    item.matchedKeys = matchedKeys;
    item.relevanceMatches = relevanceMatches;
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
      ...splitUniqueTags(item.annotationsMain),
      ...splitUniqueTags(item.annotationsSecondary)
    ];

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
function addRelevanceMatch(item, relevanceMatches, matchedKeys, source, key, points) {
  const display = getRelevanceMatchDisplay(item, key);
  relevanceMatches.push({ source, key, display, points });
  if (display && !matchedKeys.includes(display)) {
    matchedKeys.push(display);
  }
}

function getRelevanceMatchDisplay(item, key) {
  const annotation = findAnnotationForTag(item, key);
  return getAnnotationDisplay(annotation) || getFallbackTagDisplay(key) || key;
}

function detectContentClass(annotationsMain = '', subtype = '', ftType = '') {
  const tags = splitUniqueTags(annotationsMain);
  if (ftType === 'LiveBlogPackage' || ftType === 'LiveBlogPost') {return ftType;}
  if (subtype === 'LiveBlogPackage') {return subtype;}
  if (tags.includes('News')) {return 'News';}
  if (tags.includes('Deep dive')) {return 'Deep dive';}
  if (tags.includes('Opinion')) {return 'Opinion';}
  if (tags.includes('Letter')) {return 'Letter';}
  if (tags.includes('Feature')) {return 'Feature';}
  return 'Other';
}

function splitUniqueTags(value = '') {
  if (!value || typeof value !== 'string') {return [];}
  const tags = [];
  const seen = new Set();

  for (const rawTag of value.split(',')) {
    const tag = rawTag.trim();
    if (!tag) {continue;}
    const key = normalizeAnnotationValue(tag).toUpperCase();
    if (seen.has(key)) {continue;}
    seen.add(key);
    tags.push(tag);
  }

  return tags;
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
    node.setAttribute('data-content-class-score', (CONTENT_CLASS_SCORE_MAP[item.contentClass] ?? 0).toFixed(2));
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


delegate.on('click', '.reorder-description a', function (event) {
  event.preventDefault();

  updateFollows();
  updateWeights();

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
      tierPenalty: '没有权限的内容靠后',
      showAITranslation: '显示AI翻译的内容',
      freshnessBonus: '新内容提升优先级',
      customHomePage: '自定义主页',
      save: '保存设置'
    },
    'zh-HK': {
      title: '內容推薦排序設定',
      editorial: '編輯推薦權重',
      popularity: '熱門程度權重',
      relevance: '興趣匹配權重',
      readPenalty: '已讀內容排後',
      tierPenalty: '無閱讀權限內容排後',
      showAITranslation: '顯示AI翻譯的內容',
      freshnessBonus: '新內容提升優先級',
      customHomePage: '自訂首頁',
      save: '儲存設定'
    },
    'zh-TW': {
      title: '內容推薦排序設定',
      editorial: '編輯推薦權重',
      popularity: '熱門程度權重',
      relevance: '興趣匹配權重',
      readPenalty: '已讀內容往後排',
      tierPenalty: '無閱讀權限的內容往後排',
      showAITranslation: '顯示AI翻譯的內容',
      freshnessBonus: '新內容優先顯示',
      customHomePage: '自訂首頁',
      save: '儲存設定'
    }
  };

  const t = labels[langKey] || labels.zh;

  const options = [
    { key: 'editorial', label: t.editorial, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'popularity', label: t.popularity, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'relevance', label: t.relevance, type: 'range', min: 0, max: 100, step: 0.1 },
    { key: 'readPenalty', label: t.readPenalty, type: 'checkbox' },
    { key: 'tierPenalty', label: t.tierPenalty, type: 'checkbox' },
    { key: 'showAITranslation', label: t.showAITranslation, type: 'checkbox' },
    { key: 'freshnessBonus', label: t.freshnessBonus, type: 'checkbox' },
    {
      key: 'homePagePreference',
      label: t.customHomePage,
      type: 'checkbox',
      preferenceKey: 'Home Page Preference',
      checkedValue: 'customized',
      uncheckedValue: 'default'
    }
  ];
  const currentPreference = getPreference();

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
      if (opt.preferenceKey) {
        input.checked = currentPreference?.[opt.preferenceKey] === opt.checkedValue;
        input.dataset.preferenceKey = opt.preferenceKey;
        input.dataset.checkedValue = opt.checkedValue;
        input.dataset.uncheckedValue = opt.uncheckedValue;
      } else {
        input.checked = !!recommendationWeights[opt.key];
      }
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

  const desc = this.closest('.reorder-description'); // scope to clicked banner
  if (desc) {
    desc.parentNode.insertBefore(wrapper, desc.nextSibling);
  }
});


delegate.on('click', '[data-action="reorderItems"]', function () {
  // 1. Collect updated values
  const newWeights = {};
  let preference = {};
  try {
    preference = getMyPreference();
  } catch (err) {
    console.warn('Failed to read existing preference. Creating new one.', err);
    preference = {};
  }

  document.querySelectorAll('.reorder-slider').forEach(input => {
    const key = input.name;
    const val = parseFloat(input.value);
    if (key && !isNaN(val)) {
      newWeights[key] = val;
    }
  });

  document.querySelectorAll('.reorder-toggle').forEach(input => {
    if (input.dataset.preferenceKey) {
      preference[input.dataset.preferenceKey] = input.checked ?
        input.dataset.checkedValue :
        input.dataset.uncheckedValue;
      return;
    }
    const key = input.name;
    newWeights[key] = !!input.checked;
  });

  // 3. Merge weights and save
  preference.recommendationWeights = {
    ...preference.recommendationWeights,
    ...newWeights
  };

  savePreferenceSafely(preference);

  // 4a. Recalculate + reorder
  runRecommendationForDoms();
  displayHomePageRecommendation();

  // 4b. ALSO refresh any lazy recommendation containers that already rendered
  (async () => {
    const preferredLanguage = window.preferredLanguage ?? 'zh-CN';
    const containers = document.querySelectorAll('.list-recommendation');

    for (const container of containers) {
      const items = getRememberedRecommendationItems(container);
      if (!Array.isArray(items) || items.length === 0) {continue;}

      // Re-score with new weights and re-render
      const limit = container.classList.contains('home-page-recommendation-list') ?
        HOME_PAGE_RECOMMENDATION_LIMIT :
        6;
      let recalced = calculateScores(items).sort((a, b) => b.finalScore - a.finalScore).slice(0, limit);

      // ✅ Reuse the same template renderer to keep UI consistent
      const html = await buildRecommendationHTML(recalced, preferredLanguage, false);
      container.innerHTML = html;

      // ✅ Optional: show explanation reasons (safe to remove)
      appendRecommendationReasons(container, recalced, preferredLanguage);

      runLoadImages();
      if (typeof markReadContent === 'function') {
        markReadContent(container);
      }
    }
  })();

  // 5. Clean up UI
  document.querySelectorAll('.reorder-controls').forEach(e => e.remove());
});
