# CLAUDE.md

This file provides development guidance for AI coding agents working in this repository.

## Project overview

LyfeBlood is a mobile-first blood donation coordination platform for Imo State, Nigeria. It connects donors with blood requests created by patients, families, and hospital staff, then tracks the match through acceptance, hospital arrival, collection, and completion.

The application is a Next.js 16 App Router project at the repository root. It uses React 19, TypeScript, and Supabase for authentication and PostgreSQL persistence.

## Commands

```bash
npm run dev          # Next.js development server at http://localhost:4000
npm run typecheck    # TypeScript validation without emitting files
npm run build        # Production Next.js build
npm run check        # Typecheck followed by a production build
npm run lint         # ESLint
npm test             # Run the Vitest suite once
npm run format       # Format the repository with Prettier
npm run format:check # Check formatting without changing files
npm start            # Serve an existing production build
```

Run a focused test with:

```bash
npx vitest run src/app/api/auth/session.test.js
npx vitest -t "test name"
```

Node.js 22 is required by `package.json`.

## Environment

Copy `.env.example` to `.env.local`. The active Next.js/Supabase path uses:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
AUTH_SECRET
```

Optional variables are `OTP_SECRET`, `OTP_TTL_MINUTES`, and `NEXT_PUBLIC_WORKER_URL`.

`DATABASE_URL` remains in `.env.example` for a legacy or alternative integration but is not used by the current Next.js data path. `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are compatibility fallbacks in `src/lib/supabase-client.ts`; new configuration should use the `NEXT_PUBLIC_` names.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `AUTH_SECRET`, or `OTP_SECRET` through a `NEXT_PUBLIC_` variable.

## Architecture

### Next.js App Router

- Pages and layouts live under `src/app`.
- Dynamic segments use directories such as `[requestId]` and `[matchId]`.
- API endpoints are Next.js route handlers in `src/app/api/**/route.ts`.
- Route handlers export standard `GET`, `POST`, `PATCH`, or `DELETE` functions and return `Response`/`NextResponse` values.
- `src/proxy.ts` refreshes Supabase sessions and propagates auth cookies.
- `src/app/layout.tsx` installs the TanStack Query provider, application context, toast UI, and the responsive application frame.

Do not add React Router, Vite routing, `routes.ts`, or a custom Vercel adapter. Those belonged to an earlier version of the application.

### Supabase

Supabase is the backend of record.

- `src/lib/supabase-client.ts` creates the browser client.
- `src/lib/supabase-server.ts` creates server, auth, and admin clients.
- `createSupabaseServerClient()` prefers the service-role key and is used for trusted server operations.
- `createSupabaseAuthClient()` uses the anonymous key for Supabase Auth operations.
- `createSupabaseAdminClient()` requires the service-role key.
- Database changes live in `src/supabase/migrations/*.sql`.

Migrations are incremental. Add a new timestamped migration rather than editing an already applied migration. Preserve Row Level Security and participant-scoped access when adding tables, policies, or RPCs.

The `src/worker` directory contains legacy/optional Cloudflare Worker artifacts. Its D1 schema is SQLite-specific and is not the schema source for the current Supabase application.

### Authentication and authorization

Supabase Auth is the credential and access-token provider. The main endpoints are under `src/app/api/auth`.

`src/lib/auth-server.ts` provides:

- `requireAuth()` for bearer-token authentication
- `getCanonicalRole()` and `hasRole()` for role authorization
- legacy HMAC session-token and PBKDF2 password helpers retained for compatibility

Canonical roles are:

```text
donor
patient
hospital_staff
admin
```

Legacy/UI aliases are normalized, including `requester` and `patient_family` to `patient`, and `hospital`, `hospital_officer` to `hospital_staff`.

Do not rely only on client-side role checks. Every protected server operation must authenticate and authorize independently.

### Client state and data access

`src/context/AppContext.jsx` coordinates the signed-in user, blood requests, notifications, and UI state. Most client-side API calls go through `src/utils/api.js`.

The browser Supabase session is the source of the bearer token. Session-scoped application state is stored in `sessionStorage`; durable preferences may use `localStorage`.

TanStack Query is configured in the root layout with a five-minute stale time, one retry, and no refetch on window focus.

### Domain model

