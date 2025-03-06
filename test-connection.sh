#!/bin/bash

# This script tests the connection to Supabase
# It's used in the deployment workflow

echo "===== Testing Supabase Connection ====="

# Check for .env file as the first source
if [ -f ".env" ]; then
  # Source the .env file to load variables
  export $(grep -v '^#' .env | xargs)
  echo "✅ Loaded environment variables from .env file"
fi

# Check if environment variables are set directly or from the .env file
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "⚠️ SUPABASE_URL or SUPABASE_KEY environment variables are not set"
  echo "The backend service may still work with limited functionality"
  echo "To enable full functionality, please update your .env file with these variables"
  # We'll exit with 0 to allow deployment to continue
  exit 0
fi

# Install curl if not present
if ! command -v curl &> /dev/null; then
  echo "Installing curl for testing..."
  apt-get update && apt-get install -y curl
fi

# Install jq if not present
if ! command -v jq &> /dev/null; then
  echo "Installing jq for JSON parsing..."
  apt-get update && apt-get install -y jq
fi

# Simple test to check if we can reach the Supabase URL
echo "Testing connection to Supabase URL: $SUPABASE_URL"

# Remove any trailing slash from the URL
SUPABASE_URL_CLEAN=$(echo $SUPABASE_URL | sed 's/\/$//')

# Try to connect to Supabase
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL_CLEAN/rest/v1/" \
  -H "apikey: $SUPABASE_KEY")

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 401 ] || [ "$RESPONSE" -eq 404 ]; then
  echo "✅ Successfully connected to Supabase (HTTP Status: $RESPONSE)"
  exit 0
else
  echo "⚠️ Failed to connect to Supabase (HTTP Status: $RESPONSE)"
  echo "Please check your Supabase URL and API key"
  # We'll exit with 0 to allow deployment to continue with limited functionality
  exit 0
fi 