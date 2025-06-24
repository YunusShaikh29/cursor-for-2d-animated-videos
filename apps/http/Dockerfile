# apps/http/Dockerfile

FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9.0.0 turbo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter database run db:generate

RUN pnpm turbo run build --filter=http...

RUN pnpm turbo prune --scope=http --docker

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full .

RUN npm install -g pnpm@9.0.0 && pnpm install --prod --frozen-lockfile

CMD ["node", "apps/http/dist/index.js"]