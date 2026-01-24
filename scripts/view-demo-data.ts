import { createClient } from '@supabase/supabase-js';

/**
 * View demo data from all tables
 */

async function viewData() {
  const supabaseUrl = 'https://ortjjekmexmyvkkotioo.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTA5OTI4MCwiZXhwIjoyMDg0Njc1MjgwfQ.K5QW7TAobh42FgH6Apco858cs3PdAostQ6wMwadxe6A';

  console.log('🔌 Connecting to Supabase...\n');
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch users
  console.log('👥 USERS:');
  console.log('='.repeat(60));
  const { data: users } = await supabase.from('users').select('*');
  users?.forEach(user => {
    console.log(`  ID: ${user.id} | Name: ${user.name} | Email: ${user.email}`);
  });

  // Fetch accommodations
  console.log('\n🏠 ACCOMMODATIONS:');
  console.log('='.repeat(60));
  const { data: accommodations } = await supabase.from('accommodations').select('*');
  accommodations?.forEach(acc => {
    console.log(`  ${acc.title}`);
    console.log(`  📍 ${acc.city}, ${acc.country}`);
    console.log(`  💰 $${acc.price}/month | ${acc.propertyType} | ${acc.bedrooms} bed, ${acc.bathrooms} bath`);
    console.log(`  ✅ Available: ${acc.isAvailable}\n`);
  });

  // Fetch marketplace items
  console.log('🛒 MARKETPLACE ITEMS:');
  console.log('='.repeat(60));
  const { data: items } = await supabase.from('marketplaceItems').select('*');
  items?.forEach(item => {
    console.log(`  ${item.title}`);
    console.log(`  💰 $${item.price} | ${item.category} | ${item.condition}`);
    console.log(`  👁️  ${item.views} views | Featured: ${item.isFeatured}\n`);
  });

  // Fetch rewards
  console.log('🏆 REWARDS:');
  console.log('='.repeat(60));
  const { data: rewards } = await supabase.from('rewards').select('*');
  rewards?.forEach(reward => {
    const user = users?.find(u => u.id === reward.userId);
    console.log(`  ${user?.name}: ${reward.points} points (${reward.level})`);
    console.log(`  📊 Total Earned: ${reward.totalEarned} | Redeemed: ${reward.totalRedeemed}\n`);
  });

  // Fetch reward catalog
  console.log('🎁 REWARD CATALOG:');
  console.log('='.repeat(60));
  const { data: catalog } = await supabase.from('rewardCatalog').select('*');
  catalog?.forEach(item => {
    console.log(`  ${item.title}`);
    console.log(`  💎 ${item.pointsCost} points | ${item.category}`);
    console.log(`  ${item.description.substring(0, 80)}...\n`);
  });

  // Fetch transactions
  console.log('📊 RECENT TRANSACTIONS:');
  console.log('='.repeat(60));
  const { data: transactions } = await supabase.from('rewardTransactions').select('*').order('createdAt', { ascending: false });
  transactions?.forEach(tx => {
    const user = users?.find(u => u.id === tx.userId);
    const sign = tx.type === 'earn' ? '+' : '-';
    console.log(`  ${user?.name}: ${sign}${Math.abs(tx.points)} points`);
    console.log(`  ${tx.description}\n`);
  });

  console.log('='.repeat(60));
  console.log('✨ All data displayed successfully!');
}

viewData().catch((error) => {
  console.error('❌ Failed to view data:', error);
  process.exit(1);
});
