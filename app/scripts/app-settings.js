
/* global appTypeMap, createStackedDetailView, setFontSize, setTranslatePreference */

delegate.on('click', '.settings-item', async function () {
  try {
    // Allow normal anchor handling (handleLink in app-nav) to proceed.
    if (this.tagName === 'A' && this.getAttribute('href')) {
      return;
    }

    const trigger = this;
    const info = findSettingInfo(trigger);
    if (!info) { return; }

    // Only settings with options need the custom picker.
    const options = Array.isArray(info.options) ? info.options : [];
    if (!options.length) {
      return;
    }

    const currentValue = resolveCurrentValue(info, options);
    const detailView = createSettingsDetailView(info.headline || '设置');
    const contentEl = detailView?.querySelector('.app-detail-content');
    if (!contentEl) { return; }

    contentEl.innerHTML = buildOptionsHTML(info, options, currentValue);

    const list = contentEl.querySelector('.settings-option-list');
    if (!list) { return; }

  list.addEventListener('click', async (evt) => {
    const optionEl = evt.target.closest('.settings-option');
    if (!optionEl) { return; }
    const value = optionEl.getAttribute('data-value') ?? '';
    const display = optionEl.getAttribute('data-display') ?? value;

    await applySettingSelection(info, value);
    applySettingToTargets(info, value);

    updateSelectedOptionUI(list, optionEl);
    updateSummaryLabel(trigger, display);

      if (typeof destroyDetailView === 'function') {
        destroyDetailView(detailView);
      } else {
        detailView.remove();
      }
    });
  } catch (err) {
    console.error('render story error:', err);
  }
});

function findSettingInfo(trigger) {
  try {
    const sectionIndex = parseInt(trigger.getAttribute('data-section-index'), 10);
    const itemIndex = parseInt(trigger.getAttribute('data-item-index'), 10);
    if (!Number.isNaN(sectionIndex) && !Number.isNaN(itemIndex)) {
      return appTypeMap?.setting?.[sectionIndex]?.items?.[itemIndex];
    }

    const id = trigger.getAttribute('data-id');
    if (!id) { return null; }
    for (const group of appTypeMap?.setting ?? []) {
      const match = (group?.items ?? []).find((item) => item?.id === id);
      if (match) { return match; }
    }
    return null;
  } catch (err) {
    console.error('find setting info error:', err);
    return null;
  }
}

function resolveCurrentValue(info, options = []) {
  const myPreference = getMyPreference();
  const prefValue = info?.preferenceKey ? myPreference?.[info.preferenceKey] : null;
  const cookieValue = info?.cookieName ? GetCookie(info.cookieName) : null;
  const defaultValue = options.find((opt) => opt?.is_default)?.name;
  const firstValue = options?.[0]?.name;
  return prefValue || cookieValue || defaultValue || firstValue || '';
}

function applySettingToTargets(info, value) {
  try {
    if (!info?.applyTo || !value) { return; }
    if (info.applyTo === 'bodyClassList' && document?.body?.classList) {
      const options = Array.isArray(info.options) ? info.options : [];
      const toRemove = options.map((opt) => opt?.name).filter(Boolean);
      if (toRemove.length) {
        document.body.classList.remove(...toRemove);
      }
      document.body.classList.add(value);
    }
  } catch (err) {
    console.error('apply setting target error:', err);
  }
}

function createSettingsDetailView(title = '') {
  // Prefer the shared stacked view helper from app-content.js
  if (typeof createStackedDetailView === 'function') {
    const view = createStackedDetailView('settings-detail-view');
    // Keep nav clean; title shown in content for this view.
    return view;
  }

  // Fallback minimal view (mirrors app-nav handleContentData structure)
  const view = document.createElement('div');
  view.className = 'app-detail-view settings-detail-view';
  view.innerHTML = `
    <div class="app-detail-navigation">
      <div class="app-detail-back"></div>
      <div class="app-detail-title">${escapeHTML(title)}</div>
      <div class="app-detail-share"></div>
    </div>
    <div class="app-detail-content"></div>
    <div class="app-detail-bottom"></div>`;
  const stackDepth = document.querySelectorAll('.app-detail-view').length;
  view.style.zIndex = String(2 + stackDepth);
  document.body.appendChild(view);
  void view.offsetHeight;
  view.classList.add('on');
  return view;
}

function buildOptionsHTML(info, options = [], currentValue = '') {
  const optionItems = options.map((opt) => {
    const value = opt?.name ?? '';
    const display = opt?.display ?? value;
    const selected = value === currentValue;
    const selectedClass = selected ? ' selected' : '';
    return `<li class="settings-option${selectedClass}" data-value="${escapeHTML(value)}" data-display="${escapeHTML(display)}">${escapeHTML(display)}</li>`;
  }).join('');

  const heading = escapeHTML(info?.headline ?? '设置');
  return `
    <div class="settings-detail" data-setting-id="${escapeHTML(info?.id ?? '')}">
      <h1 class="settings-detail-title">${heading}</h1>
      <ul class="settings-option-list">${optionItems}</ul>
    </div>
  `;
}

async function applySettingSelection(info, value) {
  try {
    if (!info || !value) { return; }

    if (info.cookieName && typeof SetCookie === 'function') {
      // Keep cookie in sync for native/web readers that rely on it.
      SetCookie(info.cookieName, value, '', '/');
    }

    const preferenceKey = info.preferenceKey || (info.id === 'font-setting' ? 'Font Size' : '');
    if (preferenceKey) {
      const myPreference = getMyPreference() || {};
      myPreference[preferenceKey] = value;
      if (typeof savePreference === 'function') {
        await savePreference(myPreference);
      } else if (typeof saveMyPreferenceByKey === 'function') {
        saveMyPreferenceByKey(preferenceKey, value);
      }
    }

    // Fire side effects immediately so the UI updates without reload.
    if (info.id === 'font-setting' && typeof setFontSize === 'function') {
      setFontSize();
    }
    if (info.preferenceKey === 'Article Translation Preference' && typeof setTranslatePreference === 'function') {
      setTranslatePreference();
    }
  } catch (err) {
    console.error('apply setting selection error:', err);
  }
}

function updateSelectedOptionUI(listEl, selectedEl) {
  const options = listEl.querySelectorAll('.settings-option');
  options.forEach((opt) => opt.classList.remove('selected'));
  selectedEl.classList.add('selected');
}

function updateSummaryLabel(trigger, displayText) {
  if (!trigger) { return; }
  const span = trigger.querySelector('span') || trigger.appendChild(document.createElement('span'));
  span.textContent = displayText;
}

// Apply any settings that target the DOM immediately on load (e.g., bodyClassList for font size)
(function applyInitialSettingTargets() {
  try {
    const groups = appTypeMap?.setting ?? [];
    for (const group of groups) {
      const items = Array.isArray(group?.items) ? group.items : [];
      for (const item of items) {
        if (!item?.applyTo) { continue; }
        const options = Array.isArray(item.options) ? item.options : [];
        const value = resolveCurrentValue(item, options);
        applySettingToTargets(item, value);
      }
    }
  } catch (err) {
    console.error('apply initial setting targets error:', err);
  }
})();

function escapeHTML(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
