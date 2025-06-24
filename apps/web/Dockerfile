# apps/web/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9.0.0 turbo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm turbo run build --filter=web...

RUN pnpm turbo prune --scope=web --docker

FROM node:18-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nextjs:nodejs /app/out/full .

RUN npm install -g pnpm@9.0.0 && pnpm install --prod --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "--filter=web", "start"]