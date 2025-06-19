FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9.0.0

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/http/package.json ./apps/http/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter database run db:generate

RUN pnpm --filter shared run build

RUN pnpm --filter http run build

FROM node:18-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9.0.0

# Copy built application
COPY --from=builder /app/apps/http/dist ./apps/http/dist
COPY --from=builder /app/apps/http/package.json ./apps/http/
COPY --from=builder /app/packages/database ./packages/database
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3001
CMD ["node", "apps/http/dist/index.js"]