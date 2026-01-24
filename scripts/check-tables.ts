import { createClient } from '@supabase/supabase-js';

/**
 * Check which tables exist in the Supabase database
 */

async function checkTables() {
  const supabaseUrl = 'https://ortjjekmexmyvkkotioo.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA5OTI4MCwiZXhwIjoyMDg0Njc1MjgwfQ.K5QW7TAobh42FgH6Apco858cs3PdAostQ6wMwadxe6A';

  console.log('🔌 Connecting to Supabase...\n');
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tablesToCheck = [
    'users',
    'accommodations',
    'marketplaceItems',
    'rewards',
    'rewardTransactions',
    'rewardCatalog'
  ];

  console.log('📊 Checking tables:\n');

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Does not exist or not accessible`);
        console.log(`   Error: ${error.message}\n`);
      } else {
        console.log(`✅ ${table}: EXISTS (${count || 0} rows)\n`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error checking - ${err}\n`);
    }
  }

  console.log('='.repeat(50));
  console.log('Check complete!');
}

checkTables().catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
});
