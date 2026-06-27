# EnSocial

EnSocial is a modern, AI-first social media management platform built as a TypeScript monorepo.

This package has been cleaned up from the legacy Socioboard deployment and is now prepared for Coolify using a modern stack:

- **Web:** SvelteKit + Tailwind CSS
- **API:** NestJS + Fastify
- **Database:** PostgreSQL + Prisma
- **Jobs:** Redis + BullMQ worker
- **Deployment:** Docker Compose / Coolify

## Quick start locally

```bash
cp .env.example .env
pnpm install
pnpm --filter=@ensocial/database db:generate
pnpm dev
```

Or run the full stack with Docker:

```bash
docker compose up --build
```

Open:

- Web: http://localhost:5173
- API health: http://localhost:3000/api/v1/health

## Coolify deployment

1. Push this repository to GitHub.
2. In Coolify, create a **Docker Compose** resource.
3. Set the compose file path to:

```text
/docker-compose.yaml
```

4. Add environment variables from `.env.example`.
5. Set your app domain to the `web` service on port `5173`.
6. Optional: set an API subdomain to the `api` service on port `3000`.

## Important environment variables

```env
APP_URL=https://ensocial.example.com
API_URL=https://api.ensocial.example.com
PUBLIC_API_URL=https://api.ensocial.example.com/api/v1
AUTH_SECRET=replace_with_a_64_character_random_secret
JWT_REFRESH_SECRET=replace_with_another_64_character_random_secret
POSTGRES_PASSWORD=replace_with_a_secure_database_password
REDIS_PASSWORD=replace_with_a_secure_redis_password
```

Social API credentials are intentionally optional. Users can connect accounts later once provider apps are configured.

## Architecture

```text
apps/
  web/       SvelteKit UI
  api/       NestJS API
  worker/    BullMQ background jobs
packages/
  database/  Prisma schema/client
  types/     Shared TypeScript contracts
  sdk/       Frontend API client
  auth/      Shared role/permission helpers
```

## Notes

This cleaned version removes the legacy Socioboard Docker deployment, MySQL/Mongo services, AMD64-only images, and deprecated deployment scripts. The project now targets ARM64 and AMD64 servers through native Docker builds.
