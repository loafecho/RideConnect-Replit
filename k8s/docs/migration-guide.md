# RideConnect Migration Guide: Docker to Kubernetes

This guide provides step-by-step instructions for migrating RideConnect from a single Docker container deployment to a scalable Kubernetes architecture.

## Migration Overview

### Current State (Before Migration)
- **Single container** running both frontend and backend
- **Port 5000** serves both React app and API
- **MongoDB** connection from application
- **Simple deployment** on single server

### Target State (After Migration)
- **Two containers**: Separate frontend (nginx) and backend (Node.js)
- **Frontend**: nginx on port 80 serving React static files
- **Backend**: Express API on port 3000
- **Kubernetes orchestration** with auto-scaling and high availability
- **Production-ready** monitoring, security, and CI/CD

## Pre-Migration Checklist

### 1. Environment Preparation

- [ ] Kubernetes cluster access configured
- [ ] Container registry available (Docker Hub, GHCR, etc.)
- [ ] Domain name configured for ingress
- [ ] TLS certificates or cert-manager setup
- [ ] Backup of current application and database

### 2. Dependencies Assessment

- [ ] External MongoDB service ready (Atlas recommended)
- [ ] Stripe keys available for payment processing
- [ ] Google Calendar API credentials (if used)
- [ ] Monitoring infrastructure (Prometheus/Grafana) accessible

### 3. Infrastructure Requirements

- [ ] Ingress controller installed (nginx-ingress)
- [ ] Cert-manager for TLS automation
- [ ] Metrics server for autoscaling
- [ ] Network policies supported (Calico/Cilium)

## Migration Steps

### Phase 1: Container Architecture Split

#### Step 1: Test Container Separation Locally

```bash
# 1. Build new containers
docker build -f Dockerfile.frontend -t rideconnect-frontend:test .
docker build -f Dockerfile.backend -t rideconnect-backend:test .

# 2. Create test network
docker network create rideconnect-test

# 3. Start backend container
docker run -d --name backend-test \
  --network rideconnect-test \
  -p 3000:3000 \
  -e MONGODB_URI="your-mongodb-connection-string" \
  -e NODE_ENV="production" \
  rideconnect-backend:test

# 4. Start frontend container
docker run -d --name frontend-test \
  --network rideconnect-test \
  -p 8080:80 \
  rideconnect-frontend:test

# 5. Test functionality
curl http://localhost:8080/health  # Frontend health
curl http://localhost:3000/health  # Backend health
curl http://localhost:3000/api/auth/user  # API functionality
```

#### Step 2: Validate Application Functionality

1. **Frontend Tests**:
   - [ ] Static assets load correctly
   - [ ] React routing works
   - [ ] API calls reach backend

2. **Backend Tests**:
   - [ ] Database connection successful
   - [ ] API endpoints respond correctly
   - [ ] Authentication works
   - [ ] Payment processing functional (if configured)

3. **Integration Tests**:
   - [ ] End-to-end booking flow
   - [ ] Admin functionality
   - [ ] Payment processing

### Phase 2: Kubernetes Deployment Preparation

#### Step 1: Configure Secrets

```bash
# Create namespace
kubectl create namespace rideconnect

# Create secrets (replace with actual values)
kubectl create secret generic rideconnect-secrets \
  --from-literal=mongodb-uri="mongodb+srv://user:pass@cluster.mongodb.net/rideconnect" \
  --from-literal=stripe-secret-key="sk_live_your_stripe_key" \
  --from-literal=google-calendar-client-id="your-client-id" \
  --from-literal=google-calendar-client-secret="your-client-secret" \
  --from-literal=admin-key="your-secure-admin-key" \
  --from-literal=session-secret="your-session-secret" \
  -n rideconnect
```

#### Step 2: Build and Push Production Images

```bash
# Build and tag for production
docker build -f Dockerfile.frontend -t your-registry/rideconnect-frontend:v1.0.0 .
docker build -f Dockerfile.backend -t your-registry/rideconnect-backend:v1.0.0 .

# Push to registry
docker push your-registry/rideconnect-frontend:v1.0.0
docker push your-registry/rideconnect-backend:v1.0.0

# Update kustomization.yaml with your registry URLs
```

