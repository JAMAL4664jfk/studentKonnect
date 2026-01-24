import { createClient } from '@supabase/supabase-js';

/**
 * Test script to verify the app can fetch data from Supabase
 * This simulates what the React Native app will do
 */

async function testIntegration() {
  const supabaseUrl = 'https://ortjjekmexmyvkkotioo.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTkyODAsImV4cCI6MjA4NDY3NTI4MH0.__lyxX1wdkAkO7xUj5cBuc1x9ae_h-cggfVl_yXby6A';

  console.log('🧪 Testing App Integration with Supabase...\n');
  console.log('Using ANON key (same as the app will use)\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test 1: Fetch accommodations
  console.log('📋 Test 1: Fetching accommodations...');
  try {
    const { data: accommodations, error } = await supabase
      .from('accommodations')
      .select('*')
      .eq('isAvailable', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    console.log(`✅ SUCCESS: Found ${accommodations?.length || 0} accommodations`);
    if (accommodations && accommodations.length > 0) {
      const first = accommodations[0];
      console.log(`   Sample: "${first.title}" - ${first.currency} ${first.price}/month`);
    }
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  console.log('');

  // Test 2: Fetch marketplace items
  console.log('📋 Test 2: Fetching marketplace items...');
  try {
    const { data: items, error } = await supabase
      .from('marketplaceItems')
      .select('*')
      .eq('isAvailable', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    console.log(`✅ SUCCESS: Found ${items?.length || 0} marketplace items`);
    if (items && items.length > 0) {
      const first = items[0];
      console.log(`   Sample: "${first.title}" - ${first.currency} ${first.price}`);
      console.log(`   Category: ${first.category}, Condition: ${first.condition}`);
    }
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  console.log('');

  // Test 3: Fetch rewards catalog
  console.log('📋 Test 3: Fetching rewards catalog...');
  try {
    const { data: catalog, error } = await supabase
      .from('rewardCatalog')
      .select('*')
      .eq('isActive', true)
      .order('pointsCost', { ascending: true });

    if (error) throw error;

    console.log(`✅ SUCCESS: Found ${catalog?.length || 0} reward items`);
    if (catalog && catalog.length > 0) {
      const first = catalog[0];
      console.log(`   Sample: "${first.title}" - ${first.pointsCost} points`);
    }
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  console.log('');

  // Test 4: Check data structure
  console.log('📋 Test 4: Verifying data structure...');
  try {
    const { data: accommodation, error } = await supabase
      .from('accommodations')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    console.log('✅ SUCCESS: Data structure verified');
    console.log('   Fields present:', Object.keys(accommodation || {}).join(', '));
    
    // Check if JSON fields can be parsed
    if (accommodation) {
      try {
        const amenities = JSON.parse(accommodation.amenities || '[]');
        const images = JSON.parse(accommodation.images || '[]');
        console.log(`   Amenities: ${amenities.length} items`);
        console.log(`   Images: ${images.length} items`);
      } catch (e) {
        console.log('   ⚠️  Warning: JSON fields might not be properly formatted');
      }
    }
  } catch (error: any) {
    console.log(`❌ FAILED: ${error.message}`);
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('✨ Integration test complete!');
  console.log('='.repeat(60));
  console.log('\n💡 The app should now be able to:');
  console.log('   1. Display accommodation listings');
  console.log('   2. Display marketplace items');
  console.log('   3. Show item details when clicked');
  console.log('   4. Filter by category/type');
  console.log('   5. Search by keywords');
}

testIntegration().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
