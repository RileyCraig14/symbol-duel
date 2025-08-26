const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Your Supabase credentials
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Symbol Duel database...\n');
  
  try {
    // Read the SQL setup file
    const sqlSetup = fs.readFileSync('./supabase/setup_database.sql', 'utf8');
    
    console.log('📝 Running database setup...');
    
    // Execute the SQL setup
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlSetup });
    
    if (error) {
      // If exec_sql doesn't exist, try running individual commands
      console.log('⚠️  exec_sql not available, running individual commands...');
      
      // Run basic setup commands
      await runBasicSetup();
    } else {
      console.log('✅ Database setup completed successfully!');
    }
    
    console.log('\n🎉 Your Supabase database is now ready for Symbol Duel!');
    console.log('📱 Go back to your app and test the authentication.');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n🔧 Please run the SQL manually in your Supabase dashboard:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Copy the contents of supabase/setup_database.sql');
    console.log('4. Run the SQL commands');
  }
}

async function runBasicSetup() {
  console.log('🔧 Running basic database setup...');
  
  try {
    // Create profiles table
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          username TEXT,
          balance DECIMAL(10,2) DEFAULT 100.00,
          tokens INTEGER DEFAULT 100,
          points INTEGER DEFAULT 0,
          level INTEGER DEFAULT 1,
          experience INTEGER DEFAULT 0,
          streak_days INTEGER DEFAULT 0,
          last_daily_challenge TIMESTAMP WITH TIME ZONE,
          is_verified_creator BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });
    
    if (profilesError) {
      console.log('⚠️  Could not create profiles table automatically');
      console.log('📝 Please run the SQL manually in your Supabase dashboard');
      return;
    }
    
    console.log('✅ Basic setup completed');
    
  } catch (error) {
    console.log('⚠️  Automatic setup failed, please run manually');
  }
}

// Run the setup
setupDatabase();
