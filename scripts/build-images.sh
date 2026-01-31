#!/bin/bash
set -e

# Default values
REGISTRY=${REGISTRY:-"your-registry.io"}
VERSION=${VERSION:-"latest"}

echo "Building Docker images from monorepo root..."
echo "Registry: $REGISTRY"
echo "Version: $VERSION"

# Build backend
echo "Building backend..."
docker build -f apps/backend/Dockerfile -t $REGISTRY/collabapp-backend:$VERSION .

# Build WebSocket server
echo "Building WebSocket server..."
docker build -f apps/ws/Dockerfile -t $REGISTRY/collabapp-ws:$VERSION .

# Build frontend
echo "Building frontend..."
docker build -f apps/frontend/Dockerfile -t $REGISTRY/collabapp-frontend:$VERSION .

echo "✅ All images built successfully!"
echo ""
echo "Images:"
echo "  - $REGISTRY/collabapp-backend:$VERSION"
echo "  - $REGISTRY/collabapp-ws:$VERSION"
echo "  - $REGISTRY/collabapp-frontend:$VERSION"
echo ""
echo "To push images, run:"
echo "  docker push $REGISTRY/collabapp-backend:$VERSION"
echo "  docker push $REGISTRY/collabapp-ws:$VERSION"
echo "  docker push $REGISTRY/collabapp-frontend:$VERSION"
