# JMU LEAP 🐸

**Break out of your comfort zone.** JMU LEAP is a companion app for freshmen during FROG Week /
Weeks of Welcome. Attendance at FROG events is low because there's little incentive, so LEAP turns
the weeks into a game. Freshmen scan a rotating QR code at each event, earn points for their FROG
group, keep daily attendance streaks, chat with their group and FROG, and climb a live leaderboard
of every FROG group, including live **FROGlympics** competitions, FROG vs. FROG. FROGs (First-yeaR
Orientation Guides) get tools to create optional events, run check-in, and confirm who actually stayed.

Built at the JMU Make-a-thon (24 hours, 5 people).

---

## Stack

React 19 + Vite · JavaScript + JSDoc · React Router · Tailwind CSS v4 ·
vite-plugin-pwa · Supabase (auth, Postgres, realtime) · qrcode.react · html5-qrcode

## Demo accounts

All passwords: **`LeapFrog2026!`**

| Email                                         | Role                 | Group           | Pick on login |
| --------------------------------------------- | -------------------- | --------------- | ------------- |
| `frog1@leap.demo`                             | FROG (Alex Rivera)   | Duke Dogs       | Frog          |
| `frog2@leap.demo`                             | FROG (Jordan Kim)    | Purple Pride    | Frog          |
| `frog3@leap.demo`                             | FROG (Sam Patel)     | Bluestone Bunch | Frog          |
| `frog4@leap.demo`                             | FROG (Taylor Brooks) | Quad Squad      | Frog          |
| `student1@leap.demo` … `student4@leap.demo`   | Freshman             | Duke Dogs       | Student       |
| `student5@leap.demo` … `student8@leap.demo`   | Freshman             | Purple Pride    | Student       |
| `student9@leap.demo` … `student12@leap.demo`  | Freshman             | Bluestone Bunch | Student       |
| `student13@leap.demo` … `student16@leap.demo` | Freshman             | Quad Squad      | Student       |
| `admin@leap.demo`                             | Admin                | n/a             | either        |
| `visitor@leap.demo`                           | not on roster        | n/a             | shows "Sorry" |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): data model, points rules, anti-cheat.
- [`CLAUDE.md`](CLAUDE.md): conventions for AI coding assistants (and humans).
