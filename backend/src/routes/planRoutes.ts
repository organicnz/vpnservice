import { Router } from 'express';
import { getPlans, getPlan } from '../controllers/planController';

const router = Router();

/**
 * @route   GET /api/plans
 * @desc    Get all available plans
 * @access  Public
 */
router.get('/', getPlans);

/**
 * @route   GET /api/plans/:id
 * @desc    Get a plan by ID
 * @access  Public
 */
router.get('/:id', getPlan);

export default router; 