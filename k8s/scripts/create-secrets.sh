#!/bin/bash

# Script to create Kubernetes secrets and configmaps from your .env file
# This converts your existing environment variables to Kubernetes format

set -e  # Exit on any error

NAMESPACE="rideconnect"

echo "🔒 Creating Kubernetes secrets and configmaps for RideConnect..."

# Create namespace if it doesn't exist
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo "📁 Creating secrets (sensitive data)..."

# Create secrets for sensitive data
kubectl create secret generic rideconnect-secrets \
  --from-literal=mongodb-uri="mongodb://admin:rideconnect_secure_pwd@localhost:27017/rideconnect?authSource=admin" \
  --from-literal=mongo-root-username="admin" \
  --from-literal=mongo-root-password="rideconnect_secure_pwd" \
  --from-literal=stripe-secret-key="sk_test_your_stripe_secret_key_here" \
  --from-literal=google-calendar-id="garcia121098@gmail.com" \
  --from-literal=admin-key="admin123" \
  --from-literal=session-secret="rideconnect-session-secret-$(date +%s)" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "📋 Creating configmaps (non-sensitive data)..."

# Create configmap for non-sensitive frontend environment variables
kubectl create configmap rideconnect-frontend-config \
  --from-literal=VITE_STRIPE_PUBLIC_KEY="pk_test_51RcbRKQO1CzAk8719wzDhu5HVpqje5xedXnkxFb5QB3v7hkfIWPlp0C8fmOBc0W9zREaRDkPpf0az8jA3BtoFyfv00cX1iwmKG" \
  --from-literal=VITE_OPENROUTE_API_KEY="5b3ce3597851110001cf6248c6ee16efbd6647219c95e4b3bc6a98fe" \
  --from-literal=VITE_LOCATIONIQ_API_KEY="pk.8580ce91c5b1b627b728eef6186f0dc1" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

# Update backend configmap to merge with existing one
kubectl create configmap rideconnect-backend-config \
  --from-literal=NODE_ENV="production" \
  --from-literal=LOG_LEVEL="info" \
  --from-literal=API_TIMEOUT="30000" \
  --from-literal=MAX_CONNECTIONS="100" \
  --from-literal=MONGO_DATABASE="rideconnect" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "🔑 Handling Google Service Account..."

# Check if Google service account file exists
if [ -f "./rideconnect-469322-ee88b741366b.json" ]; then
    echo "📂 Creating secret from Google service account file..."
    kubectl create secret generic google-service-account \
      --from-file=service-account.json=./rideconnect-469322-ee88b741366b.json \
      --namespace=$NAMESPACE \
      --dry-run=client -o yaml | kubectl apply -f -
else
    echo "⚠️  Google service account file not found at ./rideconnect-469322-ee88b741366b.json"
    echo "   You can create it later with:"
    echo "   kubectl create secret generic google-service-account --from-file=service-account.json=./rideconnect-469322-ee88b741366b.json -n $NAMESPACE"
fi

echo "✅ Secrets and configmaps created successfully!"
echo ""
echo "📋 Summary:"
echo "   • Namespace: $NAMESPACE"
echo "   • Secrets: rideconnect-secrets, google-service-account"
echo "   • ConfigMaps: rideconnect-frontend-config, rideconnect-backend-config"
echo ""
echo "🔍 Verify with:"
echo "   kubectl get secrets -n $NAMESPACE"
echo "   kubectl get configmaps -n $NAMESPACE"