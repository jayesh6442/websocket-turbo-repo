#!/bin/bash
set -e

# This script must be run from the monorepo root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT_DIR"

echo "📦 Building Docker images from: $ROOT_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/backend" ]; then
    echo "❌ Error: Must run from monorepo root directory"
    echo "   Current directory: $(pwd)"
    echo "   Expected: /home/devjayesh/projects/turbo/collabapp"
    exit 1
fi

# Default values
REGISTRY=${REGISTRY:-"collabapp"}
VERSION=${VERSION:-"latest"}

echo "Registry: $REGISTRY"
echo "Version: $VERSION"
echo ""

# Build backend
echo "🔨 Building backend..."
docker build -f apps/backend/Dockerfile -t $REGISTRY-backend:$VERSION . || {
    echo "❌ Backend build failed"
    exit 1
}

# Build WebSocket server
echo "🔨 Building WebSocket server..."
docker build -f apps/ws/Dockerfile -t $REGISTRY-ws:$VERSION . || {
    echo "❌ WebSocket server build failed"
    exit 1
}

# Build frontend
echo "🔨 Building frontend..."
docker build -f apps/frontend/Dockerfile -t $REGISTRY-frontend:$VERSION . || {
    echo "❌ Frontend build failed"
    exit 1
}

echo ""
echo "✅ All images built successfully!"
echo ""
echo "Images created:"
echo "  - $REGISTRY-backend:$VERSION"
echo "  - $REGISTRY-ws:$VERSION"
echo "  - $REGISTRY-frontend:$VERSION"
echo ""
echo "To test locally:"
echo "  docker run -p 3000:3000 $REGISTRY-backend:$VERSION"
echo "  docker run -p 8089:8089 $REGISTRY-ws:$VERSION"
echo "  docker run -p 3000:3000 $REGISTRY-frontend:$VERSION"
