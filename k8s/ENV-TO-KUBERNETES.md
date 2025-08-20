# Converting Your .env File to Kubernetes

## 🤔 What's Different?

Your current setup uses a `.env` file that gets loaded automatically. In Kubernetes, we use **Secrets** and **ConfigMaps** instead:

- **Secrets** 🔒: Sensitive data (passwords, API keys)
- **ConfigMaps** 📋: Non-sensitive config (log levels, timeouts)

## 📄 Your Current .env File

I found your `.env` file with:
```env
MONGODB_URI=mongodb://admin:rideconnect_secure_pwd@localhost:27017/rideconnect
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
GOOGLE_CALENDAR_ID=garcia121098@gmail.com
# ... and more
```

## 🚀 Easy Conversion Script

I've created a script that converts your `.env` file to Kubernetes format:

```bash
# Run this script to create all your secrets and configmaps
./k8s/scripts/create-secrets.sh
```

### What This Script Does:

1. **Creates Secrets** (sensitive data):
   - MongoDB connection string and credentials
   - Stripe secret key
   - Google Calendar ID
   - Admin authentication key

2. **Creates ConfigMaps** (non-sensitive data):
   - Frontend environment variables (VITE_* keys)
   - Backend configuration (log levels, timeouts)
   - Node environment settings

## 🔧 Manual Method (if you prefer)

If you want to create them manually:

```bash
# Create the namespace
kubectl create namespace rideconnect

# Create secrets for sensitive data
kubectl create secret generic rideconnect-secrets \
  --from-literal=mongodb-uri="mongodb://admin:rideconnect_secure_pwd@localhost:27017/rideconnect?authSource=admin" \
  --from-literal=stripe-secret-key="sk_test_your_stripe_secret_key_here" \
  --from-literal=google-calendar-id="garcia121098@gmail.com" \
  -n rideconnect

# Create configmap for frontend
kubectl create configmap rideconnect-frontend-config \
  --from-literal=VITE_STRIPE_PUBLIC_KEY="pk_test_51RcbRKQO1CzAk8719wzDhu5HVpqje5xedXnkxFb5QB3v7hkfIWPlp0C8fmOBc0W9zREaRDkPpf0az8jA3BtoFyfv00cX1iwmKG" \
  --from-literal=VITE_OPENROUTE_API_KEY="5b3ce3597851110001cf6248c6ee16efbd6647219c95e4b3bc6a98fe" \
  --from-literal=VITE_LOCATIONIQ_API_KEY="pk.8580ce91c5b1b627b728eef6186f0dc1" \
  -n rideconnect
```

## 🔍 How to Verify

Check that everything was created:

```bash
# List secrets
kubectl get secrets -n rideconnect

# List configmaps  
kubectl get configmaps -n rideconnect

# View a secret (encoded in base64)
kubectl describe secret rideconnect-secrets -n rideconnect

# View a configmap (readable)
kubectl describe configmap rideconnect-backend-config -n rideconnect
```

## 🔄 How Your App Uses Them

The Kubernetes manifests automatically inject these as environment variables:

```yaml
# In your pods, this becomes:
env:
- name: MONGODB_URI
  valueFrom:
    secretKeyRef:
      name: rideconnect-secrets
      key: mongodb-uri
```

So your application code **doesn't change** - it still reads `process.env.MONGODB_URI` exactly like before!

## ⚠️ Important Notes

1. **Google Service Account File**: 
   - If you have `rideconnect-469322-ee88b741366b.json`, the script will create a secret from it
   - If not, you can add it later

2. **Database Connection**:
   - Your current `localhost:27017` won't work in Kubernetes
   - You'll need to either:
     - Use external MongoDB (like MongoDB Atlas)
     - Deploy MongoDB in Kubernetes using the provided StatefulSet

3. **Frontend Environment Variables**:
   - `VITE_*` variables are built into the React app at build time
   - They're included in the frontend configmap for the build process

## 🎯 Next Steps

1. Run the script: `./k8s/scripts/create-secrets.sh`
2. Verify secrets were created: `kubectl get secrets -n rideconnect`
3. Update MongoDB connection if needed for external database
4. Deploy: `kubectl apply -k k8s/overlays/development/`

Your application will work exactly the same - just more scalable and secure! 🚀