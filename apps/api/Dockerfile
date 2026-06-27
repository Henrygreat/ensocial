FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

WORKDIR /app

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json ./

COPY apps/api/package.json ./apps/api/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/types/package.json ./packages/types/package.json

RUN pnpm install --no-frozen-lockfile

FROM deps AS builder

COPY apps/api ./apps/api
COPY packages/auth ./packages/auth
COPY packages/database ./packages/database
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types

RUN pnpm --filter=@ensocial/database db:generate
RUN pnpm --filter=@ensocial/api build

FROM node:22-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Workspace config
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Package manifests (workspace resolution + prod dep install)
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages/auth/package.json ./packages/auth/package.json
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/sdk/package.json ./packages/sdk/package.json
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

# Install prod dependencies — now includes prisma CLI (database dep) and
# @prisma/client (api dep), giving Node the correct resolution symlinks
RUN pnpm install --prod --no-frozen-lockfile

# Compiled API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Prisma schema — needed by `prisma db push` at startup
COPY --from=builder /app/packages/database/prisma ./packages/database/prisma

# Pre-generated Prisma client into the path the compiled code resolves to:
# apps/api/dist/packages/database/src/index.js → require('../generated/client')
COPY --from=builder /app/packages/database/generated/client ./apps/api/dist/packages/database/generated/client

EXPOSE 3000

CMD ["sh", "-c", "pnpm --filter=@ensocial/database db:push && node apps/api/dist/apps/api/src/main.js"]