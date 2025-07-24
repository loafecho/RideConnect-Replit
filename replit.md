# RideConnect - Personal Driver Service Platform

## Overview

RideConnect is a full-stack web application that provides a personal driver booking service. The platform allows customers to book rides directly with trusted local drivers, offering a more reliable alternative to traditional ride-sharing services. The application features a modern React frontend with a Node.js/Express backend, integrated with Stripe for payments and PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 24, 2025**: Database and security improvements
- Fixed database connection error by creating PostgreSQL development database
- Removed demo admin key display from login page for better security
- Created all required database tables (users, sessions, time_slots, bookings)
- Application now running successfully with all API endpoints working
- Prepared for external database connection in production (192.168.1.188:5433)

**July 23, 2025**: Successfully migrated project from Replit Agent to Replit environment
- Set up PostgreSQL database with all required tables (users, sessions, timeSlots, bookings)
- Verified database connection and API endpoints are working
- Application running on port 5000 with hot reload enabled
- All dependencies properly installed and configured

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Session Management**: In-memory storage (development) with planned database integration
- **Payment Processing**: Stripe integration for secure payments
- **API Design**: RESTful API with JSON responses

### Data Storage Solutions
- **Database**: PostgreSQL via Neon serverless
- **ORM**: Drizzle ORM with schema-first approach
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Connection pooling via @neondatabase/serverless

## Key Components

### Authentication & Authorization
- Basic user management with admin roles
- Session-based authentication (planned)
- Admin-only routes for time slot and booking management

### Booking System
- **Time Slot Management**: Admins can create and manage available time slots
- **Booking Process**: Multi-step booking form with validation
- **Payment Integration**: Stripe checkout flow with payment intents
- **Status Tracking**: Booking status management (pending, confirmed, completed, cancelled)

### Admin Dashboard
- Time slot creation and management
- Booking overview and status updates
- Dashboard statistics and analytics
- Real-time booking status updates

### Payment Processing
- Stripe integration for secure card payments
- Payment intent creation and confirmation
- Webhook handling for payment status updates
- Refund and cancellation support

## Data Flow

1. **Booking Creation**: Customer fills booking form → validates data → creates booking record → generates Stripe payment intent
2. **Payment Processing**: Customer completes Stripe checkout → payment confirmed → booking status updated
3. **Admin Management**: Admins can view all bookings → update statuses → manage time slots
4. **Time Slot System**: Admins create available slots → customers select from available times → slots marked as booked

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection and querying
- **stripe**: Payment processing and webhooks
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for development

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with file watching for auto-restart
- **Database**: Neon serverless PostgreSQL
- **Environment**: Replit-optimized with custom error handling

### Production Build
- **Frontend**: Vite static build output
- **Backend**: esbuild bundle for Node.js
- **Assets**: Static file serving via Express
- **Database**: Managed PostgreSQL via environment variables

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API key for server-side operations  
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key for client-side integration

### Architecture Benefits
- **Separation of Concerns**: Clear separation between client, server, and shared code
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Developer Experience**: Hot reloading, error overlays, and integrated debugging
- **Scalability**: Serverless database with connection pooling
- **Security**: Secure payment processing with Stripe's PCI compliance
- **Maintainability**: Schema-driven database changes with Drizzle migrations

### Key Design Decisions
- **Monorepo Structure**: Shared schema and types between client and server
- **Memory Storage Fallback**: Development-friendly with planned database migration
- **Component Library**: shadcn/ui for consistent, accessible UI components
- **Payment Security**: Server-side payment intent creation for security
- **Real-time Updates**: TanStack Query for optimistic updates and cache management