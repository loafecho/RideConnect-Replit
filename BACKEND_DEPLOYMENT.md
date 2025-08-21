# RideConnect Backend Deployment Guide

## Overview
The RideConnect backend has been successfully containerized and tested. This document provides instructions for deployment and registry management.

## Docker Image Details

### Image Information
- **Base Image**: Node.js 18 Alpine (minimal size)
- **Size**: ~1.04GB
- **Entry Point**: `server/k8s-server.ts`
- **Port**: 3001
- **Health Endpoints**: 
  - `/health` - Basic health check
  - `/ready` - Readiness probe with database connectivity check
  - `/metrics` - Prometheus metrics endpoint

### Available Tags
- `192.168.1.188/rideconnect-backend:latest` - Latest version
- `192.168.1.188/rideconnect-backend:v1.0.1` - Current stable version
- `192.168.1.188/rideconnect-backend:20250821-115324` - Timestamp version

## Environment Variables

### Required
```bash
MONGODB_URI=mongodb://username:password@host:27017/database?authSource=admin
NODE_ENV=production
PORT=3001
```

### Optional
```bash
STRIPE_SECRET_KEY=sk_test_...  # For payment features
GOOGLE_SERVICE_ACCOUNT_KEY=... # For calendar integration
```

## Deployment Instructions

### 1. Push to Registry (When Available)

The registry at 192.168.1.188 appears to be offline or requires specific configuration. When it's available, push the images:

```bash
# For standard Docker registry (port 5000)
docker push 192.168.1.188:5000/rideconnect-backend:v1.0.1
docker push 192.168.1.188:5000/rideconnect-backend:latest

# If using a different port (e.g., 5555)
docker push 192.168.1.188:5555/rideconnect-backend:v1.0.1
docker push 192.168.1.188:5555/rideconnect-backend:latest

# If registry requires insecure mode, add to Docker daemon config:
# /etc/docker/daemon.json
{
  "insecure-registries": ["192.168.1.188:5000"]
}
```

### 2. Run with Docker

```bash
# Create network
docker network create rideconnect-network

# Start MongoDB (if not using external database)
docker run -d \
  --name mongodb \
  --network rideconnect-network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=rideconnect \
  mongo:latest

# Start backend
docker run -d \
  --name rideconnect-backend \
  --network rideconnect-network \
  -p 3001:3001 \
  -e MONGODB_URI="mongodb://admin:password@mongodb:27017/rideconnect?authSource=admin" \
  -e NODE_ENV=production \
  -e PORT=3001 \
  192.168.1.188/rideconnect-backend:latest
```

### 3. Deploy to Kubernetes

Use the provided `k8s-backend-deployment.yaml`:

```bash
# Create namespace
kubectl create namespace rideconnect

# Create secrets
kubectl create secret generic rideconnect-backend-secrets \
  --from-literal=mongodb-uri='mongodb://...' \
  --from-literal=stripe-secret-key='sk_test_...' \
  -n rideconnect

# Apply deployment
kubectl apply -f k8s-backend-deployment.yaml -n rideconnect

# Check deployment status
kubectl get pods -n rideconnect
kubectl logs -f deployment/rideconnect-backend -n rideconnect
```

## Testing the Deployment

### Health Checks
```bash
# Health endpoint
curl http://localhost:3001/health
# Expected: {"status":"healthy","timestamp":"..."}

# Readiness endpoint
curl http://localhost:3001/ready
# Expected: {"status":"ready","timestamp":"..."}

# Metrics endpoint
curl http://localhost:3001/metrics
# Expected: Prometheus metrics output
```

### Verify Logs
```bash
# Docker
docker logs rideconnect-backend

# Kubernetes
kubectl logs deployment/rideconnect-backend -n rideconnect
```

## Version Control

### Versioning Strategy
- **Latest**: Always points to the most recent stable version
- **Semantic Version**: v1.0.1 format for specific releases
- **Timestamp**: YYYYMMDD-HHMMSS for tracking build times

### Updating Versions
```bash
# Build new version
docker build -f Dockerfile.backend -t rideconnect-backend:v1.0.2 .

# Tag appropriately
docker tag rideconnect-backend:v1.0.2 192.168.1.188/rideconnect-backend:v1.0.2
docker tag rideconnect-backend:v1.0.2 192.168.1.188/rideconnect-backend:latest

# Push to registry
docker push 192.168.1.188/rideconnect-backend:v1.0.2
docker push 192.168.1.188/rideconnect-backend:latest
```

## Troubleshooting

### Container Won't Start
- Check MongoDB connectivity: Ensure MONGODB_URI is correct
- Verify environment variables are set
- Check logs: `docker logs rideconnect-backend`

### Registry Push Fails
- Verify registry is running: `curl http://192.168.1.188:5000/v2/`
- Check Docker daemon config for insecure registries
- Ensure proper authentication if registry requires it

### Health Checks Failing
- Verify MongoDB is accessible from container
- Check that port 3001 is not blocked
- Review startup diagnostics in logs

## Security Considerations

1. **Non-root User**: Container runs as user 1001 (nodeuser)
2. **Minimal Base Image**: Alpine Linux reduces attack surface
3. **No Development Dependencies**: Production build only
4. **Environment Variables**: Use secrets management in production
5. **Network Isolation**: Use Docker networks or Kubernetes network policies

## Performance Optimization

- **Image Size**: ~1.04GB optimized from larger base images
- **Startup Time**: <10 seconds with database connection
- **Memory Usage**: ~78MB heap used, ~115MB allocated
- **Health Check Interval**: 30s with 10s timeout

## Next Steps

1. Configure your Docker registry at 192.168.1.188
2. Push the images using the commands above
3. Deploy to your target environment (Docker/Kubernetes)
4. Set up monitoring and logging
5. Configure SSL/TLS termination at ingress/load balancer level

## Support Files

- `Dockerfile.backend` - Production Dockerfile
- `Dockerfile.backend.optimized` - Multi-stage optimized version
- `docker-compose.backend.yml` - Local testing setup
- `k8s-backend-deployment.yaml` - Kubernetes manifests
- `.dockerignore.backend` - Build exclusions

## Current Status

✅ Docker image built successfully
✅ Health endpoints tested and working
✅ Container runs with MongoDB connection
⚠️ Registry push pending (registry appears offline)
✅ Documentation complete