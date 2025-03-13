/**
 * Configuration management for the VPN Service API
 * Centralizes all environment variables with validation and defaults
 */
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Utility to get env variables with validation
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  
  if (value === undefined) {
    logger.error(`[CONFIG] Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
};

// Server configuration
export const server = {
  port: parseInt(getEnvVar('PORT', '3000'), 10),
  env: getEnvVar('NODE_ENV', 'development'),
  isDev: getEnvVar('NODE_ENV', 'development') === 'development',
  isProd: getEnvVar('NODE_ENV', 'development') === 'production',
  apiPrefix: getEnvVar('API_PREFIX', '/api'),
  domain: getEnvVar('DOMAIN', 'localhost'),
};

// Database configuration (Supabase)
export const database = {
  supabaseUrl: getEnvVar('SUPABASE_URL'),
  supabaseKey: getEnvVar('SUPABASE_KEY'),
  supabaseServiceKey: getEnvVar('SUPABASE_SERVICE_ROLE_KEY', ''),
};

// JWT configuration
export const jwt = {
  secret: getEnvVar('JWT_SECRET', 'your-secret-key'),
  expiresIn: getEnvVar('JWT_EXPIRES_IN', '1d'),
  cookieName: getEnvVar('JWT_COOKIE_NAME', 'vpn_auth_token'),
  refreshSecret: getEnvVar('JWT_REFRESH_SECRET', 'your-refresh-secret-key'),
  refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
};

// VPN Panel configuration
export const vpnPanel = {
  url: getEnvVar('XUI_PANEL_URL', 'http://xui:2053'),
  username: getEnvVar('XUI_USERNAME', 'admin'),
  password: getEnvVar('XUI_PASSWORD', 'admin'),
};

// Telegram Bot configuration
export const telegramBot = {
  token: getEnvVar('TELEGRAM_BOT_TOKEN', ''),
  enabled: process.env.TELEGRAM_BOT_ENABLED === 'true',
};

// CORS configuration
export const cors = {
  allowedOrigins: getEnvVar('ALLOWED_ORIGINS', 'http://localhost:8080').split(','),
};

// Rate limiting configuration
export const rateLimit = {
  windowMs: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '15'), 10) * 60 * 1000, // 15 minutes
  max: parseInt(getEnvVar('RATE_LIMIT_MAX', '100'), 10), // 100 requests per window
};

// Cache configuration
export const cache = {
  defaultTtl: parseInt(getEnvVar('CACHE_DEFAULT_TTL', '300'), 10), // 5 minutes
};

// Logging configuration
export const logging = {
  level: getEnvVar('LOG_LEVEL', server.isDev ? 'debug' : 'info'),
  logRequests: getEnvVar('LOG_REQUESTS', 'true') === 'true',
};

// Export the entire configuration object
export default {
  server,
  database,
  jwt,
  vpnPanel,
  telegramBot,
  cors,
  rateLimit,
  cache,
  logging,
}; 