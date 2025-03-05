// Simple script to test the Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase URL and API key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate that environment variables are set
if (!supabaseUrl || !supabaseKey || !supabaseServiceRoleKey) {
  console.error('❌ Supabase URL or API keys not found. Please check your .env file.');
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
      console.error('❌ Error with anon key connection:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('❌ No data returned from plans table. Database might be empty or table missing.');
      return false;
    }
    
    console.log('✅ Anon key connection successful!');
    console.log('Plans count:', data[0].count);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error with anon key:', error.message);
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
      console.error('❌ Error with service role connection:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.error('❌ No data returned from users table. Database might be empty or table missing.');
      return false;
    }
    
    console.log('✅ Service role key connection successful!');
    console.log('Users count:', data[0].count);
    return true;
  } catch (error) {
    console.error('❌ Unexpected error with service role key:', error.message);
    return false;
  }
}

// Test database schema existence
async function testDatabaseSchema() {
  try {
    console.log('\nVerifying database schema...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    
    // Check for expected tables
    const requiredTables = ['users', 'plans', 'subscriptions', 'payments', 'servers'];
    const missingTables = [];
    
    for (const table of requiredTables) {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        missingTables.push(table);
        console.error(`❌ Table '${table}' check failed:`, error.message);
      } else {
        console.log(`✅ Table '${table}' exists with ${count} records`);
      }
    }
    
    if (missingTables.length > 0) {
      console.error(`❌ Missing tables: ${missingTables.join(', ')}`);
      return false;
    }
    
    console.log('✅ All required database tables exist!');
    return true;
  } catch (error) {
    console.error('❌ Error verifying database schema:', error.message);
    return false;
  }
}

// Run the tests
async function runTests() {
  const anonSuccess = await testAnonConnection();
  const serviceRoleSuccess = await testServiceRoleConnection();
  const schemaSuccess = await testDatabaseSchema();
  
  console.log('\n--- Test Summary ---');
  console.log('Anon Key Connection:', anonSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Service Role Connection:', serviceRoleSuccess ? '✅ PASSED' : '❌ FAILED');
  console.log('Database Schema:', schemaSuccess ? '✅ PASSED' : '❌ FAILED');
  
  if (anonSuccess && serviceRoleSuccess && schemaSuccess) {
    console.log('\n🎉 All connections successful! Your Supabase setup is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Please check your configuration.');
    process.exit(1);
  }
}

runTests(); 