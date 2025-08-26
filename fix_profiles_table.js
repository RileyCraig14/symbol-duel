const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixProfilesTable() {
  console.log('🔍 Checking profiles table structure...\n');
  
  try {
    // First, let's see what columns exist
    console.log('📊 Checking current table structure...');
    const { data: columns, error: columnsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.log('❌ Error reading table:', columnsError.message);
      return;
    }
    
    if (columns.length > 0) {
      console.log('✅ Table structure found:');
      console.log('📋 Columns:', Object.keys(columns[0]));
    } else {
      console.log('📋 Table is empty, checking schema...');
    }
    
    // Now let's add the missing columns
    console.log('\n🔧 Adding missing columns...');
    
    // Add tokens column
    try {
      const { error: tokensError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 100;'
      });
      
      if (tokensError) {
        console.log('⚠️  Could not add tokens column automatically');
        console.log('📝 You need to add it manually in Supabase dashboard');
      } else {
        console.log('✅ Added tokens column');
      }
    } catch (e) {
      console.log('⚠️  Could not add tokens column automatically');
    }
    
    // Add other missing columns
    const missingColumns = [
      'points INTEGER DEFAULT 0',
      'level INTEGER DEFAULT 1', 
      'experience INTEGER DEFAULT 0',
      'streak_days INTEGER DEFAULT 0',
      'last_daily_challenge TIMESTAMP WITH TIME ZONE',
      'is_verified_creator BOOLEAN DEFAULT FALSE',
      'creator_bio TEXT',
      'creator_website TEXT',
      'creator_social_links JSONB',
      'total_challenges_created INTEGER DEFAULT 0',
      'total_revenue_generated INTEGER DEFAULT 0',
      'creator_rating DECIMAL(3,2) DEFAULT 0.00',
      'creator_reviews_count INTEGER DEFAULT 0'
    ];
    
    console.log('\n📋 Missing columns that need to be added:');
    missingColumns.forEach(col => console.log(`  - ${col}`));
    
    console.log('\n🔧 To fix this, run this SQL in your Supabase dashboard:');
    console.log('='.repeat(60));
    console.log(`
-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_challenge TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_social_links JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_challenges_created INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_revenue_generated INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_reviews_count INTEGER DEFAULT 0;

-- Update existing profiles to have default values
UPDATE public.profiles SET 
    tokens = COALESCE(tokens, 100),
    points = COALESCE(points, 0),
    level = COALESCE(level, 1),
    experience = COALESCE(experience, 0),
    streak_days = COALESCE(streak_days, 0),
    is_verified_creator = COALESCE(is_verified_creator, FALSE),
    total_challenges_created = COALESCE(total_challenges_created, 0),
    total_revenue_generated = COALESCE(total_revenue_generated, 0),
    creator_rating = COALESCE(creator_rating, 0.00),
    creator_reviews_count = COALESCE(creator_reviews_count, 0)
WHERE tokens IS NULL OR points IS NULL OR level IS NULL;
    `);
    console.log('='.repeat(60));
    
    console.log('\n📱 After running this SQL, your authentication should work!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the check
checkAndFixProfilesTable();
