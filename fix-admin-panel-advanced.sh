#!/bin/bash

# Advanced fix script for admin panel issues
# Run this script on the server to fix the admin panel
# Usage: ./fix-admin-panel-advanced.sh

echo "===== Starting Advanced Admin Panel Fix ====="

# Navigate to the project directory
cd ~/dev/vpnservice

# 1. Check and fix docker-compose.yml if needed
echo "Checking docker-compose.yml configuration..."
if ! grep -q "NEXT_PUBLIC" docker-compose.yml; then
  echo "⚠️ Docker-compose.yml might be missing NEXT_PUBLIC environment variables"
fi

# 2. Backup current environment
echo "Creating backup of current environment..."
cp .env .env.backup.$(date +%Y%m%d%H%M%S)
docker-compose config > docker-compose-config.backup.$(date +%Y%m%d%H%M%S)

# 3. Ensure we have the latest code
echo "Pulling latest code..."
git pull origin main

# 4. Stop and remove all containers to ensure clean state
echo "Stopping all containers..."
docker-compose down

# 5. Display Supabase values for verification
echo "Current Supabase configuration:"
grep "SUPABASE" .env || echo "No Supabase variables found in .env"

# 6. Create a completely new .env file with all required variables
echo "Creating new .env file with all required variables..."
cat > .env.new << EOF
# Basic configuration
NODE_ENV=production
TIMEZONE=UTC
SECURITY_PANEL_ENFORCE_HTTPS=false

# Supabase configuration
SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env | cut -d= -f2 || echo "https://xnigsihqhdydfrgrujrd.supabase.co")
SUPABASE_KEY=$(grep -o "SUPABASE_KEY=.*" .env | cut -d= -f2 || echo "your-supabase-key")
SUPABASE_SERVICE_ROLE_KEY=$(grep -o "SUPABASE_SERVICE_ROLE_KEY=.*" .env | cut -d= -f2 || echo "your-service-role-key")

# Next.js admin panel configuration - explicit values
NEXT_PUBLIC_SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env | cut -d= -f2 || echo "https://xnigsihqhdydfrgrujrd.supabase.co")
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep -o "SUPABASE_KEY=.*" .env | cut -d= -f2 || echo "your-supabase-key")
NEXT_PUBLIC_API_URL=http://backend:3000

# Telegram bot
TELEGRAM_BOT_TOKEN=$(grep -o "TELEGRAM_BOT_TOKEN=.*" .env | cut -d= -f2 || echo "your-telegram-token")

# VPN configuration
VPN_DOMAIN=$(grep -o "VPN_DOMAIN=.*" .env | cut -d= -f2 || echo "vpn-service.germanywestcentral.cloudapp.azure.com")
VPN_ADMIN_EMAIL=$(grep -o "VPN_ADMIN_EMAIL=.*" .env | cut -d= -f2 || echo "admin@example.com")
XUI_USERNAME=$(grep -o "XUI_USERNAME=.*" .env | cut -d= -f2 || echo "admin")
XUI_PASSWORD=$(grep -o "XUI_PASSWORD=.*" .env | cut -d= -f2 || echo "admin")
XRAY_VMESS_AEAD_FORCED=$(grep -o "XRAY_VMESS_AEAD_FORCED=.*" .env | cut -d= -f2 || echo "false")
EOF

# 7. Replace the existing .env file
echo "Replacing .env file..."
mv .env.new .env
chmod 600 .env

# 8. Create .env file specifically for the admin panel
echo "Creating .env files for admin panel..."
mkdir -p admin-panel
cat > admin-panel/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env | cut -d= -f2)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep -o "SUPABASE_KEY=.*" .env | cut -d= -f2)
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# 9. Create a direct fix volume with the environment variables
echo "Creating environment fix directory..."
rm -rf .admin-panel-fix
mkdir -p .admin-panel-fix
cat > .admin-panel-fix/.env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env | cut -d= -f2)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep -o "SUPABASE_KEY=.*" .env | cut -d= -f2)
NEXT_PUBLIC_API_URL=http://backend:3000
EOF

