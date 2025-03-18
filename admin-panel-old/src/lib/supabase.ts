import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { APP_CONFIG } from '../app/config';

// Define types for better type safety
export type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in?: string;
};

export type AuthSession = {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
};

// Create a singleton instance of the Supabase client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create a Supabase client instance
 * This ensures we only create one instance per session
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseInstance === null) {
    const supabaseUrl = APP_CONFIG.supabase.url;
    const supabaseKey = APP_CONFIG.supabase.anonKey;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and anon key must be defined in environment variables');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  
  return supabaseInstance;
}

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns Session data or error
 */
export async function signInWithPassword(email: string, password: string): Promise<{ 
  data: AuthSession | null; 
  error: Error | null;
}> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error.message);
      return { data: null, error };
    }
    
    return { 
      data: {
        user: data.user as User,
        access_token: data.session?.access_token || null,
        refresh_token: data.session?.refresh_token || null,
      }, 
      error: null 
    };
  } catch (err) {
    console.error('Unexpected error during sign in:', err);
    return { 
      data: null, 
      error: err instanceof Error ? err : new Error('Unknown error during sign in') 
    };
  }
}

/**
 * Sign out the current user
 * @returns Success status or error
 */
export async function signOut(): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error.message);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error during sign out:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Unknown error during sign out') 
    };
  }
}

/**
 * Get the current session
 * @returns Current session or null if not signed in
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      return null;
    }
    
    return {
      user: data.session.user as User,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  } catch (err) {
    console.error('Error getting current session:', err);
    return null;
  }
}

/**
 * Request a password reset email
 * @param email User email
 * @param redirectTo URL to redirect to after password reset
 * @returns Success status or error
 */
export async function requestPasswordReset(email: string, redirectTo?: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    
    if (error) {
      console.error('Password reset request error:', error.message);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('Unexpected error during password reset request:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err : new Error('Unknown error during password reset request') 
    };
  }
}

// Export the default client for direct use
export default getSupabaseClient(); 