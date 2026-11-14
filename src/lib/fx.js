/**
 * Tiny visual-effect helpers that poke at DOM classes defined in src/index.css.
 */

/**
 * Restart a one-shot CSS animation class on an element (works on repeated taps).
 * @param {Element | null} el
 * @param {string} className
 * @returns {void}
 */
export function replayAnimation(el, className) {
  if (!el) return;
  el.classList.remove(className);
  void (/** @type {HTMLElement} */ (el).offsetWidth); // force reflow so the animation restarts
  el.classList.add(className);
  el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
}

/**
 * Jolt the whole app for a moment, e.g. when a stamp lands.
 * @param {number} [delayMs] wait before shaking (to sync with another animation)
 * @returns {void}
 */
export function shakeScreen(delayMs = 0) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  window.setTimeout(
    () => replayAnimation(document.getElementById('root'), 'screen-shake'),
    delayMs,
  );
  navigator.vibrate?.(40);
}
