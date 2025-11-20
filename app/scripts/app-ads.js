/* global GetCookie, gUserType */
(function (window, document) {
  'use strict';

  var DEBUG = Boolean(window.isFrontEndTest);
  var slotRegistry = Object.create(null);
  var rootCounter = 0;

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
    var fallback = detectFallbackFormats(slot);
    var defaults = formatNameToSizes(getFormatName(slot, 'default', fallback.default || fallback.small || fallback.large), config);
    var small = formatNameToSizes(getFormatName(slot, 'small', fallback.small), config);
    var medium = formatNameToSizes(getFormatName(slot, 'medium', fallback.medium), config);
    var large = formatNameToSizes(getFormatName(slot, 'large', fallback.large), config);
    var extra = formatNameToSizes(getFormatName(slot, 'extra', fallback.extra), config);

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

  function markSlotEmpty(slot) {
    if (!slot) { return; }
    slot.classList.add('o-ads--empty');
    slot.innerHTML = '';
  }

  function resetSlotElement(slot, slotId) {
    slot.id = slotId;
    slot.innerHTML = '';
    slot.removeAttribute('data-o-ads-loaded');
    slot.removeAttribute('aria-hidden');
    slot.classList.remove('o-ads--empty');
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
    resetSlotElement(slot, slotId);

    var adUnitPath = '/' + config.gpt.network + '/' + config.gpt.site + '/' + config.gpt.zone;
    var pubads = window.googletag.pubads ? window.googletag.pubads() : null;
    if (!pubads || typeof window.googletag.defineSlot !== 'function' || typeof window.googletag.sizeMapping !== 'function') {
      log('googletag not ready');
      return null;
    }
    try {
      var gptSlot = window.googletag.defineSlot(adUnitPath, sizes.all, slotId);
      if (!gptSlot) { return null; }
      var mapping = window.googletag.sizeMapping()
        .addSize([990, 0], sizes.desktop.length ? sizes.desktop : [])
        .addSize([0, 0], sizes.mobile.length ? sizes.mobile : [])
        .build();
      gptSlot.defineSizeMapping(mapping);
      gptSlot.setTargeting('cnpos', extractCnPos(slot));
      gptSlot.setTargeting('navid', ctx.navId);
      gptSlot.addService(pubads);
      window.googletag.display(slotId);
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
    var slotEls = getSlotElements(target);
    if (!slotEls.length) {
      teardown(target);
      return;
    }
    var config = ensureConfig();
    ensureGoogletagQueue();
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
