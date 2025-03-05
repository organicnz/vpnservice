require('dotenv').config();
const app = require('./app');
const { setupBot } = require('./services/telegramBot');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

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