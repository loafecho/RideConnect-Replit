# RideConnect Kubernetes Deployment Guide

This guide explains how to deploy RideConnect to Kubernetes using the provided manifests and CI/CD pipeline.

## Prerequisites

### Required Tools
- **Kubernetes cluster** (v1.25+)
- **kubectl** (v1.25+)
- **Docker** or **Podman**
- **Kustomize** (v4.0+)
- **Helm** (optional, for cert-manager)

### Required Cluster Components
- **Ingress Controller** (nginx-ingress recommended)
- **Cert-Manager** (for TLS certificates)
- **Metrics Server** (for HPA)
- **Existing Prometheus/Grafana** (for monitoring)

## Quick Start

### 1. Build and Push Docker Images

```bash
# Build frontend image
docker build -f Dockerfile.frontend -t your-registry/rideconnect-frontend:latest .
docker push your-registry/rideconnect-frontend:latest

# Build backend image  
docker build -f Dockerfile.backend -t your-registry/rideconnect-backend:latest .
docker push your-registry/rideconnect-backend:latest
```

### 2. Configure Secrets

```bash
# Create production secrets (replace with your actual values)
kubectl create secret generic rideconnect-secrets \
  --from-literal=mongodb-uri="mongodb+srv://user:pass@cluster.mongodb.net/rideconnect" \
  --from-literal=stripe-secret-key="sk_live_your_stripe_key" \
  --from-literal=admin-key="your-secure-admin-key" \
  --from-literal=session-secret="your-session-secret" \
  -n rideconnect
```

### 3. Update Image References

Edit `k8s/overlays/production/kustomization.yaml`:

```yaml
images:
- name: rideconnect-frontend
  newName: your-registry/rideconnect-frontend
  newTag: latest
- name: rideconnect-backend
  newName: your-registry/rideconnect-backend
  newTag: latest
```

### 4. Deploy to Kubernetes

```bash
# Deploy to production
kubectl apply -k k8s/overlays/production/

# Check deployment status
kubectl get pods -n rideconnect
kubectl rollout status deployment/rideconnect-frontend -n rideconnect
kubectl rollout status deployment/rideconnect-backend -n rideconnect
```

## Environment-Specific Deployments

### Development Environment

```bash
# Deploy to development (uses in-cluster MongoDB)
kubectl apply -k k8s/overlays/development/

# Port forward for local testing
kubectl port-forward service/rideconnect-frontend 8080:80 -n rideconnect-dev
```

### Staging Environment

```bash
# Deploy to staging
kubectl apply -k k8s/overlays/staging/
```

### Production Environment

```bash
# Deploy to production with external MongoDB
kubectl apply -k k8s/overlays/production/
```

## Configuration

### Database Setup

#### Option A: External MongoDB (Recommended)
1. Set up MongoDB Atlas or managed MongoDB service
2. Create database user and connection string
3. Update `mongodb-uri` secret with connection string
4. Use `k8s/base/database/external-config.yaml`

#### Option B: In-Cluster MongoDB (Development Only)
1. Use `k8s/base/database/statefulset.yaml`
2. Configure persistent volumes
3. Set up backup procedures

### Domain and TLS

1. Update domain names in `k8s/base/ingress/ingress.yaml`
2. Configure DNS to point to your ingress controller
3. Cert-manager will automatically provision TLS certificates

### Monitoring Integration

1. Ensure ServiceMonitor labels match your Prometheus configuration
2. Import Grafana dashboard from `k8s/base/monitoring/grafana-dashboard.json`
3. Configure alert routing for PrometheusRule alerts

## Scaling

### Horizontal Pod Autoscaler

HPAs are configured to scale based on CPU and memory:

- **Frontend**: 2-10 pods (scales at 70% CPU, 80% memory)
- **Backend**: 2-5 pods (scales at 70% CPU, 80% memory)

### Manual Scaling

```bash
# Scale frontend
kubectl scale deployment rideconnect-frontend --replicas=5 -n rideconnect

# Scale backend
kubectl scale deployment rideconnect-backend --replicas=3 -n rideconnect
```

### Resource Limits

Adjust resource limits in deployment manifests based on actual usage:

```yaml
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 1000m
    memory: 1Gi
```

## Security

### Network Policies

Network policies implement zero-trust networking:
- Default deny all ingress
- Allow specific communication patterns
- Isolate database access to backend only

### RBAC

Service accounts have minimal required permissions:
- Frontend: No Kubernetes API access
- Backend: Read-only access to ConfigMaps and Secrets
- Monitoring: Read access to pods and services

### Pod Security

All pods run with:
- Non-root user
- Read-only root filesystem (where possible)
- Dropped security capabilities
- Security context constraints

## Troubleshooting

### Common Issues

#### Pod Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n rideconnect

# Check logs
kubectl logs <pod-name> -n rideconnect --previous
```

#### Image Pull Errors
```bash
# Check image registry access
kubectl describe pod <pod-name> -n rideconnect

# Verify image exists
docker pull your-registry/rideconnect-frontend:latest
```

#### Database Connection Issues
```bash
# Test database connectivity
kubectl exec -it deployment/rideconnect-backend -n rideconnect -- \
  mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

#### Ingress Not Working
```bash
# Check ingress status
kubectl describe ingress rideconnect-ingress -n rideconnect

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

### Health Checks

```bash
# Check application health
kubectl exec deployment/rideconnect-backend -n rideconnect -- curl -f http://localhost:3000/health
kubectl exec deployment/rideconnect-frontend -n rideconnect -- curl -f http://localhost:80/health

# Check readiness
kubectl exec deployment/rideconnect-backend -n rideconnect -- curl -f http://localhost:3000/ready
```

### Monitoring and Metrics

```bash
# Check Prometheus targets
kubectl port-forward service/prometheus-operated 9090:9090 -n monitoring

# View metrics
curl http://localhost:9090/api/v1/targets

# Check ServiceMonitor
kubectl get servicemonitor -n rideconnect
```

## Backup and Recovery

### Database Backup

For external MongoDB:
- Use MongoDB Atlas automated backups
- Configure point-in-time recovery

For in-cluster MongoDB:
```bash
# Create backup job
kubectl create job --from=cronjob/mongodb-backup mongodb-backup-manual -n rideconnect
```

### Application State

RideConnect is stateless - no application state backup needed.

### Configuration Backup

```bash
# Backup all configurations
kubectl get all,configmap,secret,ingress,networkpolicy -n rideconnect -o yaml > rideconnect-backup.yaml
```

## Maintenance

### Updates

1. Update image tags in kustomization.yaml
2. Apply using rolling deployment:
   ```bash
   kubectl apply -k k8s/overlays/production/
   ```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/rideconnect-frontend -n rideconnect
kubectl rollout undo deployment/rideconnect-backend -n rideconnect
```

### Certificate Renewal

Cert-manager handles automatic renewal. To force renewal:
```bash
kubectl delete secret rideconnect-tls -n rideconnect
```

## Performance Optimization

### Resource Tuning

Monitor actual resource usage and adjust:

```bash
# Check resource usage
kubectl top pods -n rideconnect
kubectl top nodes
```

### Database Optimization

- Use connection pooling (configured in backend)
- Monitor query performance
- Configure appropriate indexes

### CDN Integration

For production, consider placing a CDN in front of the frontend service for static asset caching.

## Support

For issues and questions:
- Check logs: `kubectl logs deployment/rideconnect-backend -n rideconnect`
- Monitor metrics in Grafana dashboard
- Review Prometheus alerts
- Consult troubleshooting section above