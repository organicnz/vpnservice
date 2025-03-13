import { Router } from 'express';
import {
  getUserSubscriptionsController,
  getSubscriptionByIdController,
  createSubscriptionController,
  updateSubscriptionStatusController,
  renewSubscriptionController,
  getVPNAccountsController,
  createSubscriptionValidation,
  updateSubscriptionValidation,
} from '../controllers/subscriptionController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All subscription routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/subscriptions
 * @desc    Get all subscriptions for the authenticated user
 * @access  Private
 */
router.get('/', getUserSubscriptionsController);

/**
 * @route   GET /api/subscriptions/:id
 * @desc    Get a subscription by ID
 * @access  Private
 */
router.get('/:id', getSubscriptionByIdController);

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
router.post('/', createSubscriptionValidation, createSubscriptionController);

/**
 * @route   PATCH /api/subscriptions/:id/status
 * @desc    Update a subscription status
 * @access  Private
 */
router.patch('/:id/status', updateSubscriptionValidation, updateSubscriptionStatusController);

/**
 * @route   POST /api/subscriptions/:id/renew
 * @desc    Renew a subscription
 * @access  Private
 */
router.post('/:id/renew', renewSubscriptionController);

/**
 * @route   GET /api/subscriptions/:id/vpn-accounts
 * @desc    Get VPN accounts for a subscription
 * @access  Private
 */
router.get('/:id/vpn-accounts', getVPNAccountsController);

export default router; 