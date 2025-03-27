#!/bin/bash

# Log file setup
LOG_FILE="auto-update.log"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Create log file if it doesn't exist
touch "$LOG_FILE"

# Log start
echo "$TIMESTAMP - Starting auto-update process" >> "$LOG_FILE"

# Pull latest changes
echo "$TIMESTAMP - Pulling latest changes..." >> "$LOG_FILE"
git pull >> "$LOG_FILE" 2>&1

# Check if pull was successful
if [ $? -eq 0 ]; then
    echo "$TIMESTAMP - Git pull successful, updating services..." >> "$LOG_FILE"
    
    # Stop current services
    echo "$TIMESTAMP - Stopping services..." >> "$LOG_FILE"
    docker compose down >> "$LOG_FILE" 2>&1
    
    # Pull latest images
    echo "$TIMESTAMP - Pulling latest images..." >> "$LOG_FILE"
    docker compose pull >> "$LOG_FILE" 2>&1
    
    # Start services with rebuild
    echo "$TIMESTAMP - Starting services..." >> "$LOG_FILE"
    docker compose up -d --build >> "$LOG_FILE" 2>&1
    
    # Clean up
    echo "$TIMESTAMP - Cleaning up..." >> "$LOG_FILE"
    docker system prune -f >> "$LOG_FILE" 2>&1
    
    echo "$TIMESTAMP - Update completed successfully" >> "$LOG_FILE"
else
    echo "$TIMESTAMP - Git pull failed, no updates applied" >> "$LOG_FILE"
fi
