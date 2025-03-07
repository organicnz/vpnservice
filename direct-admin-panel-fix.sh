#!/bin/bash

# Direct fix script for admin panel issues
# Run this script on the server to fix the admin panel
# Usage: ./direct-admin-panel-fix.sh

echo "===== Starting Admin Panel Fix Script ====="

# Navigate to the project directory
cd ~/dev/vpnservice

# 1. Check current environment
echo "Checking current environment..."
echo "Current .env file:"
grep "NEXT_PUBLIC" .env || echo "No NEXT_PUBLIC variables found"

# 2. Backup the current .env file
echo "Backing up .env file..."
cp .env .env.backup.$(date +%Y%m%d%H%M%S)

# 3. Clean up any existing NEXT_PUBLIC variables to avoid duplicates
echo "Cleaning up existing NEXT_PUBLIC variables..."
grep -v "NEXT_PUBLIC" .env > .env.new

# 4. Add the required NEXT_PUBLIC variables
echo "Adding NEXT_PUBLIC variables to .env file..."
cat >> .env.new << EOF
# Next.js Admin Panel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_KEY}
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# 5. Replace the old .env file with the new one
mv .env.new .env

# 6. Also make a direct .env.local file for the admin panel container
echo "Creating a direct .env.local file for the admin panel container..."
mkdir -p admin-panel
cat > admin-panel/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_KEY}
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# 7. Stop and remove the admin panel container
echo "Stopping and removing the admin panel container..."
docker-compose stop admin
docker-compose rm -f admin

# 8. Rebuild the admin panel completely
echo "Rebuilding the admin panel container..."
docker-compose build --no-cache admin

# 9. Start the admin panel
echo "Starting the admin panel container..."
docker-compose up -d admin

# 10. Wait for the container to initialize
echo "Waiting for the container to initialize (30 seconds)..."
sleep 30

# 11. Check if the container is running
echo "Checking if the admin panel container is running..."
if docker ps | grep -q vpn-admin; then
  echo "✅ Admin panel container is running"
else
  echo "❌ Admin panel container is not running"
  echo "Checking container logs:"
  docker logs vpn-admin
  exit 1
fi

# 12. Test the admin panel
echo "Testing admin panel accessibility..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "302" ]; then
  echo "✅ Admin panel is accessible (HTTP Status: $ADMIN_STATUS)"
else
  echo "⚠️ Admin panel returned HTTP Status: $ADMIN_STATUS"
fi

# 13. Check the logs
echo "Checking admin panel logs:"
docker logs vpn-admin | tail -n 30

echo "===== Admin Panel Fix Complete ====="
echo "You should now be able to access the admin panel at:"
echo "http://vpn-service.germanywestcentral.cloudapp.azure.com:8080"
echo ""
echo "If you're still experiencing issues, please check the logs using:"
echo "docker logs vpn-admin" 