/**
 * User routes
 * Defines API endpoints for user-related operations
 */
import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { userSchemas } from '../utils/schemas';
import { asyncHandler } from '../middleware/errorHandler';

// Create a router instance
const router = Router();

/**
 * @route GET /api/users
 * @desc Get all users with pagination
 * @access Private (Admin)
 */
router.get('/', userController.getUsers);

/**
 * @route GET /api/users/:id
 * @desc Get a user by ID
 * @access Private (Admin or Self)
 */
router.get('/:id', userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private (Admin)
 */
router.post(
  '/',
  validate(userSchemas.create),
  userController.createUser
);

/**
 * @route PUT /api/users/:id
 * @desc Update a user
 * @access Private (Admin or Self)
 */
router.put(
  '/:id',
  validate(userSchemas.update),
  userController.updateUser
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete a user
 * @access Private (Admin)
 */
router.delete('/:id', userController.deleteUser);

export default router; 