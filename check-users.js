const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ortjjekmexmyvkkotioo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydGpqZWttZXhteXZra290aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTkyODAsImV4cCI6MjA4NDY3NTI4MH0.__lyxX1wdkAkO7xUj5cBuc1x9ae_h-cggfVl_yXby6A";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkUsers() {
  console.log('Checking profiles table...\n');
  
  // Get all profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, institution_name, course_program, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles.length} users in the database:\n`);
  
  if (profiles.length === 0) {
    console.log('❌ No users found in profiles table!');
    console.log('\nPossible reasons:');
    console.log('1. No one has signed up yet');
    console.log('2. The signup process is not creating profiles');
    console.log('3. RLS policies are blocking the query');
  } else {
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.full_name || 'No name'}`);
      console.log(`   Email: ${profile.email || 'No email'}`);
      console.log(`   Institution: ${profile.institution_name || 'Not set'}`);
      console.log(`   Program: ${profile.course_program || 'Not set'}`);
      console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
      console.log('');
    });
  }
}

checkUsers();
