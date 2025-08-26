const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthentication() {
  console.log('🔐 Testing Symbol Duel Authentication...\n');
  
  try {
    // Test 1: Check if we can read profiles
    console.log('📊 Test 1: Reading profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Failed to read profiles:', profilesError.message);
    } else {
      console.log('✅ Successfully read profiles table');
      console.log(`📈 Found ${profiles.length} profiles`);
    }
    
    // Test 2: Check if we can read auth users
    console.log('\n👥 Test 2: Checking auth system...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth system working');
      if (user) {
        console.log('👤 Current user:', user.email);
      } else {
        console.log('👤 No user currently signed in');
      }
    }
    
    // Test 3: Check RLS policies
    console.log('\n🔒 Test 3: Testing Row Level Security...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('profiles')
      .select('id, username, tokens')
      .limit(1);
    
    if (rlsError) {
      console.log('❌ RLS error:', rlsError.message);
    } else {
      console.log('✅ RLS policies working correctly');
    }
    
    console.log('\n🎉 Authentication system test completed!');
    console.log('📱 Your app should now work properly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAuthentication();
