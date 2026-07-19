/* FT-style inline music audio controls.
 * Audio is intentionally centralized so only one music clip can play at a time.
 */
(function () {
  'use strict';

  var AUDIO_SELECTOR = 'a[data-type="music-audio"][data-audio-url]';
  var SOURCE_HOST = 'ft-ig-audio-prod.s3.amazonaws.com';
  var FRONTEND_HOST = 'ig-audio.ft.com';
  var PLAY_ICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23F6E9D8%22%20d%3D%22M8%205v14l11-7z%22%2F%3E%3C%2Fsvg%3E';
  var PAUSE_ICON = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22%23F6E9D8%22%20d%3D%22M6%205h4v14H6zm8%200h4v14h-4z%22%2F%3E%3C%2Fsvg%3E';
  var audio = new Audio();
  var currentControl = null;
  var currentSource = '';

  audio.preload = 'metadata';

  function normalizeAudioUrl(value) {
    var raw = String(value || '').trim();
    if (!raw) {
      return '';
    }
    try {
      var parsed = new URL(raw, window.location.href);
      if (parsed.hostname.toLowerCase() === SOURCE_HOST) {
        parsed.protocol = 'https:';
        parsed.hostname = FRONTEND_HOST;
      }
      return parsed.toString();
    } catch (err) {
      return raw;
    }
  }

  function setProgress(control, progress) {
    if (!control || !control.content) {
      return;
    }
    var safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    var unplayedStart = Math.min(101, safeProgress + 1);
    control.content.style.background = 'linear-gradient(to right, rgba(175, 81, 108, 0.35) ' + safeProgress + '%, rgba(175, 81, 108, 0.15) ' + unplayedStart + '%)';
  }

  function setPlayingState(control, isPlaying) {
    if (!control) {
      return;
    }
    control.root.classList.toggle('g-audio--playing', isPlaying);
    control.root.classList.toggle('g-audio-pause', isPlaying);
    control.button.setAttribute('aria-label', isPlaying ? 'Pause audio' : 'Play audio');
  }

  function resetControl(control) {
    if (!control) {
      return;
    }
    setPlayingState(control, false);
    setProgress(control, 0);
  }

  function pauseCurrent(reset) {
    if (!currentControl) {
      return;
    }
    audio.pause();
    setPlayingState(currentControl, false);
    if (reset) {
      resetControl(currentControl);
    }
  }

  function playControl(control) {
    var source = control.audioUrl;
    if (!source) {
      return;
    }

    if (currentControl !== control || currentSource !== source) {
      pauseCurrent(true);
      currentControl = control;
      currentSource = source;
      audio.src = source;
      audio.load();
    }

    setPlayingState(control, true);
    var playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setPlayingState(control, false);
      });
    }
  }

  function toggleControl(control) {
    if (currentControl === control && !audio.paused) {
      audio.pause();
      setPlayingState(control, false);
      return;
    }
    playControl(control);
  }

  function activateFromKeyboard(event, control) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    event.preventDefault();
    toggleControl(control);
  }

  function createControl(anchor) {
    var audioUrl = normalizeAudioUrl(anchor.getAttribute('data-audio-url'));
    if (!audioUrl) {
      return null;
    }

    var root = document.createElement('span');
    root.className = 'g-audio g-audio--initialized';

    var button = document.createElement('span');
    button.className = 'g-audio--playbutton';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('aria-label', 'Play audio');

    var content = document.createElement('span');
    content.className = 'g-audio-content';
    while (anchor.firstChild) {
      content.appendChild(anchor.firstChild);
    }

    root.appendChild(button);
    root.appendChild(content);

    var control = {
      root: root,
      button: button,
      content: content,
      audioUrl: audioUrl
    };

    button.addEventListener('click', function () {
      toggleControl(control);
    });
    button.addEventListener('keydown', function (event) {
      activateFromKeyboard(event, control);
    });

    setProgress(control, 0);
    anchor.parentNode.replaceChild(root, anchor);
    return control;
  }

  function initializeAudioControls() {
    var anchors = document.querySelectorAll(AUDIO_SELECTOR);
    for (var i = 0; i < anchors.length; i += 1) {
      createControl(anchors[i]);
    }
  }

  function injectStyles() {
    if (document.getElementById('music-audio-inline-styles')) {
      return;
    }
    var style = document.createElement('style');
    style.id = 'music-audio-inline-styles';
    style.textContent = [
      '.g-audio {',
      '  border-radius: 6px;',
      '  cursor: pointer;',
      '  display: inline;',
      '  margin: 0 -3px 0 5px;',
      '  padding: 0 5px 0 0;',
      '  vertical-align: top;',
      '}',
      '.g-audio--playbutton {',
      '  background: #9e2f50;',
      '  border-radius: 6px 0 0 6px;',
      '  color: #f6e9d8;',
      '  margin-right: 2px;',
      '  padding-left: 5px;',
      '  padding-right: 2.5px;',
      '}',
      '.g-audio--playbutton::before {',
      '  content: "";',
      '  display: inline-block;',
      '  background-repeat: no-repeat;',
      '  background-size: contain;',
      '  background-position: 50%;',
      '  background-color: transparent;',
      '  vertical-align: middle;',
      '  width: 16px;',
      '  height: 16px;',
      '  background-image: url("' + PLAY_ICON + '");',
      '  font-size: .8em;',
      '  margin: 0 5px 2px;',
      '}',
      '.g-audio-pause .g-audio--playbutton::before {',
      '  background-image: url("' + PAUSE_ICON + '");',
      '}',
      '.g-audio-content {',
      '  display: inline;',
      '  background: #af516c26;',
      '  padding: 0 5px;',
      '  position: relative;',
      '}',
      '@media (min-width: 76.25em) {',
      '  .g-audio--playbutton::before {',
      '    margin-bottom: 4px;',
      '  }',
      '}',
      '.g-audio-content::selection {',
      '  background: rgba(175, 81, 108, 0.35);',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  audio.addEventListener('timeupdate', function () {
    if (!currentControl || !isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }
    setProgress(currentControl, (audio.currentTime / audio.duration) * 100);
  });

  audio.addEventListener('play', function () {
    setPlayingState(currentControl, true);
  });

  audio.addEventListener('pause', function () {
    setPlayingState(currentControl, false);
  });

  audio.addEventListener('ended', function () {
    resetControl(currentControl);
    audio.currentTime = 0;
  });

  audio.addEventListener('error', function () {
    setPlayingState(currentControl, false);
  });

  function start() {
    injectStyles();
    initializeAudioControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
}());
