# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RideConnect is a full-stack TypeScript ride-sharing platform that connects passengers with drivers. It features a modern React frontend, Express.js backend, PostgreSQL database with Drizzle ORM, and Stripe payment integration.

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment variables (copy from .env.example)
cp .env.example .env

# Push database schema
npm run db:push

# Start development server (serves both frontend and backend on port 5000)
npm run dev

# Type checking
npm run check

# Production build
npm run build

# Start production server
npm start
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and dev server
- **Tailwind CSS** for styling
- **shadcn/ui** component library (Radix UI primitives)
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** with PostgreSQL
- **Stripe** for payment processing
- **Express Session** for session management
- **Passport** for authentication (configured but simplified)

### Database
- **PostgreSQL** (via Neon serverless)
- **Drizzle Kit** for migrations
- **Connection pooling** via @neondatabase/serverless

## Project Structure

```
RideConnect/
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── navbar.tsx   # Main navigation
│   │   │   └── footer.tsx   # Site footer
│   │   ├── pages/           # Route components
│   │   │   ├── landing.tsx  # Public landing page
│   │   │   ├── home.tsx     # Authenticated home
│   │   │   ├── booking.tsx  # Ride booking form
│   │   │   ├── checkout.tsx # Payment checkout
│   │   │   ├── admin.tsx    # Admin dashboard
│   │   │   └── admin-login.tsx # Admin login
│   │   ├── hooks/           # Custom React hooks
│   │   │   ├── useAuth.ts   # Authentication hook
│   │   │   └── use-toast.ts # Toast notifications
│   │   ├── lib/             # Utility functions
│   │   │   ├── utils.ts     # General utilities
│   │   │   ├── queryClient.ts # TanStack Query setup
│   │   │   └── authUtils.ts # Auth utilities
│   │   ├── App.tsx          # Main app component
│   │   ├── main.tsx         # React entry point
│   │   └── index.css        # Global styles
│   └── index.html           # HTML template
├── server/                   # Backend Express app
│   ├── index.ts             # Server entry point
│   ├── routes.ts            # API route definitions
│   ├── db.ts                # Database connection
│   ├── storage.ts           # Data access layer
│   ├── vite.ts              # Vite integration
│   └── replitAuth.ts        # Authentication setup
├── shared/                  # Shared types and schemas
│   └── schema.ts            # Drizzle database schema
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── drizzle.config.ts        # Database configuration
├── tailwind.config.ts       # Tailwind CSS config
├── components.json          # shadcn/ui configuration
└── tsconfig.json            # TypeScript configuration
```

## Database Schema

The application uses 4 main tables:

1. **users** - User accounts with admin roles
2. **sessions** - Session storage (required for auth)
3. **timeSlots** - Available booking time slots
4. **bookings** - Customer ride bookings with payment tracking

Key relationships:
- Bookings reference time slots by date/time string
- Payment integration via Stripe payment intent IDs

## Environment Variables

Required environment variables (see `.env.example`):

```env
DATABASE_URL=postgresql://username:password@localhost:5432/rideconnect
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here  # Optional
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here  # Optional  
NODE_ENV=development
```

**Note**: Stripe keys are optional - the app runs without payment features for development.

## Key Features

### Authentication
- Simple admin authentication using hardcoded key ('admin123')
- Session-based auth with localStorage fallback
- Admin-only routes for management features

### Booking System
- Multi-step booking form with validation
- Time slot selection and availability checking
- Customer information collection
- Price estimation and payment processing

### Admin Dashboard
- Time slot creation and management
- Booking overview and status updates
- Dashboard with booking statistics

### Payment Processing
- Stripe integration for secure payments
- Payment intent creation and confirmation
- Checkout flow with error handling

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user info (requires admin key)

### Time Slots
- `GET /api/timeslots/:date` - Get available slots for date
- `POST /api/timeslots` - Create new time slot (admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (admin only)
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking status (admin only)

### Payments
- `POST /api/create-payment-intent` - Create Stripe payment intent
- `POST /api/confirm-payment` - Confirm payment completion

## Development Notes

### Port Configuration
- Development server runs on port 5000 (both frontend and backend)
- Frontend is served via Vite dev server in development
- Backend API routes are prefixed with `/api`

### Hot Reloading
- Frontend: Vite HMR for instant updates
- Backend: tsx with file watching for auto-restart

### Type Safety
- Shared schema definitions in `/shared/schema.ts`
- Full TypeScript coverage across frontend and backend
- Zod validation for API inputs and forms

### Path Aliases
- `@/*` - Points to `client/src/*`
- `@shared/*` - Points to `shared/*`

## Build Process

### Development
```bash
npm run dev  # Starts both frontend (Vite) and backend (tsx)
```

### Production
```bash
npm run build  # Builds frontend (Vite) + backend (esbuild)
npm start      # Serves built app on port 5000
```

### Database
```bash
npm run db:push  # Push schema changes to database
```

## Deployment Considerations

### Database
- Uses Neon serverless PostgreSQL for scalability
- Connection pooling handled automatically
- Schema migrations via Drizzle Kit

### Environment
- Originally designed for Replit deployment
- Includes Replit-specific plugins in development
- Easily adaptable to other hosting platforms

### Static Assets
- Frontend builds to `dist/public`
- Backend serves static files in production
- All assets bundled and optimized

## Common Development Tasks

### Adding New Pages
1. Create component in `client/src/pages/`
2. Add route in `client/src/App.tsx`
3. Update navigation in `client/src/components/navbar.tsx`

### Adding API Endpoints
1. Add route handler in `server/routes.ts`
2. Create data access methods in `server/storage.ts`
3. Add TypeScript types in `shared/schema.ts`

### Adding UI Components
1. Use shadcn/ui CLI: `npx shadcn@latest add [component]`
2. Components auto-installed to `client/src/components/ui/`
3. Import and use in your pages/components

### Database Changes
1. Modify schema in `shared/schema.ts`
2. Run `npm run db:push` to apply changes
3. Update TypeScript types automatically via Drizzle

## Troubleshooting

### Common Issues
- **Database connection errors**: Verify `DATABASE_URL` in `.env`
- **Port conflicts**: App uses port 5000, ensure it's available
- **Payment features not working**: Stripe keys are optional for development
- **TypeScript errors**: Run `npm run check` to verify types

### Development Tips
- Use browser dev tools to inspect API calls
- Check terminal for backend logs and errors
- TanStack Query dev tools available for debugging state
- Database queries logged in development mode

## Architecture Benefits

- **Monorepo structure** with shared types between frontend/backend
- **Type safety** end-to-end with TypeScript and Zod validation
- **Modern UI** with accessible components via Radix UI
- **Performance** optimized with React Query caching and Vite bundling
- **Scalability** ready with serverless database and stateless backend
- **Security** with server-side payment processing and input validation

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.