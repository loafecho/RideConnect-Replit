# RideConnect Kubernetes Deployment

This directory contains Kubernetes manifests and deployment configurations for running RideConnect in a production-ready, scalable environment.

## 🏗️ Architecture Overview

RideConnect is deployed as a microservices architecture on Kubernetes:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ingress       │    │   Frontend      │    │   Backend API   │
│   (nginx)       │◄──►│   (nginx +      │◄──►│   (Express.js)  │
│                 │    │   React)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
    External Traffic        Static Files              Database
                                                   (MongoDB)
```

## 📁 Directory Structure

```
k8s/
├── base/                          # Base Kubernetes configurations
│   ├── namespace/                 # Namespace and resource quotas
│   ├── rbac/                     # Service accounts, roles, bindings
│   ├── frontend/                 # Frontend deployment, service, HPA
│   ├── backend/                  # Backend deployment, service, HPA
│   ├── database/                 # Database configurations
│   ├── ingress/                  # External access and TLS
│   ├── monitoring/               # ServiceMonitors and Grafana dashboards
│   └── network-policies/         # Security policies
├── overlays/                     # Environment-specific configurations
│   ├── development/              # Development environment
│   ├── staging/                  # Staging environment
│   └── production/               # Production environment
├── docs/                         # Documentation
│   ├── deployment-guide.md       # Detailed deployment instructions
│   └── migration-guide.md        # Migration from Docker to K8s
└── docker/                       # Docker configurations
    └── frontend-nginx.conf       # Nginx configuration for frontend
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (v1.25+)
- kubectl configured
- Container registry access
- Domain name for ingress

### 1. Build and Push Images

```bash
# Build containers
docker build -f Dockerfile.frontend -t your-registry/rideconnect-frontend:latest .
docker build -f Dockerfile.backend -t your-registry/rideconnect-backend:latest .

# Push to registry
docker push your-registry/rideconnect-frontend:latest
docker push your-registry/rideconnect-backend:latest
```

### 2. Configure Secrets

```bash
kubectl create secret generic rideconnect-secrets \
  --from-literal=mongodb-uri="your-mongodb-connection-string" \
  --from-literal=stripe-secret-key="your-stripe-key" \
  --from-literal=admin-key="your-admin-key" \
  -n rideconnect
```

### 3. Deploy Application

```bash
# Production deployment
kubectl apply -k overlays/production/

# Development deployment
kubectl apply -k overlays/development/
```

### 4. Verify Deployment

```bash
# Check pod status
kubectl get pods -n rideconnect

# Check services
kubectl get services -n rideconnect

# Check ingress
kubectl get ingress -n rideconnect
```

## 🔧 Configuration

### Environment Variables

Configure through ConfigMaps and Secrets:

- **ConfigMap**: Non-sensitive configuration (log levels, timeouts)
- **Secrets**: Sensitive data (database URLs, API keys)

### Resource Limits

Default resource allocations:

| Component | CPU Request | Memory Request | CPU Limit | Memory Limit |
|-----------|-------------|----------------|-----------|--------------|
| Frontend  | 100m        | 128Mi          | 500m      | 256Mi        |
| Backend   | 500m        | 512Mi          | 1000m     | 1Gi          |

### Auto-scaling

Horizontal Pod Autoscaler (HPA) configured:

- **Frontend**: 2-10 pods (70% CPU, 80% memory threshold)
- **Backend**: 2-5 pods (70% CPU, 80% memory threshold)

## 🔒 Security Features

### Network Policies

Zero-trust networking implemented:
- Default deny all ingress
- Explicit allow rules for required communication
- Database access restricted to backend only

### Pod Security

- Non-root containers
- Read-only root filesystem (where applicable)
- Dropped security capabilities
- Security context constraints

### RBAC

Minimal permissions granted:
- Frontend: No Kubernetes API access
- Backend: Read-only access to ConfigMaps/Secrets
- Monitoring: Read access for metrics collection

## 📊 Monitoring

### Integration with Existing Prometheus/Grafana

