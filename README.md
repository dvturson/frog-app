# JMU LEAP 🐸

**Break out of your comfort zone.** JMU LEAP is a companion app for freshmen during FROG Week /
Weeks of Welcome. Attendance at FROG events is low because there's little incentive, so LEAP turns
the week into a game. Freshmen scan a rotating QR code at each event, earn points for their FROG
group, keep daily attendance streaks, chat with their group and FROG, and climb a live leaderboard
of every FROG group, including live **FROGolympics** competitions for real prizes. FROGs (First-yeaR
Orientation Guides) get tools to create events, run check-in, and confirm who actually stayed.

Built at the JMU Make-a-thon (24 hours, 5 people).

---

## Stack

React 19 + Vite · JavaScript + JSDoc (no TypeScript) · React Router · Tailwind CSS v4 ·
vite-plugin-pwa · Supabase (auth, Postgres, realtime) · qrcode.react · html5-qrcode · Vercel

## Setup (≈10 minutes)

1. **Install:** `npm install` (Node 20+).
2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).
3. **Run the SQL** in Supabase → _SQL Editor_. Paste and run each file **in this order**:
   1. `supabase/migrations/0001_schema.sql`
   2. `supabase/migrations/0002_rls.sql`
   3. `supabase/migrations/0003_functions.sql`
   4. `supabase/seed.sql` (demo data; safe to re-run, and re-running resets event times to "now")
4. **Environment:** copy `.env.example` to `.env` and paste your values from Supabase →
   _Project Settings → API_ (Project URL + `anon` public key).
5. **Run:** `npm run dev` → http://localhost:5173

### Testing on a phone (camera)

Browsers only allow the camera over HTTPS. Run `npm run dev:https`, then open the
`https://192.168.x.x:5173` "Network" URL on a phone on the **same Wi-Fi**. Accept the
self-signed certificate warning. Photo upload works everywhere as a fallback.

### Scripts

| Script              | What it does                                     |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Local dev server                                 |
| `npm run dev:https` | Dev server on your LAN with HTTPS (phone camera) |
| `npm run build`     | Production build to `dist/`                      |
| `npm run preview`   | Serve the production build                       |
| `npm run lint`      | ESLint                                           |
| `npm run format`    | Prettier (write)                                 |

## Deploy to Vercel

1. Push this repo to GitHub.
2. [vercel.com](https://vercel.com) → _Add New Project_ → import the repo (framework: **Vite**, auto-detected).
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy. `vercel.json` already rewrites every route to `index.html` so deep links work.
5. In Supabase → _Authentication → URL Configuration_, set **Site URL** to your Vercel URL.

Every push to `main` redeploys. Pull requests get preview URLs.

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

**Best demo path:** log in as `frog1` → FROG Tools → tap _Sit with Strangers at D-Hall_ (live QR).
On a second device, log in as `student4` → Path → Scan QR. Then as `frog1`, open _Arboretum Walk &
Talk_ to see the attendance screen. Event times are relative to when `seed.sql` ran, so re-run it
**within ~25 minutes of the demo** (the D-Hall QR window closes at the event's halfway point).

## Git workflow

- `main` is **always deployable** (Vercel deploys it).
- Branch per task: `feat/<area>-<thing>` (e.g. `feat/chat-realtime`, `feat/db-olympics-verify`).
- Small PRs, one reviewer, merge fast. **Pull `main` often** (at least every hour).
- Run `npm run lint && npm run build` before opening a PR.
- SQL changes: add a **new** numbered migration (`0004_…sql`) rather than editing an old one
  that teammates already ran.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): data model, points rules, anti-cheat.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md): pitch / demo script (to fill in).
- [`CLAUDE.md`](CLAUDE.md): conventions for AI coding assistants (and humans).
