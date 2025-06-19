FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/database/package.json ./packages/database/
COPY packages/manim-worker/package.json ./packages/manim-worker/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter database run db:generate

RUN pnpm --filter shared run build

RUN pnpm --filter manim-worker run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9.0.0

RUN apk add --no-cache ffmpeg python3 py3-pip

COPY --from=builder /app/packages/manim-worker/dist ./packages/manim-worker/dist
COPY --from=builder /app/packages/manim-worker/package.json ./packages/manim-worker/
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

CMD ["node", "packages/manim-worker/dist/worker.js"]