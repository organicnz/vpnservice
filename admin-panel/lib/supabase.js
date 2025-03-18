import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Add some debugging information
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Not set');

// Provide fallback for missing configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are not properly set. Authentication will not work.');
}

// Create a single supabase client for interacting with your database
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export default supabase; 