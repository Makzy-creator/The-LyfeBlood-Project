# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

LyfeBlood — a blood-donation matching app. A single React Router 7 (SSR) application deployed to Vercel, backed by Supabase (Postgres). The app lives at the repository root; there is no monorepo nesting.

## Commands

```bash
npm run dev         # Vite dev server on http://localhost:4000
npm run typecheck   # react-router typegen + tsc --noEmit
npm run build       # react-router build (required before smoke)
npm run smoke       # boots api/index.js (the Vercel adapter) and asserts GET / renders HTML
npm run check       # typecheck + build + smoke — the full pre-deploy gate
npx vitest          # run the test suite (vitest, jsdom)
npx vitest run src/app/api/auth/session.test.js   # run a single test file
npx vitest -t "Remember Me"                        # run tests matching a name
```

`npm run check` requires the env vars from `.env.example` (at minimum `DATABASE_URL`, `AUTH_SECRET`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). See `DEPLOYMENT.md` for the exact one-liner and the full Vercel variable list.

## Architecture

### Backend of record: Supabase (Postgres)
Despite `DATABASE_URL`/Neon references in some comments, the live data layer is **Supabase**. Server code creates clients via `src/app/api/utils/supabase.js`:
- `createSupabaseServerClient()` — service-role (or anon) key, server-only, bypasses RLS.
- `createSupabaseAuthClient()` — anon key, used for `signInWithPassword` / session refresh.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser (no `VITE_`/`NEXT_PUBLIC_` prefix).

The browser talks to Supabase directly through `src/lib/supabase-client.js`, and `src/utils/api.js` is the unified client that most components call.

Database schema lives in **`src/supabase/migrations/*.sql`** (timestamped). Add a new migration file rather than editing existing ones.

### File-based routing
Routes are generated at build time by `src/app/routes.ts`, which walks `src/app/` looking for `page.jsx` files. Conventions:
- `page.jsx` → a route; directory path becomes the URL.
- `[param]` directory → `:param`; `[...param]` → catch-all `*`.
- `route.js` files under `src/app/api/**` export HTTP-method handlers (`GET`, `POST`, …) that take/return standard `Request`/`Response`. These are the server API endpoints (auth, requests, matches, profile, notifications, tokens).
- `src/app/root.tsx` is the SSR document + error boundary; `layout.jsx` files wrap route subtrees.

### Auth
Two layers:
- **Server sessions** (`src/app/api/utils/auth.js`): PBKDF2 password hashing + HMAC-signed tokens, `requireAuth()` / `getCanonicalRole()`. Roles are normalized through `ROLE_ALIASES` (e.g. `requester`/`patient_family` → `patient`, `hospital` → `hospital_staff`). Supabase Auth is the credential store; login/session/logout live under `src/app/api/auth/`.
- **Client auth** (`src/utils/useAuth.js` via `@hono/auth-js`): credential + social sign-in. Social providers fall back to a dev shim (`/__create/social-dev-shim`) when running inside a dev iframe.

### Domain model
Blood-donation matching. Core concepts: blood **requests** (with `urgency_tier` SOS/Urgent/Normal, sorted SOS-first), donor–request **matches**, OTP **tokens** for check-in verification, and **notifications**. Blood-type compatibility tables live in both `src/utils/bloodTypes.js` (client) and inside `src/app/api/requests/route.js` (`REQUEST_TYPES_BY_DONOR`). Request status has a canonical lowercase set (`pending`, `verified`, `donor_matched`, `checked_in`, `blood_collected`, `fulfilled`, `cancelled`) with `STATUS_ALIASES` mapping older title-case values.

### The `__create` scaffolding
`src/__create/` and `src/app/__create/` plus the Vite plugins in `plugins/` come from the Create.xyz platform this app was bootstrapped on. They handle design-mode, render-ID injection, console piping to a parent frame, font loading from Tailwind, and a Stripe shim. Treat this as generated infrastructure — prefer working in `src/app`, `src/utils`, `src/lib`, `src/components`, and `src/hooks`/`context` rather than modifying `__create`.

### Path alias
`@/` resolves to `src/` (configured in `tsconfig.json`, `vite.config.ts`, and `vitest.config.ts`). Import shared code as e.g. `@/app/api/utils/supabase`.

## Deployment
Vercel, with **Root Directory left empty** (the app is the repo root). `vercel.json` rewrites everything to `api/index.js` (the React Router Vercel adapter) except `/assets/*`; build output is `build/client`. The `smoke` test exercises this exact adapter, so run `npm run check` before deploying.
