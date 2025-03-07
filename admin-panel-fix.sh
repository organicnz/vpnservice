#!/bin/bash
set -e

echo "===== Admin Panel Fix: Fixing Service Temporarily Unavailable ====="

# 1. Create backup of environment and configuration
echo "Creating backup of current environment..."
cp .env .env.backup.$(date +%Y%m%d%H%M%S) 2>/dev/null || echo "No .env file to backup"
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d%H%M%S)

# 2. Ensure Supabase variables are set correctly
echo "Setting up Supabase environment variables..."
SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env 2>/dev/null | cut -d= -f2 || echo "https://xnigsihqhdydfrgrujrd.supabase.co")
SUPABASE_KEY=$(grep -o "SUPABASE_KEY=.*" .env 2>/dev/null | cut -d= -f2 || echo "")

if [ -z "$SUPABASE_KEY" ]; then
  echo "⚠️ WARNING: SUPABASE_KEY is empty. Admin panel will not work without a valid key."
  echo "Please update this script with your actual Supabase key or update your .env file."
fi

# 3. Stop and remove the admin container
echo "Stopping and removing admin container..."
docker-compose stop admin
docker-compose rm -f admin

# 4. Create a directory to store environment files for volume mounting
echo "Setting up environment files for volume mounting..."
mkdir -p .admin-panel-env

# 5. Create environment files for Next.js
cat > .admin-panel-env/.env << EOF
# Next.js environment variables
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# Also create .env.local and .env.production for all possible Next.js env file locations
cp .admin-panel-env/.env .admin-panel-env/.env.local
cp .admin-panel-env/.env .admin-panel-env/.env.production
cp .admin-panel-env/.env .admin-panel-env/.env.production.local

# 6. Update docker-compose.yml to add volume mounts
echo "Updating docker-compose.yml with environment volume mounts..."

# Check if volumes section already exists for admin service
if grep -q "admin:.*volumes:" docker-compose.yml -A 5; then
  echo "Volumes section already exists, updating it..."
  # Remove existing environment file mounts if they exist
  sed -i '/\.admin-panel-env/d' docker-compose.yml
  
  # Find the line number where the volumes section is for the admin service
  ADMIN_VOL_LINE=$(grep -n "admin:.*volumes:" docker-compose.yml | cut -d: -f1)
  if [ -n "$ADMIN_VOL_LINE" ]; then
    # Add our volume mounts to the existing volumes section
    sed -i "${ADMIN_VOL_LINE}a\\      - ./.admin-panel-env/.env:/app/.env" docker-compose.yml
    sed -i "${ADMIN_VOL_LINE}a\\      - ./.admin-panel-env/.env.local:/app/.env.local" docker-compose.yml
    sed -i "${ADMIN_VOL_LINE}a\\      - ./.admin-panel-env/.env.production:/app/.env.production" docker-compose.yml
    sed -i "${ADMIN_VOL_LINE}a\\      - ./.admin-panel-env/.env.production.local:/app/.env.production.local" docker-compose.yml
  fi
else
  echo "Adding new volumes section for admin service..."
  # Find the admin service section
  ADMIN_LINE=$(grep -n "container_name: vpn-admin" docker-compose.yml | cut -d: -f1)
  if [ -n "$ADMIN_LINE" ]; then
    # Add a new volumes section
    sed -i "${ADMIN_LINE}a\\    volumes:\\n      - ./.admin-panel-env/.env:/app/.env\\n      - ./.admin-panel-env/.env.local:/app/.env.local\\n      - ./.admin-panel-env/.env.production:/app/.env.production\\n      - ./.admin-panel-env/.env.production.local:/app/.env.production.local" docker-compose.yml
  fi
fi

# 7. Modify the admin service in docker-compose.yml to use build args
echo "Updating build arguments in docker-compose.yml..."

# Make sure build args are set correctly
ADMIN_BUILD_LINE=$(grep -n "context: ./admin-panel" docker-compose.yml | cut -d: -f1)
if [ -n "$ADMIN_BUILD_LINE" ]; then
  # Check if args section exists
  if grep -q "args:" docker-compose.yml -A 5 | grep -q "NEXT_PUBLIC"; then
    echo "Build args section exists, updating it..."
    # Update existing build args
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY|g" docker-compose.yml
    sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://backend:3000|g" docker-compose.yml
  else
    echo "Adding build args section..."
    # Add build args section
    sed -i "s|context: ./admin-panel|context: ./admin-panel\\n      args:\\n        - NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL\\n        - NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_KEY\\n        - NEXT_PUBLIC_API_URL=http://backend:3000|g" docker-compose.yml
  fi
fi

# 8. Create a Dockerfile.fix for the admin panel that ensures env vars are available at build time
echo "Creating fixed Dockerfile for admin panel..."
mkdir -p .admin-panel-fix

cat > .admin-panel-fix/Dockerfile << EOF
FROM node:20-alpine AS builder

WORKDIR /app

# Set build arguments with defaults
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL=http://backend:3000

# Make build arguments available as environment variables during build
ENV NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci || npm install

# Copy the rest of the app
COPY . .

# Print environment variables for debugging
RUN echo "Building with NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}"
RUN echo "Building with NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
RUN echo "Building with NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}"

# Create env files explicitly at build time
RUN echo "NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}" > .env.production
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}" >> .env.production
RUN echo "NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}" >> .env.production

# Build the app
RUN npm run build

# Production image
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy necessary files from builder stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.production ./.env.production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -qO- http://localhost:3000 || exit 1

# Run the app
CMD ["npm", "start"]
EOF

# 9. Update docker-compose.yml to use the fixed Dockerfile
echo "Updating docker-compose.yml to use fixed Dockerfile..."
sed -i "s|dockerfile: Dockerfile|dockerfile: ../.admin-panel-fix/Dockerfile|g" docker-compose.yml

# 10. Rebuild the admin container
echo "Rebuilding admin container with fixed configuration..."
docker-compose build --no-cache admin

# 11. Start the containers
echo "Starting containers..."
docker-compose up -d

# 12. Wait for the admin panel to start
echo "Waiting for admin panel to start (45 seconds)..."
sleep 45

# 13. Check admin panel logs
echo "Admin panel logs:"
docker logs vpn-admin | tail -n 50

# 14. Test admin panel accessibility
echo "Testing admin panel accessibility..."
for i in {1..5}; do
  echo "Attempt $i..."
  ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
  if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "302" ]; then
    echo "✅ Admin panel is accessible (HTTP Status: $ADMIN_STATUS)"
    break
  else
    echo "⚠️ Admin panel returned HTTP Status: $ADMIN_STATUS"
    if [ $i -lt 5 ]; then
      echo "Waiting 10 seconds before trying again..."
      sleep 10
    fi
  fi
done

# 15. Display results
echo ""
echo "===== Admin Panel Fix Complete ====="
echo ""
echo "The admin panel should now be accessible at:"
echo "http://localhost:8080 (on server)"
echo "http://YOUR_SERVER_IP:8080 (externally)"
echo ""
echo "If you still see 'Service Temporarily Unavailable', please check the logs with:"
echo "docker logs vpn-admin"
echo ""
echo "You may need to wait a few more minutes for the build process to complete." 