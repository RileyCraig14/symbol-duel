// Test Supabase connection and authentication
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error);
    } else {
      console.log('✅ Supabase connection successful');
    }
    
    // Test auth
    const { data: { session } } = await supabase.auth.getSession();
    console.log('📊 Current session:', session ? 'Active' : 'None');
    
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testConnection();
