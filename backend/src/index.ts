import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import winston from 'winston';

// Import routes
import authRoutes from './routes/authRoutes';
import planRoutes from './routes/planRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';

// Setup logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'vpn-subscription-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Supabase connection (if environment variables are set)
let supabase: SupabaseClient | null = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('Supabase client initialized successfully');
  } catch (error) {
    logger.error('Error initializing Supabase client:', error);
  }
} else {
  logger.warn('Supabase environment variables not found. Some features will be limited.');
  logger.warn('To enable full functionality, set SUPABASE_URL and SUPABASE_KEY in your .env file.');
}

// Define routes without prefix
// Root route
app.get('/', (_req: Request, res: Response): void => {
  res.json({ message: 'VPN Service API - Running' });
});

// Health route
app.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabase ? 'configured' : 'not configured'
  });
});

// Create API router for prefixed routes
const apiRouter = express.Router();

// Duplicate the health endpoint on the API router
apiRouter.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabase ? 'configured' : 'not configured'
  });
});

// Supabase status route
apiRouter.get('/supabase-status', async (_req: Request, res: Response): Promise<Response> => {
  // Check if Supabase is configured
  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({
      status: 'warning',
      message: 'Supabase is not configured - environment variables missing',
      supabaseConfigured: false,
      missingVars: {
        SUPABASE_URL: !supabaseUrl,
        SUPABASE_KEY: !supabaseKey
      }
    });
  }

  // Check Supabase connection
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Test a simple query to confirm connection
    try {
      const { data, error } = await supabase.from('plans').select('id').limit(1);
      
      if (error) {
        return res.status(200).json({
          status: 'error',
          message: 'Failed to connect to Supabase',
          error: error.message,
          supabaseConfigured: true
        });
      }

      return res.json({
        status: 'ok',
        message: 'Successfully connected to Supabase',
        supabaseConfigured: true,
        data: data ? { count: data.length } : { count: 0 }
      });
    } catch (queryError) {
      return res.status(200).json({
        status: 'error',
        message: 'Error querying Supabase',
        error: queryError instanceof Error ? queryError.message : String(queryError),
        supabaseConfigured: true
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: 'Error testing Supabase connection',
      error: error instanceof Error ? error.message : String(error),
      supabaseConfigured: false
    });
  }
});

// Environment variables check route (for debugging)
apiRouter.get('/env-check', (_req: Request, res: Response): void => {
  res.json({
    // Return only presence status, not actual values for security
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_KEY,
    supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    telegramBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Register route modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/plans', planRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);

// Mount the API router at /api
app.use('/api', apiRouter);

// 404 handler
app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'The requested endpoint does not exist',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString(),
  });
});

// Create logs directory if it doesn't exist
import fs from 'fs';
import path from 'path';
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Log environment variable status
  logger.info('Environment Variables Status:');
  logger.info(`- SUPABASE_URL: ${supabaseUrl ? 'Set ✓' : 'Not Set ✗'}`);
  logger.info(`- SUPABASE_KEY: ${supabaseKey ? 'Set ✓' : 'Not Set ✗'}`);
  logger.info(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
}); 