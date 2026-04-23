# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Vue 3 + Vite frontend, Express backend, Postgres. Deployed on **Beachhead**
(see `BEACHHEAD` for the platform's constraints — they shape `docker-compose.yml`,
`frontend/nginx.conf`, and `beachhead.json`). Inside Beachhead, postgres runs as a
`stateful_service` so it survives blue/green swaps while frontend/backend are swapped.

## Commands

```
docker compose up --build                      # full stack (see override.yml.example)
cd backend && npm install && npm run dev       # backend hot reload, requires DATABASE_URL + JWT_SECRET
cd frontend && npm install && npm run dev      # Vite dev server, proxies /api to :3001
```

There is no test suite, linter, or build step beyond `vite build` (invoked in the frontend Dockerfile).

## Architecture

**Auth model — first user becomes admin, no seed env var.**
`GET /api/auth/status` returns `registrationOpen: true` iff the `users` table is empty.
`POST /api/auth/register` succeeds only when the table is empty and forces `is_admin = true`.
After that, admins create users via `POST /api/users`. This replaces the more common
"bootstrap admin from env var" pattern — do not reintroduce an env-var admin.

**Public vs. authed item listing — same route, different fields.**
`GET /api/items` uses `optionalAuth`. Unauthenticated callers get a PII-free projection
(`id, description, list_price, sold`); authed callers get all item fields plus the joined
consignor (name, address, phone, email). The public search filters on description only;
the authed search also matches on consignor name. Edit `backend/src/routes/items.js` as
a single query-shape decision, not two routes.

**Migrations run on backend startup.**
`backend/src/db.js#migrate` issues `CREATE TABLE IF NOT EXISTS` for `users`, `consignors`,
`items` every time the process boots. There is no separate migrations tool. For schema
changes: edit `migrate()` so it is still idempotent, or add a new idempotent block — the
function may run concurrently on two backends during a blue/green swap.

**Frontend auth state.**
Pinia store `useAuth` persists `{token, user}` in `localStorage`. `src/api.js` attaches
the bearer token and logs the user out on any 401 response. The Home view reads
`auth.isLoggedIn` to toggle between the public and authed table shapes — keep the
two column sets aligned with the two backend projections.

## Beachhead-specific invariants (do not break)

These are enforced by Beachhead at deploy time; the current files already comply. If you
edit them, preserve:

- `docker-compose.yml`: no `version:` key; `expose:` only (never `ports:`); no `container_name`
  on any service; every service on the `internal` network; postgres healthcheck with
  `start_period: 30s`; named volume `consignment-postgres`.
- `frontend/nginx.conf`: uses `resolver 127.0.0.11 valid=30s ipv6=off` and variable-based
  `proxy_pass $backend_upstream` so the backend hostname resolves at request time
  (not config load time). A bare `proxy_pass http://backend:3001` will crash nginx on
  cold start if backend isn't up yet.
- Dockerfiles use `npm install`, not `npm ci` (Beachhead requirement).
- `DB_PASSWORD` and `JWT_SECRET` come from Beachhead's global env vars → `.env` → Compose
  substitution. Don't hardcode them.
