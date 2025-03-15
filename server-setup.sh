#!/bin/bash
set -e

# Colorful output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}VPN Service Auto-Update Setup${NC}"
echo -e "${BLUE}===============================================${NC}"

# Create auto-update script
echo -e "${YELLOW}Creating auto-update script...${NC}"
cat > ~/dev/auto-update.sh << 'EOF'
#!/bin/bash
set -e

LOG_FILE="./auto-update.log"
REPO_PATH="/home/organic/dev/vpnservice"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "$TIMESTAMP - Starting auto-update process" >> "$LOG_FILE"

# Navigate to repository directory
cd "$REPO_PATH"

# Save current commit hash
BEFORE_PULL=$(git rev-parse HEAD)
echo "$TIMESTAMP - Current commit: $BEFORE_PULL" >> "$LOG_FILE"

# Pull latest changes
echo "$TIMESTAMP - Pulling latest changes..." >> "$LOG_FILE"
git pull >> "$LOG_FILE" 2>&1

# Get new commit hash
AFTER_PULL=$(git rev-parse HEAD)
echo "$TIMESTAMP - New commit: $AFTER_PULL" >> "$LOG_FILE"

# Check if there were changes
if [ "$BEFORE_PULL" != "$AFTER_PULL" ]; then
  echo "$TIMESTAMP - Changes detected. Restarting services..." >> "$LOG_FILE"
  
  # Check for docker-compose.yml
  if [ -f "$REPO_PATH/docker-compose.yml" ]; then
    echo "$TIMESTAMP - Running docker-compose..." >> "$LOG_FILE"
    cd "$REPO_PATH"
    docker-compose down >> "$LOG_FILE" 2>&1
    docker-compose pull >> "$LOG_FILE" 2>&1
    docker-compose up -d >> "$LOG_FILE" 2>&1
    echo "$TIMESTAMP - Services restarted successfully" >> "$LOG_FILE"
  else
    echo "$TIMESTAMP - No docker-compose.yml found!" >> "$LOG_FILE"
  fi
else
  echo "$TIMESTAMP - No changes detected" >> "$LOG_FILE"
fi

echo "$TIMESTAMP - Auto-update process completed" >> "$LOG_FILE"
EOF

chmod +x ~/dev/auto-update.sh
echo -e "${GREEN}Auto-update script created${NC}"

# Set up cron job
echo -e "${YELLOW}Setting up cron job...${NC}"
(crontab -l 2>/dev/null | grep -v "auto-update.sh"; echo "*/5 * * * * cd ~/dev && ./auto-update.sh >> auto-update.log 2>&1") | crontab -
echo -e "${GREEN}Cron job set up to run every 5 minutes${NC}"

# Create log file
touch ~/dev/auto-update.log
echo -e "${GREEN}Log file created${NC}"

# Run the script once
echo -e "${YELLOW}Running auto-update script for the first time...${NC}"
cd ~/dev && ./auto-update.sh
echo -e "${GREEN}Initial update completed${NC}"

echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}Setup complete! Your server will now automatically${NC}"
echo -e "${GREEN}check for updates every 5 minutes.${NC}"
echo -e "${BLUE}===============================================${NC}"

# Instructions to check logs
echo -e "${YELLOW}To check the update logs:${NC}"
echo -e "cat ~/dev/auto-update.log"
echo -e "${BLUE}===============================================${NC}" 