// Simple Express server with standalone health endpoint
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Express app
const app = express();

// Add middleware
app.use(cors());
app.use(express.json());

// Supabase connection (if environment variables are set)
let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
  }
} else {
  console.warn('⚠️ Supabase environment variables not found. Some features will be limited.');
  console.warn('   To enable full functionality, set SUPABASE_URL and SUPABASE_KEY in your .env file.');
}

// Define routes without prefix
// Root route
app.get('/', (req, res) => {
  res.json({ message: 'VPN Service API - Running' });
});

// Health route
app.get('/health', (req, res) => {
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
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend service is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    supabase: supabase ? 'configured' : 'not configured'
  });
});

// Supabase status route
apiRouter.get('/supabase-status', async (req, res) => {
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
        error: queryError.message,
        supabaseConfigured: true
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: 'error',
      message: 'Error testing Supabase connection',
      error: error.message,
      supabaseConfigured: false
    });
  }
});

// Environment variables check route (for debugging)
apiRouter.get('/env-check', (req, res) => {
  res.json({
    // Return only presence status, not actual values for security
    supabaseUrl: !!process.env.SUPABASE_URL,
    supabaseKey: !!process.env.SUPABASE_KEY,
    supabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    telegramBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// Mount the API router at /api
app.use('/api', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Log environment variable status
  console.log('Environment Variables Status:');
  console.log(`- SUPABASE_URL: ${supabaseUrl ? 'Set ✓' : 'Not Set ✗'}`);
  console.log(`- SUPABASE_KEY: ${supabaseKey ? 'Set ✓' : 'Not Set ✗'}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
}); 