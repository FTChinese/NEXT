/* app-audio.js — FT-style mini + expanded audio player (singleton via closures)
   - Single <audio> element reused
   - Mini bar (collapsed) + Expanded bottom-sheet
   - Play/Pause (SVG), ±30s (SVG), scrubber, speed, expand/collapse
   - CORS-independent; no autoplay; close destroys DOM
*/

(function () {
  'use strict';

  var rootEl;
  var audioEl;
  var currentSrc = '';
  var isScrubbing = false;
  var rafId = 0;
  var lastRate = readRate();
  var READY_CLASS = 'is-ready';
  var PLAYING_CLASS = 'is-playing';
  var DISABLED_CLASS = 'is-disabled';
  let timeSeek = {};

  // Public entry
  window.renderAudio = function renderAudio(info, appDetailEle, langSel) {
    try {
      // console.log(`info render audio: `, info);
      let subtype = info && info.subtype;
      if (!subtype || !['英语电台', '双语电台'].includes(subtype)) {return;}
      let useEN = !!(langSel && langSel.useEN);
      let audioUrl;
      let bodyObject;
      if (useEN) {
        audioUrl = info?.body_object_english?.url ?? info?.story_audio?.ai_audio_e;
        bodyObject = info?.body_object_english;
      } else {
        audioUrl = info?.body_object_chinese?.url ?? info?.story_audio?.ai_audio_c ?? info?.story_audio?.ai_audio_e;
        bodyObject = info?.body_object_chinese;
      }


      renderBodyObject(bodyObject, appDetailEle, audioUrl);

      if (!audioUrl) { return; }
      appDetailEle.setAttribute('data-audio-url', audioUrl);
      var audioTitle = useEN ? (info && info.eheadline) : (info && info.cheadline);
      var image = info?.story_pic.cover ?? info?.story_pic?.other ?? info?.story_pic?.smallbutton ?? info?.story_pic?.bigbutton ?? '';
      ensureDOM();
      if (audioUrl === currentSrc) {
        showMini(); 
        return; 
      }
      loadTrack({ src: audioUrl, title: audioTitle || 'Audio', image: image });
      showMini();
      showPlay();
      // renderAudioScript(info, appDetailEle, langSel);
    } catch (err) {
      console.log('[app-audio] renderAudio error:', err && err.message);
    }
  };

  // Delegate bindings
  if (typeof delegate !== 'undefined' && delegate.on) {
    delegate.on('click', '.audio-play-button', function (evt) {
      var el = (evt && evt.delegateTarget) ? evt.delegateTarget : evt.target;
      var url = el && el.getAttribute('data-audio-url');
      var title = el && el.getAttribute('data-audio-title');
      var image = el && el.getAttribute('data-audio-image');

      if (!url) {
        var raw = el && el.getAttribute('data-audio-info');
        if (raw) {
          try {
            var info = JSON.parse(raw);
            url = info && info.src;
            title = title || (info && info.title);
            image = image || (info && info.image);
          } catch (e) { /* ignore JSON parse error */ }
        }
      }
      if (!url) { return; }

      ensureDOM();
      if (url === currentSrc) { showMini(); return; }
      loadTrack({ src: url, title: title || 'Audio', image: image || '' });
      showMini();
    });

    delegate.on('click', '.app-audio-mini-main', function () { showExpanded(); });
    delegate.on('click', '.app-audio-toggle', function () { if (audioEl && audioEl.src) { togglePlay(); } });
    delegate.on('click', '.app-audio-close', function () { destroy(); });
    delegate.on('click', '.app-audio-collapse', function () { showMini(); });
    delegate.on('click', '.app-audio-back30', function () { if (audioEl) { seekRelative(-30); } });
    delegate.on('click', '.app-audio-fwd30', function () { if (audioEl) { seekRelative(30); } });
    delegate.on('click', '.app-audio-speed', function () { cycleRate(); });

    delegate.on('input', '.app-audio-range', function (evt) {
      if (!audioEl || !rootEl) { return; }
      var dur = audioEl.duration;
      if (!(dur && isFinite(dur))) { return; }
      isScrubbing = true;
      var val = Number(evt.target.value);
      var time = dur * val;
      setCurrentTimeUI(time, dur);
      setMiniProgressUI(val);
    });

    delegate.on('change', '.app-audio-range', function (evt) {
      if (!audioEl || !rootEl) { return; }
      var dur = audioEl.duration;
      if (!(dur && isFinite(dur))) { return; }
      var val = Number(evt.target.value);
      audioEl.currentTime = dur * val;
      isScrubbing = false;
    });

    delegate.on('click', '.audio-sentence', function(){


      let eles = document.querySelectorAll('.audio-sentence');
      for(let ele of eles) {
        ele.classList.remove('is-current');
      }
      this.classList.add('is-current');
      const seekId = this.id;

      const seekTo = Number(this.getAttribute('data-start'));
      if (!isFinite(seekTo)) {return;}
      
      // Ensure player exists or re-render with the right language
      let playerEle = document.querySelector('#app-audio');

      const rootView = this.closest('[data-detail-root]');
      if (!rootView) { return; }
      const appDetailEle = this.closest('.app-detail-view') || document.body;

      // Pull canonical info for this view
      const st = detailViewState.get(rootView);
      const info = st?.info;
      if (!info) { return; }

      // Decide language with your helper
      const langSel = selectLanguage(info);

      // Helper to compute the desired audio URL / title / image given info+langSel
      function resolveDesiredTrack(info, langSel) {
        const useEN = !!(langSel && langSel.useEN);
        const src = useEN ? (info?.body_object_english?.url ?? info?.story_audio?.ai_audio_e ?? '')
 : (info?.body_object_chinese?.url ?? info?.story_audio?.ai_audio_c ?? info?.story_audio?.ai_audio_e ?? '');
        const title = useEN ? (info?.eheadline || 'Audio') : (info?.cheadline || 'Audio');
        const img = (info?.story_pic && (info.story_pic.cover || info.story_pic.other || info.story_pic.smallbutton || info.story_pic.bigbutton)) || '';
        return { src: String(src || ''), title: String(title || 'Audio'), image: String(img || '') };
      }

      const desired = resolveDesiredTrack(info, langSel);
      if (!desired.src) { return; }

      // If player not created yet, render it now (body text is already on screen)
      if (!playerEle) {
        renderAudio(info, appDetailEle, langSel);
        const currentsentence = appDetailEle?.querySelector(`#${seekId}`);
        if (currentsentence) {
          currentsentence.classList.add('is-current');
        }
        playerEle = document.querySelector('#app-audio');
        if (!playerEle) { return; } // bail if render failed
      } else {
        // Player exists; make sure our internal refs are ready
        ensureDOM();
        // If a different src is needed, swap tracks without changing the user’s view
        if (desired.src !== currentSrc) {
          loadTrack(desired);
        }
      }




      // Now seek to the tapped sentence and play
      const seekToSafe = Math.max(0, Number(seekTo) || 0);
      const doSeekAndPlay = function () {
        try {
          const dur = audioEl && isFinite(audioEl.duration) ? audioEl.duration : NaN;
          if (isFinite(dur)) {
            audioEl.currentTime = Math.min(seekToSafe, dur);
          } else {
            audioEl.currentTime = seekToSafe;
          }
        } catch (e) { /* no-op */ }

        play();

        // If the player was hidden (freshly initiated), default to mini; otherwise leave as-is
        if (rootEl) {
          const state = rootEl.getAttribute('data-state');
          if (!state || state === 'hidden') { showMini(); }
        }
      };

      // Seek immediately if metadata ready; otherwise wait once
      if (audioEl && isFinite(audioEl.duration) && audioEl.duration > 0) {
        doSeekAndPlay();
      } else {
        const once = function () {
          audioEl.removeEventListener('loadedmetadata', once);
          audioEl.removeEventListener('canplay', once);
          doSeekAndPlay();
        };
        audioEl.addEventListener('loadedmetadata', once, { once: true });
        audioEl.addEventListener('canplay', once, { once: true });
        try { audioEl.load(); } catch (e) { /* safe */ }
      }

    });
  }


  function renderBodyObject(bodyObject, appDetailEle, audioUrl) {
    // console.log(bodyObject);
    let paragraphs = bodyObject?.text ?? [];
    
    if (paragraphs.length === 0) {return;}
    let ele = appDetailEle.querySelector('#ios-story-body');
    if (!ele) {return;}
    ele.setAttribute(`data-audio-url`, audioUrl);
		var htmlForAudio = '';
		for (var k=0; k<paragraphs.length; k++) {
      let prefix = '<p>';
      let suffix = '</p>';

      if (paragraphs[k].length === 1 && /^<.+>$/gi.test(paragraphs[k]?.[0]?.text ?? '')) {
        prefix = '';
        suffix = '';
      }
      htmlForAudio += prefix;
			for (var l=0; l<paragraphs[k].length; l++) {
        const sentenceInfo = paragraphs[k][l];
				const t = sentenceInfo?.text?.replace(/<strong>([^<]+)$/g, '<strong>$1</strong>').replace(/^<\/strong>/g, '') ?? '';
        const s = sentenceInfo?.start;
				htmlForAudio += `<span class="audio-sentence" data-start="${s}" id="span-${k}-${l}">${t}</span>`;
			}
			htmlForAudio += suffix;
		}
		ele.innerHTML = htmlForAudio;
    
    const firstParagraph = paragraphs?.[0];
    // console.log(`first paragraph: `, firstParagraph);
    if (!firstParagraph) {return;}
    const firstParagraphText = firstParagraph?.[0].text ?? '';
    // console.log(`firstParagraphText: `, firstParagraphText);
    if (firstParagraph.length === 1 && /<picture>/gi.test(firstParagraphText)) {
      let imageEle = appDetailEle.querySelector('.story-image');
      if (imageEle) {
        imageEle.innerHTML = '';
      }
    }

  }





  // DOM
  function ensureDOM() {
    if (rootEl && audioEl) { return; }

    rootEl = document.getElementById('app-audio');
    if (!rootEl) {
      rootEl = document.createElement('div');
      rootEl.id = 'app-audio';
      rootEl.className = 'app-audio';
      rootEl.setAttribute('data-state', 'hidden');
      rootEl.innerHTML = template();
      document.body.appendChild(rootEl);
    }

    audioEl = rootEl.querySelector('#app-audio-el');
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = 'app-audio-el';
      audioEl.preload = 'metadata';
      rootEl.appendChild(audioEl);
    }

    try { audioEl.removeAttribute('crossorigin'); } catch (e) {}
    try { audioEl.playbackRate = lastRate; } catch (e) {}

    if (!audioEl.__bound) { bindAudioEvents(audioEl); audioEl.__bound = true; }
  }

  // SVG icons
  function svgPlay() {
    return '<svg viewBox="0 0 24 24" class="icon icon-play" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"></path></svg>';
  }
  function svgPause() {
    return '<svg viewBox="0 0 24 24" class="icon icon-pause" aria-hidden="true"><path d="M6 5h6v14H6zM14 5h6v14h-6z" fill="currentColor"></path></svg>';
  }
  function svgBack() {
    return '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M12 5V2L7 6l5 4V7a7 7 0 1 1-7 7H3a9 9 0 1 0 9-9z" fill="currentColor"></path></svg>';
  }
  function svgFwd() {
    return '<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M12 5V2l5 4-5 4V7a7 7 0 1 0 7 7h2a9 9 0 1 1-9-9z" fill="currentColor"></path></svg>';
  }

  function template() {
    return '' +
      '<audio id="app-audio-el" preload="metadata"></audio>' +
      '<div class="app-audio-mini" aria-live="polite">' +
        '<button class="app-audio-toggle app-audio-mini-btn" aria-label="Play/Pause">' +
          svgPlay() + svgPause() +
        '</button>' +
        '<div class="app-audio-mini-main" role="button" aria-label="Open audio player">' +
          '<div class="app-audio-mini-title" title=""></div>' +
          '<div class="app-audio-mini-remaining"></div>' +
        '</div>' +
        '<button class="app-audio-close" aria-label="Close">✕</button>' +
        '<div class="app-audio-mini-progress"><div class="app-audio-mini-progress-bar"></div></div>' +
      '</div>' +
      '<div class="app-audio-expanded" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="app-audio-header">' +
          '<div class="app-audio-title"></div>' +
          '<button class="app-audio-collapse" aria-label="Collapse">⌄</button>' +
        '</div>' +
        '<div class="app-audio-hero">' +
          '<img class="app-audio-image" alt="Audio cover">' +
        '</div>' +
        '<div class="app-audio-timeline">' +
          '<span class="app-audio-current">0:00</span>' +
          '<input class="app-audio-range" type="range" min="0" max="1" step="0.001" value="0" aria-label="Seek">' +
          '<span class="app-audio-total">0:00</span>' +
        '</div>' +
        '<div class="app-audio-controls">' +
          '<button class="app-audio-back30" aria-label="Back 30 seconds">' + svgBack() + '<span>30</span></button>' +
          '<button class="app-audio-toggle app-audio-big" aria-label="Play/Pause">' + svgPlay() + svgPause() + '</button>' +
          '<button class="app-audio-fwd30" aria-label="Forward 30 seconds">' + svgFwd() + '<span>30</span></button>' +
        '</div>' +
        '<button class="app-audio-speed" aria-label="Playback speed">x1</button>' +
      '</div>';
  }

  // Load / play / state
  function loadTrack(opts) {
    var src = opts && opts.src ? String(opts.src) : '';
    var title = opts && opts.title ? String(opts.title) : 'Audio';
    var image = opts && opts.image ? String(opts.image) : '';
    if (!src) { return; }

    currentSrc = src;

    setTexts(title);
    setImage(image);
    setMiniProgressUI(0);
    setCurrentTimeUI(0, 0);
    setTotalUI(0);
    disableControls(true);

    audioEl.src = src;
    try { audioEl.playbackRate = readRate(); } catch (e) {}
    try { audioEl.load(); } catch (e) {}
  }

  function play() {
    if (!audioEl || !rootEl) { return; }
    audioEl.play().then(function () {
      if (rootEl) { rootEl.classList.add(PLAYING_CLASS); }
    }).catch(function () {
      if (rootEl) { rootEl.classList.remove(PLAYING_CLASS); }
    });
  }

  function pause() {
    if (!audioEl || !rootEl) { return; }
    try { audioEl.pause(); } catch (e) {}
    if (rootEl) { rootEl.classList.remove(PLAYING_CLASS); }
  }

  function togglePlay() {
    if (!audioEl) { return; }
    if (audioEl.paused) { play(); } else { pause(); }
  }

  function showPlay() {
    if (!rootEl) { return; }
    rootEl.classList.remove(PLAYING_CLASS);
  }

  function seekRelative(delta) {
    if (!audioEl) { return; }
    var t = audioEl.currentTime || 0;
    var d = audioEl.duration;
    var next = t + delta;
    if (next < 0) { next = 0; }
    if (d && isFinite(d) && next > d) { next = d; }
    audioEl.currentTime = next;
  }

  function showMini() { setState('mini'); }
  function showExpanded() { setState('expanded'); }

  function setState(next) {
    if (!rootEl) { return; }
    rootEl.setAttribute('data-state', next);
    var expanded = rootEl.querySelector('.app-audio-expanded');
    if (!expanded) { return; }
    if (next === 'expanded') {
      expanded.setAttribute('aria-hidden', 'false');
      lockBodyScroll(true);
    } else {
      expanded.setAttribute('aria-hidden', 'true');
      lockBodyScroll(false);
    }
  }

  function lockBodyScroll(locked) {
    var body = document.body; if (!body) { return; }
    if (locked) {
      if (!body.__prevOverflow) { body.__prevOverflow = body.style.overflow; }
      body.style.overflow = 'hidden';
    } else {
      if (typeof body.__prevOverflow !== 'undefined') {
        body.style.overflow = body.__prevOverflow;
        delete body.__prevOverflow;
      } else {
        body.style.overflow = '';
      }
    }
  }

  function destroy() {
    try {
      timeSeek = {};
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      if (audioEl) {
        const audioUrl = audioEl.src;
        try { audioEl.pause(); } catch (e1) {}
        try { audioEl.removeAttribute('src'); audioEl.load(); } catch (e2) {}
        if (audioUrl) {
          console.log(`look for the detail view (${audioUrl}) and close it! `);
          let view = document.querySelector(`.app-detail-view[data-audio-url="${audioUrl}"]`);
          if (view) {
            destroyDetailView(view);
          }
        }
      }
      if (rootEl && rootEl.parentNode) { rootEl.parentNode.removeChild(rootEl); }

    } catch (e) {
      console.log('[app-audio] destroy error:', e && e.message);
    } finally {
      rootEl = null;
      audioEl = null;
      currentSrc = '';
      isScrubbing = false;
      lockBodyScroll(false);
    }
  }

  // UI helpers (guard rootEl)
  function setTexts(title) {
    if (!rootEl) { return; }
    var miniTitleEl = rootEl.querySelector('.app-audio-mini-title');
    var bigTitleEl = rootEl.querySelector('.app-audio-title');
    if (miniTitleEl) { miniTitleEl.textContent = title; miniTitleEl.setAttribute('title', title); }
    if (bigTitleEl) { bigTitleEl.textContent = title; }
  }

  function setImage(src) {
    if (!rootEl) { return; }
    var img = rootEl.querySelector('.app-audio-image');
    if (!img) { return; }
    if (src) {
      img.src = src;
      img.style.display = '';
    } else {
      img.removeAttribute('src');
      img.style.display = 'none';
    }
  }

  function setMiniProgressUI(fraction) {
    if (!rootEl) { return; }
    var bar = rootEl.querySelector('.app-audio-mini-progress-bar'); if (!bar) { return; }
    if (typeof fraction === 'number') {
      var pct = Math.max(0, Math.min(1, fraction));
      bar.classList.remove('indeterminate');
      bar.style.transform = 'scaleX(' + pct + ')';
    } else {
      bar.classList.add('indeterminate');
      bar.style.transform = 'scaleX(0.25)';
    }
  }

  function setCurrentTimeUI(current, duration) {
    if (!rootEl) { return; }
    var curEl = rootEl.querySelector('.app-audio-current');
    var remEl = rootEl.querySelector('.app-audio-mini-remaining');
    var range = rootEl.querySelector('.app-audio-range');

    if (curEl) { curEl.textContent = formatTime(current || 0); }

    var hasDuration = duration && isFinite(duration);
    if (remEl) { remEl.textContent = hasDuration ? formatRemaining(Math.max(0, duration - (current || 0))) : ''; }

    if (range) {
      range.style.visibility = hasDuration ? 'visible' : 'hidden';
      if (hasDuration && !isScrubbing) { range.value = String((current || 0) / duration); }
    }
  }

  function setTotalUI(duration) {
    if (!rootEl) { return; }
    var totalEl = rootEl.querySelector('.app-audio-total'); if (!totalEl) { return; }
    totalEl.textContent = (duration && isFinite(duration)) ? formatTime(duration) : '0:00';
  }

  function disableControls(disabled) {
    if (!rootEl) { return; }
    var names = ['.app-audio-back30', '.app-audio-fwd30', '.app-audio-range', '.app-audio-speed'];
    var i = 0;
    while (i < names.length) {
      var el = rootEl.querySelector(names[i]);
      if (el) {
        if (disabled) { el.classList.add(DISABLED_CLASS); el.disabled = true; }
        else { el.classList.remove(DISABLED_CLASS); el.disabled = false; }
      }
      i += 1;
    }
    var playEls = rootEl.querySelectorAll('.app-audio-toggle');
    var j = 0;
    while (j < playEls.length) { playEls[j].classList.remove(DISABLED_CLASS); playEls[j].disabled = false; j += 1; }
  }


  function highlightCurrentAudioText(t, d, currentSrc) {

    function removeCurrentClasses(audioHTMLBodyEle) {
        let currentEles = audioHTMLBodyEle.querySelectorAll('.audio-sentence.is-current[data-start]');
        for (let currentEle of currentEles) {
          currentEle.classList.remove('is-current');
        }
    }


    const current = timeSeek?.current;
    const next = timeSeek?.next;
    const src = timeSeek?.src;
    if (src !== currentSrc) {
      timeSeek = { src: currentSrc, current: -1, next: Infinity, el: null };
    }
    if (current >= 0 && t >= current && t < next) {
      // At this point we can quickly return to save computation power
      return;
    }
    let audioHTMLBodyEle = document.querySelector(`#ios-story-body[data-audio-url="${currentSrc}"]`);
    if (!audioHTMLBodyEle) {return;}
      if (t === d) {
      removeCurrentClasses(audioHTMLBodyEle);
    }
    const sentencesEles = audioHTMLBodyEle.querySelectorAll('.audio-sentence[data-start]');
    const l = sentencesEles.length;
    for (let [index, sentenceEle] of sentencesEles.entries()) {
      const startTime = Number(sentenceEle?.getAttribute('data-start'));
      const nextSentenceEle = sentencesEles[index + 1];
      let nextTime;
      if (index + 1 < l) {
        nextTime = Number(nextSentenceEle?.getAttribute('data-start'));
      } else {
        nextTime = d;
      }
      if (!Number.isFinite(startTime)) {continue;}
      if (t >= startTime && t < nextTime) {
        removeCurrentClasses(audioHTMLBodyEle);
        sentenceEle.classList.add('is-current');
        // TODO: scroll this into view
        sentenceEle.scrollIntoView({block: 'nearest', inline: 'nearest', behavior: 'smooth'});
        timeSeek.current = startTime;
        timeSeek.next = nextTime;
        break;
      }
    }
  }

  // Events
  function bindAudioEvents(a) {
    function onReady() {
      if (!rootEl || !a || !a.isConnected) { return; }
      rootEl.classList.add(READY_CLASS);
      var d = a.duration;
      var hasDuration = d && isFinite(d);
      disableControls(!hasDuration);
      setTotalUI(d || 0);
      updateSpeedButton();
      tick();
    }

    a.addEventListener('loadedmetadata', function () { onReady(); }, { passive: true });
    a.addEventListener('canplay', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      if (!rootEl.classList.contains(READY_CLASS)) { onReady(); }
    }, { passive: true });

    a.addEventListener('timeupdate', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      if (rafId) { return; }
      rafId = requestAnimationFrame(function () {
        rafId = 0;
        if (!rootEl || !a || !a.isConnected) { return; }
        var d = a.duration;
        var t = a.currentTime || 0;
        setCurrentTimeUI(t, d);
        highlightCurrentAudioText(t, d, currentSrc);
        if (d && isFinite(d)) { setMiniProgressUI(t / d); } else { setMiniProgressUI(null); }
      });
    }, { passive: true });

    a.addEventListener('play', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      rootEl.classList.add(PLAYING_CLASS);
    }, { passive: true });

    a.addEventListener('pause', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      rootEl.classList.remove(PLAYING_CLASS);
    }, { passive: true });

    a.addEventListener('ended', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      rootEl.classList.remove(PLAYING_CLASS);
      var d = a.duration;
      if (d && isFinite(d)) { setMiniProgressUI(1); } else { setMiniProgressUI(null); }
    }, { passive: true });

    a.addEventListener('ratechange', function () {
      if (!a || !a.isConnected) { return; }
      persistRate(a.playbackRate || 1);
      if (rootEl) { updateSpeedButton(); }
    }, { passive: true });

    a.addEventListener('error', function () {
      if (!rootEl || !a || !a.isConnected) { return; }
      disableControls(true);
      rootEl.classList.remove(PLAYING_CLASS);
    }, { passive: true });
  }

  function tick() {
    if (!audioEl || !rootEl || !audioEl.isConnected) { return; }
    var d = audioEl.duration;
    var t = audioEl.currentTime || 0;
    setCurrentTimeUI(t, d);
    if (d && isFinite(d)) { setMiniProgressUI(t / d); } else { setMiniProgressUI(null); }
  }

  // Speed
  function readRate() {
    try {
      var raw = localStorage.getItem('appAudioRate');
      var val = raw ? Number(raw) : 1;
      if (!val || !isFinite(val)) { return 1; }
      return Math.max(0.5, Math.min(3, val));
    } catch (e) { return 1; }
  }

  function persistRate(val) {
    try { localStorage.setItem('appAudioRate', String(val)); } catch (e) {}
    lastRate = val;
  }

  function cycleRate() {
    if (!audioEl) { return; }
    var list = [1, 1.25, 1.5, 1.75, 2, 0.75];
    var i = 0;
    var next = 1;
    while (i < list.length) {
      if (Math.abs(list[i] - (audioEl.playbackRate || 1)) < 0.001) { next = list[(i + 1) % list.length]; break; }
      i += 1;
    }
    audioEl.playbackRate = next;
  }

  function updateSpeedButton() {
    if (!rootEl || !audioEl) { return; }
    var btn = rootEl.querySelector('.app-audio-speed'); if (!btn) { return; }
    var rate = audioEl.playbackRate || 1;
    var label = rate % 1 === 0 ? ('x' + rate.toFixed(0)) : ('x' + rate.toFixed(2).replace(/0+$/, '').replace(/\.$/, ''));
    btn.textContent = label;
  }

  // Formatting
  function formatTime(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var r = s % 60;
    var mm = h > 0 ? String(m).padStart(2, '0') : String(m);
    var ss = String(r).padStart(2, '0');
    return (h > 0 ? (h + ':' + mm + ':' + ss) : (mm + ':' + ss));
  }

  function formatRemaining(sec) {
    var s = Math.max(0, Math.floor(Number(sec) || 0));
    var mins = Math.ceil(s / 60);
    return mins <= 1 ? '1 min remaining' : (mins + ' min remaining');
  }
})();
