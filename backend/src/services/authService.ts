import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { User, JWTPayload } from '../types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Register a new user
 * @param email User email
 * @param password User password
 * @param fullName User's full name (optional)
 */
export const registerUser = async (
  email: string,
  password: string,
  fullName?: string
): Promise<User | null> => {
  try {
    // Hash the password
    // Disabled due to linting error
  // // Disabled due to linting error
  // const hashedPassword = await bcrypt.hash(password, 10);

    // Register user with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    // Create user record in profiles table
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user?.id,
          email,
          full_name: fullName,
          role: 'user', // Default role
        },
      ])
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    return userData as User;
  } catch (error) {
    console.error('Error registering user:', error);
    return null;
  }
};

/**
 * Login a user
 * @param email User email
 * @param password User password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User | null; token: string | null }> => {
  try {
    // Sign in with Supabase auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw new Error(authError.message);

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (userError) throw new Error(userError.message);

    const user = userData as User;

    // Generate JWT token
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { user, token };
  } catch (error) {
    console.error('Error logging in:', error);
    return { user: null, token: null };
  }
};

/**
 * Verify JWT token
 * @param token JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

/**
 * Get user by ID
 * @param id User ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();

    if (error) throw new Error(error.message);

    return data as User;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

/**
 * Update user profile
 * @param id User ID
 * @param userData User data to update
 */
export const updateUser = async (
  id: string,
  userData: Partial<User>
): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data as User;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}; 