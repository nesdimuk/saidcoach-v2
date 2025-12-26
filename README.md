# Corporate Wellness Challenge Platform

Next.js 15 + Supabase implementation of the 90‑day multi‑company wellness challenge. The app router serves the corporate challenge dashboard, leaderboards, authentication and legacy marketing pages; Supabase provides auth, row-level security, SQL functions and storage for nutrition photos.

## Highlights

- **Multi-company onboarding:** `/company/[slug]` pages link new users directly to their employer’s challenge and run `/api/join-company` after login/sign-up.
- **Today-only habits:** server time (default `America/Santiago`) gates movement, nutrition, lesson, meditation and gratitude logs. Users cannot backfill.
- **Automatic streaks:** recalculated after every pointful action; enforcing the “4-of-5 habits per day” rule and zeroing streaks when a day is missed.
- **Leaderboards:** RPC-backed daily/weekly/monthly rankings scoped by company, exposed via `/api/get-leaderboard` and `/ranking`.
- **Nutrition storage:** photos stream straight into the `nutrition_photos` bucket with fine-grained RLS and optional early-bird bonus before 09:00.
- **Minimal UX:** dashboard checklist shows only today’s actions, buttons that immediately perform the action, and badge callouts for bonuses.

## Environment Variables

Create `.env.local` (and replicate in Vercel):

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key, used by browser and server clients. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key for signed storage URLs or server utilities. |
| `CHALLENGE_TIMEZONE` *(optional)* | Override default `America/Santiago` for server “today” calculations. |
| `NUTRITION_BONUS_CUTOFF` *(optional)* | HH:mm cutoff for the +5 nutrition bonus (default `09:00`). |
| `STREAK_TASKS_REQUIRED` *(optional)* | Minimum completed habits needed per day (default `4`). |

## Supabase Setup

1. Create a Supabase project and note the URL + keys.
2. Open **SQL Editor** and run `supabase/schema.sql` from this repo. The script creates:
   - Tables for companies, members, profiles, challenges, daily logs, nutrition logs, movement first completions, and streaks.
   - RLS policies that enforce “today only” writes and company scoping.
   - RPC helpers: `current_local_date`, `claim_first_completion`, `get_*_leaderboard`.
   - Storage bucket `nutrition_photos` with authenticated write/read policies.
3. In Supabase Auth > URL configuration add:
   - Site URL: production domain.
   - Redirects: `<domain>/auth/callback`, `http://localhost:3000`, `http://localhost:3000/auth/callback`.

### Creating Companies & Challenges

```sql
insert into companies (name, slug) values ('Acme Health', 'acme-health');

insert into challenges (
  company_id, name, level, start_date, end_date,
  movement_goal, photos_per_day, lessons_per_day,
  meditation_required, gratitude_required
)
values (
  (select id from companies where slug = 'acme-health'),
  'Q1 Wellness Sprint',
  2,
  '2025-01-06',
  '2025-04-05',
  20,
  1,
  1,
  true,
  true
);
```

Users join via `/company/acme-health`, log in or sign up, and the app automatically links them to the active challenge, creates their profile row, and seeds today’s `daily_log`.

## API Overview

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/join-company` | `POST` | Link authenticated user to a company slug and active challenge. |
| `/api/get-daily-log` | `GET` | Returns today’s `daily_log`, challenge caps, company info, and streaks. |
| `/api/log-movement` | `POST` | Adds reps (capped per challenge) and awards top-3 bonuses via RPC. |
| `/api/log-nutrition` | `POST` | Multipart upload (camera only) to `nutrition_photos`, with early bonus. |
| `/api/log-lesson` | `POST` | Adds +3 per lesson up to the challenge-defined daily limit. |
| `/api/log-meditation` | `POST` | Marks 3-point meditation completion after playback is confirmed. |
| `/api/log-gratitude` | `POST` | Stores daily gratitude text (+2 pts). |
| `/api/log-notes` | `PATCH` | Optional daily notes (no points, today only). |
| `/api/get-leaderboard` | `GET` | Calls Supabase RPC for daily / weekly / monthly rankings. |

All endpoints use the Supabase server client, enforce auth, and rely on the shared timezone helper so that dates never depend on the browser clock.

## App Router Pages

- `/company/[slug]` – company-branded join CTA with login/signup links that carry the slug forward.
- `/login` / `/signup` – minimal email/password forms; when a `company` query param is present the flow auto-calls `/api/join-company`.
- `/dashboard` – daily checklist (movement, nutrition, lesson, meditation, gratitude, notes) plus streak tiles and bonus badges.
- `/profile` – simple profile form (name, body metrics, goals, food preferences).
- `/ranking` – tabs for today/week/month leaderboards scoped to the user’s company.
- Legacy marketing pages (`/`, `/servicios`, `/competencia`, etc.) remain untouched.

## Local Development

```bash
npm install
npm run dev
# visit http://localhost:3000
```

Use Supabase’s auth emulator or real project keys; the Supabase provider syncs browser sessions with `/auth/callback`.

## Deployment

1. Deploy the repo on Vercel (Next.js App Router + Edge runtime ready).
2. Set the environment variables listed above in Vercel.
3. Run the SQL script on the production Supabase project and confirm the `nutrition_photos` bucket exists.
4. Point your company partners to `/company/<slug>` links so that every employee joins with the correct scope.

## Daily Ops Checklist

- Monitor `daily_log` and `first_completions` tables for anomalies.
- Use the SQL RPCs to power email summaries or scheduled reports.
- Adjust challenge caps (`movement_goal`, `lessons_per_day`, etc.) per company without redeploying the app.

With these pieces in place the corporate wellness challenge is ready for production: one click per habit, unambiguous rules, and auditable Supabase data.
