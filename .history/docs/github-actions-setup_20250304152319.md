# Setting Up GitHub Actions Deployment for Azure VM

This guide will help you configure GitHub Actions to automatically deploy your VPN service to your Azure VM whenever you push changes to the main branch.

## Prerequisites

1. An Azure VM running at `vpn-service.germanywestcentral.cloudapp.azure.com`
2. SSH access to your Azure VM with username `organic`
3. Docker and Docker Compose installed on your Azure VM

## Step 1: Generate or Use Existing SSH Private Key

Since you already have a key at `~/.ssh/azure_id_rsa.pem`, you'll need to find the corresponding private key. If this is actually your private key (despite the .pem extension), you can use it directly. Otherwise, find the private key that corresponds to the public key you provided.

Typically, the private key would be at `~/.ssh/azure_id_rsa` (without the .pem extension).

## Step 2: Verify Your Public Key is Added to Azure VM

Your public key:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCb7T6hz3sH+wynfqhiTo8D3FzW0UR+aBpQna8u72b/vX4T0PV6Aii0/r4YlNGCf+l8wECs1kn2Z+OxsBHL2t5RS8H5l6YXNPDg5ciurwp4JlKbstxA90DMF8JKG7pbiNYpoqbIOP944rWzHeUNYTREdqWy8ghjPb7AKh+cDQPRGrgRUkoAg/Oy3fOI45WkT5hHoUARLEDEcYWto3ImSgts7OaJm8FmkZWKnoxGp5SqKeiIdvOGDEvJEJzK+fmRFYaytbNDesYZaVGhcnc30xl33OzyCp4OU738mKCea0KY0Vcos/tJjG+I8yT6n3KQl4KyETGY3T8wmmYJfejBJioMOqaCRuG6X4Rn5/SMdQ7fOECkvRzMrb8BbxzJYLUHKWb+Vk8WW5AWorbXdyrvV5yYTySthhhsuaj12fLp+SFTqbP8A5+xe2ijAcrgWi8VLhrx7aU/Wq2XTNJEm4lOq3W9OEIL5ncqfcYZOlb2MQa3c7axBcDF3JWs+irmk3ymi1E=
```

Make sure this public key is added to the `~/.ssh/authorized_keys` file on your Azure VM.

```bash
# Connect to your VM
ssh organic@vpn-service.germanywestcentral.cloudapp.azure.com

# Check if your key is already in authorized_keys
grep "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCb7T6hz3sH" ~/.ssh/authorized_keys

# If not found, add it
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCb7T6hz3sH+wynfqhiTo8D3FzW0UR+aBpQna8u72b/vX4T0PV6Aii0/r4YlNGCf+l8wECs1kn2Z+OxsBHL2t5RS8H5l6YXNPDg5ciurwp4JlKbstxA90DMF8JKG7pbiNYpoqbIOP944rWzHeUNYTREdqWy8ghjPb7AKh+cDQPRGrgRUkoAg/Oy3fOI45WkT5hHoUARLEDEcYWto3ImSgts7OaJm8FmkZWKnoxGp5SqKeiIdvOGDEvJEJzK+fmRFYaytbNDesYZaVGhcnc30xl33OzyCp4OU738mKCea0KY0Vcos/tJjG+I8yT6n3KQl4KyETGY3T8wmmYJfejBJioMOqaCRuG6X4Rn5/SMdQ7fOECkvRzMrb8BbxzJYLUHKWb+Vk8WW5AWorbXdyrvV5yYTySthhhsuaj12fLp+SFTqbP8A5+xe2ijAcrgWi8VLhrx7aU/Wq2XTNJEm4lOq3W9OEIL5ncqfcYZOlb2MQa3c7axBcDF3JWs+irmk3ymi1E=" >> ~/.ssh/authorized_keys
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

- `SSH_PRIVATE_KEY`: The content of your private key file (NOT the public key)
  - On your local machine, run: `cat ~/.ssh/azure_id_rsa` (or the path to your private key)
  - Copy the ENTIRE output including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines
  
- `SSH_KNOWN_HOSTS`: The output from the ssh-keyscan command from Step 3

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
6. If you get permission errors, make sure your user has Docker permissions:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ``` 