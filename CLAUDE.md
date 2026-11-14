# CLAUDE.md: JMU LEAP

Gamified FROG Week companion app for JMU freshmen. 24-hour hackathon, 5-person team.
Read `README.md` (setup, ownership) and `docs/ARCHITECTURE.md` (data model, points) first.

## Stack

- React 19 + Vite 8, **JavaScript + JSDoc. No TypeScript**, no `.ts`/`.tsx` files.
- React Router 7 (`createBrowserRouter` in `src/routes.jsx`)
- Tailwind CSS v4: theme tokens in `src/index.css` under `@theme` (`frog-50…900`, `gold-400/500`)
- Supabase JS v2: one client in `src/lib/supabase.js`. Never create another.
- vite-plugin-pwa, qrcode.react (show QR), html5-qrcode (scan QR)
- Deployed on Vercel (`vercel.json` = SPA rewrites)

## Folders

```
src/
  routes.jsx             all routes + role guards
  lib/                   supabase client, auth (AuthProvider/useAuth/RequireRole), points helpers, JSDoc types
  components/            shared UI: AppShell, TopBar, BottomNav, XPBar, StreakCounter, FrogMascot, Button, Card, Sheet
  features/<area>/       one folder per feature; pages start with a TODO list
supabase/migrations/     0001 schema → 0002 RLS → 0003 functions (run in order)
supabase/seed.sql        demo data
```

## Rules

- **JavaScript + JSDoc.** Add a JSDoc comment to every exported function and component (params + return).
  Shared data shapes live in `src/lib/types.js`; reference them with `import('../../lib/types').Profile`.
- **Prefer small, targeted edits.** Don't reformat or restructure files you weren't asked to touch.
  Each feature folder has an owner (README → "Who owns what").
- **Mobile-first Tailwind.** Design for a 390px phone. `AppShell` already centers a phone-width column
  on desktop. Use theme colors (`bg-frog-600`), not raw hex.
- **Points, XP and streaks only change via Postgres functions** (`check_in`, `confirm_attendance`,
  `verify_olympics_result`). Clients have no UPDATE grant on those columns, so never "fix" this by
  writing them from the frontend or by loosening RLS/grants.
- New SQL goes in a **new** migration file (`0004_….sql`), not edits to ones teammates already ran.
- Keep `private.event_phase` (SQL) and `src/features/events/eventPhase.js` in sync.
- Never put secret keys in the frontend. Only `VITE_SUPABASE_URL` + anon key. AI features (FrogAI) go
  through a Supabase Edge Function.
- Before committing: `npm run lint && npm run build`.

## Commands

`npm run dev` · `npm run dev:https` (phone camera on LAN) · `npm run build` · `npm run lint` · `npm run format`