#### Step 3: Configure Domain and Ingress

1. **Update DNS Records**:
   ```
   rideconnect.yourdomain.com -> [your-ingress-ip]
   api.rideconnect.yourdomain.com -> [your-ingress-ip]
   ```

2. **Update Ingress Configuration**:
   ```bash
   # Edit k8s/base/ingress/ingress.yaml
   # Replace "yourdomain.com" with your actual domain
   ```

### Phase 3: Staging Deployment and Testing

#### Step 1: Deploy to Staging Environment

```bash
# Deploy staging environment
kubectl apply -k k8s/overlays/staging/

# Monitor deployment
kubectl get pods -n rideconnect-staging -w
```

#### Step 2: Comprehensive Testing

1. **Infrastructure Tests**:
   ```bash
   # Check pod status
   kubectl get pods -n rideconnect-staging
   
   # Check services
   kubectl get services -n rideconnect-staging
   
   # Check ingress
   kubectl get ingress -n rideconnect-staging
   ```

2. **Application Tests**:
   ```bash
   # Health checks
   kubectl exec deployment/rideconnect-backend -n rideconnect-staging -- curl -f http://localhost:3000/health
   kubectl exec deployment/rideconnect-frontend -n rideconnect-staging -- curl -f http://localhost:80/health
   
   # API functionality
   curl https://rideconnect-staging.yourdomain.com/api/auth/user
   ```

3. **Load Testing**:
   ```bash
   # Install hey for load testing
   go install github.com/rakyll/hey@latest
   
   # Test frontend
   hey -n 1000 -c 10 https://rideconnect-staging.yourdomain.com/
   
   # Test API
   hey -n 1000 -c 10 https://rideconnect-staging.yourdomain.com/api/timeslots/2024-01-01
   ```

### Phase 4: Production Migration

#### Step 1: Pre-Migration Tasks

1. **Backup Current System**:
   ```bash
   # Database backup (if using managed MongoDB, this may be automated)
   mongodump --uri="your-current-mongodb-uri" --out=/backup/pre-migration
   
   # Application configuration backup
   docker exec your-current-container env > current-env-backup.txt
   ```

2. **DNS TTL Reduction**:
   ```bash
   # Reduce DNS TTL to 300 seconds for faster switchover
   # Update your DNS provider settings
   ```

#### Step 2: Blue-Green Deployment Strategy

1. **Deploy Kubernetes (Green Environment)**:
   ```bash
   # Deploy production environment
   kubectl apply -k k8s/overlays/production/
   
   # Verify deployment
   kubectl rollout status deployment/rideconnect-frontend -n rideconnect
   kubectl rollout status deployment/rideconnect-backend -n rideconnect
   ```

2. **Smoke Testing**:
   ```bash
   # Test all critical paths
   kubectl exec deployment/rideconnect-backend -n rideconnect -- curl -f http://localhost:3000/ready
   
   # Database connectivity
   kubectl exec deployment/rideconnect-backend -n rideconnect -- \
     node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('DB OK'))"
   ```

#### Step 3: Traffic Switchover

1. **DNS Switchover**:
   ```bash
   # Update DNS to point to Kubernetes ingress IP
   # Monitor application metrics during switchover
   ```

2. **Monitor Application**:
   ```bash
   # Watch pods
   kubectl get pods -n rideconnect -w
   
   # Check metrics in Grafana
   # Monitor error rates and response times
   ```

#### Step 4: Post-Migration Validation

1. **Functional Testing**:
   - [ ] User registration/login works
   - [ ] Booking creation successful
   - [ ] Payment processing functional
   - [ ] Admin dashboard accessible
   - [ ] All API endpoints responding

2. **Performance Validation**:
   - [ ] Response times within acceptable limits
   - [ ] Auto-scaling triggers correctly
   - [ ] Database performance stable
   - [ ] No memory leaks or CPU spikes

3. **Monitoring Setup**:
   - [ ] Prometheus metrics collecting
   - [ ] Grafana dashboards displaying data
   - [ ] Alerts configured and testing
   - [ ] Log aggregation working

### Phase 5: Old System Decommissioning

#### Step 1: Monitoring Period (Recommended: 7 days)

