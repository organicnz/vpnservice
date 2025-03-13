# VPN Subscription Backend Service

A robust backend service for managing VPN subscriptions, built with TypeScript, Express, and Supabase.

## Features

- **User Authentication**: Secure signup and login with JWT-based authentication
- **Subscription Management**: Create, retrieve, and manage VPN subscriptions
- **Payment Integration**: Support for payment processing
- **VPN Account Management**: Create and manage VPN accounts
- **Admin Dashboard**: Admin-specific routes for service management
- **Telegram Bot Integration**: Connect with users via Telegram
- **Comprehensive Testing**: Jest-based test suite
- **Type Safety**: Built with TypeScript for enhanced developer experience

## Prerequisites

- Node.js (v20 or later)
- npm or yarn
- Supabase account for database
- (Optional) Telegram Bot Token

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd vpn-subscription-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Fill in the environment variables in the `.env` file:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_KEY`: Your Supabase anonymous key
   - `JWT_SECRET`: Secret key for JWT signing
   - (Optional) `TELEGRAM_BOT_TOKEN`: Your Telegram Bot token

## Database Setup

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Set up the following tables:
   - `profiles`: User profiles
   - `plans`: Subscription plans
   - `subscriptions`: User subscriptions
   - `vpn_accounts`: VPN credentials for users
   - `payments`: Payment records

Detailed SQL scripts for database setup are available in the `./database` directory.

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with hot-reload enabled.

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and receive JWT
- `GET /api/auth/profile`: Get current user profile

### Plans

- `GET /api/plans`: Get all available plans
- `GET /api/plans/:id`: Get a specific plan

### Subscriptions

- `GET /api/subscriptions`: Get user's subscriptions
- `GET /api/subscriptions/:id`: Get a specific subscription
- `POST /api/subscriptions`: Create a new subscription
- `PATCH /api/subscriptions/:id/status`: Update subscription status
- `POST /api/subscriptions/:id/renew`: Renew a subscription
- `GET /api/subscriptions/:id/vpn-accounts`: Get VPN accounts for a subscription

### System

- `GET /health`: Health check endpoint
- `GET /api/health`: API health check endpoint
- `GET /api/supabase-status`: Check Supabase connection status

## Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage report:

```bash
npm test -- --coverage
```

## Code Style and Linting

The project follows strict TypeScript and ESLint rules:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format
```

## Project Structure

```
src/
├── __tests__/        # Test files
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/           # Data models
├── routes/           # API routes
├── services/         # Business logic
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
├── app.ts            # Express app setup
└── index.ts          # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 