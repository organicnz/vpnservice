# Setting Up GitHub Actions Deployment

This guide will help you configure GitHub Actions to automatically deploy your VPN service to your Azure VM whenever you push changes to the main branch.

## Prerequisites

1. An Azure VM running at `vpn-service.germanywestcentral.cloudapp.azure.com`
2. SSH access to your Azure VM
3. Docker and Docker Compose installed on your Azure VM

## Step 1: Generate SSH Key Pair

If you don't already have an SSH key pair for GitHub Actions to use:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy"
# Don't use a passphrase as this will be used in automation
```

This will generate two files:
- `~/.ssh/id_ed25519` (private key)
- `~/.ssh/id_ed25519.pub` (public key)

## Step 2: Add Public Key to Azure VM

Add the public key to the authorized_keys file on your Azure VM:

```bash
# Copy the public key content
cat ~/.ssh/id_ed25519.pub

# On your Azure VM, add to authorized_keys
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Get SSH Known Hosts

To securely connect to your server, GitHub Actions needs to know its fingerprint:

```bash
ssh-keyscan vpn-service.germanywestcentral.cloudapp.azure.com
```

Save the output for the next step.

## Step 4: Add GitHub Secrets

In your GitHub repository:

1. Go to Settings > Secrets and variables > Actions
2. Add the following secrets:

- `SSH_PRIVATE_KEY`: The content of your private key file (~/.ssh/id_ed25519)
- `SSH_KNOWN_HOSTS`: The output from the ssh-keyscan command
- `SSH_USER`: Your username on the Azure VM
- `SUPABASE_URL`: Your Supabase URL
- `SUPABASE_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token

## Step 5: Trigger Deployment

The workflow will automatically run when you push to the main branch. You can also manually trigger it:

1. Go to Actions tab in your GitHub repository
2. Select "Deploy to Azure VM" workflow
3. Click "Run workflow"

## Troubleshooting

If your deployment fails:

1. Check the GitHub Actions logs for error messages
2. Verify that all secrets are correctly set
3. Ensure your Azure VM is reachable and SSH is properly configured
4. Check that Docker and Docker Compose are installed on your VM
5. Verify the server has proper permissions to pull from the GitHub repository 