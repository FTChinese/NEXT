(function (window, document) {
  'use strict';

  if (window.ftcPromoDedupeInitialized) {
    return;
  }
  window.ftcPromoDedupeInitialized = true;

  var desktopBreakpoint = '(min-width: 980px)';

  function isNativeApp() {
    return window.isInNativeApp === true ||
      document.documentElement.classList.contains('is-ftc-app') ||
      window.location.protocol === 'file:' ||
      /(?:^|[?&])webview=ftcapp(?:&|$)/.test(window.location.search);
  }

  function initializePromoPosition() {
    var promoContainer = document.getElementById('promo-box-container');
    if (!promoContainer || isNativeApp() || !window.matchMedia) {
      return;
    }

    var anchor = document.createComment('promo-box-container-original-position');
    promoContainer.parentNode.insertBefore(anchor, promoContainer);
    var desktopQuery = window.matchMedia(desktopBreakpoint);

    function syncPromoPosition() {
      if (!anchor.parentNode) {
        return;
      }

      if (desktopQuery.matches) {
        if (document.body.firstElementChild !== promoContainer) {
          document.body.insertBefore(promoContainer, document.body.firstElementChild);
        }
      } else if (promoContainer.parentNode !== anchor.parentNode ||
                 promoContainer.previousSibling !== anchor) {
        anchor.parentNode.insertBefore(promoContainer, anchor.nextSibling);
      }
    }

    syncPromoPosition();
    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener('change', syncPromoPosition);
    } else {
      desktopQuery.addListener(syncPromoPosition);
    }
  }

  function syncPromoVisibility() {
    var promoBoxes = document.querySelectorAll('#promo-box-container .subscription-promo-container');
    var topBanners = document.querySelectorAll('[data-o-ads-name="banner1"]');
    var bannerLoaded = false;
    var desktopWeb = !isNativeApp() && window.matchMedia &&
      window.matchMedia(desktopBreakpoint).matches;
    var index;

    for (index = 0; index < topBanners.length; index += 1) {
      var state = topBanners[index].getAttribute('data-o-ads-loaded');
      if (state && state !== 'false') {
        bannerLoaded = true;
        break;
      }
    }

    for (index = 0; index < promoBoxes.length; index += 1) {
      promoBoxes[index].style.display = bannerLoaded && !desktopWeb ? 'none' : '';
    }
  }

  function initialize() {
    initializePromoPosition();
    syncPromoVisibility();

    if (window.MutationObserver) {
      var observer = new MutationObserver(syncPromoVisibility);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-o-ads-loaded']
      });
    }

    if (window.matchMedia) {
      var desktopQuery = window.matchMedia(desktopBreakpoint);
      if (desktopQuery.addEventListener) {
        desktopQuery.addEventListener('change', syncPromoVisibility);
      } else {
        desktopQuery.addListener(syncPromoVisibility);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
