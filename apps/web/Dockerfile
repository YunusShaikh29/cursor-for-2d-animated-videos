# apps/web/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter database exec prisma generate

RUN pnpm turbo run build --filter=database

RUN pnpm turbo run build --filter=web...

RUN pnpm turbo prune --scope=web --docker

FROM node:18-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full .

RUN pnpm install --prod --frozen-lockfile

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["pnpm", "--filter=web", "start"]