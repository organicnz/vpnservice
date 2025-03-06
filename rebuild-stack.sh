#!/bin/bash

# Script to completely rebuild the VPN service stack
# This will pull the latest changes and rebuild all containers

echo "===== Starting Full VPN Service Rebuild ====="
echo "This process will rebuild all containers with the latest changes"
echo ""

# Pull latest changes from git
echo "Step 1: Pulling latest changes from repository..."
git pull

# Stop and remove all containers
echo "Step 2: Stopping and removing existing containers..."
docker-compose down

# Ensure the .env file has the SSL fix
echo "Step 3: Ensuring SSL fix is applied in .env file..."
if [ -f ".env" ] && ! grep -q "SECURITY_PANEL_ENFORCE_HTTPS" .env; then
  echo "Adding SSL fix to .env file..."
  echo "SECURITY_PANEL_ENFORCE_HTTPS=false" >> .env
else
  echo "SSL fix already present in .env file."
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
fi

# Test Backend API
echo "Testing Backend API accessibility..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "Failed")
if [ "$API_STATUS" == "200" ]; then
  echo "✅ Backend API is accessible"
else
  echo "⚠️ Backend API test failed - HTTP status: $API_STATUS"
fi

# Test Admin Dashboard
echo "Testing Admin Dashboard accessibility..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 || echo "Failed")
if [ "$ADMIN_STATUS" == "200" ] || [ "$ADMIN_STATUS" == "302" ]; then
  echo "✅ Admin Dashboard is accessible"
else
  echo "⚠️ Admin Dashboard test failed - HTTP status: $ADMIN_STATUS"
fi

echo ""
echo "===== Rebuild Complete ====="
echo "VPN Admin Panel: http://localhost:54321"
echo "Backend API: http://localhost:3000"
echo "Admin Dashboard: http://localhost:8080"
echo ""
echo "For remote access:"
echo "VPN Admin Panel: http://vpn-service.germanywestcentral.cloudapp.azure.com:54321"
echo "Backend API: http://vpn-service.germanywestcentral.cloudapp.azure.com:3000"
echo "Admin Dashboard: http://vpn-service.germanywestcentral.cloudapp.azure.com:8080" 