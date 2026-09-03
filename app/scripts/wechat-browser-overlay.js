/* global document, window, navigator */

(function () {
  const defaultImageUrl = 'https://d1sh1cgb4xvhl.cloudfront.net/unsafe/picture/0/000310220_piclink.png';
  const defaultOptions = {
    title: '请在浏览器中打开本页面',
    detail: '您当前在微信内置浏览器，功能受限。请点击右上角“⋯”→选择“在浏览器中打开”，以继续下载或安装。',
    imageUrl: defaultImageUrl,
    dismissible: false
  };

  function isWechatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent || '');
  }

  function removeWechatBrowserOverlay() {
    const overlay = document.getElementById('ftc-wechat-overlay');
    const style = document.getElementById('ftc-wechat-style');
    if (overlay) { overlay.remove(); }
    if (style) { style.remove(); }
    document.documentElement.style.overflow = '';
    document.body.classList.remove('is-wechat');
    window.__FTC_WECHAT_ONLY__ = false;
  }

  function showWechatBrowserOverlay(options = {}) {
    if (document.getElementById('ftc-wechat-overlay')) { return; }

    const settings = { ...defaultOptions, ...options };
    window.__FTC_WECHAT_ONLY__ = true;
    document.body.classList.add('is-wechat');

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
      .wechat-wrap { width: 100%; max-width: 680px; margin: 0 16px; }
      .wechat-card {
        position: relative; background: #fff; border-radius: 14px; overflow: hidden;
        box-shadow: 0 8px 32px rgba(0,0,0,.35);
      }
      .wechat-head { font-size: 22px; font-weight: 700; color: #111; padding: 16px 18px 0; }
      .wechat-body { padding: 12px 18px 6px; }
      .wechat-img { display: block; width: 100%; height: auto; border-radius: 8px; border: 1px solid #eee; }
      .wechat-tip { padding: 8px 18px 18px; color: #333; font-size: 18px; line-height: 1.6; }
      #ftc-wechat-overlay .wechat-backdrop { position: absolute; inset: 0; }
      #ftc-wechat-overlay .wechat-close {
        position: absolute; top: 4px; right: 8px; z-index: 2; border: 0;
        background: transparent; color: #666; font-size: 28px; line-height: 36px;
      }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement('div');
    overlay.id = 'ftc-wechat-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', settings.title);
    const closeButton = settings.dismissible ? '<button type="button" class="wechat-close" aria-label="关闭">×</button>' : '';
    overlay.innerHTML = `
      <div class="wechat-backdrop" tabindex="-1" aria-hidden="true"></div>
      <div class="wechat-wrap" role="document">
        <div class="wechat-card">
          ${closeButton}
          <div class="wechat-body">
            <img class="wechat-img" alt="在微信中点击右上角，在浏览器中打开" src="${settings.imageUrl}">
          </div>
          <div class="wechat-head">${settings.title}</div>
          <div class="wechat-tip">${settings.detail}</div>
        </div>
      </div>
    `;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    overlay.addEventListener('touchmove', (event) => event.preventDefault(), { passive: false });
    overlay.addEventListener('wheel', (event) => event.preventDefault(), { passive: false });

    if (settings.dismissible) {
      const close = () => {
        document.documentElement.style.overflow = previousOverflow || '';
        removeWechatBrowserOverlay();
      };
      overlay.querySelector('.wechat-close')?.addEventListener('click', close);
      overlay.querySelector('.wechat-backdrop')?.addEventListener('click', close);
    }
  }

  window.isWechatBrowser = isWechatBrowser;
  window.showWechatBrowserOverlay = showWechatBrowserOverlay;
  window.removeWechatBrowserOverlay = removeWechatBrowserOverlay;
}());
