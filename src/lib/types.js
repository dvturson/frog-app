/**
 * Shared data shapes (JSDoc only, no runtime code). These mirror
 * supabase/migrations/0001_schema.sql. Update both together.
 *
 * Use them in other files like:  /** @param {import('../lib/types').Profile} profile *\/
 */

/** @typedef {'freshman' | 'frog' | 'admin'} UserRole */
/** @typedef {'session' | 'frogolympics'} EventType */
/** @typedef {'arrived' | 'stayed' | 'left'} CheckinStatus */
/** @typedef {'announcements' | 'group' | 'dm'} ChatChannel */

/**
 * @typedef {object} FrogGroup
 * @property {string} id
 * @property {string} name
 * @property {string | null} frog_leader_id
 */

/**
 * @typedef {object} Profile
 * @property {string} id                 Same as the auth user id
 * @property {string} display_name
 * @property {UserRole | null} role      null = not on the roster
 * @property {string | null} major
 * @property {string | null} frog_group_id
 * @property {{ id: string, name: string } | null} [frog_group]  Joined in AuthProvider
 * @property {number} points             Points this member earned for their group
 * @property {number} xp                 Personal XP (level = see lib/points.js)
 * @property {number} current_streak
 * @property {string | null} last_active_date  'YYYY-MM-DD'
 */

/**
 * @typedef {object} LeapEvent
 * @property {string} id
 * @property {string} title
 * @property {string | null} description
 * @property {EventType} type
 * @property {boolean} is_mandatory
 * @property {string | null} frog_group_id   null = all groups
 * @property {string | null} location_name
 * @property {string} starts_at              ISO timestamp
 * @property {string} ends_at                ISO timestamp
 * @property {number} xp
 * @property {string | null} created_by
 */

/**
 * @typedef {object} Checkin
 * @property {string} event_id
 * @property {string} user_id
 * @property {CheckinStatus} status
 * @property {number} points_awarded
 * @property {string} created_at
 */

/**
 * @typedef {object} LeaderboardRow   Row of the group_leaderboard view
 * @property {string} id
 * @property {string} name
 * @property {number} member_points
 * @property {number} olympics_points
 * @property {number} total_points
 * @property {number} rank
 */

/**
 * @typedef {object} Message
 * @property {number} id
 * @property {string} frog_group_id
 * @property {string} user_id
 * @property {ChatChannel} channel
 * @property {string | null} recipient_id
 * @property {string} body
 * @property {string} created_at
 */

export {};
