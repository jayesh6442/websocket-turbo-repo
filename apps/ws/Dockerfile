FROM oven/bun:1.2.3-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
# Copy root package files
COPY package.json bun.lock* ./
# Copy workspace package files
COPY apps/ws/package.json ./apps/ws/
COPY packages/db/package.json ./packages/db/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/db/prisma ./packages/db/prisma/
# Install all dependencies
# Note: Use 'bun install --frozen-lockfile' for production after lockfile is synced
RUN bun install
RUN bunx prisma generate --schema=packages/db/prisma/schema.prisma

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
# Copy root package.json for production stage
COPY package.json ./
COPY apps/ws ./apps/ws
COPY packages ./packages
COPY turbo.json ./
# Build the ws server (optional - Bun can run TS directly, but build for optimization)
WORKDIR /app/apps/ws
RUN bun run build || true

# Production
FROM base AS production
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source code (Bun can run TypeScript directly)
COPY --from=build /app/apps/ws ./apps/ws
# Copy packages
COPY --from=build /app/packages ./packages
COPY --from=build /app/package.json ./

WORKDIR /app/apps/ws
EXPOSE 8089

CMD ["bun", "run", "src/index.ts"]
