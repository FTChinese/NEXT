/* global window, document, IntersectionObserver, ResizeObserver, HEADSHOTS, refreshAllAds */
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


// Minimal CE builder (text-only pairing like native). Skips <img> and top-level pic divs.
function buildCEBody(ebody, cbody) {
  const getParas = (html) => {
    if (!html) {
      return [];
    }
    const matches = html.match(/<p>[\s\S]*?<\/p>/g) || [];
    const cleaned = [];
    for (let i = 0; i < matches.length; i += 1) {
      const p = matches[i];
      if (p.startsWith('<p><img') || p.startsWith('<p><div class="pic"')) {
        continue;
      }
      cleaned.push(p.replace(/^<p>|<\/p>$/g, ''));
    }
    return cleaned;
  };

  const e = getParas(ebody);
  const c = getParas(cbody);
  const len = Math.max(e.length, c.length);
  let out = '';
  for (let i = 0; i < len; i += 1) {
    const le = e[i] ? `<div class="leftp"><p>${e[i]}</p></div>` : '<div class="leftp"><p></p></div>';
    const lc = c[i] ? `<div class="rightp"><p>${c[i]}</p></div>` : '<div class="rightp"><p></p></div>';
    out += `${le}${lc}<div class="clearfloat"></div>`;
  }
  return out;
}

// Very small follow chips from tags (you can expand later)
function buildRelatedTopics({ tag = '', tag_code = '' }, isEnglish) {
  if (!tag) {
    return { listHTML: '', themeTag: '' };
  }
  const names = tag.split(',').map((s) => s.trim()).filter(Boolean);
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
}

