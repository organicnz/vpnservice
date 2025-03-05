# Setting Up Your VPN Subscription Service with Supabase

This guide will help you set up and run your VPN subscription service using Supabase as the backend database.

## Prerequisites

- Docker and Docker Compose installed
- A Telegram Bot token (you can get one from [@BotFather](https://t.me/botfather))
- A server with a public IP address

## Step 1: Set Up Your Supabase Database

1. Go to the SQL Editor in your Supabase dashboard at https://app.supabase.com
2. Create a new query
3. Paste the entire contents of the `backend/src/utils/supabase-schema.sql` file
4. Run the query to create all necessary tables and initial data

## Step 2: Update Server Addresses

The sample data includes server addresses like `server1.yourvpn.com`. You should update these to your actual server domains or IP addresses:

1. Go to the "Table Editor" in your Supabase dashboard
2. Select the "servers" table
3. Update the "address" field for each server to your actual domain or IP address

## Step 3: Update Environment Variables

1. Make sure your `.env` file has the following settings:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `SUPABASE_URL`: Your project URL (https://xnigsihqhdydfrgrujrd.supabase.co)
   - `SUPABASE_KEY`: Your anon key 
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
   - `VPN_DOMAIN`: Your VPN service domain

## Step 4: Start the Services

Run the following command to start all services:

```bash
docker-compose up -d
```

This will start:
- The 3x-ui VPN panel on port 54321
- The backend API on port 3000
- The admin panel on port 8080

## Step 5: Verify the Setup

1. Check if the services are running:
```bash
docker-compose ps
```

2. Test the API connection:
```bash
curl http://localhost:3000/api/supabase-status
```

3. Access the admin panel at http://your-server-ip:8080

## Step 6: Create an Admin User

The first user you need to create is an admin user. To do this:

1. Send a message to your Telegram bot to create a regular user account
2. In the Supabase dashboard, go to the "Table Editor" and select the "users" table
3. Find your user and change the "role" field from "user" to "admin"

## Troubleshooting

If you encounter any issues:

1. Check the logs:
```bash
docker-compose logs backend
```

2. Make sure your Supabase credentials are correct in the `.env` file
3. Verify that all tables were created in your Supabase database
4. Ensure your server can reach the Supabase API (no firewall blocking outbound requests)

## Security Considerations

- Keep your `.env` file secure
- Never expose your service role key
- Consider enabling SSL for your services in production 