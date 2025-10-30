// install-guide.js (fixed for iOS 26 UA freeze and jshint curly braces)
(function () {
  'use strict';

  // --- Environment detection ---
  const ua = navigator.userAgent || '';
  const isTouchMacLike = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isIOSDevice = (/iPhone|iPad|iPod/i.test(ua) || isTouchMacLike);

  // True Safari only (exclude Chrome/Firefox/Edge shells on iOS)
  const isSafari = (/Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua));

  // Already running as installed web app?
  const isStandalone = ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
                        (typeof navigator.standalone !== 'undefined' && navigator.standalone === true));

  if (isStandalone) {
    return;
  }

  if (/MicroMessenger/i.test(ua)) {
    showWeChatOverlay();
    return;
  }

  if (!(isIOSDevice && isSafari)) {
    return;
  }

  // Use Safari's Version/x token for branching (works for iOS & iPadOS Safari)
  const safariMajor = getSafariMajorVersionFromUA(ua);
  if (safariMajor >= 26) {
    showInstallGuideOverlay('new');
  } else {
    showInstallGuideOverlay('old');
  }

  // --- Version parsing: rely on Version/XX from UA (works for iOS & iPadOS Safari) ---
  function getSafariMajorVersionFromUA(uaString) {
    const m = uaString.match(/Version\/(\d+)[._]/i);
    if (m && m[1]) {
      return parseInt(m[1], 10);
    }

    const os = uaString.match(/OS\s(\d+)[._]/i);
    if (os && os[1]) {
      return parseInt(os[1], 10);
    }

    return 0;
  }

  // --- Overlay rendering ---
  function showInstallGuideOverlay(variant /* 'new' | 'old' */) {
    if (document.getElementById('ftc-app-install-overlay')) {
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'ftc-app-install-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'ios-guide-title');

    let stepsHTML = '';
    if (variant === 'new') {
      stepsHTML = getNewStepsHTML();
    } else {
      stepsHTML = getOldStepsHTML();
    }

    overlay.innerHTML = `
      <div class="app-install-backdrop" tabindex="-1" aria-hidden="true"></div>
      <div class="app-install-panel" role="document">
        <button type="button" class="app-install-close" aria-label="关闭">×</button>
        <div class="app-install-body">
          <div class="guide-hd">
            <h3 class="guide-title" id="ios-guide-title">最后一步</h3>
            <p class="guide-sub">将本页<strong>添加到主屏幕</strong>，就可完成安装，步骤如下：</p>
          </div>
          ${stepsHTML}
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.id = 'ftc-app-install-style';
    style.textContent = `
      #ftc-app-install-overlay {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        touch-action: manipulation;
      }
      .app-install-backdrop {
        position: absolute; inset: 0; background: rgba(0,0,0,.5); z-index: 1;
      }
      .app-install-panel {
        position: relative; box-sizing: border-box; width: 100%; max-width: 640px;
        height: 90vh; max-height: 720px; background: #fff; border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,.35); display: flex; flex-direction: column;
        overflow: hidden; margin: 0 12px; z-index: 2;
      }
      .app-install-close {
        position: absolute; right: 6px; top: 6px; width: 44px; height: 44px;
        border: none; background: transparent; color: #666; font-size: 26px; line-height: 44px;
        cursor: pointer; z-index: 3; -webkit-tap-highlight-color: transparent;
      }
      .app-install-body { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; padding: 16px 18px 20px; }
      .guide-hd { margin-bottom: 12px; }
      .guide-title { margin: 0 48px 8px 0; font-size: 24px; color: #111; font-weight: 700; }
      .guide-sub { margin: 0; color: #333; line-height: 1.5; font-size: 20px; }
      .guide-steps { list-style: none; padding: 0; margin: 16px 0 10px; }
      .step { margin-bottom: 20px; background: #000; color: #fff; padding: 12px; border: 15px solid #000; border-radius: 8px; }
      .step p { margin: 0 0 12px; font-size: 20px; line-height: 1.6; }
      .step img { display: block; max-width: 100%; height: auto; border-radius: 6px; border: 1px solid #333; }
      @media (max-width: 360px) { .app-install-panel { height: 92vh; } }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const closeOverlay = function () {
      removeOverlay();
    };

    if (typeof delegate !== 'undefined' && delegate.on) {
      delegate.on('click', '.app-install-close', closeOverlay);
      delegate.on('click', '.app-install-backdrop', closeOverlay);
    } else {
      const btn = overlay.querySelector('.app-install-close');
      const backdrop = overlay.querySelector('.app-install-backdrop');
      if (btn) {
        btn.addEventListener('click', closeOverlay, { passive: true });
      }
      if (backdrop) {
        backdrop.addEventListener('click', closeOverlay, { passive: true });
      }
    }

    function removeOverlay() {
      const styleEl = document.getElementById('ftc-app-install-style');
      if (styleEl) {
        styleEl.remove();
      }
      overlay.remove();
    }
  }

  // --- Steps (new vs old) ---
  function getNewStepsHTML() {
    return `
      <ul class="guide-steps">
        <li class="step">
          <p><strong>步骤1：</strong>点击底部地址栏右侧的<strong>“⋯”</strong>按钮</p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/0/000310260_piclink.jpg" alt="在Safari打开目标页面">
        </li>
        <li class="step">
          <p><strong>步骤2：</strong>在弹出的菜单中选择<strong>“共享”</strong></p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/2/000310262_piclink.jpg" alt="点地址栏右侧的三个点，选择分享">
        </li>
        <li class="step">
          <p><strong>步骤3：</strong>点击<strong>“更多”</strong></p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/8/000310298_piclink.jpg" alt="在分享菜单中选择添加到主屏幕">
        </li>
        <li class="step">
          <p><strong>步骤4：</strong>在菜单中向下滚动，找到并点击<strong>“添加到主屏幕”</strong></p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/4/000310264_piclink.jpg" alt="切换以网页应用打开开关">
        </li>
        <li class="step">
          <p><strong>步骤5：</strong>点击右上角的<strong>“添加”</strong>即可完成安装</p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/5/000310265_piclink.jpg" alt="编辑名称并添加到主屏幕">
        </li>
      </ul>
    `;
  }

  function getOldStepsHTML() {
    return `
      <ul class="guide-steps">
        <li class="step">
          <p><strong>步骤1：</strong>点击底部的<strong>“分享”</strong>按钮</p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/8/000310368_piclink.png" alt="点击底部的分享按钮">
        </li>
        <li class="step">
          <p><strong>步骤2：</strong>在弹出的菜单中向下滚动，找到并点击<strong>“添加到主屏幕”</strong></p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/9/000310369_piclink.png" alt="在菜单中选择添加到主屏幕">
        </li>
        <li class="step">
          <p><strong>步骤3：</strong>点击右上角的<strong>“添加”</strong>即可完成安装</p>
          <img src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/0/000310370_piclink.jpg" alt="确认添加到主屏幕">
        </li>
      </ul>
    `;
  }


  function showWeChatOverlay() {
    if (document.getElementById('ftc-wechat-overlay')) {
      return;
    }

    // Global flag + body class (as per your example)
    window.__FTC_WECHAT_ONLY__ = true;
    document.body.classList.add('is-wechat');

    // Style
    const style = document.createElement('style');
    style.id = 'ftc-wechat-style';
    style.textContent = `
      #ftc-wechat-overlay {
        position: fixed; inset: 0; z-index: 100000;
        display: flex; align-items: center; justify-content: center;
        background: rgba(0,0,0,.7);
        font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
        touch-action: manipulation;
      }
      .wechat-wrap {
        width: 100%; max-width: 680px; margin: 0 16px;
      }
      .wechat-card {
        position: relative; background: #fff; border-radius: 14px; overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.35);
      }
      .wechat-head {
        font-size: 22px; font-weight: 700; color: #111; padding: 16px 18px 0;
      }
      .wechat-body {
        padding: 12px 18px 6px;
      }
      .wechat-img {
        display: block; width: 100%; height: auto; border-radius: 8px; border: 1px solid #eee;
      }
      .wechat-tip {
        padding: 8px 18px 18px; color: #333; font-size: 18px; line-height: 1.6;
      }
      /* Optional: an invisible backdrop button to prevent clicks through */
      #ftc-wechat-overlay .wechat-backdrop {
        position: absolute; inset: 0;
      }
    `;
    document.head.appendChild(style);

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'ftc-wechat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '请在浏览器中打开本页面');

    // Content (matches your example copy & asset)
    overlay.innerHTML = `
      <div class="wechat-backdrop" tabindex="-1" aria-hidden="true"></div>
      <div class="wechat-wrap" role="document">
        <div class="wechat-card">
          <div class="wechat-body">
            <img
              class="wechat-img"
              alt="在微信中点击右上角，在浏览器中打开"
              src="https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/0/000310220_piclink.png"
            >
          </div>
          <div class="wechat-head">请在浏览器中打开本页面</div>
          <div class="wechat-tip">
            您当前在微信内置浏览器，功能受限。请点击右上角“⋯”→选择“在浏览器中打开”，以继续下载或安装。
          </div>
        </div>
      </div>
    `;

    // Prevent scroll behind overlay
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    // Append
    document.body.appendChild(overlay);

    // Ensure no interaction falls through; no close button by design.
    overlay.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });
    overlay.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });

    // Cleanup helper if ever removed programmatically
    overlay.addEventListener('remove', function () {
      const styleEl = document.getElementById('ftc-wechat-style');
      if (styleEl) { styleEl.remove(); }
      document.documentElement.style.overflow = prevOverflow || '';
    });
  }
})();
