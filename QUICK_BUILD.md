# Quick Docker Build Guide

## ⚠️ IMPORTANT: Always build from the ROOT directory!

The Dockerfiles are designed to be built from the monorepo root, not from within app directories.

## Quick Build Commands

### Option 1: Use the build script (Recommended)
```bash
# From monorepo root
./scripts/docker-build.sh
```

### Option 2: Manual build from root
```bash
# Make sure you're in the root directory
cd /home/devjayesh/projects/turbo/collabapp

# Build backend
docker build -f apps/backend/Dockerfile -t collabapp-backend:latest .

# Build WebSocket server
docker build -f apps/ws/Dockerfile -t collabapp-ws:latest .

# Build frontend
docker build -f apps/frontend/Dockerfile -t collabapp-frontend:latest .
```

## Common Errors

### Error: "file not found in build context"
**Cause**: Building from wrong directory (e.g., from `apps/backend/`)

**Fix**: 
```bash
# ❌ WRONG - Don't do this:
cd apps/backend
docker build -t backend .

# ✅ CORRECT - Do this:
cd /home/devjayesh/projects/turbo/collabapp  # Go to root
docker build -f apps/backend/Dockerfile -t backend .
```

### Error: "bun.lock not found"
**Fix**: Run `bun install` at the root to generate the lockfile

## Verify You're in the Right Directory

You should see these files/directories:
- `package.json` (root)
- `apps/backend/`
- `apps/ws/`
- `apps/frontend/`
- `packages/`
