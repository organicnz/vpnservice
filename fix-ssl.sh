#!/bin/bash

# Script to fix SSL issues with the VPN admin panel
echo "Starting SSL fix script..."

# Pull the latest changes
echo "Pulling the latest changes from git..."
git pull

# Restart the services
echo "Restarting the docker containers..."
docker-compose down
docker-compose up -d

echo "Waiting for services to start..."
sleep 10

# Check if the xray-ui container is running
if docker ps | grep -q xray-ui; then
  echo "✅ xray-ui container is running"
else
  echo "❌ xray-ui container failed to start"
  echo "Checking logs:"
  docker logs xray-ui
  exit 1
fi

echo "✅ SSL fix applied successfully!"
echo "You should now be able to access the admin panel at:"
echo "http://vpn-service.germanywestcentral.cloudapp.azure.com:54321/"
echo ""
echo "Default credentials (if not changed):"
echo "Username: admin"
echo "Password: admin"
echo ""
echo "Note: The panel is now accessible via HTTP instead of HTTPS" 