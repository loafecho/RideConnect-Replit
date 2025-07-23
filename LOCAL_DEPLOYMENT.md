# Local Deployment Guide for RideConnect

## Prerequisites

Before running locally, make sure you have:
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git (for version control)

## Setup Instructions

### 1. Clone or Download the Project
If you want to commit to GitHub first:
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - RideConnect application"

# Add your GitHub repository
git remote add origin https://github.com/yourusername/rideconnect.git
git push -u origin main
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
You have two options:

#### Option A: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database: `createdb rideconnect`
3. Set DATABASE_URL: `postgresql://username:password@localhost:5432/rideconnect`

#### Option B: Cloud Database (Recommended)
Use a cloud service like:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app

### 4. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
NODE_ENV=development
```

### 5. Database Migration
```bash
npm run db:push
```

### 6. Start the Application
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Production Build
For production deployment:
```bash
npm run build
npm start
```

## Stripe Configuration (Optional)
To enable payments:
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Add them to your `.env` file

## Git Workflow
```bash
# Regular commits
git add .
git commit -m "Your commit message"
git push

# Create branches for features
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push -u origin feature/new-feature
```

## Troubleshooting
- If you get database connection errors, verify your DATABASE_URL
- If Stripe features don't work, check your API keys
- For port conflicts, the app uses port 5000 by default