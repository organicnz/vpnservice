/**
 * Server entry point file
 * Starts the Express application server
 */
import app from './app';
import logger from './utils/logger';
import config from './config';

// Set port from config
const PORT = config.server.port;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection', error);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.server.env} mode on port ${PORT}`);
  logger.info(`API available at ${config.server.apiPrefix}`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  logger.info('Shutting down server gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Force closing server after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default server; 