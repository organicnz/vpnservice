require('dotenv').config();
const app = require('./app');
const { setupBot } = require('./services/telegramBot');
const logger = require('./utils/logger');
const { supabase } = require('./utils/supabase');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const subscriptionRoutes = require('./routes/subscriptions');
const vpnRoutes = require('./routes/vpn');
const paymentRoutes = require('./routes/payments');

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/vpn', vpnRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Supabase connection check
app.get('/api/supabase-status', async (req, res) => {
  try {
    // Simple query to check Supabase connection
    const { data, error } = await supabase.from('plans').select('count').limit(1);
    if (error) throw error;
    
    res.status(200).json({ 
      status: 'Connected', 
      timestamp: new Date(),
      message: 'Successfully connected to Supabase'
    });
  } catch (error) {
    logger.error(`Supabase connection error: ${error.message}`);
    res.status(500).json({ 
      status: 'Error', 
      timestamp: new Date(),
      message: `Failed to connect to Supabase: ${error.message}`
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Setup Telegram bot if token is provided
  if (process.env.TELEGRAM_BOT_TOKEN) {
    try {
      const bot = setupBot();
      logger.info('Telegram bot started');
    } catch (error) {
      logger.error(`Failed to start Telegram bot: ${error.message}`);
    }
  } else {
    logger.warn('TELEGRAM_BOT_TOKEN not provided. Telegram bot not started.');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled Rejection: ${error.message}`);
  // Don't exit on unhandled rejections in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

module.exports = app; // For testing purposes 