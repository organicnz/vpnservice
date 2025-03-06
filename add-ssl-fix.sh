#!/bin/bash

# This script updates the workflow file to add the SSL fix

# First, replace the https URLs with http
sed -i '' 's|echo "VPN Admin Panel: https://$DOMAIN:54321"|echo "VPN Admin Panel: http://$DOMAIN:54321"|' .github/workflows/workflow.yml
sed -i '' 's|echo "Backend API: https://$DOMAIN:3000"|echo "Backend API: http://$DOMAIN:3000"|' .github/workflows/workflow.yml

# Add the SSL fix environment variable
# Find the line number for NODE_ENV=production
LINE_NUM=$(grep -n 'echo "NODE_ENV=production" >> .env' .github/workflows/workflow.yml | cut -d: -f1)
NEXT_LINE=$((LINE_NUM + 1))

# Insert the SSL fix line after NODE_ENV
sed -i '' "${LINE_NUM}a\\
              echo \"SECURITY_PANEL_ENFORCE_HTTPS=false\" >> .env" .github/workflows/workflow.yml

# Add a block to ensure the SSL fix is applied even if .env already exists
# Find the line number that closes the if statement for .env creation
FI_LINE_NUM=$(tail -n +$NEXT_LINE .github/workflows/workflow.yml | grep -n "fi" | head -1 | cut -d: -f1)
FI_LINE_NUM=$((FI_LINE_NUM + NEXT_LINE - 1))
NEXT_FI_LINE=$((FI_LINE_NUM + 1))

# Insert the SSL fix check block after the "fi" line
sed -i '' "${FI_LINE_NUM}a\\
\\
            # Ensure SSL fix is applied even if .env already exists\\
            if [ -f \".env\" ] && ! grep -q \"SECURITY_PANEL_ENFORCE_HTTPS\" .env; then\\
              echo \"Adding SSL fix configuration to .env file...\"\\
              echo \"SECURITY_PANEL_ENFORCE_HTTPS=false\" >> .env\\
            fi" .github/workflows/workflow.yml

echo "Workflow file updated successfully with the SSL fix!" 