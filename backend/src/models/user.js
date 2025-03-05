/**
 * User model implementation using Supabase
 * Provides a Mongoose-like API for compatibility with existing code
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Supabase-based User model
const User = {
  /**
   * Find a user by query parameters
   * @param {Object} query Query parameters (email, telegramId)
   * @returns {Promise<Object>} User object or null
   */
  findOne: async function(query) {
    // Get Supabase client from global scope or request
    const supabase = global.supabase;
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    let supabaseQuery = supabase.from('users').select('*');
    
    // Convert mongoose-style queries to Supabase
    if (query.email) {
      supabaseQuery = supabaseQuery.eq('email', query.email);
    } else if (query.telegramId) {
      supabaseQuery = supabaseQuery.eq('telegram_id', query.telegramId);
    }
    
    const { data, error } = await supabaseQuery.maybeSingle();
    
    if (error || !data) return null;
    
    // Transform to match mongoose model structure and methods
    return transformUserData(data);
  },
  
  /**
   * Find a user by ID
   * @param {string} id User ID
   * @returns {Promise<Object>} User object or null
   */
  findById: async function(id) {
    const supabase = global.supabase;
    if (!supabase) {
      console.error('Supabase client not initialized');
      return null;
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error || !data) return null;
    
    return transformUserData(data);
  },
  
  /**
   * Create a new user
   * @param {Object} userData User data
   * @returns {Promise<Object>} Created user
   */
  create: async function(userData) {
    const supabase = global.supabase;
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    // Hash password if provided
    let userToCreate = { ...userData };
    if (userToCreate.password) {
      const salt = await bcrypt.genSalt(10);
      userToCreate.password = await bcrypt.hash(userToCreate.password, salt);
    }
    
    // Convert camelCase to snake_case for Supabase
    if (userToCreate.telegramId) {
      userToCreate.telegram_id = userToCreate.telegramId;
      delete userToCreate.telegramId;
    }
    
    if (userToCreate.lastLoginAt) {
      userToCreate.last_login_at = userToCreate.lastLoginAt;
      delete userToCreate.lastLoginAt;
    }
    
    // Add timestamps
    userToCreate.created_at = new Date().toISOString();
    userToCreate.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('users')
      .insert(userToCreate)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }
    
    return transformUserData(data);
  }
};

/**
 * Transform Supabase user data to match Mongoose model structure
 * @param {Object} data User data from Supabase
 * @returns {Object} Transformed user with Mongoose-like methods
 */
function transformUserData(data) {
  return {
    ...data,
    _id: data.id,
    telegramId: data.telegram_id,
    lastLoginAt: data.last_login_at,
    // Add Mongoose-like methods
    comparePassword: async function(candidatePassword) {
      return bcrypt.compare(candidatePassword, data.password);
    },
    generateAuthToken: function() {
      const payload = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role
      };
      
      return jwt.sign(
        payload, 
        process.env.JWT_SECRET || 'defaultsecret', 
        { expiresIn: '7d' }
      );
    },
    save: async function() {
      const supabase = global.supabase;
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      const { data: updatedData, error } = await supabase
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select()
        .single();
        
      if (error) throw error;
      return transformUserData(updatedData);
    }
  };
}

module.exports = User; 