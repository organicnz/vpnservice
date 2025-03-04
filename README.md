# VPN Subscription Service

A VPN service targeted for Russian users, based on 3x-ui (Xray) with Telegram bot payment integration.

## Components

1. **VPN Server** - Based on 3x-ui/Xray
2. **Telegram Bot** - For user registration, subscription management, and payments
3. **Backend API** - Connects the VPN server with the Telegram bot
4. **Admin Panel** - For managing users and subscriptions

## Setup Instructions

### Prerequisites

- Docker and Docker Compose
- Telegram Bot Token (from BotFather)
- Server with a public IP address
- Domain name (recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/vpn-subscription-service.git
cd vpn-subscription-service
```

2. Configure the environment variables:
```bash
cp .env.example .env
# Edit .env file with your settings
```

3. Run the services:
```bash
docker-compose up -d
```

4. Access the admin panel at `https://your-domain.com/admin`

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
- MongoDB for data storage
- Docker for containerization

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 