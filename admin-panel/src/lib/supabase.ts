import { createClient } from '@supabase/supabase-js';

// These environment variables are set by default when using Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client for static site generation if environment variables are missing
const isBrowser = typeof window !== 'undefined';
const isSSG = !isBrowser && (!supabaseUrl || !supabaseKey);

// If we're in a server environment during static build with no env vars, return a dummy client
// that will be replaced with the real client on the client side
const dummyClient = {
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => ({ data: null, error: null }),
  }),
  auth: {
    signIn: async () => ({ user: null, session: null, error: null }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
    onAuthStateChange: () => ({ data: null, subscription: { unsubscribe: () => {} } }),
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    setSession: async () => ({ data: { session: null }, error: null }),
    refreshSession: async () => ({ data: { session: null }, error: null }),
    setAuth: () => {},
  },
};

// Create a real Supabase client only if we have the required environment variables
export const supabase = isSSG 
  ? dummyClient 
  : createClient(supabaseUrl, supabaseKey);

export default supabase; 