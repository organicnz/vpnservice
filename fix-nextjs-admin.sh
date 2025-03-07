#!/bin/bash

# Admin Panel Rebuild Script for Next.js "Service Temporarily Unavailable" issue
# This script forcefully rebuilds the Next.js admin panel to resolve the common build issues

set -eo pipefail

echo "===== Starting Admin Panel Complete Rebuild ====="
echo "This script will completely rebuild the admin panel to fix 'Service Temporarily Unavailable' issues"

# Ensure we're in the right directory
if [ -d "./vpnservice" ]; then
  cd ./vpnservice
fi

# Get environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  if [ -f ".env" ]; then
    echo "Loading environment variables from .env file"
    export $(grep -v '^#' .env | grep -v -e "^$" | xargs)
  else
    echo "ERROR: No .env file found and SUPABASE_URL/SUPABASE_KEY not set in environment"
    echo "Please create a .env file with SUPABASE_URL and SUPABASE_KEY or provide them as environment variables"
    exit 1
  fi
fi

# Ensure required variables are set
SUPABASE_URL=${SUPABASE_URL:-"https://xnigsihqhdydfrgrujrd.supabase.co"}
SUPABASE_KEY=${SUPABASE_KEY:-"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaWdzaWhxaGR5ZGZyZ3J1anJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTMyODgsImV4cCI6MjA1NjY4OTI4OH0.UuUjSuJ4D_xocFofw62hbMBOwmZPwQULRaL5enp2GnY"}
API_URL=${API_URL:-"http://backend:3000"}

echo "Using SUPABASE_URL: ${SUPABASE_URL}"
echo "Using SUPABASE_KEY: ${SUPABASE_KEY:0:10}..." # Only show first 10 chars for security
echo "Using API_URL: ${API_URL}"

# Step 1: Stop and remove the admin container
echo "Stopping and removing existing admin container..."
docker stop vpn-admin 2>/dev/null || echo "No container to stop"
docker rm vpn-admin 2>/dev/null || echo "No container to remove"

# Step 2: Remove existing admin panel image to force a clean rebuild
echo "Removing admin panel Docker image (if exists)..."
docker rmi vpnservice-admin 2>/dev/null || docker rmi vpn-admin-fixed 2>/dev/null || echo "No image to remove"

# Step 3: Create explicit Next.js environment files in the admin-panel directory
echo "Creating Next.js environment files..."
mkdir -p admin-panel
cat > admin-panel/.env << EOF
# Next.js runtime environment variables
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_KEY}
NEXT_PUBLIC_API_URL=${API_URL}
EOF

# Create all variations of Next.js environment files
cp admin-panel/.env admin-panel/.env.local
cp admin-panel/.env admin-panel/.env.production
cp admin-panel/.env admin-panel/.env.production.local

echo "Created environment files in admin-panel directory"

# Step 4: Create a custom Dockerfile that ensures proper Next.js environment variable handling
echo "Creating optimized Next.js Dockerfile..."
cat > admin-panel/Dockerfile.fixed << EOF
FROM node:20-alpine AS builder

WORKDIR /app

# Set build arguments and environment variables explicitly
ARG NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_KEY}"
ARG NEXT_PUBLIC_API_URL="${API_URL}"

ENV NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}

# Copy package files first for better cache utilization
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy application code
COPY . .

# Debug: Print environment variables to verify they're set at build time
RUN echo "Building with NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}"
RUN echo "Building with NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:10}..."
RUN echo "Building with NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}"

# Create env files explicitly at build time
RUN echo "NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}" > .env
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}" >> .env
RUN echo "NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}" >> .env
RUN cp .env .env.local
RUN cp .env .env.production
RUN cp .env .env.production.local

# Force Next.js to use production mode
ENV NODE_ENV=production

# Build the app with the environment variables
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set runtime environment variables
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_KEY}"
ENV NEXT_PUBLIC_API_URL="${API_URL}"

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env* ./

# Expose port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]
EOF

echo "Created custom Dockerfile at admin-panel/Dockerfile.fixed"

# Step 5: Build the admin panel with the specialized Dockerfile
echo "Building admin panel with specialized Dockerfile..."
docker build -t vpn-admin-fixed:latest -f admin-panel/Dockerfile.fixed ./admin-panel

# Step 6: Determine the network to use
echo "Finding network for container..."
NETWORK_NAME=$(docker network ls | grep vpn | head -1 | awk '{print $2}')
if [ -z "$NETWORK_NAME" ]; then
  NETWORK_NAME="vpn_vpn-network"
  echo "No existing network found, using default: $NETWORK_NAME"
  docker network create $NETWORK_NAME || echo "Network creation failed, it might already exist"
else
  echo "Using existing network: $NETWORK_NAME"
fi

# Step 7: Run the container with environment variables explicitly set
echo "Starting admin panel container..."
docker run -d \
  --name vpn-admin \
  --network $NETWORK_NAME \
  -p 8080:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="${SUPABASE_URL}" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="${SUPABASE_KEY}" \
  -e NEXT_PUBLIC_API_URL="${API_URL}" \
  -e NODE_ENV="production" \
  --restart unless-stopped \
  vpn-admin-fixed:latest

echo "Admin panel container started, waiting for initialization..."
sleep 10

# Step 8: Verify container status
echo "Checking container status..."
docker ps | grep vpn-admin || echo "WARNING: Container not found in running containers!"

# Step 9: View logs to check for errors
echo "Container logs:"
docker logs vpn-admin | tail -n 20

# Step 10: Test accessibility
echo "Testing admin panel accessibility..."
for i in {1..5}; do
  echo "Attempt $i of 5..."
  if curl -s --head http://localhost:8080 | grep -q "200 OK\|302 Found"; then
    echo "✅ Admin panel is accessible!"
    ADMIN_ACCESSIBLE=true
    break
  else
    echo "⚠️ Admin panel not yet accessible, waiting 5 seconds..."
    sleep 5
  fi
done

if [ "$ADMIN_ACCESSIBLE" != "true" ]; then
  echo "❌ Admin panel still shows 'Service Temporarily Unavailable'"
  echo "Please check the application logs for specific errors:"
  echo "  docker logs vpn-admin"
  echo ""
  echo "You can manually check the status in a few minutes at:"
  echo "  http://localhost:8080"
else
  echo ""
  echo "✅ Successfully rebuilt the admin panel container!"
  echo "The admin panel should now be accessible at:"
  echo "  http://localhost:8080"
fi

echo "===== Admin Panel Rebuild Complete =====" 