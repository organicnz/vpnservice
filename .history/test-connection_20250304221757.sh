#!/bin/bash

# Set script to exit immediately if any command fails
set -e

echo "===== Testing Supabase Connection ====="

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing required dependencies..."
  npm install @supabase/supabase-js dotenv --no-save
  
  # Check if npm install succeeded
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
  fi
fi

# Run the test script
echo "Running Supabase connection tests..."
node test-supabase-connection.js

# Capture the exit code from the Node script
NODE_EXIT_CODE=$?

# Exit with the same code as the Node script
exit $NODE_EXIT_CODE 