# 10. Modify docker-compose.yml to add the direct volume mounting
echo "Adding environment fix volume to docker-compose..."
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d%H%M%S)
VOLUME_LINE="      - ./.admin-panel-fix/.env.local:/app/.env.local"

if ! grep -q ".admin-panel-fix/.env.local:/app/.env.local" docker-compose.yml; then
  # Find the admin service section
  ADMIN_LINE=$(grep -n "container_name: vpn-admin" docker-compose.yml | cut -d: -f1)
  if [ -n "$ADMIN_LINE" ]; then
    # Find the volumes section or add it
    VOLUMES_LINE=$(tail -n +$ADMIN_LINE docker-compose.yml | grep -n "volumes:" | head -1 | cut -d: -f1)
    if [ -n "$VOLUMES_LINE" ]; then
      VOLUMES_LINE=$((ADMIN_LINE + VOLUMES_LINE - 1))
      # Add our volume to the volumes section
      sed -i "${VOLUMES_LINE}a\\${VOLUME_LINE}" docker-compose.yml
    else
      # Add a new volumes section
      VOLUMES_INSERT="    volumes:\n${VOLUME_LINE}"
      sed -i "/container_name: vpn-admin/a\\${VOLUMES_INSERT}" docker-compose.yml
    fi
  fi
fi

# 11. Rebuild the admin container completely
echo "Rebuilding the admin panel container..."
docker-compose build --no-cache admin

# 12. Start the containers
echo "Starting all containers..."
docker-compose up -d

# 13. Wait for containers to start
echo "Waiting for containers to initialize (45 seconds)..."
sleep 45

# 14. Check container status
echo "Checking container status..."
docker ps
docker logs vpn-admin | tail -n 50

# 15. Test admin panel accessibility
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

# 16. Add a new volume to point directly to the .env file inside the container
if [ "$ADMIN_STATUS" != "200" ] && [ "$ADMIN_STATUS" != "302" ]; then
  echo "⚠️ Still having issues. Trying alternative approach..."
  docker-compose stop admin
  
  # Create a direct environment file for the container
  cat > .admin-panel-fix/.env.production.local << EOF
NEXT_PUBLIC_SUPABASE_URL=$(grep -o "SUPABASE_URL=.*" .env | cut -d= -f2)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$(grep -o "SUPABASE_KEY=.*" .env | cut -d= -f2)
NEXT_PUBLIC_API_URL=http://backend:3000
EOF
  
  # Update docker-compose with additional volume
  if ! grep -q ".admin-panel-fix/.env.production.local:/app/.env.production.local" docker-compose.yml; then
    VOLUME_LINE="      - ./.admin-panel-fix/.env.production.local:/app/.env.production.local"
    ADMIN_LINE=$(grep -n "container_name: vpn-admin" docker-compose.yml | cut -d: -f1)
    VOLUMES_LINE=$(tail -n +$ADMIN_LINE docker-compose.yml | grep -n "volumes:" | head -1 | cut -d: -f1)
    if [ -n "$VOLUMES_LINE" ]; then
      VOLUMES_LINE=$((ADMIN_LINE + VOLUMES_LINE))
      sed -i "${VOLUMES_LINE}a\\${VOLUME_LINE}" docker-compose.yml
    fi
  fi
  
  # Restart the admin container
  docker-compose up -d admin
  
  echo "Waiting 30 seconds for the container to initialize with new configuration..."
  sleep 30
  
  # Test again
  ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
  if [ "$ADMIN_STATUS" = "200" ] || [ "$ADMIN_STATUS" = "302" ]; then
    echo "✅ Admin panel is now accessible with alternative configuration (HTTP Status: $ADMIN_STATUS)"
  else
    echo "❌ Admin panel still not accessible (HTTP Status: $ADMIN_STATUS)"
  fi
fi

# 17. Check final logs
echo "Final admin panel logs:"
docker logs vpn-admin | tail -n 30

echo "===== Admin Panel Fix Complete ====="
echo ""
echo "You should now be able to access the admin panel at:"
echo "http://vpn-service.germanywestcentral.cloudapp.azure.com:8080"
echo ""
echo "If you're still experiencing issues, please check the logs using:"
echo "docker logs vpn-admin"
echo ""
echo "Restart manually if needed with:"
echo "docker-compose restart admin" 