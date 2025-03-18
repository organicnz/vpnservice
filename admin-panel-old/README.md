# VPN Subscription Admin Panel

A modern admin panel built with Next.js 14 and Supabase to manage VPN subscriptions, users, and servers.

## Features

- 🔒 Secure authentication with Supabase Auth
- 📊 Dashboard with key metrics
- 👥 User management
- 💳 Subscription plan management
- 🖥️ Server status monitoring
- 📱 Responsive design for all devices

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **State Management:** React Hooks
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Navigate to the admin-panel directory:
   ```bash
   cd admin-panel
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
5. Update `.env.local` with your Supabase credentials.

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
admin-panel/
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── dashboard/     # Dashboard pages
│   │   ├── login/         # Authentication pages
│   │   ├── page.tsx       # Home page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # Reusable components
│   ├── lib/               # Utility libraries
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── ...config files
```

## Integration with Backend

This admin panel is designed to work with your existing VPN subscription backend service. It connects to the same Supabase instance that your backend uses, providing a seamless admin experience.

## Deployment

This project can be easily deployed to Vercel or any other Next.js hosting provider. Make sure to set up the environment variables in your hosting dashboard.

```bash
npm run build
npm run start
```

## License

This project is licensed under the MIT License. 