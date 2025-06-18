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

# Generate Prisma Client
RUN pnpm --filter database exec prisma generate

# Build the specific application and its dependencies
RUN pnpm turbo run build --filter=manim-worker...

# Prune the monorepo to only include what's needed for the 'manim-worker' app
RUN pnpm turbo prune --scope=manim-worker --docker

# 2. Runner Stage: Create the final, small image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy the pruned files from the builder stage
COPY --from=builder /app/out/json .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/full .

# Install production dependencies
RUN npm install -g pnpm && pnpm install --prod --frozen-lockfile

# Set the command to run the application
CMD ["node", "apps/manim-worker/dist/worker.js"]