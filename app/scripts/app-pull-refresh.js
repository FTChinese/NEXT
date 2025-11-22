(function () {
  const IOS_UA_REGEX = /(iPad|iPhone|iPod)/i;
  const container = document.getElementById('app-main-content');

  function isIosDevice() {
    const ua = window.navigator.userAgent || '';
    const platform = window.navigator.platform || '';
    if (IOS_UA_REGEX.test(ua)) {
      return true;
    }
    return platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  }

  if (!container || !isIosDevice()) {
    return;
  }

  // Identify likely scrollable root. Prefer the main app container if its
  // content is taller than its viewport; otherwise fall back to the document.
  function chooseScrollRoot() {
    if (container && container.scrollHeight - container.clientHeight > 1) {
      return container;
    }
    return document.scrollingElement || document.documentElement || document.body;
  }

  const scrollRoot = chooseScrollRoot();

  // Lightweight debug logger so we can collect device logs.
  const DEBUG = false; // set to false to silence
  function logDebug(label, payload) {
    if (!DEBUG || !window.console || typeof window.console.log !== 'function') {
      return;
    }
    window.console.log('[pull-refresh]', label, payload || '');
  }
  const THRESHOLD = 80;
  const MAX_PULL = 140;
  const DAMPING = 0.5;
  const state = {
    startY: 0,
    pulling: false,
    triggered: false,
    refreshing: false,
    loggedMove: false,
  };

  const header = document.querySelector('.app-header-container');
  const indicator = document.createElement('div');
  indicator.className = 'app-pull-refresh-indicator';
  indicator.setAttribute('aria-live', 'polite');
  indicator.textContent = '下拉刷新';
  indicator.style.position = 'fixed';
  indicator.style.left = '0';
  indicator.style.right = '0';
  const headerOffset = header ? header.offsetHeight + 8 : 96;
  indicator.style.top = headerOffset + 'px';
  indicator.style.textAlign = 'center';
  indicator.style.fontSize = '12px';
  indicator.style.color = '#666';
  indicator.style.opacity = '0';
  indicator.style.transition = 'opacity 0.2s ease';
  indicator.style.pointerEvents = 'none';
  indicator.style.zIndex = '5';
  indicator.style.padding = '0 12px';
  indicator.style.maxWidth = '100%';
  document.body.appendChild(indicator);

  function currentScrollTops() {
    return {
      scrollRoot: scrollRoot ? scrollRoot.scrollTop : null,
      container: container ? container.scrollTop : null,
      docEl: document.documentElement ? document.documentElement.scrollTop : null,
      body: document.body ? document.body.scrollTop : null,
      pageYOffset: window.pageYOffset || 0,
    };
  }

  // Treat as "at top" only when every candidate scroller is at (or near) 0.
  function isAtTop() {
    const tops = currentScrollTops();
    const vals = [tops.scrollRoot, tops.container, tops.docEl, tops.body, tops.pageYOffset];
    const anyScrolled = vals.some(function (v) {
      return typeof v === 'number' && v > 0.5;
    });
    return !anyScrolled;
  }

  logDebug('init', {
    scrollRoot: scrollRoot === container ? '#app-main-content' : (scrollRoot && scrollRoot.tagName),
    scrollRootHeight: scrollRoot ? {scrollHeight: scrollRoot.scrollHeight, clientHeight: scrollRoot.clientHeight} : null,
    containerHeight: container ? {scrollHeight: container.scrollHeight, clientHeight: container.clientHeight} : null,
    tops: currentScrollTops(),
  });

  function getActiveChannel() {
    const activeTab = document.querySelector('.app-channel.on');
    if (!activeTab || typeof appMap !== 'object') {
      return null;
    }
    const sectionName = activeTab.getAttribute('data-section');
    const index = parseInt(activeTab.getAttribute('data-index'), 10);
    if (!sectionName || Number.isNaN(index)) {
      return null;
    }
    const section = appMap[sectionName];
    if (!section || !Array.isArray(section.Channels)) {
      return null;
    }
    const channel = section.Channels[index];
    if (channel) {
      channel.index = index;
    }
    return channel || null;
  }

  function resetTransform() {
    container.style.transition = 'transform 0.2s ease';
    container.style.transform = 'translate3d(0, 0, 0)';
    window.setTimeout(function () {
      container.style.transition = '';
      container.style.transform = '';
    }, 200);
  }

  function hideIndicator() {
    indicator.style.opacity = '0';
  }

  async function triggerRefresh() {
    const channel = getActiveChannel();
    if (!channel || typeof renderChannel !== 'function') {
      hideIndicator();
      return;
    }
    state.refreshing = true;
    logDebug('refresh:start', { channel });
    hideIndicator();
    try {
      await renderChannel(channel);
    } catch (err) {
      console.error('Pull refresh failed', err);
      logDebug('refresh:error', err && err.message ? err.message : err);
    } finally {
      state.refreshing = false;
      logDebug('refresh:done');
    }
  }

  function onTouchStart(event) {
    if (state.refreshing || event.touches.length !== 1) {
      return;
    }
    const atTop = isAtTop();
    state.loggedMove = false;
    if (!atTop) {
      state.pulling = false;
      logDebug('touchstart: blocked (not at top)', { tops: currentScrollTops() });
      return;
    }
    state.startY = event.touches[0].clientY;
    state.pulling = true;
    state.triggered = false;
    logDebug('touchstart: allowed', { startY: state.startY, tops: currentScrollTops() });
  }

  function onTouchMove(event) {
    if (!state.pulling || state.refreshing) {
      return;
    }
    const delta = event.touches[0].clientY - state.startY;
    if (delta <= 0) {
      container.style.transform = '';
      hideIndicator();
      state.triggered = false;
      return;
    }
    const pullDistance = Math.min(MAX_PULL, delta * DAMPING);
    container.style.transition = 'transform 0s';
    container.style.transform = 'translate3d(0,' + pullDistance + 'px,0)';
    indicator.style.opacity = '1';
    if (pullDistance >= THRESHOLD) {
      indicator.textContent = '释放刷新';
      state.triggered = true;
    } else {
      indicator.textContent = '下拉刷新';
      state.triggered = false;
    }
    if (!state.loggedMove) {
      logDebug('touchmove', {
        delta: +delta.toFixed(1),
        pullDistance: +pullDistance.toFixed(1),
        thresholdReached: state.triggered,
        tops: currentScrollTops(),
      });
      state.loggedMove = true;
    }
    event.preventDefault();
  }

  function onTouchEnd() {
    if (!state.pulling) {
      return;
    }
    resetTransform();
    if (state.triggered && !state.refreshing) {
      logDebug('touchend: trigger refresh', { tops: currentScrollTops() });
      triggerRefresh();
    } else {
      logDebug('touchend: cancel', { tops: currentScrollTops() });
      hideIndicator();
    }
    state.pulling = false;
    state.startY = 0;
    state.triggered = false;
    state.loggedMove = false;
  }

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd);
  container.addEventListener('touchcancel', onTouchEnd);
})();
