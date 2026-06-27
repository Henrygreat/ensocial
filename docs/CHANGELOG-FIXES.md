# Fix report

This archive was cleaned and prepared as a modern Coolify-ready EnSocial project.

## Removed

- Legacy Socioboard PHP/Node microservice deployment files.
- MySQL and MongoDB compose services.
- AMD64-only prebuilt Docker image usage.
- Old Docker scripts and nginx/php container build paths that caused missing-context errors.
- Embedded `.git` history from the uploaded zip.

## Added / Updated

- Root `docker-compose.yaml` for Coolify.
- PostgreSQL, Redis, API, Worker and Web services.
- ARM64-friendly native Docker builds using Node 22 Alpine.
- SvelteKit landing page with modern SaaS positioning.
- Production `.env.example` with only current EnSocial variables.
- Coolify deployment checklist in `docs/COOLIFY.md`.
- Dockerfiles adjusted to work without a committed `pnpm-lock.yaml`.
- API response interceptor fixed to avoid double-wrapping `{ data }` responses.
- Google OAuth strategy made optional so the API can boot without OAuth credentials.

## Coolify

Use `/docker-compose.yaml` as the compose file path.

Recommended first deploy:

1. Add variables from `.env.example` in Coolify.
2. Point the web domain to service `web`, port `5173`.
3. Optional: point an API subdomain to service `api`, port `3000`.
4. Deploy.
