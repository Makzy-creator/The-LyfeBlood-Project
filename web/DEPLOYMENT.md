# Vercel deployment

Set the Vercel project **Root Directory** to `web` when deploying this folder from a larger repository. If this folder itself is the repository root, leave Root Directory empty.

## Required environment variables

Set these for Production and Preview, then redeploy without reusing the old deployment:

- `DATABASE_URL`: Supabase PostgreSQL transaction-pooler URI. URL-encode only the password portion.
- `AUTH_SECRET`: a long random value, for example from `openssl rand -base64 32`.
- `AUTH_URL`: the production site URL, such as `https://your-project.vercel.app`.
- `SUPABASE_URL`: `https://<project-ref>.supabase.co`.
- `SUPABASE_ANON_KEY`: Supabase anon/publishable key.
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service-role key. Server-only; never prefix it with `VITE_` or `NEXT_PUBLIC_`.
- `VITE_SUPABASE_URL`: same public Supabase URL, available to browser code at build time.
- `VITE_SUPABASE_ANON_KEY`: same public anon/publishable key, available to browser code at build time.

Optional Create.xyz integration variables may still be needed for integration proxy routes:

- `NEXT_PUBLIC_CREATE_BASE_URL`
- `NEXT_PUBLIC_CREATE_HOST`
- `NEXT_PUBLIC_PROJECT_GROUP_ID`

## Verification

Run from this directory:

```bash
npm ci
DATABASE_URL='postgresql://user:pass@localhost:5432/db' \
AUTH_SECRET='local-test-secret' \
VITE_SUPABASE_URL='https://example.supabase.co' \
VITE_SUPABASE_ANON_KEY='test-key' \
npm run check
```

The smoke test verifies the same `api/index.js` adapter used by Vercel and requires a completed production build.
