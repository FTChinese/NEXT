/* jshint browser:true, devel:true, strict:true, esversion: 6 */
/* global delegate */

(function () {
  'use strict';

  // --- Gesture config
  var DISMISS_DISTANCE_RATIO = 0.33;   // drag ≥ 33% of width -> dismiss
  var DISMISS_MIN_VELOCITY   = 0.55;   // px/ms to allow a quick flick
  var HORIZONTAL_LOCK_ANGLE  = 30;     // degrees from horizontal to lock gesture
  var MAX_OPACITY_FADE_PCT   = 0.15;   // fade a bit as you drag (optional)

  // Per-element gesture state
  var gesture = new WeakMap();

  // --- Utils
  function now() {
    if (window.performance && typeof window.performance.now === 'function') {
      return window.performance.now();
    }
    return Date.now();
  }

  function getTouchFromEvent(ev) {
    if (ev.touches && ev.touches[0]) {
      return ev.touches[0];
    }
    if (ev.changedTouches && ev.changedTouches[0]) {
      return ev.changedTouches[0];
    }
    return null;
  }

  function getTouchX(ev) {
    var t = getTouchFromEvent(ev);
    return t ? t.clientX : 0;
  }

  function getTouchY(ev) {
    var t = getTouchFromEvent(ev);
    return t ? t.clientY : 0;
  }

  function setTranslateX(el, x) {
    el.style.transform = 'translateX(' + x + 'px)';
  }

  function setDraggingStyles(el, dragging) {
    if (dragging) {
      el.style.transition = 'none';
      el.style.willChange = 'transform, opacity';
    } else {
      el.style.willChange = '';
    }
  }

  function applyProgressEffects(el, x, width) {
    var progress = x / width;
    if (progress < 0) {
      progress = 0;
    }
    if (progress > 1) {
      progress = 1;
    }
    var opacity = 1 - progress * MAX_OPACITY_FADE_PCT;
    el.style.opacity = String(opacity);
  }

  function resetVisual(el) {
    el.style.transition = 'transform 260ms ease, opacity 260ms ease';
    el.style.transform = '';
    el.style.opacity = '';
  }

  // Force a reflow using a function call (avoids JSHint W030)
  function forceReflow(el) {
    el.getBoundingClientRect(); // read to flush pending styles
  }

  // Optional: a hook to do app-level dismiss (e.g., history.back())
  function dismissAppDetailView(el) {
    // history.back();
    el.remove();
  }

  function animateOffAndRemove(el, fromX) {
    var width = el.getBoundingClientRect().width || window.innerWidth;
    el.style.transition = 'transform 260ms ease-out, opacity 180ms linear';
    el.style.opacity = '0';
    forceReflow(el);
    setTranslateX(el, Math.max(fromX, width + 16));
    var onEnd = function (e) {
      if (e && e.target === el && e.propertyName === 'transform') {
        el.removeEventListener('transitionend', onEnd);
        dismissAppDetailView(el);
      }
    };
    el.addEventListener('transitionend', onEnd);
  }

  function shouldDismiss(state, elWidth) {
    if (!state) {
      return false;
    }
    var dx = state.lastX - state.startX;
    var dt = state.lastT - state.startT;
    if (dt < 1) {
      dt = 1;
    }
    var velocity = dx / dt; // px/ms
    var distanceEnough = dx >= elWidth * DISMISS_DISTANCE_RATIO;
    var velocityEnough = velocity >= DISMISS_MIN_VELOCITY;
    return dx > 0 && (distanceEnough || velocityEnough);
  }

  // --- Scroll locking for inner content scroller
  function getContentScroller(rootEl) {
    return rootEl.querySelector('.app-detail-content');
  }

  function setScrollLock(rootEl, lock) {
    var scroller = getContentScroller(rootEl);
    if (!scroller) {
      return;
    }
    if (lock) {
      scroller._prevOverflowY = scroller.style.overflowY;
      scroller._prevWebkitScroll = scroller.style.webkitOverflowScrolling;
      scroller.style.overflowY = 'hidden';
      scroller.style.webkitOverflowScrolling = 'auto';
    } else {
      scroller.style.overflowY = (typeof scroller._prevOverflowY === 'string') ? scroller._prevOverflowY : '';
      scroller.style.webkitOverflowScrolling = (typeof scroller._prevWebkitScroll === 'string') ? scroller._prevWebkitScroll : '';
      scroller._prevOverflowY = null;
      scroller._prevWebkitScroll = null;
    }
  }

  // --- Attach a non-passive touchmove for the duration of the gesture
  function attachNonPassiveMoveDuringGesture(rootEl, state) {
    function onMove(ev) {
      state.lastX = getTouchX(ev);
      state.lastY = getTouchY(ev);
      state.lastT = now();

      if (state.locked === undefined) {
        var dx0 = Math.abs(state.lastX - state.startX);
        var dy0 = Math.abs(state.lastY - state.startY);
        if (dx0 >= 3 || dy0 >= 3) {
          var ang = Math.atan2(dy0, dx0) * (180 / Math.PI);
          if (ang <= HORIZONTAL_LOCK_ANGLE) {
            state.locked = true;
            setScrollLock(rootEl, true);
          } else {
            state.locked = false;
          }
        }
      }

      // Unconditionally prevent default once locked (per your request)
      if (state.locked === true) {
        ev.preventDefault();
      }
    }

    function cleanup() {
      rootEl.removeEventListener('touchmove', onMove, { passive: false });
      rootEl.removeEventListener('touchend', cleanup);
      rootEl.removeEventListener('touchcancel', cleanup);
    }

    rootEl.addEventListener('touchmove', onMove, { passive: false });
    rootEl.addEventListener('touchend', cleanup);
    rootEl.addEventListener('touchcancel', cleanup);
  }

  // Locking logic: once movement clearly horizontal, prevent vertical scrolling
  function maybeLockScroll(ev, state) {
    if (state.locked !== undefined) {
      return; // already decided
    }
    var dx = Math.abs(state.lastX - state.startX);
    var dy = Math.abs(state.lastY - state.startY);
    if (dx < 3 && dy < 3) {
      return; // not enough info yet
    }

    var angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angleDeg <= HORIZONTAL_LOCK_ANGLE) {
      state.locked = true;
      setScrollLock(state.rootEl, true);
      // Unconditionally prevent default once locked
      ev.preventDefault();
    } else {
      state.locked = false;
    }
  }

  // --- Event handlers (using your delegate)
  delegate.on('touchstart', '.app-detail-view', function (event) {
    try {
      var el = this;
      var x = getTouchX(event);
      var y = getTouchY(event);
      var t = now();

      var st = {
        rootEl: el,
        startX: x,
        startY: y,
        lastX: x,
        lastY: y,
        startT: t,
        lastT: t,
        dragging: true,
        locked: undefined
      };
      gesture.set(el, st);
      setDraggingStyles(el, true);
      setTranslateX(el, 0);

      // Ensure we have a non-passive touchmove while this gesture is active.
      attachNonPassiveMoveDuringGesture(el, st);
    } catch (err) {
      console.error('touchstart error:', err);
    }
  });

  delegate.on('touchmove', '.app-detail-view', function (event) {
    try {
      var el = this;
      var st = gesture.get(el);
      if (!st || !st.dragging) {
        return;
      }

      st.lastX = getTouchX(event);
      st.lastY = getTouchY(event);
      st.lastT = now();

      // Decide whether to lock; if we lock, preventDefault here as well
      maybeLockScroll(event, st);
      if (st.locked === false) {
        return; // let vertical scroll continue
      }
      if (st.locked === true) {
        event.preventDefault(); // unconditional, as requested
      }

      var dx = st.lastX - st.startX;
      if (dx < 0) {
        dx = 0; // only allow right-swipe to move
      }

      setTranslateX(el, dx);

      // Optional: progress effects (fade)
      var width = el.getBoundingClientRect().width || window.innerWidth;
      applyProgressEffects(el, dx, width);
    } catch (err) {
      console.error('touchmove error:', err);
    }
  });

  delegate.on('touchend', '.app-detail-view', function () {
    try {
      var el = this;
      var st = gesture.get(el);
      if (!st) {
        return;
      }

      st.dragging = false;
      var width = el.getBoundingClientRect().width || window.innerWidth;
      var dx = st.lastX - st.startX;
      if (dx < 0) {
        dx = 0;
      }

      if (shouldDismiss(st, width)) {
        animateOffAndRemove(el, dx);
      } else {
        resetVisual(el);
      }

      setScrollLock(el, false);
      gesture.delete(el);
      setDraggingStyles(el, false);
    } catch (err) {
      console.error('touchend error:', err);
    }
  });

  delegate.on('touchcancel', '.app-detail-view', function () {
    try {
      var el = this;
      resetVisual(el);
      setScrollLock(el, false);
      gesture.delete(el);
      setDraggingStyles(el, false);
    } catch (err) {
      console.error('touchcancel error');
    }
  });
})();
