/**
 * Test Supabase Connection
 * 
 * This script tests the connection to your new Supabase database
 * Run with: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Your new Supabase credentials
const SUPABASE_URL = 'https://ortjjekmexmyvkkotioo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTkyODAsImV4cCI6MjA4NDY3NTI4MH0.__lyxX1wdkAkO7xUj5cBuc1x9ae_h-cggfVl_yXby6A';

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Project Ref: ortjjekmexmyvkkotioo\n');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Test 1: Check if wallets table exists
    console.log('Test 1: Checking connection and wallets table...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .limit(1);

    if (walletsError) {
      if (walletsError.code === 'PGRST116' || walletsError.code === 'PGRST205') {
        console.log('⚠️  Wallets table does not exist yet');
        console.log('   Run the SQL migration to create it\n');
      } else {
        throw walletsError;
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Wallets table exists!');
      console.log(`   Found ${wallets?.length || 0} wallet(s)\n`);
    }

    // Test 2: Check profiles table
    console.log('Test 2: Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (profilesError) {
      if (profilesError.code === 'PGRST116' || profilesError.code === 'PGRST205') {
        console.log('⚠️  Profiles table does not exist yet\n');
      } else {
        console.log('⚠️  Profiles table error:', profilesError.message, '\n');
      }
    } else {
      console.log('✅ Profiles table exists!');
      console.log(`   Found ${profiles?.length || 0} profile(s)\n`);
    }

    // Test 3: Check messages table
    console.log('Test 3: Checking messages table...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      if (messagesError.code === 'PGRST116' || messagesError.code === 'PGRST205') {
        console.log('⚠️  Messages table does not exist yet\n');
      } else {
        console.log('⚠️  Messages table error:', messagesError.message, '\n');
      }
    } else {
      console.log('✅ Messages table exists!');
      console.log(`   Found ${messages?.length || 0} message(s)\n`);
    }

    console.log('✅ Connection test completed!');
    console.log('\n📋 Next steps:');
    console.log('1. If tables don\'t exist, run the SQL migration');
    console.log('2. Deploy Edge Functions');
    console.log('3. Test wallet creation in the app');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error('Error:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testConnection();