// Body-only renderer: language-dependent UI (called on initial load and on switch)
async function renderContentPageBody(info, appDetailEle, langSel, langValue) {
  // -------- 0) Clean up previous observers before replacing the body --------
  const oldTarget = appDetailEle.querySelector('.user_comments_container');
  if (oldTarget && oldTarget.__io) {
    try { oldTarget.__io.disconnect(); } catch (ignore) {}
    oldTarget.__io = null;
    oldTarget.__observed = false;
  }

  // -------- 1) Language selection & core fields --------
  const isEN = langSel.useEN;
  const isCE = langSel.bilingual;

  const headline = isEN ? (info.eheadline || info.cheadline || '') : (info.cheadline || info.eheadline || '');
  const longLead = isEN ? (info.elongleadbody || info.eshortleadbody || '') : (info.clongleadbody || info.cshortleadbody || '');
  const byline = isEN ? (info.englishByline || info.eauthor || '') : ((info.cbyline && info.cbyline.replace(/\s+/g, '') !== '') ? info.cbyline : (info.cauthor ?? info.eauthor ?? ''));


  const timeStamp = getTimeStamp(info, isEN);

  let bodyHtml = isEN ? (info.ebody || '') : (info.cbody || '');
  if (isCE && info.ebody) {
    bodyHtml = buildCEBody(info.ebody || '', info.cbody || '');
  }

  // Disclaimer (AITranslation tag, Chinese only)
  const disclaimer = (!isEN && info.tag && info.tag.indexOf('AITranslation') >= 0) ? '<div class="ai-disclaimer-container">为了第一时间为您呈现此信息，中文内容为AI翻译，仅供参考。</div>' : '';

  // -------- 2) Ads / entitlement & body normalization --------
  const hasPrivilege = !!info.hasPrivilege;
  const shouldHideAd = hasPrivilege || coerceBool(info.suppressad) || coerceBool(info.hideAd);

  let finalBody = '';
  const { userTier, hasLogin } = getUserInfo();
  const isEnOrCEForNoneSubscriber = userTier < 1 && ['en', 'ce'].includes(langValue ?? '');
  if (hasPrivilege && !isEnOrCEForNoneSubscriber) {
    finalBody = (bodyHtml || '')
      .replace(/<p>\s*<\/p>/g, '') // remove empty paragraphs
      .replace(/([*-]){10,}/g, '<hr>'); // long runs → hr

    if (!shouldHideAd && !isCE) {
      finalBody = insertMPUs(finalBody, [
        '<div class="o-ads mpu mpu-1" data-o-ads-name="mpu1"></div>',
        '<div class="o-ads mpu mpu-2" data-o-ads-name="mpu2"></div>'
      ]);
    }

    const audioId = info?.story_audio?.interactive_id;

    // console.log(`audio id: `, audioId);
    if (audioId) {
      appDetailEle.querySelector('.app-detail-audio').classList.add('on');
    }

  } else {
    const logoutMessage = '请先<a href="/logout" class="o-client-id-link">请点击这里登出</a>，再重新<a href="/login" class="o-client-id-link">登入</a>';
    const loginLink = '<a href="/login" class="o-client-id-link">请点击这里登录</a>';
    const loginMessage = hasLogin ? logoutMessage : loginLink;

    let contentPaywallDescription = 'FT独家内容';
    if (isEnOrCEForNoneSubscriber) {
      if (langValue === 'en') {
        contentPaywallDescription = '英文内容';
      } else if (langValue === 'ce') {
        contentPaywallDescription = '中英文对照内容';
      }
    }
    const messages = {
      lock_message: `成为付费会员，阅读${contentPaywallDescription}`,
      upgrade_message: '成为会员',
      login_message: `如您已经是会员，${loginMessage}`,
    };

    if (info?.access_tier === 2) {
      if (userTier === 1) {
        messages.lock_message = '本内容是高端会员专享，您目前为标准会员';
        messages.upgrade_message = '升级为高端会员';
      } else {
        messages.lock_message = '成为高端会员，阅读高端专享内容';
        messages.upgrade_message = '成为高端会员';
      }
      messages.login_message = `如您已经是高端会员，${loginMessage}`;
    }

    // TODO: track the paywall display (privilege classification)
    finalBody = `<div class="subscribe-lock-container"><div class="lock-block">
        <div class="lock-content">${messages.lock_message}</div>
        <div class="lock-content">${messages.login_message}</div>
        <div class="subscribe-btn"><a href="/subscription">${messages.upgrade_message}►</a></div>
    </div></div>`;
  }

  // Detect any playable video regardless of entitlements so the hero swap is consistent.
  const videoId = extractVideoId(info);
  const videoHeroHTML = videoId ? buildVideoPlayerHTML(info, videoId) : '';
  const hasVideoHero = !!videoHeroHTML;
  if (hasVideoHero && finalBody && typeof document !== 'undefined') {
    const tempBody = document.createElement('div');
    tempBody.innerHTML = finalBody;
    // Remove the first inline player so we only render the hero instance once.
    const inlineVideo = tempBody.querySelector('.video-player, figure.loading-video, .loading-video');
    if (inlineVideo && inlineVideo.parentNode) {
      inlineVideo.parentNode.removeChild(inlineVideo);
      finalBody = tempBody.innerHTML;
    }
  }

  // -------- 3) IMAGE GATE (exactly like Swift) --------
  const tagsStr = info.tag || '';
  const noCopyrightCover = /(^|,)\s*NoCopyrightCover\s*(,|$)/.test(tagsStr);
  const bodyHasTopPic = bodyStartsWithImage(finalBody);
  const heroAllowed = hasVideoHero || (!noCopyrightCover && !bodyHasTopPic);

  let storyImage = '';
  let storyImageNoContainer = '';
  if (heroAllowed) {
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

  // -------- 4) HEADER STYLE (Swift precedence, but only if imageHTML != "") --------
  let headerType = 'default'; // 'hero' | 'columnist' | 'default'
  let headerStyle = { styleClass: '', headshot: '', bgClass: '' };

  if (storyImage !== '') {
    const body = finalBody || '';
    const tag = info.tag || '';
    const genre = info.genre || '';
    const eauthor = info.eauthor || '';
    const columnInfo = info.columninfo || null;

    const isHeroByBody = body.indexOf('full-grid') >= 0 || body.indexOf('scrollable-block') >= 0;
    const isBigFeatureTag = /FT大视野|卧底经济学家|FT杂志|FT大視野|臥底經濟學家|FT雜誌/.test(tag);
    const isWeekendEssay = /周末随笔|周末隨筆/.test(tag);
    const isFTAcademy = /FT商学院|FT商學院/.test(tag);


    if (isHeroByBody || isBigFeatureTag) {
      headerType = 'hero';
      headerStyle = { styleClass: ' show-story-hero-container', headshot: '', bgClass: '' };
    } else if (isWeekendEssay) {
      headerType = 'hero';
      headerStyle = { styleClass: ' show-story-hero-container', headshot: '', bgClass: ' story-hero-theme-pink' };
    } else if (columnInfo && columnInfo.piclink) {
      headerType = 'columnist';
      headerStyle = {
        styleClass: ' show-story-columnist-topper',
        headshot: `<figure data-url="${esc(columnInfo.piclink)}" class="loading"></figure>`,
        bgClass: ''
      };
    } else if (!isFTAcademy && genre && /(comment|opinion|column)/i.test(genre)) {
      const key = (eauthor || '').toUpperCase();
      const pic = HEADSHOTS[key] || (columnInfo && columnInfo.piclink) || '';
      if (pic) {
        headerType = 'columnist';
        headerStyle = {
          styleClass: ' show-story-columnist-topper',
          headshot: `<figure data-url="${esc(pic)}" class="loading"></figure>`,
          bgClass: ''
        };
      } else {
        headerType = 'default';
      }
    } else {
      headerType = 'default';
    }
  } else {
    headerType = 'default';
  }


  // -------- 5) Theme + related topics --------
  const relatedBits = buildRelatedTopics(
    { tag: info.tag || '', tag_code: info.tag_code || info.tagCode || '' },
    isEN
  );

  const storyTheme = relatedBits.themeTag ? `<div class="story-theme"><a target="_blank" href="/tag/${encodeURIComponent(relatedBits.themeTag)}">${esc(relatedBits.themeTag)}</a><button class="myft-follow plus" data-tag="${encodeURIComponent(relatedBits.themeTag)}" data-type="tag">${isEN ? 'Follow' : '关注'}</button></div>` : '';


  // -------- 6) Build the SINGLE header HTML --------
  let headerHTML = '';
  if (headerType === 'hero') {
    headerHTML = `
      <div class="story-hero-container${headerStyle.bgClass}">
        <div class="story-hero-inner">
          <div class="story-hero-intro">
            <div class="story-hero-intro-container">
              <div class="story-hero-tag">${storyTheme}</div>
              <div class="story-hero-title">${esc(headline)}</div>
              <div class="story-hero-content"><p>${esc(longLead)}</p></div>
            </div>
          </div>
        </div>
        <div class="story-hero-image">${storyImageNoContainer}</div>
      </div>
    `;
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
      </div>
    `;
  } else {
    // default topper (inside main story container further below)
    headerHTML = '';
  }

  // -------- 7) Comments visibility --------
  const type = info.item_type || info.type || 'interactive';
  const showComments = ['story', 'premium', 'interactive'].indexOf(type) >= 0 && !isEN;
  const storyCommentsContainerClass = showComments ? '' : 'hide';

  // -------- 8) Headline prefix (限免) --------
  let headlinePrefix = '';
  if (info.tag && (/高端限免|17周年大视野精选|17周年大視野精選|限免/).test(info.tag)) {
    headlinePrefix = '【' + (info.tag.indexOf('限免') >= 0 ? '限免' : '高端限免') + '】';
  }

  // -------- 9) Compose classes & constants --------
  const storyHeadlineClass = (type === 'premium' || (info.subtype || info.subType) === 'bilingual') ? ' story-headline-large' : '';
  const fullGridClass = finalBody.indexOf('full-grid') >= 0 ? ' full-grid-story' : '';
  const scrollyClass = finalBody.indexOf('scrollable-block') >= 0 ? ' has-scrolly-telling' : '';
  const storyBodyClass = `${fullGridClass}${scrollyClass}${headerStyle.styleClass}`;
  const contentType = (type === 'premium') ? 'story' : type;

  // Precompute default topper HTML to avoid multiline ternary inside template
  let defaultTopper = '';
  
  if (headerType === 'default') {
    defaultTopper = `<div class="story-topper">
      ${storyTheme}
      <h1 class="story-headline${storyHeadlineClass}" id="story-headline-ios">${esc(headlinePrefix + headline)}</h1>
      <div class="story-lead">${esc(longLead)}</div>
      ${storyImage}
    </div>`;
  } else if (headerType === 'columnist') {
    defaultTopper = storyImage;
  }

  const appDetailContentEle = appDetailEle.querySelector('.app-detail-content');

  appDetailContentEle.innerHTML = `
    ${headerHTML}
    <div class="block-container has-side story-page">
      <div class="block-inner">
        <div class="content-container">
          <div class="content-inner">
            <div class="story-container${storyBodyClass}">
              ${defaultTopper}
              ${disclaimer || ''}
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

              <!--DiscussContentWithAI (optional) -->
              <div class="${storyCommentsContainerClass}">
                <div class="user_comments_container">
                  <h2 class="box-title">
                    <div class="comments-sort-container">
                      <label for="commentsortby">${isEN ? 'Sort by' : '排序方式'}</label>
                      <select class="commentsortby" id="commentsortby" data-id="${esc(info.id || '')}" data-type="${esc(contentType)}">
                        <option value="1" selected>${isEN ? 'Newest first' : '最新的在上方'}</option>
                        <option value="2">${isEN ? 'Oldest first' : '最早的在上方'}</option>
                        <option value="3">${isEN ? 'Most popular' : '按热门程度'}</option>
                      </select>
                    </div>
                    <a class="list-link" href="#">${isEN ? 'Comments' : '读者评论'}</a>
                  </h2>
                  <div id="allcomments" class="allcomments container"></div>
                </div>

                <div id="logincomment" class="logincomment">
                  <form id="storyForm">
                    <div class="comment-input-container">
                      <div class="container">
                        <div style="margin:5px 0;display:none;">
                          用户名：<span id="comment-user-name"></span>
                          <input type="checkbox" id="anonymous-checkbox" name="anonimous-checkbox" checked>
                          <label for="anonymous-checkbox">匿名发表</label>
                        </div>
                        <div style="margin:5px 0;">FT中文网欢迎读者发表评论，部分评论会被选进《读者有话说》栏目。我们保留编辑与出版的权利。</div>
                        <textarea name="Talk" id="Talk" class="commentTextArea" width="100%" rows="3"></textarea>
                        <span style="display:none">
                          <input name="use_nickname" type="hidden" id="name">
                          <input name="use_nickname" type="radio" id="userid" value="0" checked>
                          <input type="text" autocorrect="off" class="user_id textinput nick_name" name="NickName" id="nick_name" value="">
                        </span>
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
                    <input type="text" autocorrect="off" name="username" id="username1" class="user_id textinput user-name">
                    <div class="password-label">密码</div>
                    <input type="password" name="password" class="user_id textinput password" id="password1">
                    <input type="submit" value="登录后发表评论" class="comment_btn submitbutton button ui-light-btn">
                    <div class="topmargin statusmsg"></div>
                    <a class="social-login-wechat" href="ftcregister://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn stress">免费注册</button></div></a>
                    <a class="social-login-wechat" href="weixinlogin://www.ftchinese.com/"><div class="centerButton"><button class="ui-light-btn wechat-login">微信登录</button></div></a>
                  </div>
                </div>
              </div>
            </div>

            <div class="items">
              <div data-o-ads-name="infoflow3" class="o-ads infoflow"
                   data-o-ads-formats-default="false"
                   data-o-ads-formats-small="FtcInfoFlow"
                   data-o-ads-formats-medium="false"
                   data-o-ads-formats-large="false"
                   data-o-ads-formats-extra="false"
                   data-o-ads-targeting="cnpos=info3;"></div>
            </div>
          </div>
        </div>

        <div class="side-container">
          <div class="side-inner">
            ${relatedBits.listHTML}
          </div>
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

  if (showComments) {
    setupCommentsLazyLoad(String(info.id || ''), contentType);
  }
  setupFollowButtons();

  // External embed shims
  const bodyEl = appDetailEle.querySelector('#ios-story-body');
  if (bodyEl) {
    const htmlText = bodyEl.innerHTML || '';
    if (htmlText.indexOf('flourish-embed') >= 0 && !document.querySelector('script[src*="flourish.studio/resources/embed.js"]')) {
      const s = document.createElement('script');
      s.src = 'https://public.flourish.studio/resources/embed.js';
      s.async = true;
      document.head.appendChild(s);
    }
    if (htmlText.indexOf('twitter-tweet') >= 0 && !document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      const s2 = document.createElement('script');
      s2.src = 'https://platform.twitter.com/widgets.js';
      s2.async = true;
      document.head.appendChild(s2);
    }
  }
  hydrateVideoPlayers(appDetailEle);
  runLoadImages();

  renderAudio(info, appDetailEle, langSel);

  displayRecommendationInContentPageLazy();

  // console.log('content info: ', JSON.stringify(info, null, 2));

  const id = info?.id;
  const ftid = info?.ftid;
  const upLimit = 500;
  if (ftid) {
    updateReadIdsInStorage('readids', ftid, upLimit);
  }
  if (id && type) {
    const key = type + id;
    updateReadIdsInStorage('ftcreadids', key, upLimit);
  }

    //   if (itemType === 'content') {
    //   updateReadIdsInStorage('readids', itemId, upLimit);
    // } else {
    //   updateReadIdsInStorage('ftcreadids', itemTypeId, upLimit);
    // }

  if (typeof refreshAllAds === 'function') {
    refreshAllAds(appDetailEle);
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
