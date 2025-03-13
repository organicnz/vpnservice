#!/bin/bash
# Script to update dependencies and regenerate package-lock.json

echo "=== Updating Backend Dependencies ==="
echo "This script will regenerate your package-lock.json"

# Install rimraf for clean removal
npm install -g rimraf

# Clean node_modules and package-lock.json
echo "Removing node_modules and package-lock.json..."
rimraf node_modules package-lock.json

# Install all dependencies
echo "Installing dependencies and generating new package-lock.json..."
npm install

echo "=== Dependencies Updated Successfully ==="
echo "You can now build and run the backend with the updated dependencies."
echo "Use 'docker-compose build backend && docker-compose up -d backend' to rebuild and start the backend." 