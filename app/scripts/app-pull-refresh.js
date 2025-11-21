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

  // Identify the element that actually scrolls. On the app shell most content
  // scrolls inside `#app-main-content` with `-webkit-overflow-scrolling: touch`,
  // so using `document.scrollingElement` reports `0` even when the inner
  // container has been scrolled. That caused pull-to-refresh to fire mid-page.
  const scrollRoot = (function getScrollContainer() {
    if (container && container.scrollHeight > container.clientHeight) {
      return container;
    }
    return document.scrollingElement || document.documentElement || document.body;
  })();
  const THRESHOLD = 80;
  const MAX_PULL = 140;
  const DAMPING = 0.5;
  const state = {
    startY: 0,
    pulling: false,
    triggered: false,
    refreshing: false,
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

  function isAtTop() {
    if (scrollRoot && typeof scrollRoot.scrollTop === 'number') {
      return scrollRoot.scrollTop <= 0;
    }
    return (window.pageYOffset || 0) <= 0;
  }

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
    hideIndicator();
    try {
      await renderChannel(channel);
    } catch (err) {
      console.error('Pull refresh failed', err);
    } finally {
      state.refreshing = false;
    }
  }

  function onTouchStart(event) {
    if (state.refreshing || event.touches.length !== 1) {
      return;
    }
    if (!isAtTop()) {
      state.pulling = false;
      return;
    }
    state.startY = event.touches[0].clientY;
    state.pulling = true;
    state.triggered = false;
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
    event.preventDefault();
  }

  function onTouchEnd() {
    if (!state.pulling) {
      return;
    }
    resetTransform();
    if (state.triggered && !state.refreshing) {
      triggerRefresh();
    } else {
      hideIndicator();
    }
    state.pulling = false;
    state.startY = 0;
    state.triggered = false;
  }

  container.addEventListener('touchstart', onTouchStart, { passive: true });
  container.addEventListener('touchmove', onTouchMove, { passive: false });
  container.addEventListener('touchend', onTouchEnd);
  container.addEventListener('touchcancel', onTouchEnd);
})();
