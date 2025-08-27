// Test if profile creation is working in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileCreation() {
  console.log('🔍 Testing profile creation...');
  
  try {
    // Check if we can read profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('❌ Error reading profiles:', error);
    } else {
      console.log('✅ Successfully read profiles:', profiles.length, 'found');
      if (profiles.length > 0) {
        console.log('📊 Sample profile:', profiles[0]);
      }
    }
    
    // Test if we can create a profile manually
    const testProfile = {
      id: 'test-user-' + Date.now(),
      username: 'TestUser' + Date.now(),
      email: 'test@example.com',
      account_balance: 100.00
    };
    
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select()
      .single();
    
    if (createError) {
      console.error('❌ Error creating test profile:', createError);
    } else {
      console.log('✅ Successfully created test profile:', newProfile);
      
      // Clean up test profile
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testProfile.id);
      console.log('🧹 Cleaned up test profile');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testProfileCreation();
