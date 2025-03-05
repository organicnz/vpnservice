# VPN Service with Supabase and Telegram Bot

A complete VPN service solution with Supabase backend, Telegram bot for user interaction, and 3x-ui panel for VPN management.

## Components

- **3x-ui VPN Panel**: Manages VPN configuration and connections
- **Backend API**: Handles user management, payments, and subscription logic
- **Admin Panel**: Web interface for administrators
- **Telegram Bot**: User interface for registration and service management

## Deployment Options

### Local Deployment

```bash
# Clone the repository
git clone https://github.com/organicnz/vpnservice.git
cd vpnservice

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Start services
docker-compose up -d
```

### Azure Deployment

For deploying to Azure VMs:

1. Create an Azure VM and note its domain (example: vpn-service.germanywestcentral.cloudapp.azure.com)
2. Connect to your VM via SSH
3. Install Docker and Docker Compose on the VM
4. Clone this repository and set up environment variables
5. Start the services with `docker-compose up -d`

Make sure to open the required ports in Azure's Network Security Group:
- 54321 (VPN Admin Panel)
- 3000 (Backend API)
- 8080 (Admin Dashboard)
- 443 (HTTPS)
- 80 (HTTP)

### GitHub Token Authentication

For easier repository access without password prompts:

```bash
# Remove existing remote if present
git remote remove origin

# Add remote with token authentication
git remote add origin https://YOUR_GITHUB_TOKEN@github.com/organicnz/vpnservice.git

# Verify remote configuration
git remote -v
```

### Quick Commit & Push

One-liner to add, commit, and push all changes:

```bash
git add . && git commit -m "Type(scope): descriptive message" && git push -u origin main
```

Replace the commit message with an appropriate type and description following conventional commit format.

## Services

- VPN Admin Panel: https://your-domain:54321
- Backend API: https://your-domain:3000
- Admin Dashboard: https://your-domain:8080

## Features

- User registration via Telegram
- Multiple subscription plans
- Automated payment processing
- Traffic usage monitoring
- Geographic server selection
- Admin dashboard

## Technology Stack

- 3x-ui/Xray for VPN server
- Node.js for backend API
- Telegram Bot API
- Supabase for data storage
- Docker for containerization

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 