import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// Debug information (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key exists:', !!supabaseAnonKey);
}

// Initialize the Supabase client
let supabaseInstance = null;

try {
  // Only initialize the client if we have the required values
  if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      global: {
        fetch: (...args) => {
          // Add timeout to fetch requests
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Request timed out'));
            }, 30000); // 30-second timeout
            
            fetch(...args)
              .then(resolve)
              .catch(reject)
              .finally(() => clearTimeout(timeout));
          });
        }
      }
    });
  } else {
    // Create a mock client that will provide meaningful errors
    supabaseInstance = {
      auth: {
        signInWithPassword: () => Promise.reject(new Error('Supabase not configured: Missing URL or API key')),
        signUp: () => Promise.reject(new Error('Supabase not configured: Missing URL or API key')),
        getSession: () => Promise.resolve({ data: null }),
        signOut: () => Promise.resolve()
      },
      from: () => ({
        select: () => ({
          limit: () => ({
            maybeSingle: () => Promise.reject(new Error('Supabase not configured: Missing URL or API key'))
          })
        })
      })
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.warn('Supabase client initialization failed. Using mock client that will return errors.');
    }
  }
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  
  // Create a fallback mock client that won't crash the app
  supabaseInstance = {
    auth: {
      signInWithPassword: () => Promise.reject(new Error('Supabase initialization error: ' + error.message)),
      signUp: () => Promise.reject(new Error('Supabase initialization error: ' + error.message)),
      getSession: () => Promise.resolve({ data: null }),
      signOut: () => Promise.resolve()
    },
    from: () => ({
      select: () => ({
        limit: () => ({
          maybeSingle: () => Promise.reject(new Error('Supabase initialization error: ' + error.message))
        })
      })
    })
  };
}

// Helper function to get user role
export const getUserRole = async () => {
  try {
    if (!supabaseInstance) {
      return { role: 'anonymous' };
    }
    
    const { data } = await supabaseInstance.auth.getSession();
    
    if (!data || !data.session) {
      return { role: 'anonymous' };
    }
    
    const session = data.session;
    
    // Check if the user has an admin role (you can customize this logic)
    // For example, you might check user.app_metadata.role or user.user_metadata.role
    const isAdmin = session?.user?.app_metadata?.role === 'admin' || 
                   session?.user?.user_metadata?.role === 'admin';
    
    return { 
      role: isAdmin ? 'admin' : 'client',
      user: session.user
    };
  } catch (error) {
    console.error('Error getting user role:', error);
    return { role: 'anonymous' };
  }
};

// Helper function to check if Supabase connection is working
export const testSupabaseConnection = async () => {
  try {
    if (!supabaseInstance) {
      return { 
        success: false, 
        message: 'Supabase client not initialized' 
      };
    }
    
    // Try to fetch a small amount of data to test the connection
    const { data, error } = await supabaseInstance
      .from('test')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 means table doesn't exist, which is fine for testing
      return { success: false, message: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to connect to Supabase'
    };
  }
};

// Make supabase client available
export const supabase = supabaseInstance;

// Also export as default for convenience
export default supabaseInstance; 