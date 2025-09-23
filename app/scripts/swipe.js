// --- Gesture config
const DISMISS_DISTANCE_RATIO = 0.33;   // drag ≥ 33% of width -> dismiss
const DISMISS_MIN_VELOCITY   = 0.55;   // px/ms to allow a quick flick
const HORIZONTAL_LOCK_ANGLE  = 30;     // degrees from horizontal to lock gesture
const MAX_OPACITY_FADE_PCT   = 0.15;   // fade a bit as you drag (optional)

// Per-element gesture state
const gesture = new WeakMap();
// Utility: now in ms
const now = () => (performance?.now ? performance.now() : Date.now());

function getTouchX(evt) {
  const t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
  return t ? t.clientX : 0;
}
function getTouchY(evt) {
  const t = (evt.touches && evt.touches[0]) || (evt.changedTouches && evt.changedTouches[0]);
  return t ? t.clientY : 0;
}

// Optional: a hook to do app-level dismiss (e.g., history.back())
function dismissAppDetailView(el) {
  // Remove from DOM after animation, or navigate:
  // history.back();
  el.remove();
}

function setTranslateX(el, x) {
  el.style.transform = `translateX(${x}px)`;
}

function setDraggingStyles(el, dragging) {
  if (dragging) {
    // No transition during drag; let it track the finger 1:1
    el.style.transition = 'none';
    el.style.willChange = 'transform, opacity';
  } else {
    // Let CSS control the release animation; we’ll set transition on release
    el.style.willChange = '';
  }
}

function applyProgressEffects(el, x, width) {
  // Optional visual: a subtle fade as you drag (max MAX_OPACITY_FADE_PCT opacity loss)
  const progress = Math.max(0, Math.min(1, x / width));
  const opacity = 1 - progress * MAX_OPACITY_FADE_PCT;
  el.style.opacity = String(opacity);
}

function resetVisual(el) {
  el.style.transition = 'transform 260ms ease, opacity 260ms ease';
  el.style.transform = '';
  el.style.opacity = '';
}

function animateOffAndRemove(el, fromX) {
  const width = el.getBoundingClientRect().width || window.innerWidth;
  // Animate to full width (or a bit more to be safe)
  el.style.transition = 'transform 260ms ease-out, opacity 180ms linear';
  el.style.opacity = '0';
  // Force layout so transition applies (rarely needed, but safe):
  // eslint-disable-next-line no-unused-expressions
  void el.offsetHeight; 
  setTranslateX(el, Math.max(fromX, width + 16));
  const onEnd = () => {
    el.removeEventListener('transitionend', onEnd);
    dismissAppDetailView(el);
  };
  el.addEventListener('transitionend', onEnd);
}

/**
 * Decide whether to dismiss:
 * - If distance ratio ≥ threshold OR velocity ≥ min velocity
 * - Only if the drag was to the right (positive deltaX)
 */
function shouldDismiss(state, elWidth) {
  if (!state) {return false;}
  const dx = state.lastX - state.startX;
  const dt = Math.max(1, state.lastT - state.startT); // ms
  const velocity = dx / dt; // px/ms
  const distanceEnough = dx >= elWidth * DISMISS_DISTANCE_RATIO;
  const velocityEnough = velocity >= DISMISS_MIN_VELOCITY;
  return dx > 0 && (distanceEnough || velocityEnough);
}

// Locking logic: once movement clearly horizontal, prevent vertical scrolling
function maybeLockScroll(evt, state) {
  if (state.locked !== undefined) {return; }// already decided
  const dx = Math.abs(state.lastX - state.startX);
  const dy = Math.abs(state.lastY - state.startY);
  if (dx < 3 && dy < 3) {return; }// not enough info yet
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);
  if (angleDeg <= HORIZONTAL_LOCK_ANGLE) {
    state.locked = true;
    // prevent the page from scrolling when we’ve decided it’s a horizontal swipe
    if (evt.cancelable) {evt.preventDefault();}
  } else {
    state.locked = false;
  }
}

// --- Event handlers (using your delegate)
delegate.on('touchstart', '.app-detail-view', function (event) {
  try {
    const el = this;
    const x = getTouchX(event);
    const y = getTouchY(event);
    const t = now();

    const st = {
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      startT: t,
      lastT: t,
      dragging: true,
      locked: undefined, // unknown until we see direction
    };
    gesture.set(el, st);
    setDraggingStyles(el, true);
    // Start from 0 translation
    setTranslateX(el, 0);
  } catch (err) {
    console.error('touchstart error:', err);
  }
});

delegate.on('touchmove', '.app-detail-view', function (event) {
  try {
    const el = this;
    const st = gesture.get(el);
    if (!st || !st.dragging) {return;}

    st.lastX = getTouchX(event);
    st.lastY = getTouchY(event);
    st.lastT = now();

    maybeLockScroll(event, st); // will preventDefault if locked horizontally
    if (st.locked === false) {return;} // let vertical scroll continue

    const dx = Math.max(0, st.lastX - st.startX); // only allow right-swipe to move
    setTranslateX(el, dx);

    // Optional: progress effects (fade)
    const width = el.getBoundingClientRect().width || window.innerWidth;
    applyProgressEffects(el, dx, width);
  } catch (err) {
    console.error('touchmove error:', err);
  }
});

delegate.on('touchend', '.app-detail-view', function () {
  try {
    const el = this;
    const st = gesture.get(el);
    if (!st) {return;}

    st.dragging = false;
    const width = el.getBoundingClientRect().width || window.innerWidth;
    const dx = Math.max(0, st.lastX - st.startX);

    if (shouldDismiss(st, width)) {
      // Fling/distance qualifies: animate off to the right and remove
      animateOffAndRemove(el, dx);
    } else {
      // Not enough: snap back
      resetVisual(el);
    }

    // Clear per-element state after we decide
    gesture.delete(el);
    setDraggingStyles(el, false);
  } catch (err) {
    console.error('touchend error:', err);
  }
});

// (Optional) If you want to handle interruptions:
delegate.on('touchcancel', '.app-detail-view', function () {
  try {
    const el = this;
    resetVisual(el);
    gesture.delete(el);
    setDraggingStyles(el, false);
  } catch (err) {
    console.error('touchcancel error');
  }
});
