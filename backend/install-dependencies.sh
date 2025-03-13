#!/bin/bash

# Script to install all the dependencies required for the refactored backend

echo "Installing backend dependencies..."

# Navigate to the backend directory
cd "$(dirname "$0")"

# Get the current package.json
if [ ! -f package.json ]; then
  echo "Error: package.json not found. Please run this script from the backend directory."
  exit 1
fi

# Backup the current package.json
cp package.json package.json.bak

# Install dependencies from our generated file
DEPENDENCIES=$(cat package.dependencies.json)
DEPS_JSON=$(echo $DEPENDENCIES | jq -r '.dependencies')

# Update package.json with the new dependencies
TMP_FILE=$(mktemp)
jq --argjson deps "$DEPS_JSON" '.dependencies = (.dependencies // {}) + $deps' package.json > "$TMP_FILE"
mv "$TMP_FILE" package.json

# Install dependencies
echo "Installing npm packages..."
npm install

# Clean up temporary files
rm -f package.add.json package.security.json package.cache.json package.logger.json package.dependencies.json

echo "Dependencies installed successfully!"
echo "Original package.json backed up to package.json.bak" 