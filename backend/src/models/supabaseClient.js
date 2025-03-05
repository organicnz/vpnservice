// Supabase client setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for required environment variables
if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase URL or key not set in environment variables');
}

// Create Supabase client with anon key (for authenticated user operations)
const supabase = supabaseUrl && supabaseKey ? 
  createClient(supabaseUrl, supabaseKey) : 
  null;

// Create Supabase admin client with service role key (for admin operations)
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey ? 
  createClient(supabaseUrl, supabaseServiceRoleKey) : 
  null;

module.exports = {
  supabase,
  supabaseAdmin
}; 