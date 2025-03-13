/**
 * User service
 * Handles business logic for user-related operations
 */
import { userRepository, User } from '../repositories/userRepository';
import logger from '../utils/logger';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { clearCacheForRoute } from '../middleware/cache';

/**
 * Interface for user creation
 */
export interface CreateUserDto {
  email: string;
  name?: string;
  password?: string;
  role?: 'user' | 'admin';
  telegram_id?: string;
}

/**
 * Interface for user update
 */
export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
  telegram_id?: string;
}

/**
 * User Service
 * Contains business logic for user operations
 */
export const userService = {
  /**
   * Get a user by ID
   * @param id User ID
   * @returns User object
   * @throws NotFoundError if user not found
   */
  async getUserById(id: string): Promise<User> {
    const user = await userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  },

  /**
   * Get a user by email
   * @param email User email
   * @returns User object
   * @throws NotFoundError if user not found
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return user;
  },

  /**
   * Check if user exists by email
   * @param email User email
   * @returns Boolean indicating if user exists
   */
  async userExistsByEmail(email: string): Promise<boolean> {
    const user = await userRepository.findByEmail(email);
    return !!user;
  },

  /**
   * Create a new user
   * @param userData User data for creation
   * @returns Created user
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Validate user data
      if (!userData.email) {
        throw new BadRequestError('Email is required');
      }
      
      // Create user
      const user = await userRepository.create(userData);
      
      // Clear cache
      clearCacheForRoute('/api/users');
      
      return user;
    } catch (error) {
      logger.error(`[UserService] Error in createUser: ${error}`);
      throw error;
    }
  },

  /**
   * Update a user
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user
   */
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      // Update user
      const user = await userRepository.update(id, userData);
      
      // Clear cache
      clearCacheForRoute(`/api/users/${id}`);
      clearCacheForRoute('/api/users');
      
      return user;
    } catch (error) {
      logger.error(`[UserService] Error in updateUser: ${error}`);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param id User ID
   * @returns True if successful
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Delete user
      const success = await userRepository.delete(id);
      
      // Clear cache
      clearCacheForRoute(`/api/users/${id}`);
      clearCacheForRoute('/api/users');
      
      return success;
    } catch (error) {
      logger.error(`[UserService] Error in deleteUser: ${error}`);
      throw error;
    }
  },

  /**
   * List all users with pagination
   * @param page Page number
   * @param limit Items per page
   * @returns Users and total count
   */
  async listUsers(page = 1, limit = 20): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    try {
      const { users, total } = await userRepository.list(page, limit);
      
      return {
        users,
        total,
        page,
        limit,
      };
    } catch (error) {
      logger.error(`[UserService] Error in listUsers: ${error}`);
      throw error;
    }
  },
}; 