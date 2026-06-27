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

RUN pnpm install --frozen-lockfile

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

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

COPY --from=builder /app/packages ./packages

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "apps/api/dist/main.js"]