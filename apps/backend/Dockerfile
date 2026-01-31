FROM oven/bun:1.2.3-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
# Copy root package files
COPY package.json bun.lock* ./
# Copy workspace package files
COPY apps/backend/package.json ./apps/backend/
COPY packages/db/package.json ./packages/db/
COPY packages/kafka/package.json ./packages/kafka/
# Install all dependencies
# Note: Use 'bun install --frozen-lockfile' for production after lockfile is synced
RUN bun install

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
# Copy root package.json for production stage
COPY package.json ./
COPY apps/backend ./apps/backend
COPY packages ./packages
COPY turbo.json ./
# Build the backend (optional - Bun can run TS directly, but build for optimization)
WORKDIR /app/apps/backend
RUN bun run build || true

# Production
FROM base AS production
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source code (Bun can run TypeScript directly)
COPY --from=build /app/apps/backend ./apps/backend
# Copy packages
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json ./

WORKDIR /app/apps/backend
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