- Monitor new system stability
- Keep old system as backup
- Gradual confidence building

#### Step 2: Cleanup

```bash
# After successful migration and monitoring period:

# 1. Stop old Docker container
docker stop your-old-container

# 2. Remove old container (after final backup)
docker rm your-old-container

# 3. Update monitoring to remove old system alerts

# 4. Update documentation with new deployment process
```

## Rollback Plan

### Quick Rollback (If needed within first hour)

1. **DNS Rollback**:
   ```bash
   # Revert DNS to old system IP
   # Wait for DNS propagation (5-15 minutes with reduced TTL)
   ```

2. **Restart Old System**:
   ```bash
   docker start your-old-container
   # Verify functionality
   ```

### Extended Rollback (If needed after hours/days)

1. **Database State Verification**:
   ```bash
   # Check for data inconsistencies
   # Restore from backup if necessary
   ```

2. **Complete Revert**:
   ```bash
   # Scale down Kubernetes deployment
   kubectl scale deployment rideconnect-frontend --replicas=0 -n rideconnect
   kubectl scale deployment rideconnect-backend --replicas=0 -n rideconnect
   
   # Restart old system
   docker start your-old-container
   
   # Revert DNS
   ```

## Post-Migration Optimization

### Performance Tuning

1. **Resource Optimization**:
   ```bash
   # Monitor actual resource usage
   kubectl top pods -n rideconnect
   
   # Adjust resource requests/limits based on actual usage
   ```

2. **Auto-scaling Tuning**:
   ```bash
   # Monitor HPA behavior
   kubectl get hpa -n rideconnect
   
   # Adjust scaling thresholds if needed
   ```

### Security Hardening

1. **Network Policies**: Verify network isolation is working
2. **RBAC**: Ensure minimal permissions are working
3. **Pod Security**: Confirm security contexts are applied
4. **Secrets Management**: Rotate initial secrets

### Monitoring Enhancement

1. **Custom Metrics**: Add business-specific metrics
2. **Alerting**: Fine-tune alert thresholds
3. **Dashboards**: Customize Grafana dashboards
4. **Logging**: Enhance log aggregation and searching

## Troubleshooting Common Migration Issues

### Container Startup Issues

**Problem**: Pods failing to start
```bash
# Debug steps
kubectl describe pod <pod-name> -n rideconnect
kubectl logs <pod-name> -n rideconnect --previous
```

**Common Solutions**:
- Check image pull permissions
- Verify environment variables
- Confirm resource limits are sufficient

### Database Connection Issues

**Problem**: Backend can't connect to database
```bash
# Test connection
kubectl exec deployment/rideconnect-backend -n rideconnect -- \
  node -e "console.log(process.env.MONGODB_URI)"
```

**Common Solutions**:
- Verify MongoDB URI in secrets
- Check network policies allow database access
- Confirm MongoDB Atlas IP whitelist includes cluster IPs

### Ingress/DNS Issues

**Problem**: Application not accessible via domain
```bash
# Debug ingress
kubectl describe ingress rideconnect-ingress -n rideconnect
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

**Common Solutions**:
- Verify DNS propagation: `nslookup rideconnect.yourdomain.com`
- Check ingress controller status
- Confirm TLS certificate generation

## Success Criteria

Migration is considered successful when:

- [ ] All application functionality works correctly
- [ ] Performance meets or exceeds previous system
- [ ] Auto-scaling responds appropriately to load
- [ ] Monitoring and alerting are functional
- [ ] Security policies are enforced
- [ ] CI/CD pipeline is operational
- [ ] Documentation is updated
- [ ] Team is trained on new deployment process

## Next Steps After Migration

1. **CI/CD Integration**: Set up automated deployments
2. **Disaster Recovery**: Test and document recovery procedures
3. **Capacity Planning**: Monitor growth and plan scaling
4. **Security Audits**: Regular security reviews and updates
5. **Performance Optimization**: Continuous performance monitoring and tuning

## Getting Help

For migration assistance:
- Review logs: `kubectl logs deployment/rideconnect-backend -n rideconnect`
- Check pod status: `kubectl describe pod <pod-name> -n rideconnect`
- Monitor metrics in Grafana dashboard
- Consult deployment guide for detailed configuration options