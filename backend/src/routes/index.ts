/**
 * Main routes file
 * Combines all route modules and exports them as a single router
 */
import { Router } from 'express';
import userRoutes from './userRoutes';
// Import other route modules as needed

// Create a main router
const router = Router();

// Root route - API information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VPN Subscription Service API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: '/api/docs',
  });
});

// Mount route modules
router.use('/users', userRoutes);
// Add other route modules here
// router.use('/subscriptions', subscriptionRoutes);
// router.use('/plans', planRoutes);
// etc.

// Export combined router
export default router; 