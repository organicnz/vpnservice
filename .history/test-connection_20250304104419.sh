#!/bin/bash

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
  echo "Installing required dependencies..."
  npm install @supabase/supabase-js dotenv
fi

# Run the test script
echo "Testing Supabase connection..."
node test-supabase-connection.js 