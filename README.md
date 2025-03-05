# VPN Subscription Service

A modern VPN subscription management system with a Node.js backend and Next.js admin panel.

## Features

- 🔒 **Secure Authentication**: User authentication powered by Supabase
- 💳 **Subscription Management**: Handle customer subscriptions and payments
- 📊 **Admin Dashboard**: Modern Next.js admin interface with real-time data
- 🌐 **VPN Service Integration**: Automated provisioning of VPN credentials
- 🤖 **Telegram Bot**: Customer support and account management via Telegram
- 🚀 **Docker Deployment**: Containerized for easy deployment

## Architecture

This project consists of several components:

- **Backend API**: Node.js REST API service
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
   - Backend API: http://localhost:3000/api
   - Admin Panel: http://localhost:8080
   - Supabase Studio: http://localhost:54323

### Admin Panel Development

For frontend development:

```bash
cd admin-panel
npm install
npm run dev
```

### Backend Development

For backend API development:

```bash
cd backend
npm install
npm run dev
```

## Deployment

The application can be deployed using Docker Compose or through the provided GitHub Actions workflow:

1. Set up your production server with Docker and Docker Compose installed
2. Configure your production environment variables
3. Run `docker-compose -f docker-compose.prod.yml up -d`

### CI/CD

The project includes GitHub Actions workflows for continuous integration and deployment:

- `.github/workflows/ci.yml`: Runs tests and linting on every push
- `.github/workflows/deploy.yml`: Deploys to production when merging to main branch

## Project Structure

```
.
├── admin-panel/           # Next.js admin panel
├── backend/               # Node.js API server
├── .github/               # GitHub Actions workflows
├── docker-compose.yml     # Development Docker Compose
├── docker-compose.prod.yml # Production Docker Compose
└── .env.example           # Environment variables template
```

## Contributing

Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 