- **ServiceMonitors**: Automatic service discovery for Prometheus
- **Grafana Dashboard**: Pre-built dashboard for application metrics
- **PrometheusRules**: Alerting rules for common issues

### Metrics Exposed

- **Frontend**: nginx status, request rates, response times
- **Backend**: Node.js metrics, API performance, business metrics
- **Infrastructure**: Pod health, resource usage, scaling events

### Key Alerts

- High error rate (>5% for 5 minutes)
- High response time (>2s for 5 minutes)
- Service unavailable
- Pod crash looping
- High memory/CPU usage

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Automated pipeline includes:

1. **Test Phase**: Unit tests, type checking, security audit
2. **Build Phase**: Multi-platform container builds with vulnerability scanning
3. **Deploy Phase**: Environment-specific deployments with health checks
4. **Rollback**: Automatic rollback on deployment failure

### Environment Promotion

- **Development**: Auto-deploy on `develop` branch
- **Staging**: Auto-deploy on `develop` branch with extended testing
- **Production**: Auto-deploy on `main` branch with manual approval

## 🗄️ Database Options

### External MongoDB (Recommended)

Use managed MongoDB service (Atlas, AWS DocumentDB):
- Automatic backups and scaling
- Built-in security and monitoring
- Reduced operational overhead

### In-Cluster MongoDB (Development)

StatefulSet configuration provided for development:
- Persistent storage with automatic provisioning
- Single instance for simplicity
- Manual backup procedures required

## 🌐 Networking

### Ingress Configuration

- **Primary Domain**: `rideconnect.yourdomain.com`
- **API Subdomain**: `api.rideconnect.yourdomain.com` (optional)
- **TLS**: Automatic certificate provisioning via cert-manager
- **Rate Limiting**: 100 requests/minute per IP

### Service Communication

- Frontend → Backend: Internal cluster communication
- Backend → Database: External or internal based on configuration
- External → Services: Through ingress controller only

## 📖 Documentation

- **[Deployment Guide](docs/deployment-guide.md)**: Comprehensive deployment instructions
- **[Migration Guide](docs/migration-guide.md)**: Migration from Docker to Kubernetes
- **[Troubleshooting](docs/deployment-guide.md#troubleshooting)**: Common issues and solutions

## 🛠️ Development

### Local Development with Kubernetes

```bash
# Deploy development environment
kubectl apply -k overlays/development/

# Port forward for local access
kubectl port-forward service/rideconnect-frontend 8080:80 -n rideconnect-dev
kubectl port-forward service/rideconnect-backend 3000:3000 -n rideconnect-dev
```

### Testing Deployments

```bash
# Health checks
kubectl exec deployment/rideconnect-backend -n rideconnect -- curl http://localhost:3000/health
kubectl exec deployment/rideconnect-frontend -n rideconnect -- curl http://localhost:80/health

# Load testing
hey -n 1000 -c 10 https://rideconnect.yourdomain.com/
```

## 🆘 Support

### Getting Help

1. **Check pod logs**: `kubectl logs deployment/rideconnect-backend -n rideconnect`
2. **Describe resources**: `kubectl describe pod <pod-name> -n rideconnect`
3. **Monitor metrics**: Check Grafana dashboard
4. **Review alerts**: Check Prometheus alerting rules

### Common Commands

```bash
# Check deployment status
kubectl rollout status deployment/rideconnect-backend -n rideconnect

# Scale manually
kubectl scale deployment rideconnect-frontend --replicas=5 -n rideconnect

# Update image
kubectl set image deployment/rideconnect-backend backend=new-image:tag -n rideconnect

# Rollback deployment
kubectl rollout undo deployment/rideconnect-backend -n rideconnect
```

## 🔮 Future Enhancements

- **Service Mesh**: Istio integration for advanced traffic management
- **GitOps**: ArgoCD for declarative deployments
- **Chaos Engineering**: Chaos Monkey for resilience testing
- **Multi-cluster**: Cross-region deployment for high availability

---

For detailed instructions, see the [Deployment Guide](docs/deployment-guide.md) or [Migration Guide](docs/migration-guide.md).