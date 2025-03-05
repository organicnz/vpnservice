# Security Documentation

## Making this Project Public with GitHub Secrets

This document describes how to safely make this VPN service project public while protecting sensitive information using GitHub Secrets.

## What to Protect with GitHub Secrets

The following sensitive information should be stored as GitHub Secrets:

1. **API Keys and Tokens**
   - Supabase URL and API keys
   - Telegram Bot Token
   - Any other third-party service credentials

2. **Authentication Credentials**
   - VPN panel admin credentials (XUI_USERNAME, XUI_PASSWORD)
   - Database access credentials
   - SSH keys for deployment

3. **Environment-specific Configuration**
   - Production server information
   - Domain names and certificates

## Setting Up GitHub Secrets

### Step 1: Create GitHub Secrets

1. Navigate to your GitHub repository
2. Go to Settings > Secrets and variables > Actions
3. Click on "New repository secret"
4. Add the following secrets (adjust as needed for your setup):

| Secret Name | Description |
|-------------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `XUI_USERNAME` | Username for the VPN admin panel |
| `XUI_PASSWORD` | Password for the VPN admin panel |
| `SSH_PRIVATE_KEY` | Private SSH key for deployment |
| `SSH_KNOWN_HOSTS` | SSH known hosts for secure deployment |
| `TIMEZONE` | Server timezone (e.g., Europe/Moscow) |

### Step 2: Update Environment Files

Ensure your `.env.example` file exists but doesn't contain actual values:

```
# Telegram Bot Settings
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# 3x-ui Panel Settings
XUI_USERNAME=admin
XUI_PASSWORD=admin123

# Supabase Settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Additional settings...
```

### Step 3: Update Workflow Files

Our CI/CD workflow has been updated to use GitHub Secrets instead of hardcoded values. The workflow:

1. Deploys the application using secrets
2. Injects environment variables from GitHub Secrets
3. Runs tests to ensure everything is working

## Security Best Practices

1. **Never commit sensitive information** to the repository, even temporarily
2. Regularly **rotate credentials and update GitHub Secrets**
3. Use **environment-specific secrets** for staging and production
4. Set up branch protection rules to enforce **code reviews**
5. Enable **vulnerability alerts** for the repository

## Deployment with Secrets

The deployment process now uses GitHub Secrets for all sensitive information:

1. The workflow pulls secrets from GitHub and creates the `.env` file during deployment
2. Docker Compose uses these environment variables via variable substitution 
3. Container services access their required secrets via environment variables

## Securing Local Development

For local development:

1. Copy `.env.example` to `.env`
2. Add your development credentials to `.env`
3. Ensure `.env` is in `.gitignore` to prevent accidental commits

## Security Reporting

If you discover a security vulnerability within this project, please send an email to [security@yourdomain.com](mailto:security@yourdomain.com). All security vulnerabilities will be promptly addressed. 