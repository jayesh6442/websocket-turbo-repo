FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
# Copy root package files
COPY package.json package-lock.json* ./
# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/
# Install dependencies
RUN cd apps/frontend && npm ci

# Build
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY apps/frontend ./apps/frontend
COPY packages ./packages
COPY turbo.json ./
ENV NEXT_TELEMETRY_DISABLED 1
# Build Next.js app
WORKDIR /app/apps/frontend
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy standalone build
# Next.js standalone output structure:
# - server.js at root of standalone
# - .next/static/ in standalone
# - node_modules/ in standalone (only production deps, but may not include 'next' and its deps)
# - apps/frontend/ directory structure
COPY --from=build /app/apps/frontend/.next/standalone ./
# Copy static files to the correct location (standalone includes .next but not static)
COPY --from=build /app/apps/frontend/.next/static ./apps/frontend/.next/static
# Copy public files
COPY --from=build /app/apps/frontend/public ./apps/frontend/public

# Next.js standalone doesn't include 'next' and its dependencies properly
# Copy all production node_modules from build stage to ensure all dependencies are available
# This merges with the standalone node_modules
COPY --from=build /app/node_modules ./node_modules

WORKDIR /app
EXPOSE 3000

# Next.js standalone puts server.js at the root of standalone directory
CMD ["node", "server.js"]
