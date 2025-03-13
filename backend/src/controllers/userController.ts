/**
 * User controller
 * Handles HTTP requests for user-related operations
 */
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../utils/logger';

/**
 * User Controller
 * Contains handlers for user-related HTTP endpoints
 */
export const userController = {
  /**
   * Get all users with pagination
   * @route GET /api/users
   */
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    // Parse query parameters
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    
    // Get users from service
    const result = await userService.listUsers(page, limit);
    
    // Send response
    res.status(200).json({
      success: true,
      ...result,
      pages: Math.ceil(result.total / limit),
    });
  }),

  /**
   * Get a user by ID
   * @route GET /api/users/:id
   */
  getUserById: asyncHandler(async (req: Request, res: Response) => {
    // Get user ID from params
    const { id } = req.params;
    
    // Get user from service
    const user = await userService.getUserById(id);
    
    // Send response
    res.status(200).json({
      success: true,
      user,
    });
  }),

  /**
   * Create a new user
   * @route POST /api/users
   */
  createUser: asyncHandler(async (req: Request, res: Response) => {
    // Get user data from request body
    const userData = req.body;
    
    // Create user
    const user = await userService.createUser(userData);
    
    // Log success
    logger.info(`[UserController] Created user with ID: ${user.id}`);
    
    // Send response
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  }),

  /**
   * Update a user
   * @route PUT /api/users/:id
   */
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    // Get user ID from params
    const { id } = req.params;
    
    // Get user data from request body
    const userData = req.body;
    
    // Update user
    const user = await userService.updateUser(id, userData);
    
    // Log success
    logger.info(`[UserController] Updated user with ID: ${id}`);
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user,
    });
  }),

  /**
   * Delete a user
   * @route DELETE /api/users/:id
   */
  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    // Get user ID from params
    const { id } = req.params;
    
    // Delete user
    await userService.deleteUser(id);
    
    // Log success
    logger.info(`[UserController] Deleted user with ID: ${id}`);
    
    // Send response
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  }),
}; 