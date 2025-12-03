/* global window, document, IntersectionObserver, ResizeObserver, HEADSHOTS, refreshAllAds, hydrateSettingsPage */
/* exported renderContentPage */

/* -----------------------------
   tiny helpers (no deps)
----------------------------- */
const reading_preference_key = 'reading_preference';

// Per-view state registry (keyed by a view's root element)
const detailViewState = new WeakMap();
const BOKECC_SITE_ID = '922662811F1A49E9';
const VIDEO_ASPECT_RATIO = 16 / 9;

const esc = (s) => {
  const v = (s === null || s === undefined) ? '' : s;
  return String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const coerceBool = (v) => (
  String(v) === '1' || v === 1 || v === true || String(v).toLowerCase() === 'true'
);

function getTimeStamp(info, isEn = true) {
  if (!info?.pubdate || !info?.fileupdatetime) {return '';}

  const pubDate = new Date(parseInt(info.pubdate, 10) * 1000);
  const fileUpdateDate = new Date(parseInt(info.fileupdatetime, 10) * 1000);

  const isSameDay =
    pubDate.getFullYear() === fileUpdateDate.getFullYear() &&
    pubDate.getMonth() === fileUpdateDate.getMonth() &&
    pubDate.getDate() === fileUpdateDate.getDate();

  const formatDate = (date, includeTime = true) => {
    if (isEn) {
      const options = includeTime ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' } : { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleString('en-GB', options).replace(',', '');
    } else {
      const pad = (n) => n.toString().padStart(2, '0');
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const h = pad(date.getHours());
      const min = pad(date.getMinutes());
      return includeTime ? `${y}年${m}月${d}日 ${h}:${min}` : `${y}年${m}月${d}日`;
    }
  };

  if (isSameDay) {
    // ✅ Only show updated time
    const updateStr = formatDate(fileUpdateDate, true);
    return isEn ? `${updateStr}` : `${updateStr}`;
  } else {
    // ✅ Show published (date only) and updated (full)
    const pubStr = formatDate(pubDate, false);
    const updateStr = formatDate(fileUpdateDate, true);
    return isEn ? `Published on ${pubStr}, updated at ${updateStr}` : `发布于 ${pubStr}，更新于 ${updateStr}`;
  }
}



/* -----------------------------
   helpers
----------------------------- */

// Insert one or more ad HTML snippets after Nth <p> tags
function insertMPUs(html, adSnippets) {
  if (!html) {
    return html;
  }
  // Normalize to ease regex
  const compact = html.replace(/[\r\n\t]+/g, '');
  let out = compact;

  // Simple paragraph counter insertion (keeps your spirit; adjust as needed)
  const insertAfterNthP = (str, n, snippet) => {
    if (!snippet) {
      return str;
    }
    let count = 0;
    let idx = -1;
    const re = /<\/p>/g;
    let m;
    while ((m = re.exec(str)) !== null) {
      count += 1;
      if (count === n) {
        idx = m.index + m[0].length;
        break;
      }
    }
    if (idx === -1) {
      return str;
    }
    return str.slice(0, idx) + snippet + str.slice(idx);
  };

  // MPU1 after ~3rd paragraph, MPU2 after ~9th paragraph
  if (adSnippets && adSnippets.length) {
    out = insertAfterNthP(out, 3, adSnippets[0] || '');
  }
  if (adSnippets && adSnippets.length > 1) {
    out = insertAfterNthP(out, 9, adSnippets[1] || '');
  }
  return out;
}

// Detect if body starts with a picture block to avoid duplicate hero
const bodyStartsWithImage = (html) => (typeof html === 'string' && html.trim().startsWith('<div class="pic'));

// Build a simple hero figure from story_pic
function buildHeroFromStoryPic(story_pic, withContainer = true) {
  if (!story_pic || !(story_pic.other || story_pic.smallbutton)) {
    return '';
  }
  const src = story_pic.other || story_pic.smallbutton;
  const caption = story_pic.caption ? `<div class="caption">${esc(story_pic.caption)}</div>` : '';
  const figure = `<figure data-url="${esc(src)}" class="loading"></figure>`;
  return withContainer ? `<div class="story-image image" style="margin-bottom:0;">${figure}${caption}</div>` : figure;
}

// Video APIs sometimes ship a raw vid field, sometimes only the HTML snippet.
// Extracting it centrally lets us reuse the same player builder everywhere.
function extractVideoId(info) {
  if (info?.vid) {
    return String(info.vid);
  }
  if (typeof document === 'undefined' || !info?.customHTML) {
    return '';
  }
  const temp = document.createElement('div');
  temp.innerHTML = info.customHTML;
  const preset = temp.querySelector('[data-vid]');
  if (preset && preset.getAttribute('data-vid')) {
    return preset.getAttribute('data-vid');
  }
  const scriptText = temp.textContent || '';
  const match = scriptText.match(/vid\s*=\s*['"]([A-Za-z0-9_-]+)['"]/i);
  return match ? match[1] : '';
}

function buildVideoPlayerHTML(info, providedVid) {
  const resolvedVid = providedVid || extractVideoId(info);
  if (!resolvedVid) {
    return '';
  }

  const siteId = info.siteId || BOKECC_SITE_ID;
  if (typeof document !== 'undefined' && info.customHTML) {
    const temp = document.createElement('div');
    temp.innerHTML = info.customHTML;
    const player = temp.querySelector('.video-player');
    if (player) {
      player.setAttribute('data-video-player', 'bokecc');
      player.setAttribute('data-vid', resolvedVid);
      player.setAttribute('data-site-id', siteId);
      const innerEls = player.querySelectorAll('.video-player-inner');
      if (innerEls.length === 0) {
        const inner = document.createElement('div');
        inner.className = 'video-player-inner';
        inner.setAttribute('data-video-player-inner', '1');
        player.appendChild(inner);
      } else {
        for (let i = 0; i < innerEls.length; i += 1) {
          const innerEl = innerEls[i];
          innerEl.setAttribute('data-video-player-inner', '1');
        }
      }
      const scripts = player.querySelectorAll('script');
      for (let s = 0; s < scripts.length; s += 1) {
        const scriptNode = scripts[s];
        if (scriptNode?.parentNode) {
          scriptNode.parentNode.removeChild(scriptNode);
        }
      }
      return player.outerHTML;
    }
  }

  return `<div class="video-player" data-video-player="bokecc" data-vid="${esc(resolvedVid)}" data-site-id="${esc(siteId)}"><div class="video-player-inner" data-video-player-inner="1"></div></div>`;
}

// Replace third-party inline scripts with a measured player so it works in SPA views.
function hydrateVideoPlayers(root) {
  if (!root) {
    return;
  }
  const players = root.querySelectorAll('[data-video-player="bokecc"]');
  if (!players.length) {
    return;
  }

  for (let i = 0; i < players.length; i += 1) {
    const wrapper = players[i];
    const inner = wrapper.querySelector('[data-video-player-inner]') || wrapper.querySelector('.video-player-inner') || wrapper;
    const vid = wrapper.getAttribute('data-vid');
    const siteId = wrapper.getAttribute('data-site-id') || BOKECC_SITE_ID;

    if (!inner || !vid) {
      continue;
    }

    const mountPlayer = () => {
      const bounds = wrapper.getBoundingClientRect();
      const fallbackWidth = wrapper.offsetWidth || inner.offsetWidth || inner.parentElement?.offsetWidth || 0;
      const width = Math.max(Math.round(bounds.width || fallbackWidth), 0);
      if (!width) {
        if (!wrapper.__videoRetryScheduled) {
          wrapper.__videoRetryScheduled = true;
          const rerender = () => {
            wrapper.__videoRetryScheduled = false;
            mountPlayer();
          };
          if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
            window.requestAnimationFrame(rerender);
          } else {
            setTimeout(rerender, 50);
          }
        }
        return;
      }
      const height = Math.max(Math.round(width / VIDEO_ASPECT_RATIO), 1);

      inner.innerHTML = '';
      inner.style.height = `${height}px`;

      const script = document.createElement('script');
      const params = `vid=${encodeURIComponent(vid)}&siteid=${encodeURIComponent(siteId)}&autoStart=true&width=${width}&height=${height}`;
      script.src = `https://p.bokecc.com/player?${params}`;
      script.type = 'text/javascript';
      script.async = true;
      inner.appendChild(script);

      wrapper.__videoHydrated = true;
      wrapper.__videoRenderedWidth = width;
    };

    mountPlayer();

    if (typeof ResizeObserver === 'function' && !wrapper.__videoResizeObserver) {
      const ro = new ResizeObserver(() => {
        if (!wrapper.isConnected) {
          ro.disconnect();
          return;
        }
        const currentWidth = Math.max(Math.round(wrapper.getBoundingClientRect().width), 0);
        if (!currentWidth || currentWidth === wrapper.__videoRenderedWidth) {
          return;
        }
        wrapper.__videoHydrated = false;
        mountPlayer();
      });
      ro.observe(wrapper);
      wrapper.__videoResizeObserver = ro;
    } else if (typeof window !== 'undefined' && !wrapper.__videoResizeHandler) {
      const resizeHandler = () => {
        if (!wrapper.isConnected) {
          window.removeEventListener('resize', resizeHandler);
          return;
        }
        const currentWidth = Math.max(Math.round(wrapper.getBoundingClientRect().width), 0);
        if (!currentWidth || currentWidth === wrapper.__videoRenderedWidth) {
          return;
        }
        wrapper.__videoHydrated = false;
        mountPlayer();
      };
      window.addEventListener('resize', resizeHandler);
      wrapper.__videoResizeHandler = resizeHandler;
    }
  }
}


// Decide language class and pick fields (rough parity with your Swift rules)
function selectLanguage(info) {
  const myPreference = getMyPreference();
  const readingPreference = myPreference?.[reading_preference_key] ?? 'cn';
  // 'cn' = Chinese, 'en' = English, 'ce' = bilingual

  const hasEN = !!(info.ebody && info.ebody.trim()) || info.body_object_english;

  const show_billigual_switch = info?.show_billigual_switch;

  if (hasEN && readingPreference === 'en') {
    return { langClass: ' en', useEN: true, bilingual: false, hasEN, show_billigual_switch };
  }
  if (hasEN && readingPreference === 'ce') {
    // For now render as Chinese to keep layout; CE split view can be added later if you want.
    return { langClass: ' ce', useEN: false, bilingual: true, hasEN, show_billigual_switch };
  }
  return { langClass: '', useEN: false, bilingual: false, hasEN, show_billigual_switch };
}


function buildCEBody(ebody, cbody) {
  // 1. Helper to parse string into DOM nodes using browser's native parser
  const getChildren = (htmlStr) => {
    if (!htmlStr) { return []; }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlStr;
    // Array.from creates a static array so we don't worry about live nodelists
    return Array.from(tempDiv.children); 
  };

  const enNodes = getChildren(ebody);
  const cnNodes = getChildren(cbody);
  const maxLen = Math.max(enNodes.length, cnNodes.length);

  let outHtml = '';

  for (let i = 0; i < maxLen; i += 1) {
    const enEl = enNodes[i];
    const cnEl = cnNodes[i];

    // Get the HTML string for the node, or empty string if index out of bounds
    const enHtml = enEl ? enEl.outerHTML : '';
    const cnHtml = cnEl ? cnEl.outerHTML : '';

    // 2. Logic Check: Does the English node contain an image?
    // This matches your backend regex: /<picture>|<img/
    // We check if the element IS an image, or CONTAINS one.
    const hasImage = enEl && (
      enEl.tagName === 'IMG' || 
      enEl.tagName === 'PICTURE' || 
      enEl.querySelector('img, picture')
    );

    if (hasImage) {
      // Logic: If it's an image, use the English version (full width/hero style)
      // and ignore the Chinese counterpart to avoid duplicates.
      outHtml += enHtml;
    } else {
      // Logic: Standard text pairing (Left/Right columns)
      // We wrap them in divs to styling classes .leftp and .rightp
      outHtml += `<div class="leftp">${enHtml}</div><div class="rightp">${cnHtml}</div><div class="clearfloat"></div>`;
    }
  }

  return outHtml;
}

// Very small follow chips from tags (you can expand later)
function buildRelatedTopics({ tag = '', tag_code = '' }, isEnglish) {
  // console.log(`tag: ${tag}, tag_code: ${tag_code}`);
  if (!tag) {
    return { listHTML: '', themeTag: '' };
  }
  const reservedSet = new Set(['去广告', '单页', '透明', '置顶', '白底', '靠右', '沉底', '资料', '突发', '插图', '高清', 'interactive_search', '高清', '科技', 'QuizPlus', '单选题', 'SurveyPlus', '置顶', '低调', '精华', '小测', '生活时尚', '测试', '视频', '新闻', 'FTLifeOfASong', 'Podcast', '播音员朗读', 'AI合成', '科技', '双语阅读', '高端专享', '订户专享', '会员专享', '双语电台', '高端限免', '限免', 'NoCopyrightCover', 'AITranslation', 'FTArticle', 'IsEdited', 'HasTranscript', '']);  
  const names = tag.split(',')
    .map(s => s.trim())
    .filter(s => s && !reservedSet.has(s));
  const codes = decodeURIComponent(tag_code || '').split(',').map((s) => s.trim());
  const items = [];
  let primary = '';

  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    if (!name) {
      continue;
    }
    if (!primary) {
      primary = name;
    }
    const code = codes[i] || name;
    const title = isEnglish ? name.replace(/[^A-Za-z0-9 ]/g, '') : name; // keep only ASCII in EN
    if (isEnglish && title === '') {
      continue;
    }
    const link = '/tag/' + encodeURIComponent(name);
    const dataTag = code;
    items.push(
      `<li class="story-theme mp${i + 1}">
        <a target="_blank" href="${link}">${esc(title)}</a>
        <div class="icon-right">
          <button class="myft-follow plus" data-tag="${esc(dataTag)}" data-type="tag">${isEnglish ? 'Follow' : '关注'}</button>
        </div>
      </li>`
    );
  }

  const listHTML = items.length ? `<div class="story-box last-child"><h2 class="box-title"><a>${isEnglish ? 'Related topics' : '相关话题'}</a></h2><ul class="top10">${items.join('')}</ul></div>` : '';
  return { listHTML, themeTag: primary };
}

// After insertion: wire comments loader once
function setupCommentsLazyLoad(contentId, contentType) {
  const target = document.querySelector('.user_comments_container');
  if (!target || target.__observed) {
    return;
  }
  const io = new IntersectionObserver(
    (entries, obs) => {
      for (let i = 0; i < entries.length; i += 1) {
        const e = entries[i];
        if (e.isIntersecting) {
          if (typeof window.loadcomment === 'function') {
            window.loadcomment(contentId, contentType);
          }
          if (typeof window.clickToSubmitComment === 'function') {
            window.clickToSubmitComment();
          }
          obs.unobserve(e.target);
          // disconnect after first trigger for tidiness
          obs.disconnect();
          target.__io = null;
        }
      }
    },
    { root: null, rootMargin: '0px 0px 500px 0px', threshold: 0 }
  );
  io.observe(target);
  target.__observed = true;
  target.__io = io;
}

// Optional: wire follow buttons to your existing web handlers (guarded to add once)
function setupFollowButtons() {
  const root = document.body;
  if (!root || root.__followWired) {
    return;
  }
  root.addEventListener('click', (e) => {
    const t = e.target;
    if (!t || !t.className || typeof t.className !== 'string' || t.className.indexOf('myft-follow') < 0) {
      return;
    }
    const type = t.getAttribute('data-type') || 'tag';
    let value = t.getAttribute('data-tag') || '';
    if (value.indexOf('%') >= 0) {
      try {
        value = decodeURIComponent(value);
      } catch (ignore) {
        // noop
      }
    }

    // toggle UI
    if (t.className.indexOf(' plus') >= 0) {
      t.innerHTML = t.innerHTML === 'Follow' ? 'Following' : '已关注';
      t.className = t.className.replace(' plus', ' tick');
      if (window.FollowAPI && typeof window.FollowAPI.follow === 'function') {
        window.FollowAPI.follow({ type, value });
      }
    } else {
      t.innerHTML = t.innerHTML === 'Following' ? 'Follow' : '关注';
      t.className = t.className.replace(' tick', ' plus');
      if (window.FollowAPI && typeof window.FollowAPI.unfollow === 'function') {
        window.FollowAPI.unfollow({ type, value });
      }
    }
  });
  root.__followWired = true;
}

// Build sticky bottom action bar (save / comment / share / settings)
function renderDetailBottomBar(appDetailEle) {
  try {
    const bottom = appDetailEle?.querySelector('.app-detail-bottom');
    if (!bottom || bottom.__rendered) { return; }

    bottom.innerHTML = `
      <button class="app-detail-bottom-action" type="button" data-action="save" aria-label="Save">
        <span class="app-detail-bottom-icon icon-save"></span>
      </button>
      <button class="app-detail-bottom-action" type="button" data-action="comments" aria-label="Comments">
        <span class="app-detail-bottom-icon icon-comments"></span>
      </button>
      <button class="app-detail-bottom-action" type="button" data-action="share" aria-label="Share">
        <span class="app-detail-bottom-icon icon-share"></span>
      </button>
      <button class="app-detail-bottom-action" type="button" data-action="settings" aria-label="Settings">
        <span class="app-detail-bottom-icon icon-settings"></span>
      </button>
    `;

    bottom.__rendered = true;
  } catch (err) {
    console.error('render detail bottom bar error:', err);
  }
}

// Simple loading veil while content loads/renders
function ensureDetailLoader(root) {
  if (!root) { return null; }
  let loader = root.querySelector('.app-detail-loading');
  if (loader) { return loader; }
  loader = document.createElement('div');
  loader.className = 'app-detail-loading';
  loader.innerHTML = `
    <div class="skeleton title"></div>
    <div class="skeleton meta"></div>
    <div class="skeleton block"></div>
    <div class="skeleton block"></div>
    <div class="skeleton block short"></div>
    <div class="skeleton block"></div>
    <div class="skeleton block short"></div>
  `;
  root.appendChild(loader);
  return loader;
}

function setDetailLoading(root, show) {
  const loader = ensureDetailLoader(root);
  if (!loader) { return; }
  if (show) {
    loader.classList.add('on');
  } else {
    loader.classList.remove('on');
  }
}

async function syncSaveButtonState(btn) {
  try {
    const id = btn?.getAttribute('data-item-id');
    const type = btn?.getAttribute('data-item-type');
    const hasToken = typeof GetCookie === 'function' ? GetCookie('accessTokenUpdateTime') : null;
    if (!btn || !id || !type || !hasToken) { return; }

    const response = await fetch('/check_saved_content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type })
    });
    if (!response.ok) { return; }
    const data = await response.json();
    const isSaved = !!data?.isSaved;
    btn.classList.toggle('saved', isSaved);
    btn.setAttribute('aria-pressed', String(isSaved));
    btn.setAttribute('aria-label', isSaved ? 'Unsave content' : 'Save content');
  } catch (err) {
    console.error('check saved content error:', err);
  }
}

