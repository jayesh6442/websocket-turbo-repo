# Docker Build Guide

This guide explains how to build Docker images for the CollabApp monorepo.

## Important: Build from Root Directory

**All Docker builds must be run from the monorepo root directory**, not from within individual app directories.

## Building Images

### Option 1: Using the Build Script (Recommended)

```bash
# From the monorepo root
./scripts/build-images.sh

# Or with custom registry and version
REGISTRY=myregistry.io VERSION=v1.0.0 ./scripts/build-images.sh
```

### Option 2: Manual Build

Build each service from the **root directory**:

```bash
# Backend
docker build -f apps/backend/Dockerfile -t collabapp-backend:latest .

# WebSocket Server
docker build -f apps/ws/Dockerfile -t collabapp-ws:latest .

# Frontend
docker build -f apps/frontend/Dockerfile -t collabapp-frontend:latest .
```

## Testing Images Locally

```bash
# Test backend (requires DATABASE_URL env var)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  collabapp-backend:latest

# Test WebSocket server
docker run -p 8089:8089 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e KAFKA_BROKERS="localhost:9092" \
  -e WS_PORT="8089" \
  -e JWT_SECRET="your-secret" \
  collabapp-ws:latest

# Test frontend
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:3000/api" \
  -e NEXT_PUBLIC_WS_URL="ws://localhost:8089" \
  collabapp-frontend:latest
```

## Pushing to Registry

```bash
# Tag images
docker tag collabapp-backend:latest your-registry.io/collabapp-backend:latest
docker tag collabapp-ws:latest your-registry.io/collabapp-ws:latest
docker tag collabapp-frontend:latest your-registry.io/collabapp-frontend:latest

# Push images
docker push your-registry.io/collabapp-backend:latest
docker push your-registry.io/collabapp-ws:latest
docker push your-registry.io/collabapp-frontend:latest
```

## Troubleshooting

### Error: "file not found in build context"

**Solution**: Make sure you're running `docker build` from the **monorepo root**, not from within `apps/backend`, `apps/ws`, or `apps/frontend`.

### Error: "bun.lock not found"

**Solution**: Run `bun install` at the root to generate `bun.lock`.

### Frontend build fails with "Cannot read properties of null"

This is a Next.js build issue. The standalone output should work, but if it persists, you may need to adjust the Next.js configuration.
