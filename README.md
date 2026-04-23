# Consignment Tracker

Track items consigned at a trade show for sale. Vue frontend, Express/Postgres backend.

- Public home page lists items with search (no PII shown).
- Logged-in users can add/edit items and consignors.
- The **first registered user** becomes the admin.
- Admins manage authorized user logins; any user can change their own password.

## Local development

```
cp .env.example .env
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose up --build
```

Frontend at http://localhost:8080 (override exposes it).

## Deploying on Beachhead

Set `DB_PASSWORD` and `JWT_SECRET` as **global** env vars in the Beachhead dashboard
(no Target Service) so they land in `.env` for Compose substitution.

Postgres is declared as a stateful service in `beachhead.json` — the DB container
persists across blue/green swaps while `frontend`/`backend` are swapped normally.
