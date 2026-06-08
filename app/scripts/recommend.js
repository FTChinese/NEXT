/* global getMyPreference, savePreference, convertChinese, runLoadImages, markReadContent, updateHeadlineLocks, GetCookie, Android, webkit, AbortController, Blob */
/* exported renderRecommendationForWebAppHome, renderHomePageRecommendationNow, renderFTGlobalCurationEntry, shouldShowHomePageRecommendation, getFTGlobalCurationEntryState, syncPreferenceForFTGlobalCurationOptIn, getPremiumPreferenceGate */

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
  Correction: 0.05,
  Crossword: 0.05,
  EndpointsNews: 0.2,
  FTAVFurtherReading: 0.2,
  FTSchools: 0.05,
  Letter: 0.1,
  'Deep dive': 1.6
};

const LOW_PRIORITY_CONTENT_FORMATS = [
  {
    contentClass: 'Crossword',
    penalty: 0.5,
    signals: ['Crossword', 'Puzzles and games', '填字游戏'],
    headlinePattern: /填字游戏|crossword/i
  },
  {
    contentClass: 'FTSchools',
    penalty: 0.5,
    signals: ['FT Schools', 'FT Schools geography', 'FT Schools economics', 'FT学校']
  },
  {
    contentClass: 'Letter',
    penalty: 0.4,
    signals: ['Letter', '读者来信']
  },
  {
    contentClass: 'Correction',
    penalty: 0.4,
    signals: ['Correction', '更正'],
    headlinePattern: /^更正[:：]|^Correction[:：]?/i
  },
  {
    contentClass: 'EndpointsNews',
    penalty: 0.6,
    signals: ['Endpoints News']
  },
  {
    contentClass: 'FTAVFurtherReading',
    penalty: 0.6,
    signals: ['FTAV', 'FTAV延伸阅读', 'FTAV的进一步阅读', 'FTAV’s further reading', 'FTAV\'s further reading'],
    headlinePattern: /FTAV\s*(?:延伸阅读|的进一步阅读)|FTAV(?:'|’)?s\s+further\s+reading/i
  }
];

const LOW_PRIORITY_CONTENT_FORMAT_MAP = Object.fromEntries(
  LOW_PRIORITY_CONTENT_FORMATS.map(format => [format.contentClass, format])
);

const TAG_DISPLAY_FALLBACKS = {
  Correction: '更正',
  Crossword: '填字游戏',
  'Deep dive': '深度解读',
  EndpointsNews: 'Endpoints News',
  Explainer: '解读',
  Feature: '特写',
  FTAVFurtherReading: 'FTAV延伸阅读',
  'FT Schools': 'FT学校',
  'FT Schools economics': 'FT学校',
  'FT Schools geography': 'FT学校',
  Letter: '读者来信',
  News: '新闻',
  'News in-depth': '深度报道',
  Opinion: '观点',
  'The Big Read': 'FT大视野',
  'The Long View': '长线观点'
};

const attrToKeyMap = Object.fromEntries(attributeMap);

let followsSet = new Set();
let followedInterestIndex = createFollowedInterestIndex();

const HOME_PAGE_RECOMMENDATION_CONTAINER_ID = 'home-page-recommendation-container';
const HOME_PAGE_RECOMMENDATION_LIMIT = 24;
const NATIVE_HOME_PAGE_RECOMMENDATION_TIMEOUT_MS = 30000;
const HOME_PAGE_RECOMMENDATION_TRACK_ENDPOINT = '/track_ft_global_curation';
const HOME_PAGE_RECOMMENDATION_TRACK_THROTTLE_MS = 2000;
const FT_GLOBAL_CURATION_ENTRY_SEEN_RATIO = 0.5;
const FT_GLOBAL_CURATION_ENTRY_SEEN_MS = 1000;
const HOME_PAGE_PREFERENCE_KEY = 'Home Page Preference';
const ARTICLE_TRANSLATION_PREFERENCE_KEY = 'Article Translation Preference';
const CUSTOM_HOME_PAGE_PREFERENCE_VALUE = 'customized';
const BOTH_TRANSLATION_PREFERENCE_VALUE = 'both';
const HUMAN_TRANSLATION_PREFERENCE_VALUE = 'human';
const RECOMMENDATION_SOURCE_ALL = 'all';
const RECOMMENDATION_SOURCE_FTCHINESE = 'ftchinese';
const FT_GLOBAL_CURATION_STATE_ENABLED = 'enabled';
const FT_GLOBAL_CURATION_STATE_ELIGIBLE = 'eligible';
const FT_GLOBAL_CURATION_STATE_GATED = 'gated';
const FT_GLOBAL_CURATION_STATE_HIDDEN = 'hidden';
const FT_GLOBAL_CURATION_ENTRY_DISMISS_DAYS = 30;
const FT_GLOBAL_CURATION_ENTRY_DISMISS_KEY_PREFIX = 'ft-global-curation-entry-dismissed-until';
const FT_GLOBAL_CURATION_FOLLOW_PROMPT_MIN_FOLLOWS = 3;
const FT_GLOBAL_CURATION_FOLLOW_PROMPT_LIMIT = 6;
const FT_GLOBAL_CURATION_FOLLOW_PROMPT_DISMISS_DAYS = 30;
const FT_GLOBAL_CURATION_FOLLOW_PROMPT_DISMISS_KEY_PREFIX = 'ft-global-curation-follow-prompt-dismissed-until';
// Cold-start chips borrow the broad, durable follow topics from Chatbot settings.
// They should not surface article-specific companies, authors, columns, or formats.
const FT_GLOBAL_CURATION_COLD_START_FOLLOW_TOPICS = [
  {key: 'China', field: 'regions', display: '中国', aliases: ['中国']},
  {key: 'Artificial intelligence', field: 'topics', display: '人工智能', aliases: ['AI']},
  {key: 'Chinese business & finance', field: 'topics', display: '中国商业与金融'},
  {key: 'Technology Sector', field: 'topics', display: '科技', aliases: ['Technology sector', '科技行业', '科技产业']},
  {key: 'Economy', field: 'topics', display: '经济'},
  {key: 'Markets', field: 'topics', display: '金融市场', aliases: ['市场']},
  {key: 'Climate change', field: 'topics', display: '气候变化'},
  {key: 'Electric vehicles', field: 'topics', display: '电动汽车'},
  {key: 'Semiconductors', field: 'topics', display: '半导体'},
  {key: 'Cryptocurrencies', field: 'topics', display: '加密货币'},
  {key: 'Work & Careers', field: 'topics', display: '职场'},
  {key: 'Personal Finance', field: 'topics', display: '个人理财'}
];
const PREMIUM_ONLY_PREFERENCE_VALUES = {
  [HOME_PAGE_PREFERENCE_KEY]: CUSTOM_HOME_PAGE_PREFERENCE_VALUE
};
const FT_EXCLUSIVE_CURATION_TEXTS = {
  zh: {
    title: 'FT全球臻享',
    description: '更及时获取更多FT全球内容，包括AI翻译加速上线的深度报道、分析和观点，并按您的偏好排序。<a href="#">点击这里自定义</a>',
    humanOnlyDescription: '当前仅显示FT中文网已上线内容，并按您的偏好排序。开启AI翻译后，可更及时获取更多FT全球深度报道、分析和观点。<a href="#">点击这里自定义</a>',
    entryDescription: '高端会员可在首页开启FT全球臻享，更及时获取更多FT全球内容，并按您的偏好排序。',
    entryAction: '开启',
    entryDismiss: '关闭',
    entrySaving: '正在开启...',
    entryFailed: '暂时无法保存设置，请稍后重试。',
    loading: '正在加载FT全球臻享',
    empty: '暂时没有新的FT全球臻享内容，请稍后刷新。',
    timeout: 'FT全球臻享加载较慢，请点击重试。',
    failed: 'FT全球臻享暂时无法加载，请点击重试。',
    retry: '点击这里重试',
    followPrompt: '关注几个话题，FT全球臻享会更贴近你的兴趣：',
    followPromptFollow: '关注',
    followPromptFollowing: '已关注',
    followPromptDismiss: '关闭'
  },
  'zh-HK': {
    title: 'FT全球臻享',
    description: '更及時獲取更多FT全球內容，包括AI翻譯加速上線的深度報道、分析和觀點，並按您的偏好排序。<a href="#">點擊這裡自定義</a>',
    humanOnlyDescription: '當前僅顯示FT中文網已上線內容，並按您的偏好排序。開啟AI翻譯後，可更及時獲取更多FT全球深度報道、分析和觀點。<a href="#">點擊這裡自定義</a>',
    entryDescription: '高端會員可在首頁開啟FT全球臻享，更及時獲取更多FT全球內容，並按您的偏好排序。',
    entryAction: '開啟',
    entryDismiss: '關閉',
    entrySaving: '正在開啟...',
    entryFailed: '暫時無法儲存設定，請稍後重試。',
    loading: '正在載入FT全球臻享',
    empty: '暫時沒有新的FT全球臻享內容，請稍後刷新。',
    timeout: 'FT全球臻享載入較慢，請點擊重試。',
    failed: 'FT全球臻享暫時無法載入，請點擊重試。',
    retry: '點擊這裡重試',
    followPrompt: '關注幾個話題，FT全球臻享會更貼近你的興趣：',
    followPromptFollow: '關注',
    followPromptFollowing: '已關注',
    followPromptDismiss: '關閉'
  },
  'zh-TW': {
    title: 'FT全球臻享',
    description: '更即時取得更多FT全球內容，包括AI翻譯加速上線的深度報導、分析和觀點，並按您的偏好排序。<a href="#">點擊這裡自訂</a>',
    humanOnlyDescription: '目前僅顯示FT中文網已上線內容，並按您的偏好排序。開啟AI翻譯後，可更即時取得更多FT全球深度報導、分析和觀點。<a href="#">點擊這裡自訂</a>',
    entryDescription: '高端會員可在首頁開啟FT全球臻享，更即時取得更多FT全球內容，並按您的偏好排序。',
    entryAction: '開啟',
    entryDismiss: '關閉',
    entrySaving: '正在開啟...',
    entryFailed: '暫時無法儲存設定，請稍後重試。',
    loading: '正在載入FT全球臻享',
    empty: '暫時沒有新的FT全球臻享內容，請稍後重新整理。',
    timeout: 'FT全球臻享載入較慢，請點擊重試。',
    failed: 'FT全球臻享暫時無法載入，請點擊重試。',
    retry: '點擊這裡重試',
    followPrompt: '關注幾個話題，FT全球臻享會更貼近你的興趣：',
    followPromptFollow: '關注',
    followPromptFollowing: '已關注',
    followPromptDismiss: '關閉'
  }
};
// Keep raw recommendation objects out of DOM attributes. They include long annotations
// and scoring metadata, but are only needed in memory when users tweak ranking settings.
const recommendationItemsByContainer = new WeakMap();
const homePageRecommendationRenderPromises = new WeakMap();
const homePageRecommendationTrackedShells = new WeakSet();
const homePageRecommendationTrackedTerminalStatuses = new WeakMap();
const homePageRecommendationTrackThrottle = new Map();
const ftGlobalCurationEntrySeenTimers = new WeakMap();
const ftGlobalCurationEntrySeenObservers = new WeakMap();
const ftGlobalCurationEntrySeenEntries = new WeakSet();

// === Recommendation Weights ===
const recommendationWeights = {
  editorial: 20,
  popularity: 10,
  relevance: 30,
  readPenalty: true,
  tierPenalty: false,
  freshnessBonus: true
};


// === Kickstart only for web page ===
if (!isWebAppShell()) {
  console.log('recommending...');
  runRecommendationForDoms();
  displayRecommendationInContentPageLazy();
  if (!isNativeAppWebView()) {
    displayHomePageRecommendation();
  }
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
    filterCurrentContent: true,
    isInWebApp: isWebAppShell()
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
  const onRendered = options?.onRendered;
  const onError = options?.onError;

  let containers = document.querySelectorAll(containerSelector);
  if (targetDom) {
    containers = targetDom.querySelectorAll(containerSelector);
  }
  if (containers.length === 0) {return;}

  const observer = new IntersectionObserver(async (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {continue;}
      try {
        const result = await renderRecommendationsIntoContainer(entry.target, {
          ...options,
          limit,
          filterCurrentContent,
          isInWebApp
        });

        if (result?.status === 'empty') {
          if (typeof onEmpty === 'function') {
            onEmpty(entry.target, result);
          }
          observer.unobserve(entry.target);
          continue;
        }

        if (typeof onRendered === 'function') {
          onRendered(entry.target, result);
        }
        observer.unobserve(entry.target);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        if (typeof onError === 'function') {
          onError(entry.target, error);
        }
        observer.unobserve(entry.target);
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
  const entryState = getFTGlobalCurationEntryState();
  if (entryState === FT_GLOBAL_CURATION_STATE_ELIGIBLE) {
    if (!showFTGlobalCurationEntryInContainer(container, {entryPoint: 'web_home_prompt'})) {
      hideHomePageRecommendation(container);
    }
    return;
  }
  if (entryState !== FT_GLOBAL_CURATION_STATE_ENABLED) {
    hideHomePageRecommendation(container);
    return;
  }

  container.hidden = false;
  markHomePageRecommendationStatus(container, {status: 'loading'});
  container.innerHTML = buildHomePageRecommendationShellHTML();
  trackHomePageRecommendationShellShown(container);

  displayRecommendationLazy({
    targetDom: container,
    containerSelector: '.home-page-recommendation-list',
    limit: HOME_PAGE_RECOMMENDATION_LIMIT,
    filterCurrentContent: false,
    insertTitleForNextBlock: true,
    onRendered: (_list, result) => showHomePageRecommendationTerminalStatus(container, result),
    onEmpty: (_list, result) => showHomePageRecommendationTerminalStatus(container, result),
    onError: (_list, error) => {
      console.error('homepage recommendation lazy render error:', error);
      showHomePageRecommendationTerminalStatus(container, {status: 'failed'});
    }
  });
}

async function renderHomePageRecommendationNow(options = {}) {
  const container = options?.targetDom || document.getElementById(HOME_PAGE_RECOMMENDATION_CONTAINER_ID);
  if (!container) {return {status: 'missing'};}
  const entryState = getFTGlobalCurationEntryState();
  if (entryState === FT_GLOBAL_CURATION_STATE_ELIGIBLE) {
    if (!showFTGlobalCurationEntryInContainer(container, {
      entryPoint: options?.entryPoint || 'native_home_prompt'
    })) {
      markHomePageRecommendationStatus(container, {status: 'entry_dismissed'});
      hideHomePageRecommendation(container);
      return {status: 'entry_dismissed'};
    }
    return {status: 'entry'};
  }
  if (entryState !== FT_GLOBAL_CURATION_STATE_ENABLED) {
    markHomePageRecommendationStatus(container, {status: 'skipped'});
    hideHomePageRecommendation(container);
    return {status: 'skipped'};
  }

  const activeRender = homePageRecommendationRenderPromises.get(container);
  if (activeRender) {
    return activeRender;
  }
  const renderPromise = performHomePageRecommendationRender(container, options);
  homePageRecommendationRenderPromises.set(container, renderPromise);
  try {
    return await renderPromise;
  } finally {
    if (homePageRecommendationRenderPromises.get(container) === renderPromise) {
      homePageRecommendationRenderPromises.delete(container);
    }
  }
}

async function performHomePageRecommendationRender(container, options = {}) {
  const renderState = {cancelled: false};
  let timeoutId;
  let controller;
  let timeoutPromise = null;
  try {
    if (options?.timeoutMs > 0) {
      if (typeof AbortController === 'function') {
        controller = new AbortController();
      }
      timeoutPromise = new Promise(resolve => {
        timeoutId = setTimeout(() => {
          renderState.cancelled = true;
          controller?.abort();
          resolve({status: 'timeout'});
        }, options.timeoutMs);
      });
    }

    container.hidden = false;
    markHomePageRecommendationStatus(container, {status: 'loading'});
    container.innerHTML = buildHomePageRecommendationShellHTML();
    trackHomePageRecommendationShellShown(container);

    const list = container.querySelector('.home-page-recommendation-list');
    const renderPromise = renderRecommendationsIntoContainer(list, {
      ...options,
      limit: options?.limit ?? HOME_PAGE_RECOMMENDATION_LIMIT,
      filterCurrentContent: false,
      insertTitleForNextBlock: true,
      signal: controller?.signal,
      renderState
    });
    const result = timeoutPromise ? await Promise.race([renderPromise, timeoutPromise]) : await renderPromise;

    markHomePageRecommendationStatus(container, result);
    showHomePageRecommendationTerminalStatus(container, result);
    return result;
  } catch (err) {
    if (err?.name === 'AbortError' || renderState.cancelled) {
      markHomePageRecommendationStatus(container, {status: 'timeout'});
      showHomePageRecommendationTerminalStatus(container, {status: 'timeout'});
      return {status: 'timeout'};
    }
    console.error('render homepage recommendation error:', err);
    markHomePageRecommendationStatus(container, {status: 'failed'});
    showHomePageRecommendationTerminalStatus(container, {status: 'failed'});
    return {status: 'failed'};
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function showHomePageRecommendationTerminalStatus(container, result = {}) {
  if (!container) {return;}
  markHomePageRecommendationStatus(container, result);
  trackHomePageRecommendationTerminalStatus(container, result);
  const status = result?.status || 'unknown';
  if (status === 'rendered') {
    updateHomePageRecommendationNotice(container, 'rendered');
    return;
  }
  if (status === 'empty' || status === 'timeout' || status === 'failed' || status === 'cancelled') {
    updateHomePageRecommendationNotice(container, status === 'cancelled' ? 'timeout' : status);
    insertTitleForNextHomeBlock();
  }
}

function markHomePageRecommendationStatus(container, result = {}) {
  if (!container) {return;}
  const status = result?.status || 'unknown';
  container.setAttribute('data-render-status', status);
  if (status === 'loading') {
    container.setAttribute('data-render-start-ms', `${Date.now()}`);
  }
  if (typeof result?.count === 'number') {
    container.setAttribute('data-render-count', `${result.count}`);
  }
}

function buildHomePageRecommendationShellHTML() {
  return `
    <div class="block-container no-side home-page-recommendation-block">
      <div class="block-inner">
        <div class="content-container"><div class="content-inner">
          <div class="list-container"><div class="list-inner">
            ${buildFTExclusiveCurationIntroHTML()}
            ${buildFTExclusiveCurationDescriptionHTML()}
            <div class="card-grid list-recommendation home-page-recommendation-list">${buildHomePageRecommendationNoticeHTML('loading')}</div>
          </div></div>
        </div></div>
        <div class="clearfloat"></div>
      </div>
    </div>`;
}

function buildFTGlobalCurationEntryHTML(entryPoint = 'home_prompt', impressionId = '') {
  const text = getFTExclusiveCurationText();
  return `
    <div class="block-container no-side home-page-recommendation-entry-block" data-entry-point="${escapeAttributeValue(entryPoint)}" data-impression-id="${escapeAttributeValue(impressionId)}">
      <div class="block-inner">
        <div class="content-container"><div class="content-inner">
          <div class="ft-global-curation-entry-banner" role="region" aria-label="${escapeAttributeValue(text.title)}">
            <p class="ft-global-curation-entry-copy">${escapeAttributeValue(text.entryDescription)}</p>
            <div class="ft-global-curation-entry-actions">
              <button class="button button-primary ft-global-curation-entry-enable" type="button">${escapeAttributeValue(text.entryAction)}</button>
              <button class="ft-global-curation-entry-dismiss" type="button" aria-label="${escapeAttributeValue(text.entryDismiss)}">${escapeAttributeValue(text.entryDismiss)}</button>
            </div>
            <p class="ft-global-curation-entry-error" hidden></p>
          </div>
        </div></div>
        <div class="clearfloat"></div>
      </div>
    </div>`;
}

function getFTGlobalCurationEntryPoint(container) {
  return container?.querySelector?.('.home-page-recommendation-entry-block')?.getAttribute('data-entry-point') || 'home_prompt';
}

function getFTGlobalCurationEntryBlock(container) {
  return container?.querySelector?.('.home-page-recommendation-entry-block') || null;
}

function getFTGlobalCurationEntryImpressionId(container) {
  return getFTGlobalCurationEntryBlock(container)?.getAttribute('data-impression-id') ||
    container?.getAttribute?.('data-ft-global-curation-impression-id') ||
    '';
}

function createFTGlobalCurationImpressionId() {
  const random = Math.random().toString(36).slice(2, 10);
  return `ftgc-${Date.now().toString(36)}-${random}`;
}

function getRoundedVisibleRatio(value) {
  const ratio = Number(value);
  if (!Number.isFinite(ratio)) {return undefined;}
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100) / 100;
}

function clearFTGlobalCurationEntrySeenTimer(entry) {
  const timer = ftGlobalCurationEntrySeenTimers.get(entry);
  if (!timer) {return;}
  window.clearTimeout(timer);
  ftGlobalCurationEntrySeenTimers.delete(entry);
}

function stopFTGlobalCurationEntrySeenObserver(entry) {
  if (!entry) {return;}
  clearFTGlobalCurationEntrySeenTimer(entry);
  const observer = ftGlobalCurationEntrySeenObservers.get(entry);
  if (!observer) {return;}
  observer.disconnect();
  ftGlobalCurationEntrySeenObservers.delete(entry);
}

function stopFTGlobalCurationEntrySeenTracking(container) {
  stopFTGlobalCurationEntrySeenObserver(getFTGlobalCurationEntryBlock(container));
}

function trackFTGlobalCurationEntrySeen(container, options = {}) {
  const entry = getFTGlobalCurationEntryBlock(container);
  if (!entry || ftGlobalCurationEntrySeenEntries.has(entry)) {return false;}
  ftGlobalCurationEntrySeenEntries.add(entry);
  entry.setAttribute('data-entry-seen', 'true');
  stopFTGlobalCurationEntrySeenObserver(entry);

  const visibleRatio = getRoundedVisibleRatio(options.visibleRatio);
  const visibleMs = Number(options.visibleMs);
  const data = {
    status: 'seen',
    entryPoint: getFTGlobalCurationEntryPoint(container),
    impressionId: getFTGlobalCurationEntryImpressionId(container),
    seenReason: options.seenReason || 'viewport'
  };
  if (visibleRatio !== undefined) {
    data.visibleRatio = visibleRatio;
  }
  if (Number.isFinite(visibleMs)) {
    data.visibleMs = Math.max(0, Math.round(visibleMs));
  }
  trackHomePageRecommendationEvent('ft_global_curation_entry_seen', data, {throttleMs: 0});
  return true;
}

function observeFTGlobalCurationEntrySeen(container) {
  const entry = getFTGlobalCurationEntryBlock(container);
  if (
    !entry ||
    ftGlobalCurationEntrySeenEntries.has(entry) ||
    typeof window !== 'object' ||
    typeof window.IntersectionObserver !== 'function'
  ) {
    return;
  }

  let visibleStartedAt = 0;
  let visibleRatio = 0;
  const observer = new window.IntersectionObserver(entries => {
    for (const observedEntry of entries) {
      if (observedEntry.target !== entry) {continue;}
      const ratio = getRoundedVisibleRatio(observedEntry.intersectionRatio) || 0;
      if (observedEntry.isIntersecting && ratio >= FT_GLOBAL_CURATION_ENTRY_SEEN_RATIO) {
        if (ftGlobalCurationEntrySeenTimers.has(entry)) {continue;}
        visibleStartedAt = Date.now();
        visibleRatio = ratio;
        const timer = window.setTimeout(() => {
          ftGlobalCurationEntrySeenTimers.delete(entry);
          trackFTGlobalCurationEntrySeen(container, {
            visibleRatio,
            visibleMs: Date.now() - visibleStartedAt,
            seenReason: 'viewport'
          });
        }, FT_GLOBAL_CURATION_ENTRY_SEEN_MS);
        ftGlobalCurationEntrySeenTimers.set(entry, timer);
        continue;
      }
      clearFTGlobalCurationEntrySeenTimer(entry);
    }
  }, {threshold: [0, FT_GLOBAL_CURATION_ENTRY_SEEN_RATIO, 1]});

  ftGlobalCurationEntrySeenObservers.set(entry, observer);
  observer.observe(entry);
}

function showFTGlobalCurationEntryInContainer(container, options = {}) {
  if (!container) {return false;}
  if (
    getFTGlobalCurationEntryState() !== FT_GLOBAL_CURATION_STATE_ELIGIBLE ||
    isFTGlobalCurationEntryDismissed()
  ) {
    return false;
  }
  const entryPoint = options?.entryPoint || 'home_prompt';
  const impressionId = createFTGlobalCurationImpressionId();
  stopFTGlobalCurationEntrySeenTracking(container);
  container.hidden = false;
  container.setAttribute('data-render-status', 'entry');
  container.setAttribute('data-ft-global-curation-impression-id', impressionId);
  container.innerHTML = buildFTGlobalCurationEntryHTML(entryPoint, impressionId);
  trackHomePageRecommendationEvent('ft_global_curation_entry_shown', {
    status: 'shown',
    entryPoint,
    impressionId
  }, {throttleMs: 0});
  observeFTGlobalCurationEntrySeen(container);
  return true;
}

function renderFTGlobalCurationEntry(targetDom, options = {}) {
  if (
    getFTGlobalCurationEntryState() !== FT_GLOBAL_CURATION_STATE_ELIGIBLE ||
    isFTGlobalCurationEntryDismissed()
  ) {
    return false;
  }
  const root = targetDom || document;
  const slot = root?.id === HOME_PAGE_RECOMMENDATION_CONTAINER_ID ?
    root :
    root?.querySelector?.(`#${HOME_PAGE_RECOMMENDATION_CONTAINER_ID}`);
  if (slot) {
    return showFTGlobalCurationEntryInContainer(slot, options);
  }
  if (!targetDom || options?.fallback !== 'prepend') {
    return false;
  }

  const entrySlot = document.createElement('div');
  entrySlot.id = HOME_PAGE_RECOMMENDATION_CONTAINER_ID;
  targetDom.insertBefore(entrySlot, targetDom.firstChild);
  return showFTGlobalCurationEntryInContainer(entrySlot, options);
}

function getFTGlobalCurationEntryDismissKey() {
  const userKey = window.userId || window.username || 'anonymous';
  return `${FT_GLOBAL_CURATION_ENTRY_DISMISS_KEY_PREFIX}:${userKey}`;
}

function isFTGlobalCurationEntryDismissed() {
  if (typeof localStorage !== 'object') {return false;}
  try {
    const dismissedUntil = parseInt(localStorage.getItem(getFTGlobalCurationEntryDismissKey()) || '', 10);
    return Number.isFinite(dismissedUntil) && dismissedUntil > Date.now();
  } catch (err) {
    return false;
  }
}

function dismissFTGlobalCurationEntry(container) {
  if (typeof localStorage === 'object') {
    try {
      const dismissedUntil = Date.now() + FT_GLOBAL_CURATION_ENTRY_DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(getFTGlobalCurationEntryDismissKey(), `${dismissedUntil}`);
    } catch (err) {
      console.warn('Failed to save FT global curation entry dismissal:', err);
    }
  }
  hideHomePageRecommendation(container);
}

async function enableFTGlobalCurationFromEntry(button) {
  const container = button?.closest?.(`#${HOME_PAGE_RECOMMENDATION_CONTAINER_ID}`);
  if (!container || button.disabled) {return;}
  trackFTGlobalCurationEntrySeen(container, {seenReason: 'enable_click'});

  const text = getFTExclusiveCurationText();
  const error = container.querySelector('.ft-global-curation-entry-error');
  const previousLabel = button.textContent;
  let preference = {};
  try {
    preference = getPreference();
  } catch (err) {
    preference = {};
  }

  const previousHomePagePreference = preference?.[HOME_PAGE_PREFERENCE_KEY] || '';
  preference[HOME_PAGE_PREFERENCE_KEY] = CUSTOM_HOME_PAGE_PREFERENCE_VALUE;
  syncPreferenceForFTGlobalCurationOptIn(preference, HOME_PAGE_PREFERENCE_KEY, CUSTOM_HOME_PAGE_PREFERENCE_VALUE);

  if (error) {
    error.hidden = true;
    error.textContent = '';
  }
  button.disabled = true;
  button.textContent = text.entrySaving;

  try {
    await savePreferenceNow(preference);
    if (previousHomePagePreference !== CUSTOM_HOME_PAGE_PREFERENCE_VALUE) {
      trackHomePageRecommendationEvent('ft_global_curation_preference_enabled', {
        status: 'enabled',
        entryPoint: getFTGlobalCurationEntryPoint(container),
        impressionId: getFTGlobalCurationEntryImpressionId(container)
      }, {throttleMs: 0});
    }
    if (typeof localStorage === 'object') {
      try {
        localStorage.removeItem(getFTGlobalCurationEntryDismissKey());
      } catch (err) {
        console.warn('Failed to clear FT global curation entry dismissal:', err);
      }
    }
    retryHomePageRecommendation(container);
  } catch (err) {
    console.error('Failed to enable FT global curation:', err);
    button.disabled = false;
    button.textContent = previousLabel || text.entryAction;
    if (error) {
      error.textContent = text.entryFailed;
      error.hidden = false;
    }
  }
}

function buildHomePageRecommendationNoticeHTML(status = 'loading') {
  const text = getFTExclusiveCurationText();
  const isRetriable = status === 'timeout' || status === 'failed';
  return `
    <div class="home-page-recommendation-status ${getHomePageRecommendationStatusClass(status)}" role="status" aria-live="polite">
      <span class="home-page-recommendation-spinner" aria-hidden="true"></span>
      <span class="home-page-recommendation-status-text">${text[status] || text.failed}</span>
      <button class="home-page-recommendation-retry" type="button"${isRetriable ? '' : ' hidden'}>${text.retry}</button>
    </div>`;
}

function updateHomePageRecommendationNotice(container, status) {
  const list = container?.querySelector('.home-page-recommendation-list');
  if (!list) {return;}
  if (status === 'rendered') {
    list.querySelector('.home-page-recommendation-status')?.remove();
    return;
  }
  let notice = list.querySelector('.home-page-recommendation-status');
  if (!notice) {
    list.innerHTML = buildHomePageRecommendationNoticeHTML(status);
    return;
  }
  const text = notice.querySelector('.home-page-recommendation-status-text');
  const retry = notice.querySelector('.home-page-recommendation-retry');
  notice.classList.remove('is-loading', 'is-empty', 'is-error');

  notice.hidden = false;
  if (retry) {
    retry.disabled = false;
    retry.hidden = !(status === 'timeout' || status === 'failed');
  }
  notice.classList.add(getHomePageRecommendationStatusClass(status));
  if (text) {
    text.textContent = getFTExclusiveCurationText()[status] || getFTExclusiveCurationText().failed;
  }
}

function getHomePageRecommendationStatusClass(status) {
  if (status === 'loading') {return 'is-loading';}
  if (status === 'empty') {return 'is-empty';}
  return 'is-error';
}

function retryHomePageRecommendation(container) {
  if (!container) {return Promise.resolve({status: 'missing'});}
  if (homePageRecommendationRenderPromises.has(container)) {
    return homePageRecommendationRenderPromises.get(container);
  }
  const options = {
    targetDom: container,
    limit: HOME_PAGE_RECOMMENDATION_LIMIT
  };
  if (isNativeAppWebView()) {
    options.timeoutMs = NATIVE_HOME_PAGE_RECOMMENDATION_TIMEOUT_MS;
  }
  return renderHomePageRecommendationNow(options).then(result => {
    if (isNativeAppWebView()) {
      const status = result?.status || 'unknown';
      container.setAttribute('data-native-render-status', status);
      if (typeof result?.count === 'number') {
        container.setAttribute('data-native-render-count', `${result.count}`);
      }
    }
    return result;
  });
}

function hideHomePageRecommendation(container) {
  if (!container) {return;}
  stopFTGlobalCurationEntrySeenTracking(container);
  container.hidden = true;
  container.innerHTML = '';
}

function getHomePageRecommendationTrackPlatform() {
  if (typeof Android === 'object' && typeof Android.link === 'function') {
    return 'android';
  }
  if (typeof webkit === 'object' && webkit.messageHandlers) {
    return 'ios';
  }
  if (isNativeAppWebView()) {
    return 'native';
  }
  if (isWebAppShell()) {
    return 'webapp';
  }
  return 'web';
}

function shouldThrottleHomePageRecommendationTrack(eventName, data = {}, throttleMs = HOME_PAGE_RECOMMENDATION_TRACK_THROTTLE_MS) {
  const key = [
    eventName,
    data.status || '',
    data.itemId || ''
  ].join(':');
  const now = Date.now();
  const last = homePageRecommendationTrackThrottle.get(key) || 0;
  if (now - last < throttleMs) {
    return true;
  }
  homePageRecommendationTrackThrottle.set(key, now);
  if (homePageRecommendationTrackThrottle.size > 100) {
    const firstKey = homePageRecommendationTrackThrottle.keys().next().value;
    homePageRecommendationTrackThrottle.delete(firstKey);
  }
  return false;
}

function postHomePageRecommendationTrack(payload) {
  const body = JSON.stringify(payload);
  if (typeof navigator === 'object' && typeof navigator.sendBeacon === 'function' && typeof Blob === 'function') {
    try {
      const blob = new Blob([body], {type: 'application/json'});
      if (navigator.sendBeacon(HOME_PAGE_RECOMMENDATION_TRACK_ENDPOINT, blob)) {
        return;
      }
    } catch (err) {
      // Fall through to fetch below.
    }
  }

  if (typeof fetch !== 'function') {
    return;
  }
  fetch(HOME_PAGE_RECOMMENDATION_TRACK_ENDPOINT, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'same-origin',
    keepalive: true,
    body
  }).catch(() => {});
}

function trackHomePageRecommendationEvent(eventName, data = {}, options = {}) {
  if (!eventName) {return;}
  if (shouldThrottleHomePageRecommendationTrack(eventName, data, options.throttleMs)) {
    return;
  }
  const payload = {
    eventName,
    platform: getHomePageRecommendationTrackPlatform(),
    url: window.location.href,
    path: window.location.pathname,
    ...data
  };
  postHomePageRecommendationTrack(payload);
}

function getHomePageRecommendationDurationMs(container) {
  const startedAt = parseInt(container?.getAttribute('data-render-start-ms') || '', 10);
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return undefined;
  }
  return Math.max(0, Date.now() - startedAt);
}

function trackHomePageRecommendationShellShown(container) {
  if (!container || homePageRecommendationTrackedShells.has(container)) {
    return;
  }
  homePageRecommendationTrackedShells.add(container);
  trackHomePageRecommendationEvent('ft_global_curation_shell_shown', {status: 'shown'});
}

function trackHomePageRecommendationTerminalStatus(container, result = {}) {
  if (!container) {return;}
  const status = result?.status || 'unknown';
  const eventNameMap = {
    rendered: 'ft_global_curation_render_success',
    empty: 'ft_global_curation_empty',
    timeout: 'ft_global_curation_timeout',
    failed: 'ft_global_curation_failed',
    cancelled: 'ft_global_curation_timeout'
  };
  const eventName = eventNameMap[status];
  if (!eventName) {return;}

  const count = typeof result?.count === 'number' ? result.count : undefined;
  const trackedKey = `${status}:${count ?? ''}`;
  if (homePageRecommendationTrackedTerminalStatuses.get(container) === trackedKey) {
    return;
  }
  homePageRecommendationTrackedTerminalStatuses.set(container, trackedKey);
  trackHomePageRecommendationEvent(eventName, {
    status,
    resultCount: count,
    durationMs: getHomePageRecommendationDurationMs(container)
  });
}

function getRecommendationItemTier(item) {
  const tier = item?.getAttribute('data-tier') || '';
  if (tier) {return tier;}
  const link = item?.querySelector('.item-headline-link');
  if (link?.classList.contains('vip')) {
    return 'premium';
  }
  if (link?.classList.contains('locked')) {
    return 'standard';
  }
  return '';
}

function getRecommendationItemTrackData(item) {
  if (!item) {return {};}
  const itemType = item.getAttribute('data-type') || '';
  const articleUrl = item.getAttribute('data-article-url') || '';
  const data = {
    itemId: item.getAttribute('data-ft-id') || item.getAttribute('data-id') || '',
    itemType,
    itemSubtype: item.getAttribute('data-sub-type') || '',
    contentClass: item.getAttribute('data-content-class') || '',
    tier: getRecommendationItemTier(item),
    isAITranslation: itemType === 'content' || /^\/content\//.test(articleUrl)
  };
  const score = parseFloat(item.getAttribute('data-score') || '');
  const relevanceScore = parseFloat(item.getAttribute('data-relevance-score') || '');
  if (Number.isFinite(score)) {
    data.score = score;
  }
  if (Number.isFinite(relevanceScore)) {
    data.relevanceScore = relevanceScore;
  }
  return data;
}

function trackHomePageRecommendationItemClick(item) {
  trackHomePageRecommendationEvent(
    'ft_global_curation_item_click',
    getRecommendationItemTrackData(item),
    {throttleMs: 500}
  );
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
  // Visibility gate: only premium users who explicitly enable the custom home page
  // should see the FT全球臻享 block. This does not decide the content pool.
  return getFTGlobalCurationEntryState() === FT_GLOBAL_CURATION_STATE_ENABLED;
}

function getFTGlobalCurationEntryState(preference = getPreference()) {
  const subscriptionTier = getCurrentSubscriptionTier();
  if (subscriptionTier === 'premium') {
    return isCustomHomePageEnabled(preference) ?
      FT_GLOBAL_CURATION_STATE_ENABLED :
      FT_GLOBAL_CURATION_STATE_ELIGIBLE;
  }
  if (subscriptionTier === 'standard' && isCustomHomePageEnabled(preference)) {
    return FT_GLOBAL_CURATION_STATE_GATED;
  }
  return FT_GLOBAL_CURATION_STATE_HIDDEN;
}

function getChineseLanguageKey(preferredLanguage = window.preferredLanguage || 'zh-CN') {
  const normalized = preferredLanguage.toLowerCase();
  if (normalized.startsWith('zh-tw')) {
    return 'zh-TW';
  }
  if (normalized.startsWith('zh-hk') || normalized.startsWith('zh-mo')) {
    return 'zh-HK';
  }
  return 'zh';
}

function getFTExclusiveCurationText() {
  const langKey = getChineseLanguageKey();
  return FT_EXCLUSIVE_CURATION_TEXTS[langKey] || FT_EXCLUSIVE_CURATION_TEXTS.zh;
}

function buildFTExclusiveCurationIntroHTML() {
  const text = getFTExclusiveCurationText();
  return `
    <div class="home-page-recommendation-intro">
      <h2 class="list-title"><a class="list-link">${text.title}</a></h2>
    </div>`;
}

function buildFTExclusiveCurationDescriptionHTML() {
  return `<p class="home-page-recommendation-description reorder-description">${getFTExclusiveCurationDescription()}</p>`;
}

function getFTExclusiveCurationDescription() {
  const text = getFTExclusiveCurationText();
  return shouldUseAITranslationContentPool() ?
    text.description :
    text.humanOnlyDescription;
}


// === Shared helpers for recommendation rendering ===
function isCustomHomePageEnabled(preference = getPreference()) {
  return preference?.[HOME_PAGE_PREFERENCE_KEY] === CUSTOM_HOME_PAGE_PREFERENCE_VALUE;
}

function shouldUseAITranslationContentPool(preference = getPreference()) {
  return preference?.[ARTICLE_TRANSLATION_PREFERENCE_KEY] === BOTH_TRANSLATION_PREFERENCE_VALUE;
}

function syncPreferenceForFTGlobalCurationOptIn(preference, preferenceKey, value) {
  if (!preference || preferenceKey !== HOME_PAGE_PREFERENCE_KEY || value !== CUSTOM_HOME_PAGE_PREFERENCE_VALUE) {
    return preference;
  }
  if (preference[ARTICLE_TRANSLATION_PREFERENCE_KEY] !== BOTH_TRANSLATION_PREFERENCE_VALUE) {
    preference[ARTICLE_TRANSLATION_PREFERENCE_KEY] = BOTH_TRANSLATION_PREFERENCE_VALUE;
  }
  return preference;
}

function getRecommendationSource() {
  // Content-pool gate: this applies to every recommendation surface, including
  // the FT全球臻享 home block and story-page recommendations.
  return shouldUseAITranslationContentPool() ?
    RECOMMENDATION_SOURCE_ALL :
    RECOMMENDATION_SOURCE_FTCHINESE;
}

function getTopPathname() {
  try {
    return top.location.pathname || '';
  } catch (err) {
    return window.location.pathname || '';
  }
}

function isWebAppShell() {
  return /^\/app(?:\/|$)/.test(getTopPathname());
}

function hasNativeAppLinkBridge() {
  const hasIOSBridge = typeof webkit === 'object' &&
    webkit.messageHandlers &&
    webkit.messageHandlers.link &&
    typeof webkit.messageHandlers.link.postMessage === 'function';
  const hasAndroidBridge = typeof Android === 'object' && typeof Android.link === 'function';
  return hasIOSBridge || hasAndroidBridge;
}

function isNativeAppWebView() {
  const search = window.location.search || '';
  return /(?:^|[?&])(?:webview=ftcapp|to=iosapp|android=)/.test(search) ||
    hasNativeAppLinkBridge() ||
    typeof window.androidUserInfo === 'object';
}

function getPreference() {
  if (typeof getMyPreference !== 'function') {return {};}
  return getMyPreference() ?? {};
}

async function savePreferenceNow(preference) {
  try {
    if (typeof savePreference === 'function') {
      return await savePreference(preference, {immediate: true});
    }
    localStorage.setItem('preference', JSON.stringify(preference));
    return preference;
  } catch (err) {
    console.error('Failed to save preference:', err);
    throw err;
  }
}

function savePreferenceSafely(preference) {
  try {
    const result = savePreferenceNow(preference);
    if (result && typeof result.catch === 'function') {
      result.catch(() => {});
    }
    return result;
  } catch (err) {
    return null;
  }
}

function isPremiumUser() {
  return getCurrentSubscriptionTier() === 'premium';
}

function getCurrentSubscriptionTier() {
  if (window.gUserType === 'VIP') {return 'premium';}
  if (window.gUserType === 'Subscriber') {return 'standard';}
  const nativeTier = getNativeSubscriptionTier();
  if (nativeTier) {return nativeTier;}
  if (typeof GetCookie !== 'function') {return '';}
  const subscriptionType = GetCookie('subscription_type');
  if (subscriptionType === 'premium' || subscriptionType === 'standard') {
    return subscriptionType;
  }
  const paywall = GetCookie('paywall');
  if (paywall === 'premium') {return 'premium';}
  if (paywall === 'standard' || paywall === 'subscriber') {return 'standard';}
  return '';
}

function getNativeSubscriptionTier() {
  const androidMembership = window.androidUserInfo?.membership;
  if (androidMembership?.vip === true) {return 'premium';}

  const androidTier = androidMembership?.webPrivilegeTier || androidMembership?.tier;
  if (androidTier === 'premium' || androidTier === 'vip') {return 'premium';}
  if (androidTier === 'standard') {return 'standard';}

  if (Array.isArray(window.gPrivileges)) {
    if (window.gPrivileges.includes('EditorChoice')) {return 'premium';}
    if (window.gPrivileges.includes('premium')) {return 'standard';}
  }
  return '';
}

function getPremiumPreferenceGate(preferenceKey, value, labels = {}) {
  const premiumOnlyValue = PREMIUM_ONLY_PREFERENCE_VALUES[preferenceKey];
  if (!premiumOnlyValue || value !== premiumOnlyValue) {
    return null;
  }
  const entitled = isPremiumUser();
  return {
    badge: labels.premiumOnlyBadge || '高端专享',
    note: entitled ? '' : labels.premiumOnlyHomePageNotice || '当前为标准会员，此设置将在升级为高端会员后生效。',
    entitled
  };
}

function refreshHeadlineLocksIfAvailable() {
  if (typeof updateHeadlineLocks === 'function') {
    updateHeadlineLocks();
  }
}

async function renderRecommendationsIntoContainer(container, options = {}) {
  if (!container) {return {status: 'missing'};}

  const renderState = options?.renderState;
  const isCancelled = () => renderState?.cancelled === true;
  if (isCancelled()) {return {status: 'cancelled'};}

  updateFollows();
  updateWeights();

  const limit = options?.limit ?? 6;
  const filterCurrentContent = options?.filterCurrentContent ?? true;
  const isInWebApp = options?.isInWebApp ?? false;
  const source = getRecommendationSource();

  let items = await fetchRecommendations(source, {signal: options?.signal});
  if (isCancelled()) {return {status: 'cancelled'};}
  if (filterCurrentContent) {
    items = filterOutCurrentContent(items);
  }
  items = selectRecommendations(items, {limit});

  if (items.length === 0) {
    return {status: 'empty', count: 0, items};
  }

  const html = await buildRecommendationHTML(items, window.preferredLanguage ?? 'zh-CN', isInWebApp);
  if (isCancelled()) {return {status: 'cancelled'};}

  rememberRecommendationItems(container, items);
  container.innerHTML = html;
  appendRecommendationReasons(container, items, window.preferredLanguage ?? 'zh-CN');
  showCustomisation(container);
  renderFTGlobalCurationFollowPrompt(container, items);
  if (options?.insertTitleForNextBlock) {
    insertTitleForNextHomeBlock();
  }

  if (typeof runLoadImages === 'function') {
    runLoadImages();
  }
  if (typeof markReadContent === 'function') {
    markReadContent(container);
  }
  refreshHeadlineLocksIfAvailable();

  return {status: 'rendered', count: items.length, items};
}

async function fetchRecommendations(source = RECOMMENDATION_SOURCE_FTCHINESE, options = {}) {
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
    signal: options?.signal,
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
      lockClass = ' standard locked';
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
    const tierAttr = ` data-tier="${tier}"`;
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
      const isFollowed = isRecommendationTagFollowed(item, mainTag) || isMatchedRecommendationTag(item, mainTag);

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


    html += `<div class="item-container ${imageClass} item-container-app" data-id="${id}" data-type="${type}" data-sub-type="${subtype}" data-keywords="${keywords}" data-update="${update}" data-ft-id="${ftid}"${ftTypeAttr}${cardArticleUrlAttr}${tierAttr}${scoreAttrs}>
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
    ['data-format-penalty', item?.formatPenalty, 4],
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
  if (item?.relevanceMatchStrength) {
    html += ` data-relevance-strength="${escapeAttributeValue(item.relevanceMatchStrength)}"`;
  }
  if (Number.isFinite(parseFloat(item?.relevanceScoreBeforeWeakCap))) {
    html += ` data-relevance-score-before-cap="${parseFloat(item.relevanceScoreBeforeWeakCap).toFixed(4)}"`;
  }
  if (item?.weakRelevanceCapApplied === true) {
    html += ` data-weak-relevance-cap-applied="true"`;
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
  const followSources = Array.isArray(match?.followSources) ? match.followSources.filter(Boolean) : [];
  const followText = followSources.length > 0 ? `[follow=${followSources.join(',')}]` : '';
  return `${match?.source ?? 'match'}:${label}${pointText}${followText}`;
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
delegate.on('click', '.home-page-recommendation-list a[href]', function () {
  const item = this.closest('.item-container-app');
  if (item) {
    trackHomePageRecommendationItemClick(item);
  }
});

delegate.on('click', '.home-page-recommendation-list .item-container-app', function (event) {
  if (event?.target?.closest('a[href], button')) {
    return;
  }
  trackHomePageRecommendationItemClick(this);
});

delegate.on('click', '.list-recommendation .item-container-app', function (event) {
  if (event?.defaultPrevented) {
    return;
  }
  // Web app shell and native app list pages have their own click routing; avoid double handling.
  if (isWebAppShell() || isNativeAppWebView()) {
    return;
  }
  // Let regular anchor/button behavior fire first.
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

delegate.on('click', '.home-page-recommendation-retry', function (event) {
  event.preventDefault();
  const container = this.closest(`#${HOME_PAGE_RECOMMENDATION_CONTAINER_ID}`);
  if (!container || homePageRecommendationRenderPromises.has(container)) {
    return;
  }
  this.disabled = true;
  this.hidden = true;
  trackHomePageRecommendationEvent('ft_global_curation_retry', {
    status: container.getAttribute('data-render-status') || 'retry'
  });
  retryHomePageRecommendation(container).then(() => {
    this.disabled = false;
  }, () => {
    this.disabled = false;
  });
});

delegate.on('click', '.ft-global-curation-entry-enable', function (event) {
  event.preventDefault();
  enableFTGlobalCurationFromEntry(this);
});

delegate.on('click', '.ft-global-curation-entry-dismiss', function (event) {
  event.preventDefault();
  const container = this.closest(`#${HOME_PAGE_RECOMMENDATION_CONTAINER_ID}`);
  trackFTGlobalCurationEntrySeen(container, {seenReason: 'dismiss_click'});
  trackHomePageRecommendationEvent('ft_global_curation_entry_dismissed', {
    status: 'dismissed',
    entryPoint: getFTGlobalCurationEntryPoint(container),
    impressionId: getFTGlobalCurationEntryImpressionId(container)
  }, {throttleMs: 0});
  dismissFTGlobalCurationEntry(container);
});

delegate.on('click', '.ft-global-curation-follow-prompt-dismiss', function (event) {
  event.preventDefault();
  const prompt = this.closest('.ft-global-curation-follow-prompt');
  dismissFTGlobalCurationFollowPrompt(prompt);
  trackHomePageRecommendationEvent('ft_global_curation_follow_prompt_dismissed', {
    status: 'dismissed'
  });
});

delegate.on('click', '.ft-global-curation-follow-chip', function () {
  const action = this.classList.contains('plus') ? 'follow' : 'unfollow';
  const prompt = this.closest('.ft-global-curation-follow-prompt');
  const list = prompt?.parentNode?.querySelector('.list-recommendation');
  trackHomePageRecommendationEvent('ft_global_curation_follow_prompt_click', {
    status: action,
    tag: this.getAttribute('data-key') || this.getAttribute('data-tag') || ''
  }, {throttleMs: 500});

  setTimeout(() => {
    updateFollows();
    if (!list) {return;}
    renderFTGlobalCurationFollowPrompt(list, getRememberedRecommendationItems(list));
  }, 0);
});

function getFollowPreferenceAttrs(item, mainTag, preferredLanguage = 'zh-CN') {
  const followedInterest = getFollowedInterestForTag(item, mainTag);
  const annotation = followedInterest?.annotation || findAnnotationForTag(item, mainTag);

  const key = annotation?.prefLabel || followedInterest?.key || mainTag;
  const field = annotation?.field || mapAnnotationField(annotation) || followedInterest?.field;
  if (!field) {return '';}

  let display = getAnnotationDisplay(annotation) || followedInterest?.display || '';
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
  return !!getFollowedInterestForTag(item, tag);
}

function isMatchedRecommendationTag(item, tag) {
  if (!item || !tag || !Array.isArray(item.matchedKeys) || !Array.isArray(item.relevanceMatches)) {
    return false;
  }
  if (!item.matchedKeys.includes(tag)) {return false;}

  for (const match of item.relevanceMatches) {
    if (String(match?.source ?? '').endsWith('Boost')) {continue;}
    if (match?.display !== tag) {continue;}
    const followSources = Array.isArray(match?.followSources) ? match.followSources.filter(Boolean) : [];
    if (followSources.length > 0) {return true;}
  }

  return false;
}

function createFollowedInterestIndex() {
  return {
    byAlias: new Map(),
    entries: new Map()
  };
}

function addFollowedInterest({ key = '', display = '', field = '', aliases = [], source = '' } = {}) {
  const cleanKey = normalizeAnnotationValue(key);
  const cleanDisplay = normalizeAnnotationValue(display);
  const fallbackDisplay = normalizeAnnotationValue(getFallbackTagDisplay(cleanKey));
  const cleanField = normalizeInterestField(field);
  const aliasList = Array.isArray(aliases) ? aliases : [aliases];
  const cleanAliases = [cleanKey, cleanDisplay, fallbackDisplay, ...aliasList]
    .map(value => normalizeAnnotationValue(value))
    .filter(Boolean);

  if (cleanAliases.length === 0) {return null;}

  let interest = null;
  for (const alias of cleanAliases) {
    interest = getFollowedInterestByAlias(alias);
    if (interest) {break;}
  }

  if (!interest) {
    const canonicalKey = cleanKey || cleanAliases[0];
    interest = {
      key: canonicalKey,
      display: cleanDisplay || fallbackDisplay || getFallbackTagDisplay(canonicalKey) || canonicalKey,
      field: cleanField,
      aliases: new Set(),
      sources: new Set()
    };
    followedInterestIndex.entries.set(canonicalKey, interest);
  }

  if (cleanDisplay && (!interest.display || interest.display === interest.key)) {
    interest.display = cleanDisplay;
  }
  if (!interest.field && cleanField) {
    interest.field = cleanField;
  }
  if (source) {
    interest.sources.add(source);
  }

  for (const alias of cleanAliases) {
    addAliasToFollowedInterest(interest, alias);
  }

  return interest;
}

function getFollowedInterestForTag(item, tag) {
  const annotation = findAnnotationForTag(item, tag);
  const aliases = getInterestAliasesForTag(annotation, tag);
  const matches = [];
  const seen = new Set();

  for (const alias of aliases) {
    const interest = getFollowedInterestByAlias(alias);
    if (!interest) {continue;}
    const key = getInterestScoreKey(interest);
    if (seen.has(key)) {continue;}
    seen.add(key);
    matches.push(interest);
  }

  if (matches.length === 0) {return null;}

  const interest = mergeFollowedInterests(matches, annotation, tag);
  return {
    key: interest.key,
    display: interest.display,
    field: interest.field,
    aliases: interest.aliases,
    sources: interest.sources,
    annotation
  };
}

function getInterestAliasesForTag(annotation, tag) {
  return [
    tag,
    annotation?.prefLabel,
    annotation?.display,
    annotation?.translation,
    getFallbackTagDisplay(annotation?.prefLabel)
  ].map(value => normalizeAnnotationValue(value)).filter(Boolean);
}

function getFollowedInterestByAlias(alias) {
  const normalized = normalizeInterestAlias(alias);
  return normalized ? followedInterestIndex.byAlias.get(normalized) : null;
}

function addAliasToFollowedInterest(interest, alias) {
  const cleanAlias = normalizeAnnotationValue(alias);
  const normalizedAlias = normalizeInterestAlias(cleanAlias);
  if (!interest || !normalizedAlias) {return;}
  interest.aliases.add(cleanAlias);
  followedInterestIndex.byAlias.set(normalizedAlias, interest);
}

function mergeFollowedInterests(interests, annotation, tag) {
  let target = chooseFollowedInterest(interests, annotation) || interests[0];
  if (!target) {return null;}

  for (const interest of interests) {
    if (!interest || interest === target) {continue;}
    for (const alias of interest.aliases) {
      addAliasToFollowedInterest(target, alias);
    }
    for (const source of interest.sources) {
      target.sources.add(source);
    }
    if (!target.display && interest.display) {
      target.display = interest.display;
    }
    if (!target.field && interest.field) {
      target.field = interest.field;
    }
    followedInterestIndex.entries.delete(interest.key);
  }

  const canonicalKey = annotation?.prefLabel || target.key;
  updateFollowedInterestKey(target, canonicalKey);

  const annotationDisplay = getAnnotationDisplay(annotation);
  if (annotationDisplay) {
    target.display = annotationDisplay;
  } else if (!target.display) {
    target.display = normalizeAnnotationValue(tag) || target.key;
  }

  const annotationField = mapAnnotationField(annotation);
  if (annotationField) {
    target.field = annotationField;
  }

  for (const alias of getInterestAliasesForTag(annotation, tag)) {
    addAliasToFollowedInterest(target, alias);
  }

  return target;
}

function chooseFollowedInterest(interests, annotation) {
  const annotationKey = normalizeInterestAlias(annotation?.prefLabel);
  if (annotationKey) {
    for (const interest of interests) {
      if (normalizeInterestAlias(interest?.key) === annotationKey) {
        return interest;
      }
    }
  }
  return interests[0] || null;
}

function updateFollowedInterestKey(interest, key) {
  const cleanKey = normalizeAnnotationValue(key);
  if (!interest || !cleanKey || interest.key === cleanKey) {return;}
  followedInterestIndex.entries.delete(interest.key);
  interest.key = cleanKey;
  followedInterestIndex.entries.set(cleanKey, interest);
  addAliasToFollowedInterest(interest, cleanKey);
}

function getInterestScoreKey(interest) {
  return normalizeInterestAlias(interest?.key || interest?.display || '');
}

function normalizeInterestAlias(value) {
  return normalizeAnnotationValue(value).toUpperCase();
}

function normalizeInterestField(field) {
  const rawField = normalizeAnnotationValue(field);
  const key = rawField.toLowerCase();
  const fieldMap = {
    area: 'regions',
    areas: 'regions',
    author: 'byline',
    authors: 'byline',
    brand: 'brand',
    brands: 'brand',
    byline: 'byline',
    customtopic: 'topics',
    genre: 'genres',
    genres: 'genres',
    organisation: 'organisations',
    organisations: 'organisations',
    organization: 'organisations',
    organizations: 'organisations',
    region: 'regions',
    regions: 'regions',
    topic: 'topics',
    topics: 'topics'
  };
  return fieldMap[key] || rawField;
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
  if (type === 'GENRE') {return 'genre';}
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
    container.innerHTML = `<div class="block-container home-page-recommendation-block"><div class="block-inner"><div class="list-container"><div class="list-inner">${buildFTExclusiveCurationIntroHTML()}</div></div><div class="list-container"><div class="list-inner customisation-container"></div></div><div class="list-container"><div class="list-inner list-recommendation card-grid">${html}</div></div></div></div>`;

    targetDom.innerHTML = '';
    targetDom.appendChild(container);

    let customisationEle = container.querySelector('.customisation-container');
    showCustomisation(customisationEle);

    // ✅ Optional: show explanation reasons (safe to remove)
    const recList = container.querySelector('.list-recommendation');
    rememberRecommendationItems(recList, items);
    appendRecommendationReasons(recList, items, window.preferredLanguage ?? 'zh-CN');
    renderFTGlobalCurationFollowPrompt(recList, items);

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

  const isHomePageRecommendation =
    list.classList.contains('home-page-recommendation-list') ||
    list.classList.contains('customisation-container');

  if (isHomePageRecommendation) {
    const note = document.createElement('p');
    note.className = 'home-page-recommendation-description reorder-description';
    note.innerHTML = getFTExclusiveCurationDescription();
    list.parentNode.insertBefore(note, list);
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

  const langKey = getChineseLanguageKey();

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

function getFTGlobalCurationFollowPromptDismissKey() {
  const userKey = window.userId || window.username || 'anonymous';
  return `${FT_GLOBAL_CURATION_FOLLOW_PROMPT_DISMISS_KEY_PREFIX}:${userKey}`;
}

function isFTGlobalCurationFollowPromptDismissed() {
  if (typeof localStorage !== 'object') {return false;}
  try {
    const dismissedUntil = parseInt(localStorage.getItem(getFTGlobalCurationFollowPromptDismissKey()) || '', 10);
    return Number.isFinite(dismissedUntil) && dismissedUntil > Date.now();
  } catch (err) {
    return false;
  }
}

function dismissFTGlobalCurationFollowPrompt(prompt) {
  if (typeof localStorage === 'object') {
    try {
      const dismissedUntil = Date.now() + FT_GLOBAL_CURATION_FOLLOW_PROMPT_DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(getFTGlobalCurationFollowPromptDismissKey(), `${dismissedUntil}`);
    } catch (err) {
      console.warn('Failed to save FT global curation follow prompt dismissal:', err);
    }
  }
  prompt?.remove();
}

function renderFTGlobalCurationFollowPrompt(list, items = []) {
  if (!isFTGlobalCurationRecommendationList(list)) {return;}
  const parent = list?.parentNode;
  if (!parent) {return;}

  const existingPrompt = getDirectFTGlobalCurationFollowPrompt(parent);
  const shouldKeepExistingPrompt = !!existingPrompt && !isFTGlobalCurationFollowPromptDismissed();
  const html = buildFTGlobalCurationFollowPromptHTML(items, {force: shouldKeepExistingPrompt});

  if (!html) {
    existingPrompt?.remove();
    return;
  }

  if (existingPrompt) {
    existingPrompt.outerHTML = html;
  } else {
    list.insertAdjacentHTML('beforebegin', html);
  }

  trackHomePageRecommendationEvent('ft_global_curation_follow_prompt_shown', {
    status: 'shown',
    candidateCount: getFTGlobalCurationFollowCandidates(items).length
  }, {throttleMs: 60 * 60 * 1000});
}

function isFTGlobalCurationRecommendationList(list) {
  if (!list) {return false;}
  return list.classList?.contains('home-page-recommendation-list') ||
    !!list.closest?.('.home-page-recommendation-block');
}

function getDirectFTGlobalCurationFollowPrompt(parent) {
  if (!parent?.children) {return null;}
  for (let i = 0; i < parent.children.length; i += 1) {
    const child = parent.children[i];
    if (child.classList?.contains('ft-global-curation-follow-prompt')) {
      return child;
    }
  }
  return null;
}

function buildFTGlobalCurationFollowPromptHTML(items = [], options = {}) {
  if (!Array.isArray(items) || items.length === 0) {return '';}
  if (isFTGlobalCurationFollowPromptDismissed()) {return '';}

  updateFollows();
  const followedCount = followedInterestIndex.entries.size;
  const candidates = getFTGlobalCurationFollowCandidates(items);
  const hasNewCandidate = candidates.some(candidate => !candidate.isFollowed);
  if (candidates.length === 0 || (!options?.force && (!hasNewCandidate || followedCount >= FT_GLOBAL_CURATION_FOLLOW_PROMPT_MIN_FOLLOWS))) {
    return '';
  }

  const text = getFTExclusiveCurationText();
  const buttons = candidates.map(candidate => {
    const isFollowed = candidate.isFollowed;
    const followClass = isFollowed ? 'tick' : 'plus';
    const attrs = buildFollowPreferenceAttrsFromCandidate(candidate);
    const label = candidate.display;
    const stateLabelAttrs = ` data-follow-label="${escapeAttributeValue(label)}" data-following-label="${escapeAttributeValue(label)}"`;
    return `<button class="myft-follow ${followClass} ft-global-curation-follow-chip" type="button" data-tag="${escapeAttributeValue(candidate.display)}" data-type="tag"${attrs}${stateLabelAttrs}>${escapeAttributeValue(label)}</button>`;
  }).join('');

  return `
    <div class="ft-global-curation-follow-prompt" role="note" data-candidate-count="${candidates.length}">
      <span class="ft-global-curation-follow-prompt-label">${escapeAttributeValue(text.followPrompt)}</span>
      <span class="ft-global-curation-follow-prompt-chips">${buttons}</span>
      <button class="ft-global-curation-follow-prompt-dismiss" type="button">${escapeAttributeValue(text.followPromptDismiss)}</button>
    </div>`;
}

function getFTGlobalCurationFollowCandidates() {
  const candidates = [];

  for (const topic of FT_GLOBAL_CURATION_COLD_START_FOLLOW_TOPICS) {
    const candidate = getFTGlobalCurationColdStartFollowCandidate(topic);
    if (!candidate || candidate.isFollowed) {continue;}
    candidates.push(candidate);
    if (candidates.length >= FT_GLOBAL_CURATION_FOLLOW_PROMPT_LIMIT) {
      break;
    }
  }

  return candidates;
}

function getFTGlobalCurationColdStartFollowCandidate(topic) {
  const key = normalizeAnnotationValue(topic?.key);
  const field = normalizeInterestField(topic?.field);
  const display = normalizeAnnotationValue(topic?.display || topic?.key);
  if (!key || !field || !display) {return null;}

  return {
    tag: display,
    key,
    field,
    display,
    isFollowed: isFTGlobalCurationColdStartTopicFollowed(topic)
  };
}

function isFTGlobalCurationColdStartTopicFollowed(topic) {
  const aliases = [
    topic?.key,
    topic?.display,
    ...(Array.isArray(topic?.aliases) ? topic.aliases : [])
  ];
  return aliases.some(alias => !!getFollowedInterestByAlias(alias));
}

function buildFollowPreferenceAttrsFromCandidate(candidate) {
  if (!candidate?.key || !candidate?.field || !candidate?.display) {return '';}
  return ` data-key="${escapeAttributeValue(candidate.key)}" data-field="${escapeAttributeValue(candidate.field)}" data-display="${escapeAttributeValue(candidate.display)}"`;
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
    Correction: 12,
    Crossword: 12,
    FTSchools: 12,
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
    const contentClass = detectContentClass(item);

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
    const formatPenalty = getLowPriorityContentFormatPenalty(item, contentClass);
    item.formatPenalty = formatPenalty;

    let tierPenalty = 0;
    const contentTier = item.tier;
    if (contentTier) {
      const userTier = getCurrentSubscriptionTier();
      if (userTier === 'standard') {
        tierPenalty = contentTier === 'premium' ? 1 : 0;
      } else if (userTier !== 'premium') {
        tierPenalty = 1;
      }
    }

    const freshnessBonusEligible = isFreshnessBonusEligibleForContentClass(item, contentClass);
    const unSeenItemBonus = updateTimestamp > lastVisitTs && freshnessBonusEligible ? (recommendationWeights.freshnessBonus ? 1 : 0) : 0;
    item.unSeenItemBonus = unSeenItemBonus;

    item.finalScore = parseFloat(finalScore.toFixed(4)) - readMinusScore - tierPenalty - formatPenalty + unSeenItemBonus;


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
  followedInterestIndex = createFollowedInterestIndex();

  const preference = localStorage.getItem('preference');
  let parsedPreference = null;

  try {
    if (preference) {
      parsedPreference = JSON.parse(preference);
    }
  } catch (err) {
    console.warn('Failed to parse preference:', err);
  }

  try {
    if (parsedPreference) {
      const interestSources = [
        ...(parsedPreference['My Interests'] || []),
        ...(parsedPreference['My Custom Interests'] || [])
      ];
      for (const interest of interestSources) {
        const key = typeof interest === 'string' ? interest : interest?.key;
        if (!key) {continue;}
        const display = typeof interest === 'object' ? interest.display : '';
        followsSet.add(key);
        const source = parsedPreference['My Custom Interests']?.includes(interest) ?
          'myFTCustomPreference' :
          'myFTPreference';
        addFollowedInterest({
          key,
          display,
          field: typeof interest === 'object' ? (interest.field || interest.type) : '',
          aliases: typeof interest === 'object' ? [interest.key, interest.display] : [interest],
          source
        });
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

  const RELEVANCE_SCORE_BANDS = {
    strong: { min: 0.65, max: 1 },
    weak: { min: 0.5, max: 0.6 }
  };

  for (const item of items) {
    let score = 0;
    let hasMainMatch = false;
    let hasSecondaryMatch = false;
    let hasKeywordMatch = false;
    let matchedKeys = [];
    let relevanceMatches = [];
    const mainInterestKeys = new Set();
    const secondaryInterestKeys = new Set();
    const keywordInterestKeys = new Set();

    const mainTags = splitUniqueTags(item.annotationsMain);
    const secondaryTags = splitUniqueTags(item.annotationsSecondary);
    const keywords = splitUniqueTags(item.keywords);

    for (const tag of mainTags) {
      const followedInterest = getFollowedInterestForTag(item, tag);
      const interestKey = getInterestScoreKey(followedInterest);
      if (followedInterest && !mainInterestKeys.has(interestKey)) {
        mainInterestKeys.add(interestKey);
        score += WEIGHTS.main;
        hasMainMatch = true;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, 'main', tag, WEIGHTS.main, followedInterest);
      }
    }

    for (const tag of secondaryTags) {
      const followedInterest = getFollowedInterestForTag(item, tag);
      const interestKey = getInterestScoreKey(followedInterest);
      if (followedInterest && !secondaryInterestKeys.has(interestKey)) {
        secondaryInterestKeys.add(interestKey);
        score += WEIGHTS.secondary;
        hasSecondaryMatch = true;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, 'secondary', tag, WEIGHTS.secondary, followedInterest);
      }
    }

    for (const [i, tag] of keywords.entries()) {
      const followedInterest = getFollowedInterestForTag(item, tag);
      const interestKey = getInterestScoreKey(followedInterest);
      if (followedInterest && !keywordInterestKeys.has(interestKey)) {
        keywordInterestKeys.add(interestKey);
        hasKeywordMatch = true;
        const points = i === 0 ? WEIGHTS.keywordPrimary : WEIGHTS.keywordOther;
        score += points;
        addRelevanceMatch(item, relevanceMatches, matchedKeys, i === 0 ? 'keywordPrimary' : 'keywordOther', tag, points, followedInterest);
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
    item.relevanceMatchStrength = hasMainMatch ? 'strong' : (hasSecondaryMatch || hasKeywordMatch ? 'weak' : 'none');
  }

  // Normalize strong and weak matches into separate bands, so weak matches can
  // compare with each other but cannot outrank a main-tag match by relevance.
  const rawRanges = {
    strong: { min: Infinity, max: -Infinity },
    weak: { min: Infinity, max: -Infinity }
  };

  for (const item of items) {
    const r = item.relevanceRaw;
    if (r > 0) {
      const strength = item.relevanceMatchStrength === 'strong' ? 'strong' : 'weak';
      rawRanges[strength].max = Math.max(rawRanges[strength].max, r);
      rawRanges[strength].min = Math.min(rawRanges[strength].min, r);
    }
  }

  for (const item of items) {
    const r = item.relevanceRaw || 0;
    if (r === 0) {
      item.relevanceScore = 0;
    } else {
      const strength = item.relevanceMatchStrength === 'strong' ? 'strong' : 'weak';
      const band = RELEVANCE_SCORE_BANDS[strength];
      const range = rawRanges[strength];
      item.relevanceScore = normalizeRelevanceRawScore(r, range.min, range.max, band.min, band.max);
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

    if (item.relevanceMatchStrength === 'weak' && item.relevanceScore > RELEVANCE_SCORE_BANDS.weak.max) {
      item.relevanceScoreBeforeWeakCap = item.relevanceScore;
      item.relevanceScore = RELEVANCE_SCORE_BANDS.weak.max;
      item.weakRelevanceCapApplied = true;
    }
  }

  return items;
}


// === Score Utilities ===
function normalizeRelevanceRawScore(rawScore, minRawScore, maxRawScore, minScore, maxScore) {
  const score = parseFloat(rawScore) || 0;
  if (score <= 0) {return 0;}
  if (!Number.isFinite(minRawScore) || !Number.isFinite(maxRawScore) || minRawScore === maxRawScore) {
    return maxScore;
  }
  return minScore + (maxScore - minScore) * ((score - minRawScore) / (maxRawScore - minRawScore));
}

function addRelevanceMatch(item, relevanceMatches, matchedKeys, source, key, points, followedInterest) {
  const annotation = followedInterest?.annotation || findAnnotationForTag(item, key);
  const matchKey = annotation?.prefLabel || followedInterest?.key || key;
  const display = getRelevanceMatchDisplay(item, key, followedInterest);
  const followSources = followedInterest ? Array.from(followedInterest.sources).sort() : [];
  relevanceMatches.push({ source, key: matchKey, display, points, followSources });
  if (display && !matchedKeys.includes(display)) {
    matchedKeys.push(display);
  }
}

function getRelevanceMatchDisplay(item, key, followedInterest) {
  const annotation = followedInterest?.annotation || findAnnotationForTag(item, key);
  return getAnnotationDisplay(annotation) || followedInterest?.display || getFallbackTagDisplay(key) || key;
}

function detectContentClass(item = {}) {
  const annotationsMain = item?.annotationsMain ?? '';
  const subtype = item?.subtype ?? '';
  const ftType = item?.ft_type ?? '';
  const tags = splitUniqueTags(annotationsMain);
  if (ftType === 'LiveBlogPackage' || ftType === 'LiveBlogPost') {return ftType;}
  if (subtype === 'LiveBlogPackage') {return subtype;}
  const lowPriorityContentClass = detectLowPriorityContentClass(item);
  if (lowPriorityContentClass) {return lowPriorityContentClass;}
  if (tags.includes('News')) {return 'News';}
  if (tags.includes('Deep dive')) {return 'Deep dive';}
  if (tags.includes('Opinion')) {return 'Opinion';}
  if (tags.includes('Letter')) {return 'Letter';}
  if (tags.includes('Feature')) {return 'Feature';}
  return 'Other';
}

function detectLowPriorityContentClass(item = {}) {
  for (const format of LOW_PRIORITY_CONTENT_FORMATS) {
    if (matchesLowPriorityContentFormat(item, format)) {
      return format.contentClass;
    }
  }
  return '';
}

function matchesLowPriorityContentFormat(item, format) {
  const signalSet = getRecommendationSignalSet(item);
  for (const signal of format.signals || []) {
    if (signalSet.has(normalizeAnnotationValue(signal).toUpperCase())) {
      return true;
    }
  }

  const headline = `${item?.cheadline ?? ''} ${item?.eheadline ?? ''}`.trim();
  return !!(headline && format.headlinePattern && format.headlinePattern.test(headline));
}

function getRecommendationSignalSet(item = {}) {
  const signalSet = new Set();
  const tagFields = [
    item?.annotationsMain,
    item?.annotationsSecondary,
    item?.keywords
  ];

  for (const value of tagFields) {
    for (const tag of splitUniqueTags(value)) {
      addRecommendationSignal(signalSet, tag);
    }
  }

  if (Array.isArray(item?.annotations)) {
    for (const annotation of item.annotations) {
      addRecommendationSignal(signalSet, annotation?.prefLabel);
      addRecommendationSignal(signalSet, annotation?.translation);
      addRecommendationSignal(signalSet, annotation?.display);
    }
  }

  return signalSet;
}

function addRecommendationSignal(signalSet, value) {
  const signal = normalizeAnnotationValue(value);
  if (signal) {
    signalSet.add(signal.toUpperCase());
  }
}

function getLowPriorityContentFormatPenalty(item, contentClass) {
  const format = LOW_PRIORITY_CONTENT_FORMAT_MAP[contentClass];
  if (!format || hasExplicitLowPriorityFormatInterest(item, format)) {return 0;}
  return format.penalty;
}

function isFreshnessBonusEligibleForContentClass(item, contentClass) {
  const format = LOW_PRIORITY_CONTENT_FORMAT_MAP[contentClass];
  if (!format) {return true;}
  return hasExplicitLowPriorityFormatInterest(item, format);
}

function hasExplicitLowPriorityFormatInterest(item, format) {
  if (!Array.isArray(item?.relevanceMatches)) {return false;}
  const formatSignals = new Set((format.signals || [])
    .map(signal => normalizeAnnotationValue(signal).toUpperCase())
    .filter(Boolean));

  for (const match of item.relevanceMatches) {
    if (String(match?.source ?? '').endsWith('Boost')) {continue;}
    const followSources = Array.isArray(match?.followSources) ? match.followSources.filter(Boolean) : [];
    if (followSources.length === 0) {continue;}

    const matchSignals = [
      match?.key,
      match?.display
    ];

    for (const signal of matchSignals) {
      if (formatSignals.has(normalizeAnnotationValue(signal).toUpperCase())) {
        return true;
      }
    }
  }
  return false;
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
    node.setAttribute('data-format-penalty', (item.formatPenalty ?? 0).toFixed(4));
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


function openRecommendationSettings(trigger) {
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
      customHomePage: '在首页显示FT全球臻享',
      premiumOnlyBadge: '高端专享',
      premiumOnlyHomePageNotice: '当前为标准会员，此设置将在升级为高端会员后生效。',
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
      customHomePage: '在首頁顯示FT全球臻享',
      premiumOnlyBadge: '高端專享',
      premiumOnlyHomePageNotice: '當前為標準會員，此設定將在升級為高端會員後生效。',
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
      customHomePage: '在首頁顯示FT全球臻享',
      premiumOnlyBadge: '高端專享',
      premiumOnlyHomePageNotice: '目前為標準會員，此設定將在升級為高端會員後生效。',
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
    {
      key: 'articleTranslationPreference',
      label: t.showAITranslation,
      type: 'checkbox',
      preferenceKey: ARTICLE_TRANSLATION_PREFERENCE_KEY,
      checkedValue: BOTH_TRANSLATION_PREFERENCE_VALUE,
      uncheckedValue: HUMAN_TRANSLATION_PREFERENCE_VALUE
    },
    { key: 'freshnessBonus', label: t.freshnessBonus, type: 'checkbox' },
    {
      key: 'homePagePreference',
      label: t.customHomePage,
      type: 'checkbox',
      preferenceKey: HOME_PAGE_PREFERENCE_KEY,
      checkedValue: CUSTOM_HOME_PAGE_PREFERENCE_VALUE,
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
      label.append(' ');
      const labelText = document.createElement('span');
      labelText.className = 'reorder-toggle-text';
      labelText.textContent = opt.label;
      label.appendChild(labelText);
      row.appendChild(label);
      syncReorderPremiumPreferenceHint(row, label, input, opt, t);
    }

    box.appendChild(row);
  });

  syncHomePagePreferenceTranslationOptIn(box);

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

  const desc = trigger?.closest?.('.reorder-description'); // scope to clicked banner
  if (desc) {
    desc.parentNode.insertBefore(wrapper, desc.nextSibling);
  }
}

delegate.on('click', '.reorder-description a', function (event) {
  event.preventDefault();
  openRecommendationSettings(this);
});

function syncReorderPremiumPreferenceHint(row, label, input, opt, labels) {
  if (!opt?.preferenceKey || !opt?.checkedValue || !opt?.uncheckedValue) {return;}

  const updateHint = () => {
    const selectedValue = input.checked ? opt.checkedValue : opt.uncheckedValue;
    const gate = getPremiumPreferenceGate(opt.preferenceKey, selectedValue, labels);
    const existingBadge = label.querySelector('.reorder-premium-badge');
    const existingNote = row.querySelector('.reorder-premium-note');

    if (!gate) {
      row.classList.remove('reorder-row-premium-gated');
      row.classList.remove('reorder-row-premium-entitled');
      if (existingBadge) {existingBadge.remove();}
      if (existingNote) {existingNote.remove();}
      return;
    }

    row.classList.toggle('reorder-row-premium-gated', !gate.entitled);
    row.classList.toggle('reorder-row-premium-entitled', gate.entitled);
    const badgeClass = `reorder-premium-badge${gate.entitled ? ' is-entitled' : ''}`;

    if (!existingBadge) {
      const badge = document.createElement('span');
      badge.className = badgeClass;
      badge.textContent = gate.badge;
      label.appendChild(badge);
    } else {
      existingBadge.className = badgeClass;
      existingBadge.textContent = gate.badge;
    }

    if (!gate.note) {
      if (existingNote) {existingNote.remove();}
      return;
    }

    if (!existingNote) {
      const note = document.createElement('div');
      note.className = 'reorder-premium-note';
      note.textContent = gate.note;
      row.appendChild(note);
    } else {
      existingNote.textContent = gate.note;
    }
  };

  updateHint();
  input.addEventListener('change', updateHint);
}

function getPreferenceToggle(container, preferenceKey) {
  const inputs = container.querySelectorAll('.reorder-toggle');
  for (const input of inputs) {
    if (input.dataset.preferenceKey === preferenceKey) {
      return input;
    }
  }
  return null;
}

function syncHomePagePreferenceTranslationOptIn(container) {
  const homePageInput = getPreferenceToggle(container, HOME_PAGE_PREFERENCE_KEY);
  const translationInput = getPreferenceToggle(container, ARTICLE_TRANSLATION_PREFERENCE_KEY);
  if (!homePageInput || !translationInput) {return;}

  homePageInput.addEventListener('change', () => {
    if (!homePageInput.checked || translationInput.checked) {return;}
    translationInput.checked = true;
  });
}


delegate.on('click', '[data-action="reorderItems"]', function () {
  // 1. Collect updated values
  const newWeights = {};
  const controls = this.closest('.reorder-controls') || document;
  let preference = {};
  try {
    preference = getMyPreference();
  } catch (err) {
    console.warn('Failed to read existing preference. Creating new one.', err);
    preference = {};
  }
  const previousHomePagePreference = preference?.[HOME_PAGE_PREFERENCE_KEY] || '';

  controls.querySelectorAll('.reorder-slider').forEach(input => {
    const key = input.name;
    const val = parseFloat(input.value);
    if (key && !isNaN(val)) {
      newWeights[key] = val;
    }
  });

  controls.querySelectorAll('.reorder-toggle').forEach(input => {
    if (input.dataset.preferenceKey) {
      preference[input.dataset.preferenceKey] = input.checked ?
        input.dataset.checkedValue :
        input.dataset.uncheckedValue;
      return;
    }
    const key = input.name;
    newWeights[key] = !!input.checked;
  });
  syncPreferenceForFTGlobalCurationOptIn(
    preference,
    HOME_PAGE_PREFERENCE_KEY,
    preference?.[HOME_PAGE_PREFERENCE_KEY]
  );

  // 3. Merge weights and save
  const previousWeights = {...preference.recommendationWeights};
  delete previousWeights.showAITranslation;
  preference.recommendationWeights = {
    ...previousWeights,
    ...newWeights
  };

  savePreferenceSafely(preference);
  const nextHomePagePreference = preference?.[HOME_PAGE_PREFERENCE_KEY] || '';
  if (previousHomePagePreference !== nextHomePagePreference) {
    if (nextHomePagePreference === CUSTOM_HOME_PAGE_PREFERENCE_VALUE) {
      trackHomePageRecommendationEvent('ft_global_curation_preference_enabled', {status: 'enabled'});
    } else if (previousHomePagePreference === CUSTOM_HOME_PAGE_PREFERENCE_VALUE) {
      trackHomePageRecommendationEvent('ft_global_curation_preference_disabled', {status: 'disabled'});
    }
  }

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

      // Reuse the same template renderer to keep UI consistent.
      const html = await buildRecommendationHTML(recalced, preferredLanguage, isWebAppShell());
      container.innerHTML = html;

      // Optional: show explanation reasons (safe to remove).
      appendRecommendationReasons(container, recalced, preferredLanguage);
      renderFTGlobalCurationFollowPrompt(container, recalced);

      runLoadImages();
      if (typeof markReadContent === 'function') {
        markReadContent(container);
      }
      refreshHeadlineLocksIfAvailable();
    }
  })();

  // 5. Clean up UI
  document.querySelectorAll('.reorder-controls').forEach(e => e.remove());
});
