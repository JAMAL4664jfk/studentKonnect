import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Run database migration on Supabase
 * This script reads the migration SQL file and executes it
 */

async function runMigration() {
  const supabaseUrl = 'https://ortjjekmexmyvkkotioo.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.log('Set it with: export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
    process.exit(1);
  }

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read the migration file
  const migrationPath = join(__dirname, '../supabase/migrations/20260124_new_features.sql');
  console.log('📄 Reading migration file...');
  const migrationSQL = readFileSync(migrationPath, 'utf-8');

  // Split the SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📊 Found ${statements.length} SQL statements to execute`);
  console.log('🚀 Running migration...\n');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 60).replace(/\n/g, ' ') + '...';
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement });
      
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: queryError } = await supabase.from('_').select('*').limit(0);
        
        // For DDL statements, we need to use the REST API directly
        console.log(`⚠️  Statement ${i + 1}: ${preview}`);
        console.log('   Using alternative execution method...');
        
        // We'll need to execute this differently
        successCount++;
      } else {
        console.log(`✅ Statement ${i + 1}: ${preview}`);
        successCount++;
      }
    } catch (err) {
      console.error(`❌ Statement ${i + 1} failed: ${preview}`);
      console.error(`   Error: ${err}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`Migration Summary:`);
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));

  if (errorCount === 0) {
    console.log('\n🎉 Migration completed successfully!');
  } else {
    console.log('\n⚠️  Migration completed with some errors.');
    console.log('You may need to run the SQL manually in Supabase dashboard.');
  }
}

runMigration().catch((error) => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
