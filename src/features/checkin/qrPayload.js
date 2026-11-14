/**
 * What the check-in QR code contains:  leap:<event uuid>:<6-char code>
 * The code rotates every 20s (see get_event_code in 0003_functions.sql).
 */

const PATTERN = /^leap:([0-9a-f-]{36}):([0-9a-f]{6})$/i;

/**
 * @param {string} eventId
 * @param {string} code
 * @returns {string}
 */
export function encodeCheckinQR(eventId, code) {
  return `leap:${eventId}:${code}`;
}

/**
 * @param {string} text Raw scanned text
 * @returns {{ eventId: string, code: string } | null} null if it's not a LEAP code
 */
export function parseCheckinQR(text) {
  const match = PATTERN.exec(text.trim());
  return match ? { eventId: match[1], code: match[2].toUpperCase() } : null;
}
