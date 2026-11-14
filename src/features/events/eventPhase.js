/**
 * Event timeline (keep in sync with private.event_phase in 0003_functions.sql):
 *   upcoming   -> more than 5 min before start
 *   checkin    -> 5 min before start until halfway   (FROG shows rotating QR)
 *   attendance -> halfway until end                  (FROG marks stayed / left)
 *   over       -> after end
 *
 * @typedef {'upcoming' | 'checkin' | 'attendance' | 'over'} EventPhase
 */

const FIVE_MIN = 5 * 60 * 1000;

/**
 * @param {Pick<import('../../lib/types').LeapEvent, 'starts_at' | 'ends_at'>} event
 * @param {number} [now] ms timestamp
 * @returns {EventPhase}
 */
export function eventPhase(event, now = Date.now()) {
  const start = new Date(event.starts_at).getTime();
  const end = new Date(event.ends_at).getTime();
  if (now < start - FIVE_MIN) return 'upcoming';
  if (now < start + (end - start) / 2) return 'checkin';
  if (now < end) return 'attendance';
  return 'over';
}

/** @param {string} iso @returns {string} e.g. "2:30 PM" */
export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** @param {string} iso @returns {string} e.g. "Thu, Aug 21" */
export function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
