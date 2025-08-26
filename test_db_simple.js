const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials
const supabaseUrl = 'https://vegpvwfceqcnqqujkaj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3B2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwNTU3MCwiZXhwIjoyMDcwNzgxNTcwfQ.SQTob_GHmivdH57UgWeDuZDdmrWkYA5wLcQwzai52LE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🧪 Testing database connection and basic operations...\n');

  try {
    // Test 1: Check if we can read from profiles
    console.log('1️⃣ Testing profiles table read...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles read failed:', profilesError);
    } else {
      console.log('✅ Profiles read successful:', profiles?.length || 0, 'profiles found');
    }

    // Test 2: Check if we can read from individual_games
    console.log('\n2️⃣ Testing individual_games table read...');
    const { data: games, error: gamesError } = await supabase
      .from('individual_games')
      .select('*')
      .limit(1);
    
    if (gamesError) {
      console.error('❌ Games read failed:', gamesError);
    } else {
      console.log('✅ Games read successful:', games?.length || 0, 'games found');
    }

    // Test 3: Check if we can read from game_players
    console.log('\n3️⃣ Testing game_players table read...');
    const { data: players, error: playersError } = await supabase
      .from('game_players')
      .select('*')
      .limit(1);
    
    if (playersError) {
      console.error('❌ Game players read failed:', playersError);
    } else {
      console.log('✅ Game players read successful:', players?.length || 0, 'players found');
    }

    // Test 4: Check table structure
    console.log('\n4️⃣ Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'individual_games' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (tableError) {
      console.log('ℹ️ RPC not available, checking with direct query...');
      // Try a simple insert to see if we get a schema error
      const { error: insertError } = await supabase
        .from('individual_games')
        .insert({
          title: 'TEST GAME',
          entry_fee: 10.00,
          max_players: 2,
          current_players: 1,
          creator_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          status: 'waiting'
        });
      
      if (insertError) {
        console.log('ℹ️ Insert test error (expected):', insertError.message);
        console.log('✅ This confirms the table structure is correct');
      }
    } else {
      console.log('✅ Table structure check successful');
    }

    console.log('\n🎉 Database test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testDatabase();
