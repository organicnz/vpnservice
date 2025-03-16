# VPN Subscription Service

A modern VPN subscription management system with a Node.js backend and Next.js admin panel.

## Features

- 🔒 **Secure Authentication**: User authentication powered by Supabase
- 💳 **Subscription Management**: Handle customer subscriptions and payments
- 📊 **Admin Dashboard**: Modern Next.js admin interface with real-time data
- 🌐 **VPN Service Integration**: Automated provisioning of VPN credentials
- 🤖 **Telegram Bot**: Customer support and account management via Telegram
- 🚀 **Docker Deployment**: Containerized for easy deployment
- 🔐 **GitHub Secrets Integration**: Secure configuration for public repositories
- 🔄 **Auto-Update System**: Automatic deployment and source code updates

## Quick Start - Automated Deployment

For the fastest possible setup, we provide an automated deployment process:

1. Go to the [Actions tab](../../actions/workflows/autopull.yml) in this repository
2. Click on the "Run workflow" button
3. Select "auto" from the dropdown and click "Run workflow"
4. Wait for the workflow to complete (usually takes less than a minute)
5. Download the deployment package from the Artifacts section
6. Transfer the package to your server
7. Extract and run the setup script:
   ```bash
   tar -xzf vpn-service-deployment.tar.gz
   chmod +x setup.sh
   ./setup.sh
   ```
8. Follow the on-screen instructions to complete the setup

This method will automatically:
- Install Docker and Docker Compose if needed
- Create a default configuration
- Set up the VPN admin panel and X-UI interface
- Configure everything for immediate use

## Architecture

This project consists of several components:

- **Admin Panel**: Next.js web application for administration
- **Database**: PostgreSQL managed by Supabase
- **VPN Server**: Integration with OpenVPN/WireGuard
- **Telegram Bot**: Node.js bot for customer interactions

## Prerequisites

- Node.js 20.x or higher
- Docker and Docker Compose
- Supabase account
- Telegram Bot token (for bot functionality)

## Getting Started

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vpnservice.git
   cd vpnservice
   ```

2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your own values.

4. Start the development environment:
   ```bash
   docker-compose up -d
   ```

5. Access the services:
   - Admin Panel: http://localhost:8080
   - Supabase Studio: http://localhost:54323

### Security and GitHub Secrets

This project is configured to use GitHub Secrets for protecting sensitive information. See the [SECURITY.md](SECURITY.md) file for detailed instructions on:

- Setting up GitHub Secrets
- What information to protect
- Secure deployment workflow
- Security best practices

When making this repository public, ensure all sensitive information is moved to GitHub Secrets and referenced appropriately in the CI/CD workflow.

### Admin Panel Development

For frontend development:

```bash
cd admin-panel
npm install
npm run dev
```

## Deployment

The application can be deployed using one of these methods:

### 1. Automated Deployment (Recommended)

Use our automated deployment workflow as described in the Quick Start section.

### 2. Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

### 3. GitHub Actions CI/CD

The project includes GitHub Actions workflows for continuous integration and deployment:

- `.github/workflows/workflow.yml`: Tests, builds, and deploys the application securely using GitHub Secrets
- `.github/workflows/autopull.yml`: Creates self-deployable packages for easy setup

## Project Structure

```
.
├── admin-panel/           # Next.js admin panel
├── .github/               # GitHub Actions workflows
├── docker-compose.yml     # Development Docker Compose
├── SECURITY.md            # Security documentation
└── .env.example           # Environment variables template
```

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 