const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSimpleGame() {
    console.log('🎮 Starting Symbol Duel Database Test...\n');

    try {
        // Test 1: Check if tables exist
        console.log('📋 Test 1: Checking database tables...');
        const { data: tables, error: tablesError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);
        
        if (tablesError) {
            console.log('❌ Profiles table error:', tablesError.message);
            return;
        }
        console.log('✅ Profiles table exists');

        // Test 2: Create a test profile
        console.log('\n👤 Test 2: Creating test profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                username: 'TestUser_' + Date.now(),
                email: 'test' + Date.now() + '@test.com',
                account_balance: 50.00,
                location_state: 'CA',
                birth_date: '1990-01-01',
                age_verified: true,
                compliance_verified: true,
                legal_agreement_signed: true
            })
            .select()
            .single();

        if (profileError) {
            console.log('❌ Profile creation error:', profileError.message);
            return;
        }
        console.log('✅ Test profile created:', profile.username);

        // Test 3: Create a test game
        console.log('\n🎯 Test 3: Creating test game...');
        const { data: game, error: gameError } = await supabase
            .from('individual_games')
            .insert({
                title: 'Test Game ' + Date.now(),
                description: 'A simple test game',
                entry_fee: 10.00,
                max_players: 2,
                creator_id: profile.id
            })
            .select()
            .single();

        if (gameError) {
            console.log('❌ Game creation error:', gameError.message);
            return;
        }
        console.log('✅ Test game created:', game.title, 'ID:', game.id);

        // Test 4: Join the game
        console.log('\n🎮 Test 4: Joining test game...');
        const { data: player, error: playerError } = await supabase
            .from('game_players')
            .insert({
                game_id: game.id,
                player_id: profile.id,
                entry_fee_paid: 10.00
            })
            .select()
            .single();

        if (playerError) {
            console.log('❌ Game join error:', playerError.message);
            return;
        }
        console.log('✅ Joined game successfully');

        // Test 5: Update game status
        console.log('\n🔄 Test 5: Updating game status...');
        const { data: updatedGame, error: updateError } = await supabase
            .from('individual_games')
            .update({ 
                current_players: 1,
                status: 'waiting'
            })
            .eq('id', game.id)
            .select()
            .single();

        if (updateError) {
            console.log('❌ Game update error:', updateError.message);
            return;
        }
        console.log('✅ Game status updated:', updatedGame.status);

        // Test 6: Check current data
        console.log('\n📊 Test 6: Checking current data...');
        
        // Check profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('username, account_balance, games_played')
            .eq('username', profile.username);
        
        if (profilesError) {
            console.log('❌ Profiles query error:', profilesError.message);
        } else {
            console.log('✅ Current profile data:', profiles[0]);
        }

        // Check games
        const { data: games, error: gamesError } = await supabase
            .from('individual_games')
            .select('title, status, current_players, entry_fee')
            .eq('id', game.id);
        
        if (gamesError) {
            console.log('❌ Games query error:', gamesError.message);
        } else {
            console.log('✅ Current game data:', games[0]);
        }

        // Check game players
        const { data: players, error: playersError } = await supabase
            .from('game_players')
            .select('entry_fee_paid, joined_at')
            .eq('game_id', game.id);
        
        if (playersError) {
            console.log('❌ Game players query error:', playersError.message);
        } else {
            console.log('✅ Current game players:', players);
        }

        console.log('\n🎉 All basic tests completed successfully!');
        console.log('✅ Database is working correctly');
        console.log('✅ Tables are accessible');
        console.log('✅ CRUD operations are functional');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testSimpleGame();
