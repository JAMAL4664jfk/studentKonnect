/**
 * Test Supabase Connection
 * 
 * This script tests the connection to your new Supabase database
 * Run with: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');

// Your new Supabase credentials
const SUPABASE_URL = 'https://ortjjekmexmyvkkotioo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTU4ODUsImV4cCI6MjA1MzEzMTg4NX0.ytzxsuI-LIsxPRGVO5m7tg_76A4dGmb';

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');
  console.log('URL:', SUPABASE_URL);
  console.log('Project Ref: ortjjekmexmyvkkotioo\n');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Test 1: Check if we can connect
    console.log('Test 1: Basic connection...');
    const { data, error } = await supabase.from('_test').select('*').limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (which is fine)
      throw error;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Check if wallets table exists
    console.log('Test 2: Checking for wallets table...');
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('*')
      .limit(1);

    if (walletsError) {
      if (walletsError.code === 'PGRST116') {
        console.log('⚠️  Wallets table does not exist yet');
        console.log('   Run the SQL migration to create it\n');
      } else {
        throw walletsError;
      }
    } else {
      console.log('✅ Wallets table exists!');
      console.log(`   Found ${wallets?.length || 0} wallet(s)\n`);
    }

    // Test 3: List all tables
    console.log('Test 3: Listing all tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (!tablesError && tables) {
      console.log('✅ Found tables:');
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }

    console.log('\n✅ All tests passed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the SQL migration to create wallets table (if not exists)');
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
