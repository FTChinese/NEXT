async function passLoginToNative() {
  // helpers
  const S = v => (v === undefined || v === null) ? '' : String(v);
  const SET = (k, v) => SetCookie(k, S(v), 86400 * 100, '/'); // 100 days

  // 1) Fast path: build message purely from cookies and post to native
  const uniqueId = GetCookie('uniqueVisitorId') || guid();
  SET('uniqueVisitorId', uniqueId);

  const hostname = location.hostname;

  const message = {
    // basics
    username:        S(GetCookie('USER_NAME') || GetCookie('USER_NAME_FT') || ''),
    userId:          S(GetCookie('USER_ID') || ''),
    uniqueVisitorId: S(uniqueId),
    ccode:           S(GetCookie('ccode') || ''),
    source:          S(GetCookie('paywall_source') || ''),
    infoSource:      'cookie',
    addon:           S(GetCookie('addon') || '0'),
    addon_days:      S(GetCookie('addon_days') || '0'),
    addon_type:      S(GetCookie('addon_type') || ''),
    wxUnionId:       S(GetCookie('WX_UNION_ID') || ''),
    version:         '5',

    // paywall snapshot
    paywall:        S(GetCookie('paywall') || ''),
    paywallExpire:  S(GetCookie('paywall_expire') || ''),

    // signed fields snapshot
    uid:   S(GetCookie('uid')   || ''),
    iat:   S(GetCookie('iat')   || ''),
    aud:   S(GetCookie('aud')   || ''),
    nonce: S(GetCookie('nonce') || ''),
    sig:   S(GetCookie('sig')   || ''),
    alg:   S(GetCookie('alg')   || ''),
    kid:   S(GetCookie('kid')   || ''),

    hostname
  };

  try { webkit.messageHandlers.user.postMessage(message); } catch (_) {}

  // If not logged in, stop here
  if (message.userId === '') {return;}

  // 2) Validate with API → update UI → post again → persist cookies
  try {
    const res = await fetch('/index.php/jsapi/paywall', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {return;}

    const userInfo = await res.json();

    // Update DOM classes (keep your existing logic)
    let htmlClass = document.documentElement.className
      .replace(/\ is\-subscriber/g, '')
      .replace(/\ is\-premium/g, '')
      .replace(/\ is\-standard/g, '');

    if (userInfo.paywall === 0) {
      if (userInfo.premium === 1) {
        message.paywall = 'premium';
        htmlClass += ' is-subscriber is-premium';
      } else {
        message.paywall = 'standard';
        htmlClass += ' is-subscriber is-standard';
      }
      document.documentElement.className = htmlClass;
    } else {
      message.paywall = '';
    }

    // expire → string
    if (userInfo.expire && userInfo.expire > 0) {
      message.paywallExpire = S(userInfo.expire);
    } else if (typeof userInfo.expire === 'string' && userInfo.expire !== '') {
      message.paywallExpire = S(userInfo.expire);
    }

    // extras (strings)
    message.ccode      = S(userInfo.campaign_code || '');
    message.duration   = S(userInfo.latest_duration || '');
    message.source     = S(userInfo.source || '');
    message.addon      = S(userInfo.addon || 0);
    message.addon_days = S(userInfo.addon_days || '0');
    message.addon_type = S(userInfo.addon_type || '');
    message.infoSource = 'jsapi/paywall';

    // signed fields (strings)
    message.uid   = S(userInfo.uid);
    message.iat   = S(userInfo.iat);
    message.aud   = S(userInfo.aud);
    message.nonce = S(userInfo.nonce);
    message.sig   = S(userInfo.sig);
    message.alg   = S(userInfo.alg || 'Ed25519');
    message.kid   = S(userInfo.kid || 'k1');
    

    // Post updated bundle to native
    try { webkit.messageHandlers.user.postMessage(message); } catch (_) {}

    // Persist cookies (all strings)
    SET('paywall_expire', S(message.paywallExpire || ''));
    SET('paywall',        S(message.paywall || ''));
    SET('paywall_source', S(message.source || ''));
    SET('addon',          S(message.addon || '0'));
    SET('addon_type',     S(message.addon_type || ''));
    SET('addon_days',     S(message.addon_days || '0'));

    // signed fields
    SET('uid',   S(message.uid));
    SET('iat',   S(message.iat));
    SET('aud',   S(message.aud));
    SET('nonce', S(message.nonce));
    SET('sig',   S(message.sig));
    SET('alg',   S(message.alg));
    SET('kid',   S(message.kid));

  } catch (_) {
    // swallow: native already has cookie snapshot; verification happens there
  }
}

// Safe to call even outside WKWebView
try { passLoginToNative(); } catch (_) {}
