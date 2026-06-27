FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/types/package.json ./packages/types/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS builder
COPY apps/worker ./apps/worker
COPY packages/database ./packages/database
COPY packages/types ./packages/types
RUN pnpm --filter=@ensocial/database db:generate
RUN pnpm --filter=@ensocial/worker build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages ./packages
CMD ["node", "apps/worker/dist/main.js"]
