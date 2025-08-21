#!/bin/bash
# Docker build script for RideConnect Backend - Production Ready

set -e

echo "🚀 Building RideConnect Backend Docker Image"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="rideconnect-backend"
REGISTRY="localhost:5001"
DOCKERFILE="Dockerfile.backend.optimized"
DOCKERIGNORE=".dockerignore.backend"

# Version extraction from package.json
VERSION=$(node -p "require('./package.json').version")
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Generate tags
FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}"
VERSION_TAG="${FULL_IMAGE_NAME}:${VERSION}"
LATEST_TAG="${FULL_IMAGE_NAME}:latest"

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo "  Registry: ${REGISTRY}"
echo "  Image: ${IMAGE_NAME}"
echo "  Version: ${VERSION}"
echo "  Build Date: ${BUILD_DATE}"
echo "  Git Commit: ${GIT_COMMIT}"
echo "  Tags: ${VERSION_TAG}, ${LATEST_TAG}"
echo ""

# Setup build environment
echo -e "${YELLOW}📝 Setting up .dockerignore for backend...${NC}"
cp $DOCKERIGNORE .dockerignore

# Validate registry connectivity
echo -e "${YELLOW}🔗 Testing registry connectivity...${NC}"
if ! curl -k -f https://${REGISTRY}/v2/ >/dev/null 2>&1; then
  echo -e "${RED}❌ Cannot connect to registry at ${REGISTRY}${NC}"
  echo "Please ensure the registry is running and accessible."
  exit 1
fi
echo -e "${GREEN}✅ Registry connectivity verified${NC}"

# Build the image with build arguments
echo -e "${YELLOW}🔨 Building Docker image with multi-stage optimization...${NC}"
docker build \
  -f $DOCKERFILE \
  --build-arg VERSION=${VERSION} \
  --build-arg BUILD_DATE=${BUILD_DATE} \
  --build-arg GIT_COMMIT=${GIT_COMMIT} \
  -t ${VERSION_TAG} \
  -t ${LATEST_TAG} \
  .

# Check image size and details
echo -e "${YELLOW}📊 Image Information:${NC}"
docker images --filter "reference=${FULL_IMAGE_NAME}" --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Security scan (optional)
echo -e "${YELLOW}🛡️ Running basic security checks...${NC}"
docker inspect ${VERSION_TAG} --format='{{.Config.User}}' | grep -q "nodeuser" && echo "✅ Running as non-root user" || echo "❌ Warning: Running as root"

# Test container startup
echo -e "${YELLOW}🧪 Testing container startup...${NC}"
CONTAINER_ID=$(docker run -d --rm \
  -e NODE_ENV=production \
  -e MONGODB_URI=mongodb://dummy-for-startup-test \
  --name rideconnect-backend-test \
  ${VERSION_TAG})

# Wait for startup and test health endpoint
echo "Waiting for container startup..."
sleep 5
if docker exec $CONTAINER_ID curl -f --max-time 5 http://localhost:3001/health >/dev/null 2>&1; then
  echo -e "${GREEN}✅ Health check passed${NC}"
else
  echo -e "${YELLOW}⚠️ Health check failed (expected without MongoDB)${NC}"
fi

# Stop test container
docker stop $CONTAINER_ID >/dev/null 2>&1 || true

echo -e "${GREEN}✅ Backend Docker image built successfully!${NC}"
echo -e "${GREEN}🏷️ Tags created:${NC}"
echo "  - ${VERSION_TAG}"
echo "  - ${LATEST_TAG}"

# Cleanup
rm -f .dockerignore

echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Push to registry:"
echo "   docker push ${VERSION_TAG}"
echo "   docker push ${LATEST_TAG}"
echo ""
echo "2. Deploy to Kubernetes:"
echo "   kubectl apply -f k8s-backend-deployment.yaml"
echo ""
echo -e "${BLUE}📋 Required Environment Variables:${NC}"
echo "  - MONGODB_URI (required)"
echo "  - NODE_ENV=production (set by default)"
echo "  - PORT=3001 (optional, default)"
echo "  - STRIPE_SECRET_KEY (optional, for payments)"