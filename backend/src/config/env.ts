import dotenv from 'dotenv';
import { EnvConfig } from '../types';

// Load environment variables
dotenv.config();

/**
 * Environment configuration
 */
const env: EnvConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d'
};

/**
 * Validate required environment variables
 */
export const validateEnv = (): boolean => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error(
      `Error: Missing required environment variables: ${missingVars.join(', ')}`
    );
    console.error('Please check your .env file or environment configuration.');
    return false;
  }

  return true;
};

export default env; 