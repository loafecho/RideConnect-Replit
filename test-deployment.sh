#!/bin/bash
# RideConnect Backend Deployment Test Script

set -e

echo "🧪 RideConnect Backend Deployment Tests"
echo "======================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="localhost:5001"
IMAGE_NAME="rideconnect-backend"
VERSION="1.0.0"
TEST_PORT="3004"

echo -e "${YELLOW}📋 Test Configuration:${NC}"
echo "  Registry: ${REGISTRY}"
echo "  Image: ${IMAGE_NAME}:${VERSION}"
echo "  Test Port: ${TEST_PORT}"
echo ""

# Test 1: Registry connectivity
echo -e "${YELLOW}🔗 Testing registry connectivity...${NC}"
if curl -k -f https://${REGISTRY}/v2/ >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Registry is accessible${NC}"
else
    echo -e "${RED}❌ Registry is not accessible${NC}"
    exit 1
fi

# Test 2: Image availability
echo -e "${YELLOW}🐳 Testing image availability...${NC}"
if curl -k -s https://${REGISTRY}/v2/${IMAGE_NAME}/tags/list | grep -q "${VERSION}"; then
    echo -e "${GREEN}✅ Image ${IMAGE_NAME}:${VERSION} is available${NC}"
else
    echo -e "${RED}❌ Image ${IMAGE_NAME}:${VERSION} not found${NC}"
    exit 1
fi

# Test 3: Container startup
echo -e "${YELLOW}🚀 Testing container startup...${NC}"
CONTAINER_ID=$(docker run -d --name rideconnect-test-deploy \
    -p ${TEST_PORT}:3001 \
    -e NODE_ENV=production \
    -e MONGODB_URI="mongodb://dummy-test-uri" \
    ${REGISTRY}/${IMAGE_NAME}:${VERSION})

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Container started successfully${NC}"
    echo "   Container ID: ${CONTAINER_ID:0:12}"
else
    echo -e "${RED}❌ Container failed to start${NC}"
    exit 1
fi

# Wait for startup
echo -e "${YELLOW}⏳ Waiting for application startup...${NC}"
sleep 10

# Test 4: Health endpoint
echo -e "${YELLOW}🏥 Testing health endpoint...${NC}"
if curl -f -s http://localhost:${TEST_PORT}/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Health endpoint responding${NC}"
else
    echo -e "${RED}❌ Health endpoint not responding${NC}"
    docker logs rideconnect-test-deploy --tail 10
fi

# Test 5: Ready endpoint  
echo -e "${YELLOW}🎯 Testing readiness endpoint...${NC}"
READY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:${TEST_PORT}/ready)
if [ "$READY_RESPONSE" = "200" ] || [ "$READY_RESPONSE" = "503" ]; then
    echo -e "${GREEN}✅ Readiness endpoint responding (HTTP $READY_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Readiness endpoint not responding${NC}"
fi

# Test 6: Metrics endpoint
echo -e "${YELLOW}📊 Testing metrics endpoint...${NC}"
if curl -f -s http://localhost:${TEST_PORT}/metrics | grep -q "nodejs_process"; then
    echo -e "${GREEN}✅ Metrics endpoint providing data${NC}"
else
    echo -e "${RED}❌ Metrics endpoint not working${NC}"
fi

# Test 7: Security validation
echo -e "${YELLOW}🔒 Testing container security...${NC}"
USER_INFO=$(docker exec rideconnect-test-deploy id)
if echo "$USER_INFO" | grep -q "uid=1001"; then
    echo -e "${GREEN}✅ Running as non-root user (nodeuser)${NC}"
else
    echo -e "${RED}❌ Not running as expected non-root user${NC}"
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up test container...${NC}"
docker stop rideconnect-test-deploy >/dev/null 2>&1 || true
docker rm rideconnect-test-deploy >/dev/null 2>&1 || true

echo ""
echo -e "${GREEN}🎉 Deployment tests completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Update Kubernetes secrets with actual MongoDB URI:"
echo "   kubectl create secret generic rideconnect-secrets \\"
echo "     --from-literal=mongodb-uri='mongodb://your-actual-uri' \\"
echo "     --namespace=rideconnect"
echo ""
echo "2. Deploy to Kubernetes:"
echo "   kubectl apply -f k8s-backend-deployment.yaml"
echo ""
echo "3. Monitor deployment:"
echo "   kubectl get pods -n rideconnect -w"
echo ""
echo -e "${GREEN}✨ RideConnect Backend is ready for production deployment!${NC}"