Core entities are:

- `users` — donors, patients, hospital staff, and administrators
- `blood_requests` — requested blood types, urgency, location, units, and state
- `matches` — donor-to-request candidates and responses
- `verification_tokens` — expiring, hashed OTPs for hospital check-in
- `notifications` — user alerts and read state
- `chat_messages` — communication between accepted-match participants
- `donor_locations` — journey tracking for accepted donors
- `role_change_requests` — controlled requests for elevated roles

Canonical request statuses are:

```text
pending
verified
donor_matched
checked_in
blood_collected
fulfilled
cancelled
```

Urgency is ordered `SOS`, `Urgent`, then `Standard`.

Blood-type parsing and validation utilities live in `src/utils/bloodTypes.js`. The database matching rules and RPCs live in the Supabase migrations. Keep client display logic and server/database compatibility behavior consistent when changing blood-type handling.

`src/lib/matching.ts` invokes the `create_matches_for_request` PostgreSQL RPC and creates notifications for donors and request recipients.

## Main routes

```text
/                              Public landing page
/login                         Sign in
/register                      Account registration
/dashboard                     Patient/family dashboard
/hospital/dashboard            Hospital dashboard
/donor/home                    Donor dashboard
/requests/[requestId]          Request details
/requests/history              Request history
/donor/match/[matchId]         Donor match response
/donor/match/[matchId]/checkin OTP check-in
/matches/[matchId]/chat        Participant chat
/matches/[matchId]/tracking    Donor journey tracking
/donations/history             Donation history
/profile                       User profile
```

API groups under `src/app/api` cover auth, profiles, requests, matches, notifications, tracking, chat, hospital status, and token verification.

## Repository layout

```text
src/
├── app/                    # App Router pages, layouts, and route handlers
│   └── api/                # Server API endpoints
├── components/ui/          # Shared application UI components
├── context/AppContext.jsx  # Client auth and domain state
├── lib/                    # Auth, Supabase, OTP, matching, notifications
├── supabase/migrations/    # Ordered PostgreSQL/Supabase migrations
├── utils/                  # API client, hooks, and domain utilities
├── worker/                 # Legacy/optional Cloudflare Worker artifacts
└── proxy.ts                # Supabase session refresh proxy
```

The `@/` alias resolves to `src/`.

`src/__create` and `src/client-integrations` contain Create.xyz-generated compatibility code. Prefer editing `src/app`, `src/components`, `src/context`, `src/lib`, and `src/utils` unless the task specifically concerns generated integration behavior.

## UI conventions

- The interface is mobile-first, with a centered frame that expands on larger screens.
- Reuse components in `src/components/ui` before creating route-local duplicates.
- Preserve the existing LyfeBlood palette and responsive behavior unless a redesign is requested.
- Client components must include `'use client'` when they use hooks, browser APIs, or client-only providers.
- Keep accessibility in mind for form labels, keyboard interaction, status messaging, and color contrast.

## Testing and validation

Vitest runs in jsdom with Testing Library setup from `test/setupTests.ts`. Tests are colocated with source files and match `*.test.*` or `*.spec.*`.

Use the narrowest relevant validation while developing, then run the broader checks before handoff:

```bash
npm test
npm run lint
npm run check
npm run format:check
```

For changes involving Next.js runtime behavior, also verify the affected flow in a running `npm run dev` instance. A passing typecheck does not validate client navigation, cookies, Supabase session restoration, or route-handler behavior.

## Security and data rules

- Do not commit `.env.local`, tokens, keys, OTPs, or user data.
- Keep service-role operations server-only and narrowly scoped.
- Validate request bodies at the API boundary.
- Authenticate and authorize before reading or mutating protected records.
- Preserve RLS policies and use database RPCs for multi-record state transitions that must be atomic.
- Do not log secrets, bearer tokens, or sensitive patient information.
- Treat OTP verification, match acceptance, request fulfillment, rewards, and cooldown updates as security-sensitive state transitions.
- Retain the product disclaimer: LyfeBlood coordinates connections; licensed medical professionals make clinical decisions.

## Documentation consistency

`README.md` is the developer-facing setup and project overview. When commands, required environment variables, major routes, or architecture change, update both `README.md` and this file in the same change.
