# packages/manim-worker/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter database exec prisma generate

RUN pnpm turbo run build --filter=manim-worker...

RUN pnpm turbo prune --scope=manim-worker --docker

FROM node:18-alpine AS runner
WORKDIR /app

RUN apk add --no-cache docker-cli

COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full .

RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

CMD ["node", "packages/manim-worker/dist/worker.js"]