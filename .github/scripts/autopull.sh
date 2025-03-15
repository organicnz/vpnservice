#!/bin/bash
set -e

echo "==============================================="
echo "VPN Service Auto-Pull Script"
echo "==============================================="
echo "🔄 Auto-pull triggered on $(date)"

# Check if code directory exists
if [ ! -d "code" ]; then
  echo "Creating code directory..."
  mkdir -p code
  cd code
  git clone https://github.com/organicnz/vpnservice.git .
  echo "Repository cloned successfully."
else
  cd code
  echo "Updating existing repository..."
  git fetch origin
  git reset --hard origin/main
  echo "Repository updated to latest commit."
fi

# Check if we need to rebuild and redeploy
if [ -f "need_deploy" ]; then
  echo "Deployment flag found. Starting deployment process..."
  cd ..
  
  # Check if there's a docker-compose file
  if [ -f "docker-compose.yml" ]; then
    echo "🛑 Stopping existing services..."
    docker-compose down
    
    echo "🔄 Pulling latest images..."
    docker-compose pull
    
    echo "🚀 Starting services..."
    docker-compose up -d
    
    echo "✅ Services deployed successfully!"
  fi
  
  # Remove the deployment flag
  rm -f code/need_deploy
  echo "Deployment flag cleared."
else
  echo "No deployment needed at this time."
fi

echo "✅ Auto-pull completed at $(date)" 