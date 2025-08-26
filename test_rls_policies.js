const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLSPolicies() {
    console.log('🔒 Testing Row Level Security (RLS) Policies...\n');

    try {
        // Test 1: Check if we can read from profiles table
        console.log('📋 Test 1: Testing READ access to profiles table...');
        const { data: profiles, error: readError } = await supabase
            .from('profiles')
            .select('id, username, email')
            .limit(5);

        if (readError) {
            console.log('❌ READ access blocked:', readError.message);
        } else {
            console.log('✅ READ access allowed');
            console.log(`   Found ${profiles.length} existing profiles`);
            if (profiles.length > 0) {
                console.log('   Sample profiles:', profiles.slice(0, 3).map(p => p.username));
            }
        }

        // Test 2: Try to create a profile (this should fail due to RLS)
        console.log('\n👤 Test 2: Testing INSERT access to profiles table...');
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                username: 'RLSTestUser_' + Date.now(),
                email: 'rls_test_' + Date.now() + '@test.com',
                account_balance: 50.00,
                location_state: 'CA',
                birth_date: '1990-01-01',
                age_verified: true,
                compliance_verified: true,
                legal_agreement_signed: true
            })
            .select()
            .single();

        if (insertError) {
            console.log('❌ INSERT access blocked (expected due to RLS):', insertError.message);
            console.log('   This is the RLS policy blocking us!');
        } else {
            console.log('✅ INSERT access allowed (unexpected!)');
            console.log('   Profile created:', newProfile.username);
        }

        // Test 3: Check what tables exist and their RLS status
        console.log('\n📊 Test 3: Checking table structure and RLS status...');
        
        // Test individual_games table
        const { data: games, error: gamesError } = await supabase
            .from('individual_games')
            .select('id, title, status')
            .limit(3);

        if (gamesError) {
            console.log('❌ individual_games table access blocked:', gamesError.message);
        } else {
            console.log('✅ individual_games table accessible');
            console.log(`   Found ${games.length} existing games`);
        }

        // Test game_players table
        const { data: players, error: playersError } = await supabase
            .from('game_players')
            .select('id, game_id, player_id')
            .limit(3);

        if (playersError) {
            console.log('❌ game_players table access blocked:', playersError.message);
        } else {
            console.log('✅ game_players table accessible');
            console.log(`   Found ${players.length} existing game players`);
        }

        // Test 4: Check if we can read from other tables
        console.log('\n🔍 Test 4: Testing access to other tables...');
        
        const tablesToTest = [
            'stripe_transactions',
            'daily_challenges', 
            'challenge_attempts',
            'game_results'
        ];

        for (const tableName of tablesToTest) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('id')
                    .limit(1);

                if (error) {
                    console.log(`❌ ${tableName}: ${error.message}`);
                } else {
                    console.log(`✅ ${tableName}: Accessible`);
                }
            } catch (err) {
                console.log(`❌ ${tableName}: ${err.message}`);
            }
        }

        // Test 5: Try to create a game (this might work if creator_id is null)
        console.log('\n🎯 Test 5: Testing game creation...');
        const { data: newGame, error: gameError } = await supabase
            .from('individual_games')
            .insert({
                title: 'RLS Test Game ' + Date.now(),
                description: 'Testing RLS policies',
                entry_fee: 10.00,
                max_players: 2,
                creator_id: null, // This might cause issues
                status: 'waiting'
            })
            .select()
            .single();

        if (gameError) {
            console.log('❌ Game creation blocked:', gameError.message);
        } else {
            console.log('✅ Game created successfully:', newGame.title);
        }

        // Test 6: Check current RLS policies
        console.log('\n📜 Test 6: RLS Policy Analysis...');
        console.log('The issue is that the RLS policies require:');
        console.log('   - auth.uid() = id (for profiles)');
        console.log('   - auth.uid() = creator_id (for games)');
        console.log('   - But we have no authenticated user context');
        console.log('');
        console.log('This means:');
        console.log('   1. ✅ Tables exist and are accessible');
        console.log('   2. ❌ RLS policies are blocking operations');
        console.log('   3. 🔧 We need to either:');
        console.log('      - Fix the RLS policies for testing');
        console.log('      - Use service role key for admin operations');
        console.log('      - Test through the actual app with real auth');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the RLS test
testRLSPolicies();
