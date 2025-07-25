# Multi-stage build for RideConnect application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application (frontend and backend)
RUN npm run build

# Fix server binding for Docker (replace localhost with 0.0.0.0 in built file)
RUN sed -i 's/"localhost"/"0.0.0.0"/g' dist/index.js

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S rideconnect -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies  
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=rideconnect:nodejs /app/dist ./dist

# Create symlink for static files so production server can find them
RUN ln -sf /app/dist/public /app/public

# Copy any additional runtime files
COPY --chown=rideconnect:nodejs . .

# Remove source files that aren't needed in production
RUN rm -rf client server shared *.ts *.config.* .env.example

# Switch to non-root user
USER rideconnect

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Set working directory and start the application
WORKDIR /app
CMD ["npm", "start"]