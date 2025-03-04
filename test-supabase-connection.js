// Simple script to test the Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseKey || !supabaseServiceRoleKey) {
  console.error('Supabase URL or API keys not found. Please check your .env file.');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Testing connection with anon key...');

// Create Supabase client with anonymous key
const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection with a simple query
async function testAnonConnection() {
  try {
    const { data, error } = await supabase.from('plans').select('count');
    
    if (error) {
      console.error('Error with anon key connection:', error.message);
      return false;
    }
    
    console.log('✅ Anon key connection successful!');
    console.log('Plans count:', data[0].count);
    return true;
  } catch (error) {
    console.error('Unexpected error with anon key:', error.message);
    return false;
  }
}

// Test the service role connection
async function testServiceRoleConnection() {
  try {
    console.log('\nTesting connection with service role key...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    const { data, error } = await supabaseAdmin.from('users').select('count');
    
    if (error) {
      console.error('Error with service role connection:', error.message);
      return false;
    }
    
    console.log('✅ Service role key connection successful!');
    console.log('Users count:', data[0].count);
    return true;
  } catch (error) {
    console.error('Unexpected error with service role key:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  const anonSuccess = await testAnonConnection();
  const serviceRoleSuccess = await testServiceRoleConnection();
  
  console.log('\n--- Test Summary ---');
  console.log('Anon Key Connection:', anonSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Service Role Connection:', serviceRoleSuccess ? '✅ PASSED' : '❌ FAILED');
  
  if (anonSuccess && serviceRoleSuccess) {
    console.log('\n🎉 All connections successful! Your Supabase setup is working correctly.');
  } else {
    console.log('\n❌ Some connections failed. Please check your configuration.');
  }
}

runTests(); 