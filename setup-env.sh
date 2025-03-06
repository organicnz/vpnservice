#!/bin/bash

# setup-env.sh - Setup and test environment variables for VPN service
# Run this script to check and update your environment variables

echo "===== VPN Service Environment Setup ====="
echo "This script will help you set up and test your environment variables."

# Check if .env file exists
if [ -f ".env" ]; then
  echo "✅ .env file found"
  # Make a backup
  cp .env .env.backup
  echo "✅ Created backup at .env.backup"
else
  echo "⚠️ .env file not found, creating from .env.example"
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env from .env.example"
  else
    echo "❌ .env.example not found. Creating empty .env file"
    touch .env
  fi
fi

# Function to update environment variable
update_env_var() {
  local var_name=$1
  local var_description=$2
  local current_value=$(grep "^${var_name}=" .env | cut -d '=' -f2- || echo "")
  
  echo ""
  echo "Setting up: ${var_name}"
  echo "Description: ${var_description}"
  
  if [ -n "$current_value" ]; then
    echo "Current value: ${current_value}"
    read -p "Do you want to change it? (y/n): " change_it
    
    if [ "$change_it" = "y" ] || [ "$change_it" = "Y" ]; then
      read -p "Enter new value for ${var_name}: " new_value
      
      # Remove the variable if it exists
      sed -i.temp "/^${var_name}=/d" .env
      # Add the new value
      echo "${var_name}=${new_value}" >> .env
      echo "✅ Updated ${var_name}"
    else
      echo "✅ Kept current value for ${var_name}"
    fi
  else
    read -p "Enter value for ${var_name}: " new_value
    echo "${var_name}=${new_value}" >> .env
    echo "✅ Added ${var_name}"
  fi
}

# Setup Supabase variables
update_env_var "SUPABASE_URL" "Your Supabase project URL (e.g., https://xnigsihqhdydfrgrujrd.supabase.co)"
update_env_var "SUPABASE_KEY" "Your Supabase anon/public API key"
update_env_var "SUPABASE_SERVICE_ROLE_KEY" "Your Supabase service role key (for admin operations)"

# Setup Telegram Bot
update_env_var "TELEGRAM_BOT_TOKEN" "Your Telegram bot token from @BotFather"

# Setup 3x-ui panel
update_env_var "XUI_USERNAME" "Username for the 3x-ui panel"
update_env_var "XUI_PASSWORD" "Password for the 3x-ui panel"

# Other settings
update_env_var "NODE_ENV" "Environment (production, development, etc.)"
update_env_var "TIMEZONE" "Server timezone (e.g., Europe/Moscow)"

echo ""
echo "===== Environment Variables Check ====="

# Check for required variables
check_var() {
  local var_name=$1
  local value=$(grep "^${var_name}=" .env | cut -d '=' -f2- || echo "")
  
  if [ -n "$value" ]; then
    echo "✅ ${var_name} is set"
  else
    echo "⚠️ ${var_name} is not set"
  fi
}

# Required variables
check_var "SUPABASE_URL"
check_var "SUPABASE_KEY"
check_var "TELEGRAM_BOT_TOKEN"
check_var "XUI_USERNAME"
check_var "XUI_PASSWORD"

echo ""
echo "===== Testing Supabase Connection ====="

# Source the updated .env file
export $(grep -v '^#' .env | xargs)

# Test Supabase connection
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "⚠️ Supabase connection test skipped - SUPABASE_URL or SUPABASE_KEY not set"
else
  # Check if curl is available
  if ! command -v curl &> /dev/null; then
    echo "⚠️ curl not found, skipping connection test"
  else
    # Remove any trailing slash
    SUPABASE_URL_CLEAN=$(echo $SUPABASE_URL | sed 's/\/$//')
    
    # Try to connect
    echo "Testing connection to: $SUPABASE_URL_CLEAN"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL_CLEAN/rest/v1/" -H "apikey: $SUPABASE_KEY")
    
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 401 ] || [ "$HTTP_STATUS" -eq 404 ]; then
      echo "✅ Successfully connected to Supabase (HTTP Status: $HTTP_STATUS)"
    else
      echo "⚠️ Failed to connect to Supabase (HTTP Status: $HTTP_STATUS)"
    fi
  fi
fi

echo ""
echo "===== Next Steps ====="
echo "1. Start or restart your services with: docker-compose down && docker-compose up -d"
echo "2. Check your service logs with: docker logs vpn-backend"
echo "3. Test your backend API with: curl http://localhost:3000/health"
echo ""
echo "Environment setup complete!" 