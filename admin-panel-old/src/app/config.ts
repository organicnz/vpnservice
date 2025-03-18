/**
 * Global application configuration
 * This file contains shared configuration used across the application
 */

// Force all pages to be server-rendered (improves build reliability)
export const dynamic = 'force-dynamic';

// Application configuration settings
export const APP_CONFIG = {
  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000, // 10 seconds
    retryCount: 3,
  },
  
  // Supabase configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  
  // Application settings
  app: {
    name: 'VPN Management Dashboard',
    logoUrl: '/logo.png',
    defaultLocale: 'en',
    defaultTheme: 'light',
    dashboardPath: '/dashboard',
    loginPath: '/login',
  },
  
  // Auth settings
  auth: {
    sessionDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    refreshTokenInterval: 60 * 60 * 1000, // 1 hour in milliseconds
  },
  
  // Feature flags for development
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableNotifications: true,
    darkModeSupport: true,
  },
};

// Helper to get environment dependent values
export const getEnvironment = () => {
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  };
};

// Export config as default for easier imports
export default APP_CONFIG; 