# RideConnect

A comprehensive ride-sharing platform connecting drivers and passengers.

## Features

- User registration and authentication
- Real-time ride booking and matching
- Driver and passenger dashboards
- Payment processing integration
- Admin management interface

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (copy `.env.example` to `.env`)
4. Push database schema: `npm run db:push`
5. Run the application: `npm run dev`

### Docker Deployment

#### Quick Start
```bash
# Pull and run the latest image
docker run -d \
  --name rideconnect \
  -p 5000:5000 \
  -e DATABASE_URL="your_database_url" \
  antg98/main-repo:latest
```

#### Using Docker Compose
```yaml
version: '3.8'
services:
  rideconnect:
    image: antg98/main-repo:latest
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/rideconnect
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=rideconnect
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `STRIPE_SECRET_KEY` - Stripe secret key (optional)
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key (optional)
- `NODE_ENV` - Environment (development/production)

#### Build from Source
```bash
# Clone and build
git clone <repository-url>
cd RideConnect
docker build -t rideconnect:latest .
docker run -p 5000:5000 rideconnect:latest
```

## Project Structure

- Frontend: Modern web interface for users
- Backend: API services and business logic
- Admin: Management dashboard for platform operations

## Contributing

Please ensure all code follows the established conventions and passes linting/type checking before submitting changes.