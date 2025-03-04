const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/subscription');
const User = require('../models/user');
const VpnService = require('../services/vpn');
const logger = require('../utils/logger');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

/**
 * @route GET /api/subscriptions
 * @desc Get all subscriptions (for admin)
 * @access Admin
 */
router.get('/', [auth, admin], async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'username email telegramId');
    
    res.json(subscriptions);
  } catch (error) {
    logger.error(`Get subscriptions error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/subscriptions/user/:userId
 * @desc Get subscriptions for a specific user
 * @access Admin
 */
router.get('/user/:userId', [auth, admin], async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    
    res.json(subscriptions);
  } catch (error) {
    logger.error(`Get user subscriptions error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/subscriptions/my
 * @desc Get current user's subscriptions
 * @access Private
 */
router.get('/my', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(subscriptions);
  } catch (error) {
    logger.error(`Get my subscriptions error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/subscriptions/:id
 * @desc Get subscription by ID
 * @access Private/Admin
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('userId', 'username email telegramId');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Check if the subscription belongs to the requesting user or is an admin
    if (subscription.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this subscription' });
    }
    
    res.json(subscription);
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/subscriptions
 * @desc Create a new subscription (for admin)
 * @access Admin
 */
router.post('/', [
  auth,
  admin,
  body('userId', 'User ID is required').not().isEmpty(),
  body('planId', 'Plan ID is required').not().isEmpty(),
  body('planName', 'Plan name is required').not().isEmpty(),
  body('trafficLimit', 'Traffic limit is required').isNumeric(),
  body('startDate', 'Start date is required').isISO8601(),
  body('endDate', 'End date is required').isISO8601()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId, planId, planName, trafficLimit, startDate, endDate, notes } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create subscription
    const subscription = new Subscription({
      userId,
      planId,
      planName,
      trafficLimit,
      startDate,
      endDate,
      notes,
      status: 'active',
      usedTraffic: 0
    });
    
    await subscription.save();
    
    // Update traffic limit in VPN server
    try {
      await VpnService.updateUserTrafficLimit(userId, trafficLimit);
    } catch (vpnError) {
      logger.error(`Error updating VPN traffic limit: ${vpnError.message}`);
      // Don't fail the request if VPN service update fails
    }
    
    res.status(201).json(subscription);
  } catch (error) {
    logger.error(`Create subscription error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route PUT /api/subscriptions/:id
 * @desc Update a subscription
 * @access Admin
 */
router.put('/:id', [
  auth,
  admin,
  body('status', 'Status must be valid').optional().isIn(['active', 'expired', 'canceled', 'suspended']),
  body('trafficLimit', 'Traffic limit must be a number').optional().isNumeric(),
  body('endDate', 'End date must be a valid date').optional().isISO8601()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Update fields
    const { status, trafficLimit, endDate, notes } = req.body;
    
    if (status) subscription.status = status;
    if (trafficLimit) subscription.trafficLimit = trafficLimit;
    if (endDate) subscription.endDate = endDate;
    if (notes !== undefined) subscription.notes = notes;
    
    subscription.updatedAt = new Date();
    
    await subscription.save();
    
    // Update traffic limit in VPN server if changed
    if (trafficLimit) {
      try {
        await VpnService.updateUserTrafficLimit(subscription.userId, trafficLimit);
      } catch (vpnError) {
        logger.error(`Error updating VPN traffic limit: ${vpnError.message}`);
        // Don't fail the request if VPN service update fails
      }
    }
    
    res.json(subscription);
  } catch (error) {
    logger.error(`Update subscription error: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route DELETE /api/subscriptions/:id
 * @desc Delete a subscription
 * @access Admin
 */
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    await subscription.remove();
    
    res.json({ message: 'Subscription removed' });
  } catch (error) {
    logger.error(`Delete subscription error: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route GET /api/subscriptions/plans
 * @desc Get available subscription plans
 * @access Public
 */
router.get('/plans', async (req, res) => {
  try {
    // In a real app, this would come from a database
    const plans = [
      { id: 'basic', name: 'Basic', price: 300, duration: 30, traffic: 50, description: 'Basic VPN access with 50GB traffic' },
      { id: 'standard', name: 'Standard', price: 600, duration: 30, traffic: 150, description: 'Standard VPN access with 150GB traffic' },
      { id: 'premium', name: 'Premium', price: 900, duration: 30, traffic: 500, description: 'Premium VPN access with 500GB traffic' }
    ];
    
    res.json(plans);
  } catch (error) {
    logger.error(`Get plans error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/subscriptions/:id/sync-traffic
 * @desc Sync traffic usage from VPN server
 * @access Admin
 */
router.post('/:id/sync-traffic', [auth, admin], async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    // Get traffic usage from VPN server
    try {
      const usedTraffic = await VpnService.getUserTrafficUsage(subscription.userId);
      
      // Update subscription
      subscription.usedTraffic = usedTraffic;
      subscription.lastCheckedTraffic = new Date();
      
      await subscription.save();
      
      res.json({ message: 'Traffic usage synced', subscription });
    } catch (vpnError) {
      logger.error(`Error getting VPN traffic usage: ${vpnError.message}`);
      res.status(500).json({ message: 'Failed to sync traffic usage' });
    }
  } catch (error) {
    logger.error(`Sync traffic error: ${error.message}`);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 