(function (window, document) {
  'use strict';

  if (window.ftcPromoDedupeInitialized) {
    return;
  }
  window.ftcPromoDedupeInitialized = true;

  function syncPromoVisibility() {
    var promoBoxes = document.querySelectorAll('#promo-box-container .subscription-promo-container');
    var topBanners = document.querySelectorAll('[data-o-ads-name="banner1"]');
    var bannerLoaded = false;
    var index;

    for (index = 0; index < topBanners.length; index += 1) {
      var state = topBanners[index].getAttribute('data-o-ads-loaded');
      if (state && state !== 'false') {
        bannerLoaded = true;
        break;
      }
    }

    for (index = 0; index < promoBoxes.length; index += 1) {
      promoBoxes[index].style.display = bannerLoaded ? 'none' : '';
    }
  }

  function initialize() {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})(window, document);
