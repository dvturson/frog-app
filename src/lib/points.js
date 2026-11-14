/** XP needed per level. Simple and linear on purpose; change freely. */
export const XP_PER_LEVEL = 100;

/**
 * Turn total XP into a level and progress toward the next level.
 * @param {number} xp Total personal XP
 * @returns {{ level: number, intoLevel: number, needed: number, percent: number }}
 */
export function levelFromXp(xp = 0) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return {
    level,
    intoLevel,
    needed: XP_PER_LEVEL,
    percent: Math.round((intoLevel / XP_PER_LEVEL) * 100),
  };
}

/**
 * A streak only counts if the last active day was today or yesterday.
 * @param {number} currentStreak
 * @param {string | null} lastActiveDate 'YYYY-MM-DD'
 * @returns {number}
 */
export function liveStreak(currentStreak, lastActiveDate) {
  if (!lastActiveDate) return 0;
  const today = new Date();
  const last = new Date(`${lastActiveDate}T00:00:00`);
  const days = Math.floor((today.setHours(0, 0, 0, 0) - last.getTime()) / 86_400_000);
  return days <= 1 ? currentStreak : 0;
}
