const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// Supabase URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase URL or API key not found. Please check your environment variables.');
  process.exit(1);
}

// Create Supabase client with anonymous key (for client-side operations)
const supabase = createClient(supabaseUrl, supabaseKey);

// Create Supabase admin client with service role key (for admin operations)
// This has bypasses Row Level Security and should only be used for server-admin tasks
const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

/**
 * Get appropriate Supabase client based on whether admin privileges are needed
 * @param {boolean} adminRequired Whether admin privileges are needed
 * @returns {Object} Supabase client
 */
function getSupabaseClient(adminRequired = false) {
  if (adminRequired) {
    if (!supabaseAdmin) {
      logger.error('Supabase admin client requested but service role key not provided');
      throw new Error('Supabase service role key not configured');
    }
    return supabaseAdmin;
  }
  return supabase;
}

module.exports = {
  supabase,
  supabaseAdmin,
  getSupabaseClient
}; 