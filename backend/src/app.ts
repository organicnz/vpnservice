/**
 * Main application setup for the VPN Service API
 */
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import config from './config';
import logger, { stream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { configureSecurityMiddleware } from './middleware/security';
import { cacheMiddleware } from './middleware/cache';
import routes from './routes';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Create Express application
const app = express();

// Apply security middleware (helmet, cors, rate limiting)
configureSecurityMiddleware(app);

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.logging.logRequests) {
  app.use(morgan('combined', { stream }));
}

// Apply cache middleware for API routes
app.use(config.server.apiPrefix, cacheMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || 'unknown',
  });
});

// Mount API routes
app.use(config.server.apiPrefix, routes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Export the configured app
export default app; 