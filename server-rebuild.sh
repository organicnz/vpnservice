#!/bin/bash

# Script to completely rebuild the VPN service stack on the server
# This should be run on the server (via SSH)

echo "===== Starting Full VPN Service Rebuild on Server ====="
echo "This process will rebuild all containers with the latest changes"
echo ""

# Navigate to the project directory
cd ~/dev/vpnservice

# Pull latest changes from git
echo "Step 1: Pulling latest changes from repository..."
git pull

# Stop and remove all containers
echo "Step 2: Stopping and removing existing containers..."
docker-compose down

# Ensure the .env file has the SSL fix and NEXT_PUBLIC variables
echo "Step 3: Ensuring environment variables are properly set..."
if [ -f ".env" ]; then
  # Check for SSL fix
  if ! grep -q "SECURITY_PANEL_ENFORCE_HTTPS" .env; then
    echo "Adding SSL fix to .env file..."
    echo "SECURITY_PANEL_ENFORCE_HTTPS=false" >> .env
  fi
  
  # Check for NEXT_PUBLIC variables
  if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env; then
    echo "Adding NEXT_PUBLIC_SUPABASE_URL to .env file..."
    echo "NEXT_PUBLIC_SUPABASE_URL=\${SUPABASE_URL}" >> .env
  fi
  
  if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
    echo "Adding NEXT_PUBLIC_SUPABASE_ANON_KEY to .env file..."
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=\${SUPABASE_KEY}" >> .env
  fi
  
  if ! grep -q "NEXT_PUBLIC_API_URL" .env; then
    echo "Adding NEXT_PUBLIC_API_URL to .env file..."
    echo "NEXT_PUBLIC_API_URL=http://backend:3000" >> .env
  fi
  
  # Update VPN_DOMAIN if it's still set to the default
  if grep -q "VPN_DOMAIN=your-vpn-domain.com" .env; then
    echo "Updating VPN_DOMAIN to server domain..."
    sed -i 's/VPN_DOMAIN=your-vpn-domain.com/VPN_DOMAIN=vpn-service.germanywestcentral.cloudapp.azure.com/' .env
  fi
else
  echo "Error: .env file not found!"
  exit 1
fi

# Rebuild all images with no cache
echo "Step 4: Rebuilding all images (no cache)..."
docker-compose build --no-cache

# Start the stack
echo "Step 5: Starting the stack..."
docker-compose up -d

# Wait for services to start
echo "Waiting for services to initialize (30 seconds)..."
sleep 30

# Check running containers
echo "Step 6: Verifying running containers..."
docker ps

# Test service accessibility
echo "Step 7: Testing service accessibility..."

# Test VPN Admin Panel
echo "Testing VPN Admin Panel (xray-ui) accessibility..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:54321/ || echo "Failed")
if [ "$HTTP_STATUS" == "200" ] || [ "$HTTP_STATUS" == "302" ]; then
  echo "✅ VPN Admin Panel is accessible"
else
  echo "⚠️ VPN Admin Panel test failed - HTTP status: $HTTP_STATUS"
  echo "Checking xray-ui logs..."
  docker logs xray-ui | tail -n 20
fi

# Test Backend API
echo "Testing Backend API accessibility..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "Failed")
if [ "$API_STATUS" == "200" ]; then
  echo "✅ Backend API is accessible"
else
  echo "⚠️ Backend API test failed - HTTP status: $API_STATUS"
  echo "Checking backend logs..."
  docker logs vpn-backend | tail -n 20
fi

# Test Admin Dashboard
echo "Testing Admin Dashboard accessibility..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
if [ "$ADMIN_STATUS" == "200" ] || [ "$ADMIN_STATUS" == "302" ]; then
  echo "✅ Admin Dashboard is accessible"
else
  echo "⚠️ Admin Dashboard test failed - HTTP status: $ADMIN_STATUS"
  echo "Checking admin panel logs..."
  docker logs vpn-admin | tail -n 20
fi

echo ""
echo "===== Rebuild Complete ====="
echo "Service endpoints (local to server):"
echo "VPN Admin Panel: http://localhost:54321"
echo "Backend API: http://localhost:3000"
echo "Admin Dashboard: http://localhost:8080"
echo ""
echo "Service endpoints (external access):"
echo "VPN Admin Panel: http://vpn-service.germanywestcentral.cloudapp.azure.com:54321"
echo "Backend API: http://vpn-service.germanywestcentral.cloudapp.azure.com:3000"
echo "Admin Dashboard: http://vpn-service.germanywestcentral.cloudapp.azure.com:8080" 