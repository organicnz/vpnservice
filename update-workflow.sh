#!/bin/bash

# This script updates the workflow.yml file to include the SSL fix

# Find the line number where we need to add the SSL fix
ENV_LINE=$(grep -n "NODE_ENV=production" .github/workflows/workflow.yml | cut -d':' -f1)

# Calculate the lines to insert after
INSERT_LINE=$((ENV_LINE + 1))

# Create a temporary file with the lines to insert
cat > temp_insert.txt << 'EOF'
              echo "SECURITY_PANEL_ENFORCE_HTTPS=false" >> .env
            fi

            # Ensure SSL fix is applied even if .env already exists
            if [ -f ".env" ] && ! grep -q "SECURITY_PANEL_ENFORCE_HTTPS" .env; then
              echo "Adding SSL fix configuration to .env file..."
              echo "SECURITY_PANEL_ENFORCE_HTTPS=false" >> .env
EOF

# Use sed to insert the lines
sed -i '' "${INSERT_LINE}r temp_insert.txt" .github/workflows/workflow.yml

# Clean up
rm temp_insert.txt

echo "Workflow file updated successfully!" 