FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml turbo.json tsconfig.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN pnpm install --no-frozen-lockfile

FROM deps AS builder
COPY apps/web ./apps/web
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
COPY packages/ui ./packages/ui
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
RUN pnpm --filter=@ensocial/web build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5173
COPY --from=builder /app/apps/web/build ./build
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -qO- http://localhost:5173 || exit 1
CMD ["node", "build"]
