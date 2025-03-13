import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  getUserSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscriptionStatus,
  renewSubscription,
  getVPNAccounts,
} from '../services/subscriptionService';

/**
 * Validation rules for creating a subscription
 */
export const createSubscriptionValidation = [
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('paymentId').optional().isString().withMessage('Payment ID must be a string'),
];

/**
 * Validation rules for updating a subscription
 */
export const updateSubscriptionValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'expired', 'canceled', 'pending'])
    .withMessage('Invalid status value'),
];

/**
 * Controller method to get user subscriptions
 */
export const getUserSubscriptionsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const subscriptions = await getUserSubscriptions(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getUserSubscriptions controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscriptions',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller method to get a subscription by ID
 */
export const getSubscriptionByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const subscription = await getSubscriptionById(id);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
        error: 'Subscription with the specified ID does not exist',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if the subscription belongs to the user or user is admin
    if (subscription.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You do not have permission to access this subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getSubscriptionById controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller method to create a new subscription
 */
export const createSubscriptionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { planId, paymentId } = req.body;

    const subscription = await createSubscription(req.user.id, planId, paymentId);

    if (!subscription) {
      res.status(400).json({
        success: false,
        message: 'Subscription creation failed',
        error: 'Failed to create subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in createSubscription controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller method to update a subscription status
 */
export const updateSubscriptionStatusController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    // Get the subscription to check ownership
    const subscription = await getSubscriptionById(id);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
        error: 'Subscription with the specified ID does not exist',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if the subscription belongs to the user or user is admin
    if (subscription.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You do not have permission to modify this subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const updatedSubscription = await updateSubscriptionStatus(id, status);

    if (!updatedSubscription) {
      res.status(400).json({
        success: false,
        message: 'Failed to update subscription status',
        error: 'Could not update subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: updatedSubscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in updateSubscriptionStatus controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription status',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller method to renew a subscription
 */
export const renewSubscriptionController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;
    const { paymentId } = req.body;

    // Get the subscription to check ownership
    const subscription = await getSubscriptionById(id);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
        error: 'Subscription with the specified ID does not exist',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if the subscription belongs to the user or user is admin
    if (subscription.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You do not have permission to renew this subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const renewedSubscription = await renewSubscription(id, paymentId);

    if (!renewedSubscription) {
      res.status(400).json({
        success: false,
        message: 'Failed to renew subscription',
        error: 'Could not renew subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      data: renewedSubscription,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in renewSubscription controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to renew subscription',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Controller method to get VPN accounts for a subscription
 */
export const getVPNAccountsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'User not found in request',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const { id } = req.params;

    // Get the subscription to check ownership
    const subscription = await getSubscriptionById(id);

    if (!subscription) {
      res.status(404).json({
        success: false,
        message: 'Subscription not found',
        error: 'Subscription with the specified ID does not exist',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Check if the subscription belongs to the user or user is admin
    if (subscription.user_id !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Forbidden',
        error: 'You do not have permission to access VPN accounts for this subscription',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const vpnAccounts = await getVPNAccounts(id);

    res.status(200).json({
      success: true,
      message: 'VPN accounts retrieved successfully',
      data: vpnAccounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in getVPNAccounts controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve VPN accounts',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}; 