async function toggleSave(button) {
  const id = button?.getAttribute('data-item-id');
  const type = button?.getAttribute('data-item-type');
  const hasToken = typeof GetCookie === 'function' ? GetCookie('accessTokenUpdateTime') : null;
  if (!id || !type) { return; }
  if (!hasToken) {
    const msg = (typeof convertChinese === 'function') ? await convertChinese('请先登录后再收藏', window?.preferredLanguage || 'zh') : 'Please log in to save content.';
    alert(msg);
    return;
  }

  const action = button.classList.contains('saved') ? 'unsave' : 'save';

  button.disabled = true;
  button.classList.add('loading');

  try {
    const response = await fetch('/save_content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type, action })
    });

    if (!response.ok) {
      console.error(`Failed to ${action} content. Status: ${response.status}`);
      return;
    }

    const nowSaved = action === 'save';
    button.classList.toggle('saved', nowSaved);
    button.setAttribute('aria-pressed', String(nowSaved));
    button.setAttribute('aria-label', nowSaved ? 'Unsave content' : 'Save content');
  } catch (error) {
    console.error('Error saving content:', error);
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

// Build a best-effort URL for sharing based on content type/id and current language
function buildShareUrl(info, langMode) {
  const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'https://www.ftchinese.com';
  const id = info?.id || info?.content_id || info?.storyid || '';
  const rawType = info?.item_type || info?.type || 'story';
  const type = rawType === 'interactive' ? 'interactive' : 'story';

  let url = info?.web_url || info?.weburl || info?.url || '';
  if (!url && id) {
    url = `${origin}/${type}/${id}`;
  }
  if (!url && typeof window !== 'undefined' && window.location) {
    url = window.location.href;
  }

  // Append language suffix when appropriate, avoiding duplicates and preserving hash
  const hash = (url && url.indexOf('#') >= 0) ? url.slice(url.indexOf('#')) : '';
  let base = hash ? url.slice(0, url.indexOf('#')) : url;
  const hasLangSuffix = /\/(en|ce)(?:[/?#]|$)/i.test(base);
  if (!hasLangSuffix) {
    if (langMode === 'en') {
      base = `${base}/en`;
    } else if (langMode === 'ce') {
      base = `${base}/ce`;
    }
  }
  return `${base}${hash}`;
}

function resolveShareLang(rootView, info) {
  const activeBtn = rootView?.querySelector?.('.lang-btn.on');
  if (activeBtn) {
    return activeBtn.getAttribute('data-mode') || 'cn';
  }
  const sel = selectLanguage(info || {});
  if (sel?.bilingual) { return 'ce'; }
  if (sel?.useEN) { return 'en'; }
  return 'cn';
}

function resolveShareTitle(rootView, info, langMode) {
  const domTitle = rootView?.querySelector?.('.story-hero-title, #story-headline-ios, .story-headline')?.textContent?.trim();
  if (domTitle) { return domTitle; }
  if (langMode === 'en') { return info?.eheadline || info?.headline || info?.title || info?.cheadline || document.title || ''; }
  if (langMode === 'ce') { return `${info?.cheadline || ''} / ${info?.eheadline || info?.headline || info?.title || ''}`.trim().replace(/^\/|\/$/g, ''); }
  return info?.cheadline || info?.headline || info?.title || info?.eheadline || document.title || '';
}

function resolveShareText(rootView, info, langMode) {
  const domLead = rootView?.querySelector?.('.story-lead')?.textContent?.trim();
  let text = domLead || '';
  if (!text) {
    if (langMode === 'en') {
      text = info?.elongleadbody || info?.eshortleadbody || '';
    } else if (langMode === 'ce') {
      const cn = info?.clongleadbody || info?.cshortleadbody || '';
      const en = info?.elongleadbody || info?.eshortleadbody || '';
      text = [cn, en].filter(Boolean).join(' / ');
    } else {
      text = info?.clongleadbody || info?.cshortleadbody || '';
    }
  }
  const trimmed = (text || '').replace(/\s+/g, ' ').trim();
  return trimmed.length > 200 ? `${trimmed.slice(0, 197)}…` : trimmed;
}

function resolveShareImage(rootView, info) {
  const figureUrl = rootView?.querySelector?.('.story-image figure[data-url]')?.getAttribute?.('data-url');
  if (figureUrl) { return figureUrl; }
  const pic = info?.story_pic || info?.image || {};
  return pic.cover || pic.other || pic.smallbutton || pic.bigbutton || '';
}

async function prepareShareFiles(imageUrl) {
  if (!imageUrl || typeof fetch !== 'function' || typeof File === 'undefined') {
    return [];
  }
  try {
    const res = await fetch(imageUrl, { mode: 'cors' });
    if (!res.ok) { return []; }
    const blob = await res.blob();
    const name = (imageUrl.split('/').pop() || 'thumbnail').split('?')[0] || 'thumbnail';
    const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
    if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      return [file];
    }
  } catch (err) {
    console.warn('Share image fetch failed:', err);
  }
  return [];
}

async function copyShareToClipboard(title, text, url) {
  const payload = [title, text, url].filter(Boolean).join('\n');
  if (!payload) { return; }
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(payload);
    } else {
      const ta = document.createElement('textarea');
      ta.value = payload;
      ta.setAttribute('readonly', 'true');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    const msg = (typeof convertChinese === 'function') ? await convertChinese('分享内容已复制到剪贴板') : 'Share info is in your clipboard.';
    alert(msg);
  } catch (err) {
    console.error('Clipboard share failed:', err);
  }
}

async function shareContent(triggerEl) {
  try {
    const rootView = triggerEl?.closest?.('[data-detail-root]') || document;
    const st = detailViewState.get(rootView) || {};
    const info = st.info || {};
    const langMode = resolveShareLang(rootView, info);

    const title = resolveShareTitle(rootView, info, langMode);
    const descriptionText = resolveShareText(rootView, info, langMode);
    const text = `【${title}】${descriptionText}`;
    const url = buildShareUrl(info, langMode);
    const imageUrl = resolveShareImage(rootView, info);

    const baseShare = { title, text, url };

    // console.log(`share data:`, baseShare);

    const files = await prepareShareFiles(imageUrl);
    const payload = (files.length) ? { ...baseShare, files } : baseShare;

    if (navigator?.share) {
      const canShare =
        !payload.files ||
        typeof navigator.canShare !== 'function' ||
        navigator.canShare(payload);
      if (canShare) {
        await navigator.share(payload);
        return;
      }
    }
    await copyShareToClipboard(title, text, url);
  } catch (err) {
    console.error('share action error:', err);
    try {
      const rootView = triggerEl?.closest?.('[data-detail-root]') || document;
      const st = detailViewState.get(rootView) || {};
      const info = st.info || {};
      const langMode = resolveShareLang(rootView, info);
      await copyShareToClipboard(
        resolveShareTitle(rootView, info, langMode),
        resolveShareText(rootView, info, langMode),
        buildShareUrl(info, langMode)
      );
    } catch (ignore) { /* noop */ }
  }
}

// ------- Settings overlay (stacked view) -------

// Reusable shell so stacked overlays reuse the same transition/back behavior
function createStackedDetailView(extraClass = '') {
  const view = document.createElement('div');
  view.className = `app-detail-view ${extraClass}`.trim();
  view.innerHTML = `
      <div class="app-detail-navigation">
        <div class="app-detail-back" aria-label="Close"></div>
        <div class="app-detail-language-switch"></div>
        <div class="app-detail-audio"></div>
      </div>
      <div class="app-detail-content"></div>
      <div class="app-detail-bottom"></div>`;

  // Stack newer overlays above older ones
  const stackDepth = document.querySelectorAll('.app-detail-view').length;
  view.style.zIndex = String(2 + stackDepth);

  document.body.appendChild(view);
  // Force reflow so CSS transition can kick in
  // eslint-disable-next-line no-unused-expressions
  void view.offsetHeight;
  view.classList.add('on');
  return view;
}

function buildSettingsHTMLFallback(groups = []) {
  if (!groups.length) {
    return '<div class="settings-container"><p>暂无可用设置</p></div>';
  }
  let html = '';
  for (const section of groups) {
    const title = section.title || '';
    const items = Array.isArray(section.items) ? section.items : [];
    const itemsHTML = items.map((item) => {
      const headline = item.headline || '';
      const url = item.url || '';
      const id = item.id || '';
      const type = item.type || '';
      if (url) {
        return `<a class="settings-item" href="${url}">${headline}</a>`;
      }
      return `<li class="settings-item"><button class="settings-button" type="button" data-id="${id}" data-type="${type}">${headline}</button></li>`;
    }).join('');
    html += `<section class="settings-group">${title ? `<h2 class="settings-title">${title}</h2>` : ''}<ul class="settings-items">${itemsHTML}</ul></section>`;
  }
  return `<div class="settings-container">${html}</div>`;
}

async function renderSettingsOverlay() {
  const view = createStackedDetailView('settings-overlay');
  const contentEl = view.querySelector('.app-detail-content');
  if (!contentEl) { return; }

  // Prefer canonical settings groups from global appTypeMap; fall back to empty array.
  const groups = (window.appTypeMap && window.appTypeMap.setting) ? window.appTypeMap.setting : [];
  const html = (typeof window.generateHTMLFromData === 'function') ? window.generateHTMLFromData(groups) : buildSettingsHTMLFallback(groups);

  const heading = (typeof convertChinese === 'function') ? await convertChinese('设置') : '设置';

  contentEl.innerHTML = `
    <div class="block-container">
      <div class="block-inner">
        <div class="content-container">
          <div class="content-inner">
            <h1 class="settings-heading">${heading}</h1>
            ${html}
          </div>
        </div>
      </div>
    </div>
  `;

  if (typeof hydrateSettingsPage === 'function') {
    await hydrateSettingsPage(contentEl);
  }

  // Settings doesn’t need the bottom action bar; keep it empty for a clean overlay.
  const bottom = view.querySelector('.app-detail-bottom');
  if (bottom) { bottom.innerHTML = ''; }
}

function scrollToComments(rootView) {
  try {
    const viewRoot = rootView || document;
    const target = viewRoot.querySelector('.user_comments_container');
    if (!target) { return; }

    if (typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const rect = target.getBoundingClientRect();
      const scrollTop = (document.documentElement || document.body).scrollTop || window.pageYOffset || 0;
      window.scrollTo(0, scrollTop + rect.top);
    }
  } catch (err) {
    console.error('comments scroll error:', err);
  }
}

/* -----------------------------
   MAIN RENDERER (refactored)
----------------------------- */

async function renderContentPage(info, appDetailEle) {
  // console.log(info);
  pushHistory(info?.type ?? 'content', info?.id ?? '');

  // Mark this node as a view root using an attribute (string → no GC risk)
  if (appDetailEle && !appDetailEle.hasAttribute('data-detail-root')) {
    appDetailEle.setAttribute('data-detail-root', '1');
  }

  // show loading veil until body is rendered
  setDetailLoading(appDetailEle, true);

  // Remember state for this view so we can re-render body only
  detailViewState.set(appDetailEle, { info });

  // Inject the sticky action bar once per view
  renderDetailBottomBar(appDetailEle);

  // Select language (reads saved preference)
  const langSel = selectLanguage(info);
  // Wire save button metadata + initial state
  const typeMap = { premium: 'story' };
  const contentType = typeMap[info?.type] ?? info?.type ?? info?.item_type ?? 'story';
  const saveBtn = appDetailEle.querySelector('.app-detail-bottom [data-action="save"]');
  if (saveBtn) {
    if (info?.id) { saveBtn.setAttribute('data-item-id', info.id); }
    saveBtn.setAttribute('data-item-type', contentType);
    saveBtn.classList.add('save_content_button');
    saveBtn.setAttribute('aria-pressed', 'false');
    saveBtn.setAttribute('aria-label', 'Save content');
    syncSaveButtonState(saveBtn);
  }

  try {
    // Render language-dependent body (topper, article, comments, etc.)
    const tags = (info?.tag ?? '').split(',').map(x => x.trim());
    if (tags.includes('教程')) {
      await renderMBAGymPageBody(info, appDetailEle);
    } else {
      await renderContentPageBody(info, appDetailEle, langSel);
      try {
        checkFTQuiz(info, appDetailEle, langSel);
      } catch(err){
        console.error(`render quiz error:`, err);
      }
    }

    // Render or update the language switch without re-creating it
    await renderLanguageSwitch(appDetailEle, langSel);
  } finally {
    setDetailLoading(appDetailEle, false);
  }
}





async function renderContentPageBody(info, appDetailEle, langSel, langValue) {
  // -------- 0) Cleanup --------
  const oldTarget = appDetailEle.querySelector('.user_comments_container');
  if (oldTarget && oldTarget.__io) {
    try { oldTarget.__io.disconnect(); } catch (ignore) {}
    oldTarget.__io = null;
    oldTarget.__observed = false;
  }

  // -------- 1) Text & Language Resolution --------
  const isEN = langSel.useEN;
  const isCE = langSel.bilingual;

  const enHead = info.eheadline || '';
  const cnHead = info.cheadline || '';
  const enLead = info.elongleadbody || info.eshortleadbody || '';
  const cnLead = info.clongleadbody || info.cshortleadbody || '';

  const asDiv = (text) => text ? '<div>' + text + '</div>' : '';

  const resolve = (cn, en) => isCE ?
    asDiv(cn) + asDiv(en) :
    isEN ? en || cn : cn || en;

  const headline = resolve(cnHead, enHead);
  const longLead = resolve(cnLead, enLead);
  
  const cnAuthor = (info.cbyline && info.cbyline.replace(/\s+/g, '') !== '') ? info.cbyline : (info.cauthor || info.eauthor || '');
  const byline = isEN ? (info.englishByline || info.eauthor || '') : cnAuthor;

  const timeStamp = getTimeStamp(info, isEN);

  const disclaimer = (!isEN && info.tag && info.tag.indexOf('AITranslation') >= 0) ? 
    '<div class="ai-disclaimer-container-app">为了第一时间为您呈现此信息，中文内容为AI翻译，仅供参考。</div>' : '';

  // -------- 2) Body Content & Entitlements --------
  let bodyHtml = isEN ? (info.ebody || '') : (info.cbody || '');
  
  if (isCE && info.ebody) {
    bodyHtml = buildCEBody(info.ebody || '', info.cbody || '');
  }

  const hasPrivilege = !!info.hasPrivilege;
  const shouldHideAd = hasPrivilege || coerceBool(info.suppressad) || coerceBool(info.hideAd);
  const { userTier, hasLogin } = getUserInfo();
  
  const isEnOrCEForNoneSubscriber = userTier < 1 && ['en', 'ce'].includes(langValue ?? '');

  let finalBody = '';

  if (hasPrivilege && !isEnOrCEForNoneSubscriber) {
    // A. User has access
    finalBody = (bodyHtml || '')
      .replace(/<p>\s*<\/p>/g, '') 
      .replace(/([*-]){10,}/g, '<hr>');

    if (!shouldHideAd && !isCE) {
      finalBody = insertMPUs(finalBody, [
        '<div class="o-ads mpu mpu-1" data-o-ads-name="mpu1"></div>',
        '<div class="o-ads mpu mpu-2" data-o-ads-name="mpu2"></div>'
      ]);
    }

    if (info?.story_audio?.interactive_id) {
      appDetailEle.querySelector('.app-detail-audio').classList.add('on');
    }

  } else {
    // B. Paywall / Login Prompt
    const logoutMsg = '请先<a href="/logout" class="o-client-id-link">请点击这里登出</a>，再重新<a href="/login" class="o-client-id-link">登入</a>';
    const loginMsg = hasLogin ? logoutMsg : '<a href="/login" class="o-client-id-link">请点击这里登录</a>';

    let contentDesc = 'FT独家内容';
    if (isEnOrCEForNoneSubscriber) {
      contentDesc = langValue === 'en' ? '英文内容' : '中英文对照内容';
    }

    const messages = {
      lock: `成为付费会员，阅读${contentDesc}`,
      upgrade: '成为会员',
      login: `如您已经是会员，${loginMsg}`,
    };

    if (info?.access_tier === 2) {
      const isStd = userTier === 1;
      messages.lock = isStd ? '本内容是高端会员专享，您目前为标准会员' : '成为高端会员，阅读高端专享内容';
      messages.upgrade = isStd ? '升级为高端会员' : '成为高端会员';
      messages.login = `如您已经是高端会员，${loginMsg}`;
    }

    finalBody = `<div class="subscribe-lock-container"><div class="lock-block">
        <div class="lock-content">${messages.lock}</div>
        <div class="lock-content">${messages.login}</div>
        <div class="subscribe-btn"><a href="/subscription">${messages.upgrade}►</a></div>
    </div></div>`;
  }

  const videoId = extractVideoId(info);
  const videoHeroHTML = videoId ? buildVideoPlayerHTML(info, videoId) : '';
  const hasVideoHero = !!videoHeroHTML;
  
  if (hasVideoHero && finalBody && typeof document !== 'undefined') {
    const tempBody = document.createElement('div');
    tempBody.innerHTML = finalBody;
    const inlineVideo = tempBody.querySelector('.video-player, figure.loading-video, .loading-video');
    if (inlineVideo && inlineVideo.parentNode) {
      inlineVideo.parentNode.removeChild(inlineVideo);
      finalBody = tempBody.innerHTML;
    }
  }

  // -------- 3) Hero & Header Determination --------
  const tagsStr = info.tag || '';
  const noCopyrightCover = /(^|,)\s*NoCopyrightCover\s*(,|$)/.test(tagsStr);
  const bodyHasTopPic = bodyStartsWithImage(finalBody);
  
  const isMediaAvailable = hasVideoHero || (!noCopyrightCover && !bodyHasTopPic);

  let storyImage = ''; 
  let storyImageNoContainer = ''; 

  if (isMediaAvailable) {
    if (hasVideoHero) {
      storyImage = `<div class="story-image image story-video">${videoHeroHTML}</div>`;
      storyImageNoContainer = videoHeroHTML;
    } else if (info.customHTML) {
      storyImage = info.customHTML;
    } else {
      storyImage = buildHeroFromStoryPic(info.story_pic, true);
      storyImageNoContainer = buildHeroFromStoryPic(info.story_pic, false);
    }
  }

  let headerType = 'default'; 
  let headerStyle = { styleClass: '', headshot: '', bgClass: '' };

  if (storyImage !== '') {
    const genre = info.genre || '';
    const columnInfo = info.columninfo || null;

    const isHeroByBody = finalBody.indexOf('full-grid') >= 0 || finalBody.indexOf('scrollable-block') >= 0;
    const isBigFeatureTag = /FT大视野|卧底经济学家|FT杂志|FT大視野|臥底經濟學家|FT雜誌/.test(tagsStr);
    const isWeekendEssay = /周末随笔|周末隨筆/.test(tagsStr);
    const isFTAcademy = /FT商学院|FT商學院/.test(tagsStr);

    const useHeroLayout = !isCE;

    if (useHeroLayout && (isHeroByBody || isBigFeatureTag)) {
      headerType = 'hero';
      headerStyle.styleClass = ' show-story-hero-container';

    } else if (useHeroLayout && isWeekendEssay) {
      headerType = 'hero';
      headerStyle.styleClass = ' show-story-hero-container';
      headerStyle.bgClass = ' story-hero-theme-pink';

    } else if (columnInfo && columnInfo.piclink) {
      headerType = 'columnist';
      headerStyle.styleClass = ' show-story-columnist-topper';
      headerStyle.headshot = `<figure data-url="${esc(columnInfo.piclink)}" class="loading"></figure>`;

    } else if (!isFTAcademy && genre && /(comment|opinion|column)/i.test(genre)) {
      const key = (info.eauthor || '').toUpperCase();
      const pic = HEADSHOTS[key] || (columnInfo && columnInfo.piclink) || '';
      if (pic) {
        headerType = 'columnist';
        headerStyle.styleClass = ' show-story-columnist-topper';
        headerStyle.headshot = `<figure data-url="${esc(pic)}" class="loading"></figure>`;
      }
    }
  }

  // -------- 4) Theme & Related Topics --------
  const relatedBits = buildRelatedTopics(
    { tag: info.tag || '', tag_code: info.tag_code || info.tagCode || '' },
    isEN
  );
  
  const themeBtnText = isEN ? 'Follow' : '关注';
  const storyTheme = relatedBits.themeTag ? 
    `<div class="story-theme"><a target="_blank" href="/tag/${encodeURIComponent(relatedBits.themeTag)}">${esc(relatedBits.themeTag)}</a><button class="myft-follow plus" data-tag="${encodeURIComponent(relatedBits.themeTag)}" data-type="tag">${themeBtnText}</button></div>` : '';

  // -------- 5) Build HTML Components --------

  let headerHTML = '';
  if (headerType === 'hero') {
    headerHTML = `
      <div class="story-hero-container${headerStyle.bgClass}">
        <div class="story-hero-inner">
          <div class="story-hero-intro">
            <div class="story-hero-intro-container">
              <div class="story-hero-tag">${storyTheme}</div>
              <div class="story-hero-title">${headline}</div>
              <div class="story-hero-content"><p>${longLead}</p></div>
            </div>
          </div>
        </div>
        <div class="story-hero-image">${storyImageNoContainer}</div>
      </div>`;
  } else if (headerType === 'columnist') {
    headerHTML = `
      <div class="story-topper-container has-side">
        <div class="block-inner">
          <div class="content-container"><div class="content-inner"><div class="story-container">
            ${storyTheme}
            <h1 class="story-headline">${headline}</h1>
            <div class="story-lead">${longLead}</div>
            <div class="story-author">${byline}</div>
            <div class="author-headshot">${headerStyle.headshot}</div>
          </div></div></div>
          <div class="clearfloat block-bottom"></div>
        </div>
      </div>`;
  }

  let headlinePrefix = '';
  if (info.tag && (/高端限免|17周年大视野精选|17周年大視野精選|限免/).test(info.tag)) {
    headlinePrefix = '【' + (info.tag.indexOf('限免') >= 0 ? '限免' : '高端限免') + '】';
  }

  const type = info.item_type || info.type || 'interactive';
  const storyHeadlineClass = (type === 'premium' || (info.subtype || info.subType) === 'bilingual') ? ' story-headline-large' : '';
  
  let defaultTopper = '';
  if (headerType === 'default') {
    defaultTopper = `<div class="story-topper">
      ${storyTheme}
      <h1 class="story-headline${storyHeadlineClass}" id="story-headline-ios">${headlinePrefix + headline}</h1>
      <div class="story-lead">${longLead}</div>
      ${storyImage}
    </div>`;
  } else if (headerType === 'columnist') {
    defaultTopper = storyImage;
  }

  const fullGridClass = finalBody.indexOf('full-grid') >= 0 ? ' full-grid-story' : '';
  const scrollyClass = finalBody.indexOf('scrollable-block') >= 0 ? ' has-scrolly-telling' : '';
  const storyBodyClass = `${fullGridClass}${scrollyClass}${headerStyle.styleClass}`;

  const showComments = ['story', 'premium', 'interactive'].indexOf(type) >= 0 && !isEN;
  const commentsClass = showComments ? '' : 'hide';
  const contentType = (type === 'premium') ? 'story' : type;

  // -------- 6) Final Template Assembly --------
  const appDetailContentEle = appDetailEle.querySelector('.app-detail-content');

  appDetailContentEle.innerHTML = `
    ${headerHTML}
    <div class="block-container has-side story-page">
      <div class="block-inner">
        <div class="content-container">
          <div class="content-inner">
            <div class="story-container${storyBodyClass}">
              ${disclaimer}
              ${defaultTopper}
              <div class="story-byline">
                <span class="story-time">${timeStamp}</span>
                <span class="story-author">${byline}</span>
              </div>
              <div class="story-body">
                <div id="ios-story-body">${finalBody}</div>
                <div class="clearfloat"></div>
              </div>
              <div class="chat-talk"><div class="chat-talk-inner"><div id="story-quiz-container"></div></div></div>
              <div class="clearfloat block-bottom"></div>

              <div class="${commentsClass}">
                <div class="user_comments_container">
                  <h2 class="box-title">
                    <div class="comments-sort-container">
                      <label>${isEN ? 'Sort by' : '排序方式'}</label>
                      <select class="commentsortby" data-id="${esc(info.id || '')}" data-type="${esc(contentType)}">
                        <option value="1" selected>${isEN ? 'Newest first' : '最新的在上方'}</option>
                        <option value="2">${isEN ? 'Oldest first' : '最早的在上方'}</option>
                        <option value="3">${isEN ? 'Most popular' : '按热门程度'}</option>
                      </select>
                    </div>
                    <a class="list-link" href="#">${isEN ? 'Comments' : '读者评论'}</a>
                  </h2>
                  <div id="allcomments" class="allcomments container"></div>
                </div>
                ${renderCommentForms(info, contentType)}
              </div>
            </div>

            <div class="items">
              <div data-o-ads-name="infoflow3" class="o-ads infoflow" data-o-ads-formats-small="FtcInfoFlow" data-o-ads-targeting="cnpos=info3;"></div>
            </div>
          </div>
        </div>

        <div class="side-container">
          <div class="side-inner">${relatedBits.listHTML}</div>
        </div>
        <div class="clearfloat"></div>
      </div>
    </div>

    <div class="block-container no-side story-recommend-container">
      <div class="block-inner">
        <div class="content-container"><div class="content-inner" id="onward-journey">
          <div class="list-container"><div class="list-inner">
            <h2 class="list-title"><a class="list-link" href="/channel/mba.html">${isEN ? 'Recommended reading' : '推荐阅读'}</a></h2>
            <div class="card-grid list-recommendation"></div>
          </div></div>
        </div></div>
        <div class="clearfloat"></div>
      </div>
    </div>
  `;

  // -------- 7) Post-Render Actions --------
  if (showComments) {
    setupCommentsLazyLoad(String(info.id || ''), contentType);
  }
  setupFollowButtons();
  injectEmbedScripts(appDetailEle);
  hydrateVideoPlayers(appDetailEle);
  runLoadImages();
  renderAudio(info, appDetailEle, langSel);
  displayRecommendationInContentPageLazy(appDetailEle);

  const id = info?.id;
  const ftid = info?.ftid;
  
  // FIX: Added braces to satisfy JSHint
  if (ftid) {
    updateReadIdsInStorage('readids', ftid, 500);
  }
  if (id && type) {
    updateReadIdsInStorage('ftcreadids', type + id, 500);
  }

  if (typeof refreshAllAds === 'function') {
    refreshAllAds(appDetailEle);
  }
}

function renderCommentForms(info, contentType) {
  return `
    <div id="logincomment" class="logincomment">
      <form id="storyForm">
        <div class="comment-input-container">
          <div class="container">
             <div style="margin:5px 0;">FT中文网欢迎读者发表评论，部分评论会被选进《读者有话说》栏目。我们保留编辑与出版的权利。</div>
             <textarea name="Talk" id="Talk" class="commentTextArea" rows="3"></textarea>
             <input type="button" value="提交评论" class="comment_btn submitbutton button ui-light-btn" id="addnewcomment">
             <input type="hidden" id="content_id" value="${esc(info.id || '')}">
             <input type="hidden" id="content_type" value="${esc(contentType)}">
          </div>
        </div>
      </form>
    </div>
    <div id="nologincomment" class="nologincomment">
      <div class="container">
        <div class="username-label">用户名</div>
        <input type="text" autocorrect="off" name="username" class="user_id textinput user-name">
        <div class="password-label">密码</div>
        <input type="password" name="password" class="user_id textinput password">
        <input type="submit" value="登录后发表评论" class="comment_btn submitbutton button ui-light-btn">
        <div class="topmargin statusmsg"></div>
        <a class="social-login-wechat" href="ftcregister://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn stress">免费注册</button></div></a>
        <a class="social-login-wechat" href="weixinlogin://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn wechat-login">微信登录</button></div></a>
      </div>
    </div>`;
}

function injectEmbedScripts(container) {
  const bodyEl = container.querySelector('#ios-story-body');
  
  // FIX: Added braces to satisfy JSHint
  if (!bodyEl) {
    return;
  }
  
  const htmlText = bodyEl.innerHTML || '';
  
  if (htmlText.indexOf('flourish-embed') >= 0 && !document.querySelector('script[src*="flourish.studio/resources/embed.js"]')) {
    const s = document.createElement('script');
    s.src = 'https://public.flourish.studio/resources/embed.js';
    s.async = true;
    document.head.appendChild(s);
  }
  if (htmlText.indexOf('twitter-tweet') >= 0 && !document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
    const s = document.createElement('script');
    s.src = 'https://platform.twitter.com/widgets.js';
    s.async = true;
    document.head.appendChild(s);
  }
}



















// JS — renderLanguageSwitch (stable widget; no full re-render on toggle)
async function renderLanguageSwitch(appDetailEle, langSel) {
  if (!langSel?.show_billigual_switch) { return; }
  const slot = appDetailEle.querySelector('.app-detail-language-switch');
  if (!slot) { return; }

  // Mode: cn = Chinese, en = English, ce = 对照（bilingual）
  const mode = langSel.bilingual ? 'ce' : (langSel.useEN ? 'en' : 'cn');

  if (!slot.__rendered) {
    // Convert Chinese labels once
    const labelCN = await convertChinese('中文');
    const labelCE = await convertChinese('对照');

    slot.innerHTML = `
      <div class="lang-switch" role="tablist">
        <button class="lang-btn" role="tab" aria-selected="false" tabindex="-1" data-mode="cn">${esc(labelCN)}</button>
        <button class="lang-btn" role="tab" aria-selected="false" tabindex="-1" data-mode="en">English</button>
        <button class="lang-btn" role="tab" aria-selected="false" tabindex="-1" data-mode="ce">${esc(labelCE)}</button>
      </div>
    `;
    slot.__rendered = true;
  }


  // Update button states without re-rendering the switch
  const btns = slot.querySelectorAll('.lang-btn');
  for (let i = 0; i < btns.length; i += 1) {
    const b = btns[i];
    const active = b.getAttribute('data-mode') === mode;
    if (active) {
      if (!b.classList.contains('on')) { b.classList.add('on'); }
      b.setAttribute('aria-selected', 'true');
      b.setAttribute('tabindex', '0');
    } else {
      b.classList.remove('on');
      b.setAttribute('aria-selected', 'false');
      b.setAttribute('tabindex', '-1');
    }
  }
}





// This is for frontend check for displaying correct information. We also made sure the actual data is verified on the backend
function getUserInfo() {
    const rootClassList = document.documentElement.classList;
    const hasLogin = rootClassList.contains('is-member');
    let userTier = 0;
    if (rootClassList.contains('is-premium')) {
      userTier = 2;
    } else if (rootClassList.contains('is-subscriber')) {
      userTier = 1;
    }
    return {userTier, hasLogin};
}



function destroyDetailView(view) {
      try {
        if (view && window.appAds && typeof window.appAds.teardown === 'function') {
          window.appAds.teardown(view);
        }

        // Remove the "on" class → triggers your CSS transition/animation
        view.classList.remove('on');

        // Define a one-time listener for when the transition ends
        const handleTransitionEnd = (e) => {
            // Make sure it only reacts to the intended property if needed
            if (e.target === view) {
                view.removeEventListener('transitionend', handleTransitionEnd);
                view.remove(); // Remove the DOM element
            }
        };

        view.addEventListener('transitionend', handleTransitionEnd);

        // For animations instead of transitions, use 'animationend'
        // view.addEventListener('animationend', handleTransitionEnd);
    } catch (err) {
        console.error('render story error:', err);
    }
}

/* -----------------------------
   Language switch handler
----------------------------- */

delegate.on('click', '.lang-btn', async function () {
  try {
    if (this.classList.contains('on')) { return; }


    const langValue = this.getAttribute('data-mode');
    // const {userTier} = getUserInfo();

    // if (userTier < 1 && ['en', 'ce'].includes(langValue)) {
    //   alert(`You need to subscribe to read English or Billingual content! `);
    //   return;
    // }

    // Toggle "on" among siblings + ARIA
    const siblings = this.parentNode.querySelectorAll('.lang-btn');
    for (let i = 0; i < siblings.length; i += 1) {
      siblings[i].classList.remove('on');
      siblings[i].setAttribute('aria-selected', 'false');
      siblings[i].setAttribute('tabindex', '-1');
    }
    this.classList.add('on');
    this.setAttribute('aria-selected', 'true');
    this.setAttribute('tabindex', '0');

    if (langValue) {
      saveMyPreferenceByKey(reading_preference_key, langValue);
    }

    // Find the view root
    const rootView = this.closest('[data-detail-root]');
    if (!rootView) { return; }

    // 🔹 simple reset: clear content + scroll to top
    const container = rootView.querySelector('.app-detail-content');
    if (container) {
      container.innerHTML = '';
    }
    // Scroll page to the view top (keeps it simple)
    try {
      rootView.scrollIntoView({ block: 'start' });
    } catch (e) {
      // fallback
      window.scrollTo(0, 0);
    }

    // Re-render BODY ONLY with the new language
    const st = detailViewState.get(rootView);
    if (!st || !st.info) { return; }
    const newLangSel = selectLanguage(st.info);
    await renderContentPageBody(st.info, rootView, newLangSel, langValue);

  } catch (err) {
    console.error('lang switch btn error:', err);
  }
});




delegate.on('click', '.app-detail-audio.on', async function () {
  try {
    const rootView = this.closest('[data-detail-root]');
    if (!rootView) { return; }
    const st = detailViewState.get(rootView);
    const id = st?.info?.story_audio?.interactive_id;
    if (!id) { return; }
    const type = 'interactive';
    await handleContentData({id, type});
  } catch (err) {
    console.error('lang switch btn error:', err);
  }
});

delegate.on('click', '.app-detail-back', async function () {
  destroyDetailView(this.closest('.app-detail-view'));
});

delegate.on('click', '.app-detail-bottom-action', async function () {
  const action = this.getAttribute('data-action') || 'unknown';
  if (action === 'save') {
    await toggleSave(this);
    return;
  } else if (action === 'comments') {
    const rootView = this.closest('[data-detail-root]') || document;
    scrollToComments(rootView);
    return;
  } else if (action === 'settings') {
    await renderSettingsOverlay();
    return;
  } else if (action === 'share') {
    await shareContent(this);
    return;
  }
  console.log(`[app-detail-bottom] ${action} clicked`);
});

// // TODO: - Use translateY to implement the touch screen gesture of swipe from left to right to dismiss the app-detail-view by moving it visually to the right and remove it after the animation is done. 

// // Gobal variables to keep track of necessary information regarding gesture

// delegate.on('touchstart', '.app-detail-view', async function (event) {
//     try {
//         console.log(this.classList);
//         console.log(event);

//     } catch (err) {
//         console.error('touchstart error:', err);
//     }
// });


// delegate.on('touchmove', '.app-detail-view', async function (event) {
//     try {
//         console.log(this.classList);
//         console.log(event);

//     } catch (err) {
//         console.error('touchmove error:', err);
//     }
// });

// delegate.on('touchend', '.app-detail-view', async function (event) {
//     try {
//         console.log(this.classList);
//         console.log(event);


//     } catch (err) {
//         console.error('touchend:', err);
//     }
// });
