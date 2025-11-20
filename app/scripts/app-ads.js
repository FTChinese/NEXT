/* global GetCookie, gUserType */
(function (window, document) {
  'use strict';

  var DEBUG = Boolean(window.isFrontEndTest);
  var slotRegistry = Object.create(null);
  var rootCounter = 0;
  var slotRenderListenerBound = false;

  function log() {
    if (!DEBUG) { return; }
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[app-ads]');
    console.log.apply(console, args);
  }

  function ensureGoogletagQueue() {
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
  }

  function parseUserkv(str) {
    var result = {};
    if (!str) { return result; }
    var entries = str.split(';');
    for (var i = 0; i < entries.length; i += 1) {
      var kv = entries[i].split('|');
      if (kv.length === 2) {
        result[kv[0]] = kv[1];
      }
    }
    return result;
  }

  function getDfpTargetingStr(obj) {
    if (!obj) { return ''; }
    var str = '';
    if (obj.sex) { str += 'cnsex=' + obj.sex + ';'; }
    if (obj.cs) { str += 'cncs=' + obj.cs + ';'; }
    if (obj.csp) { str += 'cncsp=' + obj.csp + ';'; }
    if (obj.hi) { str += 'cnhi=' + obj.hi + ';'; }
    if (obj.in) { str += 'cnin=' + obj.in + ';'; }
    if (obj.wf) { str += 'cnwf=' + obj.wf + ';'; }
    return str;
  }

  function injectConfigScript(jsonStr) {
    if (document.querySelector('script[data-o-ads-config]')) {
      return;
    }
    var script = document.createElement('script');
    script.type = 'application/json';
    script.setAttribute('data-o-ads-config', '');
    script.textContent = jsonStr;
    document.head.appendChild(script);
  }

  function buildBaseConfig() {
    var userKv = typeof GetCookie === 'function' ? GetCookie('USER_KV') : '';
    var dfpTargetingStr = '';
    if (userKv) {
      dfpTargetingStr = getDfpTargetingStr(parseUserkv(userKv));
    }
    if (typeof gUserType === 'string' && gUserType !== '') {
      dfpTargetingStr = 'cnuser=' + gUserType + ';' + dfpTargetingStr;
    }
    var config = {
      gpt: {
        network: 21753042392,
        site: 'FtChinese',
        zone: 'home'
      },
      collapseEmpty: 'before',
      dfp_targeting: dfpTargetingStr,
      formats: {
        FtcLeaderboard: { sizes: [[1200, 120], [1200, 400], [1200, 250], [969, 90], [969, 400], [969, 250]] },
        FtcBanner: { sizes: [[1200, 120], [969, 90]] },
        FtcMobileBanner: { sizes: [[414, 104]] },
        FtcMobileMpu: { sizes: [[300, 250]] },
        FtcMpu: { sizes: [[300, 250], [300, 600], [300, 1050]] },
        FtcInfoFlow: { sizes: [[400, 300]] },
        FtcMobileFullscreen: { sizes: [[414, 736]] },
        FtcPcFullscreen: { sizes: [[700, 520]] },
        FtcPaidpost: { sizes: [[280, 350]] },
        FtcRibbon: { sizes: [[300, 60]] },
        FtcMembertext: { sizes: [[300, 47]] }
      }
    };
    return config;
  }

  function ensureConfig() {
    if (window.cachedConfig) { return window.cachedConfig; }
    var config = buildBaseConfig();
    try {
      injectConfigScript(JSON.stringify(config));
    } catch (err) {
      log('inject config failed', err);
    }
    window.cachedConfig = config;
    return config;
  }

  function resolveRoot(root) {
    if (root && root.nodeType === 1) {
      return root;
    }
    return document.getElementById('app-main-content');
  }

  function ensureRootId(root) {
    if (!root) { return ''; }
    if (!root.getAttribute('data-ads-root-id')) {
      rootCounter += 1;
      root.setAttribute('data-ads-root-id', String(rootCounter));
    }
    return root.getAttribute('data-ads-root-id');
  }

  function slice(nodeList) {
    return Array.prototype.slice.call(nodeList || []);
  }

  function getSlotElements(root) {
    return slice(root ? root.querySelectorAll('.o-ads') : []);
  }

  function formatNameToSizes(formatName, config) {
    if (!formatName || formatName === 'false') { return []; }
    if (!config || !config.formats) { return []; }
    var format = config.formats[formatName];
    if (!format || !Array.isArray(format.sizes)) { return []; }
    return format.sizes;
  }

  function detectFallbackFormats(slot) {
    var name = (slot.getAttribute('data-o-ads-name') || '').toLowerCase();
    var fallback = {};
    if (!name) { return fallback; }
    if (name.indexOf('mpu') >= 0) {
      fallback.small = 'FtcMobileMpu';
      fallback.large = 'FtcMpu';
    } else if (name.indexOf('banner') >= 0 || name.indexOf('top') >= 0) {
      fallback.small = 'FtcMobileBanner';
      fallback.large = 'FtcLeaderboard';
    } else if (name.indexOf('infoflow') >= 0) {
      fallback.small = 'FtcInfoFlow';
    } else if (name.indexOf('fullscreen') >= 0) {
      fallback.small = 'FtcMobileFullscreen';
      fallback.large = 'FtcPcFullscreen';
    } else if (name.indexOf('paidpost') >= 0) {
      fallback.large = 'FtcPaidpost';
    } else if (name.indexOf('ribbon') >= 0) {
      fallback.large = 'FtcRibbon';
    }
    return fallback;
  }

  function getFormatName(slot, key, fallbackValue) {
    var attr = slot.getAttribute('data-o-ads-formats-' + key);
    if (attr && attr !== 'false') {
      return attr;
    }
    return fallbackValue || null;
  }

  function collectFormatNames(slot) {
    var fallback = detectFallbackFormats(slot);
    return {
      'default': getFormatName(slot, 'default', fallback.default || fallback.small || fallback.large),
      small: getFormatName(slot, 'small', fallback.small),
      medium: getFormatName(slot, 'medium', fallback.medium),
      large: getFormatName(slot, 'large', fallback.large),
      extra: getFormatName(slot, 'extra', fallback.extra)
    };
  }

  function dedupeSizes(list) {
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < list.length; i += 1) {
      var size = list[i];
      if (!Array.isArray(size) || size.length !== 2) { continue; }
      var key = size[0] + 'x' + size[1];
      if (!seen[key]) {
        seen[key] = true;
        out.push([size[0], size[1]]);
      }
    }
    return out;
  }

  function buildSizeBuckets(slot, config) {
    var formats = collectFormatNames(slot);
    var defaults = formatNameToSizes(formats['default'], config);
    var small = formatNameToSizes(formats.small, config);
    var medium = formatNameToSizes(formats.medium, config);
    var large = formatNameToSizes(formats.large, config);
    var extra = formatNameToSizes(formats.extra, config);

    var mobile = small.length ? small : defaults;
    var desktop = large.length ? large : (medium.length ? medium : (extra.length ? extra : defaults));

    mobile = dedupeSizes(mobile);
    desktop = dedupeSizes(desktop);
    var combined = dedupeSizes(mobile.concat(desktop));

    return {
      mobile: mobile,
      desktop: desktop,
      all: combined
    };
  }

  function findSlotContainer(node) {
    var current = node;
    while (current && current !== document.body) {
      if (current.classList && current.classList.contains('o-ads')) {
        return current;
      }
      current = current.parentNode;
    }
    return null;
  }

  function sizeMatchesFormat(formatName, size, config) {
    if (!formatName || !size) { return false; }
    var sizes = formatNameToSizes(formatName, config);
    if (!sizes || !sizes.length) { return false; }
    for (var i = 0; i < sizes.length; i += 1) {
      var candidate = sizes[i];
      if (candidate[0] === size[0] && candidate[1] === size[1]) {
        return true;
      }
    }
    return false;
  }

  function determineFormatForSize(slot, size, config) {
    var formats = collectFormatNames(slot);
    if (!size || size.length !== 2) {
      return formats.small || formats.large || formats['default'] || null;
    }
    var order = ['small', 'medium', 'large', 'extra', 'default'];
    for (var i = 0; i < order.length; i += 1) {
      var key = order[i];
      var formatName = formats[key];
      if (formatName && sizeMatchesFormat(formatName, size, config)) {
        return formatName;
      }
    }
    return formats.small || formats.large || formats['default'] || null;
  }

  function handleSlotRenderEnded(event) {
    var slotObj = event && event.slot;
    if (!slotObj || typeof slotObj.getSlotElementId !== 'function') { return; }
    var targetId = slotObj.getSlotElementId();
    var inner = targetId ? document.getElementById(targetId) : null;
    if (!inner) { return; }
    var slot = findSlotContainer(inner);
    if (!slot) { return; }
    if (event.isEmpty) {
      markSlotEmpty(slot, false);
      return;
    }
    var config = ensureConfig();
    var format = determineFormatForSize(slot, event.size, config);
    if (format) {
      slot.setAttribute('data-o-ads-loaded', format);
    } else {
      slot.setAttribute('data-o-ads-loaded', 'true');
    }
    slot.classList.remove('o-ads--empty');
    slot.removeAttribute('aria-hidden');
  }

  function ensureSlotRenderListener() {
    if (slotRenderListenerBound) { return; }
    ensureGoogletagQueue();
    window.googletag.cmd.push(function () {
      try {
        window.googletag.pubads().addEventListener('slotRenderEnded', handleSlotRenderEnded);
        slotRenderListenerBound = true;
      } catch (err) {
        log('slot render listener error', err);
      }
    });
  }

  function markSlotEmpty(slot, resetDom) {
    if (!slot) { return; }
    if (typeof resetDom === 'undefined') {
      resetDom = true;
    }
    if (resetDom) {
      slot.innerHTML = '';
    }
    slot.setAttribute('data-o-ads-loaded', 'false');
    slot.classList.add('o-ads--empty');
    slot.setAttribute('aria-hidden', 'true');
  }

  function shouldCenterSlot(slot) {
    if (!slot) { return false; }
    if (!slot.hasAttribute('data-o-ads-center')) { return false; }
    var val = slot.getAttribute('data-o-ads-center');
    return val === null || val === '' || val === 'true';
  }

  function resetSlotElement(slot, slotId) {
    slot.removeAttribute('data-o-ads-loaded');
    slot.classList.remove('o-ads--empty');
    slot.setAttribute('aria-hidden', 'true');
    slot.innerHTML = '';
    if (shouldCenterSlot(slot)) {
      slot.classList.add('o-ads--center');
    } else {
      slot.classList.remove('o-ads--center');
    }
    var outer = document.createElement('div');
    outer.className = 'o-ads__outer';
    var inner = document.createElement('div');
    inner.className = 'o-ads__inner';
    inner.id = slotId;
    outer.appendChild(inner);
    slot.appendChild(outer);
    return inner.id;
  }

  function extractCnPos(slot) {
    var targetingAttr = slot.getAttribute('data-o-ads-targeting') || '';
    var match = targetingAttr.match(/cnpos=([^;]+)/i);
    if (match && match[1]) {
      return match[1];
    }
    return slot.getAttribute('data-o-ads-name') || 'unknown';
  }

  function destroySlotsForRoot(rootId) {
    var record = slotRegistry[rootId];
    if (!record) { return; }
    try {
      if (record.gptSlots && record.gptSlots.length && window.googletag && typeof window.googletag.destroySlots === 'function') {
        window.googletag.destroySlots(record.gptSlots);
      }
    } catch (err) {
      log('destroySlots failed', err);
    }
    if (record.slotNames && window.oAds && window.oAds.slots) {
      for (var i = 0; i < record.slotNames.length; i += 1) {
        var name = record.slotNames[i];
        if (name && name !== 'lazyLoadingObservers' && window.oAds.slots[name]) {
          delete window.oAds.slots[name];
        }
      }
    }
    delete slotRegistry[rootId];
  }

  function defineSlot(slot, ctx) {
    var config = ctx.config;
    var slotName = slot.getAttribute('data-o-ads-name') || ('anonymous-' + ctx.index);
    var slotId = 'gpt-' + slotName + '-' + ctx.rootId + '-' + ctx.index;
    var sizes = buildSizeBuckets(slot, config);
    if (!sizes.all.length) {
      markSlotEmpty(slot);
      return null;
    }
    var slotTargetId = resetSlotElement(slot, slotId);

    var adUnitPath = '/' + config.gpt.network + '/' + config.gpt.site + '/' + config.gpt.zone;
    var pubads = window.googletag.pubads ? window.googletag.pubads() : null;
    if (!pubads || typeof window.googletag.defineSlot !== 'function' || typeof window.googletag.sizeMapping !== 'function') {
      log('googletag not ready');
      return null;
    }
    try {
      var gptSlot = window.googletag.defineSlot(adUnitPath, sizes.all, slotTargetId);
      if (!gptSlot) { return null; }
      var mapping = window.googletag.sizeMapping()
        .addSize([990, 0], sizes.desktop.length ? sizes.desktop : [])
        .addSize([0, 0], sizes.mobile.length ? sizes.mobile : [])
        .build();
      gptSlot.defineSizeMapping(mapping);
      gptSlot.setTargeting('cnpos', extractCnPos(slot));
      gptSlot.setTargeting('navid', ctx.navId);
      gptSlot.addService(pubads);
      window.googletag.display(slotTargetId);
      return {
        gptSlot: gptSlot,
        slotName: slotName
      };
    } catch (err) {
      log('defineSlot error', slotName, err);
      return null;
    }
  }

  function refresh(root) {
    var target = resolveRoot(root);
    if (!target) {
      log('no target root for ads refresh');
      return;
    }
    // console.log(`ftc-ad-config: `, target.querySelector(`.ftc-ad-config`));

    let zone = 'home';
    let cntopic = '';

    const ftcAdConfigEle = target?.querySelector(`.ftc-ad-config`);
    if (ftcAdConfigEle) {
      zone = ftcAdConfigEle?.getAttribute('data-zone') ?? zone;
      cntopic = ftcAdConfigEle?.getAttribute('data-cntopic') ?? cntopic;
    }

    var slotEls = getSlotElements(target);
    if (!slotEls.length) {
      teardown(target);
      return;
    }
    var config = ensureConfig();
    ensureGoogletagQueue();
    ensureSlotRenderListener();
    var rootId = ensureRootId(target);
    var navId = target.getAttribute('data-ads-nav-id');
    if (!navId) {
      navId = 'spa' + rootId;
      target.setAttribute('data-ads-nav-id', navId);
    }
    window.googletag.cmd.push(function () {
      destroySlotsForRoot(rootId);
      var gptSlots = [];
      var slotNames = [];
      for (var i = 0; i < slotEls.length; i += 1) {
        var slot = slotEls[i];
        var defined = defineSlot(slot, {
          config: config,
          navId: navId,
          rootId: rootId,
          index: i
        });
        if (defined && defined.gptSlot) {
          gptSlots.push(defined.gptSlot);
          slotNames.push(defined.slotName);
        }
      }
      if (gptSlots.length) {
        try {
          window.googletag.pubads().refresh(gptSlots);
        } catch (err) {
          log('refresh failure', err);
        }
        slotRegistry[rootId] = {
          gptSlots: gptSlots,
          slotNames: slotNames
        };
      } else {
        delete slotRegistry[rootId];
      }
    });
  }

  function teardown(root) {
    var target = resolveRoot(root);
    if (!target) { return; }
    var rootId = target.getAttribute('data-ads-root-id');
    if (!rootId) { return; }
    ensureGoogletagQueue();
    window.googletag.cmd.push(function () {
      destroySlotsForRoot(rootId);
    });
  }

  ensureGoogletagQueue();
  ensureConfig();

  window.appAds = {
    refresh: refresh,
    teardown: teardown,
    ensureConfig: ensureConfig
  };
})(window, document);
