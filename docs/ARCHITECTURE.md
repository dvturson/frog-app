# Architecture

```
Phone (React PWA)  ──supabase-js──▶  Supabase
  routes.jsx                           Auth (email + password, shown as mock JMU SSO)
  AuthProvider (session + profile)     Postgres + RLS (0001, 0002)
  features/*                           Functions: points + anti-cheat (0003)
                                       Realtime: messages, profiles, olympics_results, checkins
```

There is no custom backend. The browser talks to Supabase directly. Security comes from Row Level
Security, column grants, and a few `security definer` functions.

## Roles

| Role       | How assigned                                     | Can                                                                                                                                     |
| ---------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `freshman` | `roster` table → copied to `profiles` on sign-up | see leaderboard/events, check in, chat in own group, DM own FROG                                                                        |
| `frog`     | same                                             | everything above (no check-in) + create ≤3 optional events/day, show QR, confirm attendance, post announcements, enter olympics results |
| `admin`    | same (seed only)                                 | create mandatory events, verify olympics results, manage roster                                                                         |
| `NULL`     | not on roster                                    | nothing; login shows "Sorry, you cannot use JMU LEAP…"                                                                                  |

Login's "I am a… Frog / Student" choice must match the DB role (admins skip that check).

## Data model (`0001_schema.sql`)

| Table / view        | Notes                                                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `frog_groups`       | `name`, `frog_leader_id`. No stored total; the view computes it.                                                                   |
| `profiles`          | 1:1 with `auth.users`. `role`, `frog_group_id`, `points` (earned for group), `xp` (personal), `current_streak`, `last_active_date` |
| `roster`            | `email → role, group`. Admin CSV upload writes here (TODO).                                                                        |
| `events`            | `type` session/frogolympics, `is_mandatory`, `frog_group_id` (NULL = everyone), `starts_at`, `ends_at` (≥30 min), `xp`             |
| `event_secrets`     | QR HMAC secret per event. RLS on with **no policies**, so no client can read it.                                                   |
| `checkins`          | `(event_id, user_id)` unique. `status`: arrived → stayed / left. `points_awarded`.                                                 |
| `olympics_results`  | `placement` 1–4 → `points_awarded` (trigger: 40/20/10/5). Counts once `verified_at` is set.                                        |
| `messages`          | `channel`: announcements / group / dm (+ `recipient_id`).                                                                          |
| `group_leaderboard` | view: Σ member `points` + Σ verified olympics points, ranked.                                                                      |

**Changes from the original plan:** quests, sections, peer codes and the `quest-photos` bucket were
dropped (not used by any screen). `frog_groups.points` was replaced by the view so totals have one
source of truth. `checkin_secret` moved to `event_secrets` because RLS can't hide a single column.

## Event timeline

```
 start-5min          start            halfway             end
     │─── checkin ─────┼──────────────────│── attendance ────│── over
  FROG shows rotating QR                 FROG marks ✓ / ✗
  students scan → 'arrived'              ✓ → points, XP, streak
```

Defined twice and kept in sync: `private.event_phase()` (SQL) and `src/features/events/eventPhase.js`.

## Anti-cheat: rotating QR

1. The FROG's screen calls `get_event_code(event_id)` every 20 seconds. Only the event's creator, or a
   FROG whose group can see the event, may call it, and only during the check-in phase.
2. The code is `upper(hex(HMAC-SHA256(secret, "<event_id>:<floor(unix/20)>")))[0:6]`.
3. The QR encodes `leap:<event_id>:<code>`.
4. A student's scan calls `check_in(event_id, code)`. It accepts the current **or previous** window
   (covers slow scans and clock drift), requires role `freshman` and the right group, and inserts
   `checkins` once (duplicates are rejected).

A screenshot of the QR is useless 20–40 seconds later, and you still need the FROG's ✓ at the end.

## Points rules (`confirm_attendance`)

When a FROG taps ✓ (stayed):

- `profiles.points += 1` (counts toward the group) and `profiles.xp += event.xp` (personal level).
- **Streak:** consecutive days (America/New_York) with at least one confirmed event. Same day: no
  change. Yesterday: +1. Otherwise reset to 1.
- **Streak bonus:** on day _n_ of a streak (n ≥ 2), the **first optional** event confirmed that day
  earns an extra **+n** points.
- ✗ (left) records the status and awards nothing. Each check-in can be confirmed only once.

FROGlympics: a FROG enters placements, then an admin calls `verify_olympics_result(id)`. Unverified
results are visible but don't count.

## Security summary (`0002_rls.sql`)

- `anon` gets nothing. `authenticated` gets explicit table/column grants only.
- `profiles`: anyone signed in can read; you can update only your own `display_name` and `major`.
- `checkins`: read-only for clients (own rows, your FROG, admin). Written only by functions.
- `events`: you see all-group events plus your group's. FROGs insert optional sessions for their own group.
- `messages`: your group only. DMs visible only to sender and recipient. Announcements are FROG-only.
- Helpers `my_role()` / `my_group_id()` are `security definer` to avoid RLS recursion.
