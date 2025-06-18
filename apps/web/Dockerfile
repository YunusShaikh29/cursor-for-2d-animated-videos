# 1. Builder Stage: Build the monorepo
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm and turbo
RUN npm install -g pnpm turbo

# Copy root manifests and install all dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build the specific application and its dependencies
RUN pnpm turbo run build --filter=web...

# Prune the monorepo to only include what's needed for the 'web' app
RUN pnpm turbo prune --scope=web --docker

# 2. Runner Stage: Create the final, small image
FROM node:18-alpine AS runner
WORKDIR /app

# Set user and permissions for Next.js
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy the pruned files from the builder stage
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nextjs:nodejs /app/out/full .

# Install production dependencies
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Expose the port Next.js runs on
EXPOSE 3000

# Set the command to run the application
CMD ["pnpm", "--filter=web", "start"]