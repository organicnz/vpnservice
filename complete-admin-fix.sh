#!/bin/bash
set -e

echo "===== Complete Admin Panel Fix ====="
echo "This script fixes the 'Service Temporarily Unavailable' issue by addressing all potential causes"

# 1. Create backup of environment and configuration
echo "Creating backup of current environment..."
cp .env .env.backup.$(date +%Y%m%d%H%M%S) 2>/dev/null || echo "No .env file to backup"
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d%H%M%S) 2>/dev/null || echo "No docker-compose.yml file to backup"

# 2. Set the correct Supabase URL and key
echo "Setting up Supabase environment variables..."
SUPABASE_URL="https://xnigsihqhdydfrgrujrd.supabase.co"
# Try to get the key from various sources or use a default
SUPABASE_KEY=$(grep -o "SUPABASE_KEY=.*" .env 2>/dev/null | cut -d= -f2 || \
              docker exec vpn-backend env 2>/dev/null | grep SUPABASE_KEY | cut -d= -f2 || \
              echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuaWdzaWhxaGR5ZGZyZ3J1anJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExMTMyODgsImV4cCI6MjA1NjY4OTI4OH0.UuUjSuJ4D_xocFofw62hbMBOwmZPwQULRaL5enp2GnY")

echo "Using Supabase URL: $SUPABASE_URL"
echo "Using Supabase Key: ${SUPABASE_KEY:0:10}..." # Only show the first 10 characters for security

# 3. Create a directory for environment files
echo "Setting up environment files..."
mkdir -p .admin-fix

# 4. Create environment files with correct values
cat > .admin-fix/.env << EOF
# Next.js environment variables
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# Create copies for all possible Next.js env file locations
cp .admin-fix/.env .admin-fix/.env.local
cp .admin-fix/.env .admin-fix/.env.production
cp .admin-fix/.env .admin-fix/.env.production.local

# 5. Check if Docker is using compose or standalone
DOCKER_COMPOSE_AVAILABLE=false
if command -v docker-compose > /dev/null 2>&1; then
  DOCKER_COMPOSE_AVAILABLE=true
  echo "docker-compose is available"
elif docker compose version > /dev/null 2>&1; then
  DOCKER_COMPOSE_AVAILABLE=true
  echo "docker compose plugin is available"
else
  echo "Using standalone docker commands (no compose available)"
fi

# 6. Stop and remove the admin container
echo "Stopping and removing admin container..."
docker stop vpn-admin 2>/dev/null || true
docker rm vpn-admin 2>/dev/null || true

# 7. Check for docker network
NETWORK_NAME=$(docker network ls | grep vpn | head -1 | awk '{print $2}')
if [ -z "$NETWORK_NAME" ]; then
  NETWORK_NAME="vpn_vpn-network"
  echo "Creating docker network $NETWORK_NAME..."
  docker network create $NETWORK_NAME || true
else
  echo "Using existing network: $NETWORK_NAME"
fi

# 8. Create a multi-stage Dockerfile for the admin panel
echo "Creating optimized Dockerfile for Next.js..."
cat > .admin-fix/Dockerfile << EOF
FROM node:20-alpine AS builder

WORKDIR /app

# Set build arguments with defaults
ARG NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY"
ARG NEXT_PUBLIC_API_URL="http://backend:3000"

# Make build arguments available as environment variables during build
ENV NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}

# Copy package files
COPY admin-panel/package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy the rest of the app
COPY admin-panel/ .

# Print environment variables for debugging
RUN echo "Building with NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}"
RUN echo "Building with NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}"
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY is set: \${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:5}..."

# Create env files explicitly at build time
RUN echo "NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}" > .env
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}" >> .env
RUN echo "NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}" >> .env
RUN cp .env .env.local
RUN cp .env .env.production
RUN cp .env .env.production.local

# Build the app
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_KEY"
ENV NEXT_PUBLIC_API_URL="http://backend:3000"

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env* ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://localhost:3000 || exit 1

# Run the app
CMD ["npm", "start"]
EOF

# 9. Build the admin panel image
echo "Building admin panel image with correct environment variables..."
docker build -t vpn-admin-fixed:latest -f .admin-fix/Dockerfile .

# 10. Run the container with correct settings
echo "Starting admin panel container..."
docker run -d \
  --name vpn-admin \
  --network $NETWORK_NAME \
  -p 8080:3000 \
  -v $(pwd)/.admin-fix/.env:/app/.env \
  -v $(pwd)/.admin-fix/.env.local:/app/.env.local \
  -v $(pwd)/.admin-fix/.env.production:/app/.env.production \
  -v $(pwd)/.admin-fix/.env.production.local:/app/.env.production.local \
  --restart unless-stopped \
  --health-cmd="wget -qO- http://localhost:3000 || exit 1" \
  --health-interval=30s \
  --health-timeout=5s \
  --health-retries=3 \
  vpn-admin-fixed:latest

# 11. Wait for the container to start
echo "Waiting for admin panel to initialize (30 seconds)..."
sleep 30

# 12. Check container status and logs
echo "Admin panel container status:"
docker ps | grep vpn-admin

echo "Admin panel logs:"
docker logs vpn-admin | tail -n 30

# 13. Test accessibility
echo "Testing admin panel accessibility..."
for i in {1..5}; do
  echo "Attempt $i..."
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "302" ]; then
    echo "✅ Admin panel is accessible (HTTP Status: $HTTP_STATUS)"
    break
  else
    echo "⚠️ Admin panel returned HTTP Status: $HTTP_STATUS"
    if [ $i -lt 5 ]; then
      echo "Waiting 10 seconds before trying again..."
      sleep 10
    fi
  fi
done

# 14. Verify environment variables in container
echo "Verifying environment variables in container:"
docker exec vpn-admin env | grep NEXT_PUBLIC

echo ""
echo "===== Fix Complete ====="
echo ""
echo "The admin panel should now be accessible at:"
echo "http://localhost:8080 (on server)"
echo "http://YOUR_SERVER_IP:8080 (externally)"
echo ""
echo "If you still see 'Service Temporarily Unavailable':"
echo "1. Wait a few more minutes for the Next.js build to complete"
echo "2. Check the logs with: docker logs vpn-admin"
echo "3. Verify network connectivity between containers"
echo "4. Try accessing in an incognito/private browser window" 