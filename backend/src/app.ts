import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Extend global namespace to include supabase
declare global {
  namespace NodeJS {
    interface Global {
      supabase: SupabaseClient;
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL or SUPABASE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Make Supabase client available globally
(global as any).supabase = supabase;

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (_req: Request, res: Response): void => {
  res.json({ message: 'VPN Subscription API' });
});

// Health route
app.get('/health', (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    message: 'VPN Service API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

export default app; 