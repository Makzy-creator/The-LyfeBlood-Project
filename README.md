# LyfeBlood

LyfeBlood is a mobile-first blood donation coordination platform for patients, hospital staff, and donors in Imo State, Nigeria. It helps hospitals and patient families publish blood requests, matches compatible and available donors, and follows a donation from notification through hospital check-in and completion.

> LyfeBlood coordinates donor–hospital connections. Clinical screening, compatibility testing, and transfusion decisions remain the responsibility of licensed medical professionals.

## Features

- Role-based experiences for donors, patients/families, hospital staff, and administrators
- Standard, urgent, and SOS blood requests with support for multiple acceptable blood types
- Compatibility-aware donor matching and donor cooldown enforcement
- Donor match acceptance and rejection flows
- In-app notifications, request status updates, and donation history
- Secure, expiring OTP verification at hospital check-in
- Donor journey tracking and participant chat after a match is accepted
- Hospital-side donation status management
- Supabase Auth, PostgreSQL persistence, and Row Level Security policies
- Responsive UI optimized for mobile devices

## Technology

- [Next.js 16](https://nextjs.org/) App Router
- React 19 and TypeScript
- Supabase Auth and PostgreSQL
- TanStack Query
- Chakra UI, Tailwind CSS, and Lucide icons
- Vitest and Testing Library

## How the application works

1. A donor, patient/family member, or hospital representative registers and signs in.
2. An authorized requester creates a blood request with its blood type, units, hospital, location, and urgency.
3. The matching engine finds compatible, available donors and creates notifications.
4. A donor accepts a match and can communicate with the requester, share journey updates, and travel to the hospital.
5. Hospital staff verify the donor's one-time code and advance the request through collection and completion.

The canonical request lifecycle is:

```text
pending → verified → donor_matched → checked_in → blood_collected → fulfilled
                                                               ↘ cancelled
```

## Prerequisites

- Node.js 22
- npm
- A Supabase project with Auth enabled
- A Supabase database containing the LyfeBlood core tables (`users`, `blood_requests`, `matches`, and `verification_tokens`)

The SQL files in `src/supabase/migrations` are incremental migrations for the current Supabase schema. Apply them in filename order to the target project. They add the matching engine, notifications, chat, location tracking, rewards, authentication triggers, role-change requests, RLS policies, and multi-blood-type request support.

## Local setup

1. Clone the repository and enter its directory.

   ```bash
   git clone <repository-url>
   cd The-LyfeBlood-Project
   ```

2. Install dependencies.

   ```bash
   npm ci
   ```

3. Create the local environment file.

   ```bash
   cp .env.example .env.local
   ```

   On PowerShell:

   ```powershell
   Copy-Item .env.example .env.local
   ```

4. Add your Supabase credentials and secrets to `.env.local`.

5. Apply the migrations in `src/supabase/migrations` to your Supabase database in chronological filename order.

6. Start the development server.

   ```bash
   npm run dev
   ```

Open [http://localhost:4000](http://localhost:4000).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Server-side Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Server-side anonymous key and authentication client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes for privileged operations | Server-only administrative access; never expose this value to the browser |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Browser-side Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-safe anonymous key |
| `AUTH_SECRET` | Yes | Signs application tokens; also serves as the default OTP secret |
| `OTP_SECRET` | No | Separate secret for OTP hashing when supplied |
| `OTP_TTL_MINUTES` | No | Overrides the OTP validity period |
| `NEXT_PUBLIC_WORKER_URL` | No | Uses an external Cloudflare Worker API instead of the local `/api` routes |
| `DATABASE_URL` | No in the current Next.js data path | Retained in `.env.example` for legacy/alternative database integration |

Generate `AUTH_SECRET` and `OTP_SECRET` as long, random values. Keep all variables without the `NEXT_PUBLIC_` prefix on the server only.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the Next.js development server on port 4000 |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Check TypeScript without emitting files |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run check` | Run type checking followed by a production build |
| `npm run format` | Format the repository with Prettier |
| `npm run format:check` | Check formatting without changing files |

## Routes

### Application pages

| Route | Purpose |
| --- | --- |
| `/` | Public landing page and active-request overview |
| `/login` | Sign in |
| `/register` | Role-aware account registration |
| `/dashboard` | Patient/family dashboard |
| `/hospital/dashboard` | Hospital request and donation management |
| `/donor/home` | Donor dashboard and match alerts |
| `/requests/[requestId]` | Blood request details |
| `/requests/history` | Request history |
| `/donor/match/[matchId]` | Donor match response and details |
| `/donor/match/[matchId]/checkin` | Hospital OTP check-in |
| `/matches/[matchId]/chat` | Match participant chat |
| `/matches/[matchId]/tracking` | Donor journey tracking |
| `/donations/history` | Completed donation history |
| `/profile` | User profile and preferences |

### API groups

The Next.js route handlers under `src/app/api` provide:

- `/api/auth/*` — registration, login, logout, and session restoration
- `/api/profile` — read and update the authenticated profile
- `/api/requests/*` — create, list, inspect, update, and delete blood requests
- `/api/matches/*` — list, send, respond to, chat within, track, and update matches
- `/api/notifications` — list and update notification read state
- `/api/tokens/verify` — hospital-side OTP verification

Protected endpoints validate Supabase bearer tokens and authorize canonical roles on the server.

## Project structure

```text
src/
├── app/                    # Next.js pages, layouts, and API route handlers
│   └── api/                # Server endpoints
├── components/ui/          # Reusable application UI
├── context/AppContext.jsx  # Client auth and domain state orchestration
├── lib/                    # Supabase, auth, matching, OTP, and notifications
├── supabase/migrations/    # Ordered PostgreSQL/Supabase migrations
├── utils/                  # API client, hooks, and blood-type helpers
├── worker/                 # Legacy/optional Cloudflare Worker artifacts
└── proxy.ts                # Supabase session-cookie refresh proxy
```

`@/` resolves to `src/`.

## Testing and validation

Run the unit and component tests:

```bash
npm test
```

Before submitting changes, run:

```bash
npm run lint
npm run check
npm run format:check
```

Tests use Vitest with jsdom and Testing Library. Test files live beside the code they cover and follow `*.test.*` or `*.spec.*` naming.

## Security notes

- Do not commit `.env.local` or real credentials.
- Never prefix the Supabase service-role key with `NEXT_PUBLIC_`.
- API handlers enforce authentication and role authorization independently of the UI.
- Database migrations enable RLS on sensitive tables and define participant-scoped policies.
- OTP values are hashed, expire, and are verified by authorized hospital staff.
- Add new database changes as a new timestamped migration instead of rewriting applied migrations.

## Deployment

The app can be deployed to any platform that supports Next.js 16 and Node.js 22, including Vercel. Configure the same environment variables used locally, apply all Supabase migrations before release, then use:

```bash
npm run build
npm start
```

