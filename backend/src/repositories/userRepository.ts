/**
 * User repository for data access
 * Interfaces with Supabase for user-related operations
 */
import { createClient } from '@supabase/supabase-js';
import config from '../config';
import logger from '../utils/logger';
import { NotFoundError, BadRequestError } from '../utils/errors';

// Initialize Supabase client
const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseKey
);

// Define user interface
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  telegram_id?: string;
  is_active: boolean;
}

/**
 * User Repository
 * Handles all database operations related to users
 */
export const userRepository = {
  /**
   * Find a user by ID
   * @param id User ID
   * @returns User object or null
   */
  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        logger.error(`[UserRepository] Error finding user by ID: ${error.message}`);
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new BadRequestError(error.message);
      }
      
      return data as User;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in findById: ${error}`);
      throw error;
    }
  },

  /**
   * Find a user by email
   * @param email User email
   * @returns User object or null
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();
      
      if (error) {
        logger.error(`[UserRepository] Error finding user by email: ${error.message}`);
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new BadRequestError(error.message);
      }
      
      return data as User;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in findByEmail: ${error}`);
      throw error;
    }
  },

  /**
   * Find a user by Telegram ID
   * @param telegramId Telegram user ID
   * @returns User object or null
   */
  async findByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();
      
      if (error) {
        logger.error(`[UserRepository] Error finding user by Telegram ID: ${error.message}`);
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new BadRequestError(error.message);
      }
      
      return data as User;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in findByTelegramId: ${error}`);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param userData User data
   * @returns Created user
   */
  async create(userData: Partial<User>): Promise<User> {
    try {
      // Check if user already exists
      if (userData.email) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser) {
          throw new BadRequestError('User with this email already exists');
        }
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          email: userData.email?.toLowerCase(),
          role: userData.role || 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();
      
      if (error) {
        logger.error(`[UserRepository] Error creating user: ${error.message}`);
        throw new BadRequestError(error.message);
      }
      
      return data as User;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in create: ${error}`);
      throw error;
    }
  },

  /**
   * Update a user
   * @param id User ID
   * @param userData User data to update
   * @returns Updated user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({
          ...userData,
          email: userData.email?.toLowerCase(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        logger.error(`[UserRepository] Error updating user: ${error.message}`);
        throw new BadRequestError(error.message);
      }
      
      return data as User;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in update: ${error}`);
      throw error;
    }
  },

  /**
   * Delete a user
   * @param id User ID
   * @returns True if successful
   */
  async delete(id: string): Promise<boolean> {
    try {
      // Check if user exists
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new NotFoundError('User');
      }
      
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);
      
      if (error) {
        logger.error(`[UserRepository] Error deleting user: ${error.message}`);
        throw new BadRequestError(error.message);
      }
      
      return true;
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in delete: ${error}`);
      throw error;
    }
  },

  /**
   * List all users with pagination
   * @param page Page number (1-based)
   * @param limit Number of users per page
   * @returns Array of users and total count
   */
  async list(page = 1, limit = 20): Promise<{ users: User[]; total: number }> {
    try {
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error(`[UserRepository] Error counting users: ${countError.message}`);
        throw new BadRequestError(countError.message);
      }
      
      // Get users with pagination
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error(`[UserRepository] Error listing users: ${error.message}`);
        throw new BadRequestError(error.message);
      }
      
      return {
        users: data as User[],
        total: count || 0,
      };
    } catch (error) {
      logger.error(`[UserRepository] Unexpected error in list: ${error}`);
      throw error;
    }
  },
}; 