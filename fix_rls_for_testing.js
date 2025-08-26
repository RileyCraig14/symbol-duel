const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLSForTesting() {
    console.log('🔧 Fixing RLS Policies for Testing...\n');
    console.log('This will temporarily modify RLS policies to allow testing\n');

    try {
        // Test 1: Try to create a profile with current RLS
        console.log('📋 Test 1: Current RLS behavior...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                username: 'TestUser_' + Date.now(),
                email: 'test_' + Date.now() + '@test.com',
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
            console.log('❌ Profile creation blocked by RLS (expected):', profileError.message);
        } else {
            console.log('✅ Profile created (unexpected - RLS might be disabled)');
            return; // No need to fix if it's already working
        }

        // Test 2: Try to create a game with current RLS
        console.log('\n🎯 Test 2: Testing game creation with current RLS...');
        const { data: game, error: gameError } = await supabase
            .from('individual_games')
            .insert({
                title: 'Test Game ' + Date.now(),
                description: 'Testing RLS',
                entry_fee: 10.00,
                max_players: 2,
                creator_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
                status: 'waiting'
            })
            .select()
            .single();

        if (gameError) {
            console.log('❌ Game creation blocked by RLS (expected):', gameError.message);
        } else {
            console.log('✅ Game created (unexpected)');
        }

        console.log('\n🔍 ANALYSIS:');
        console.log('The RLS policies are working correctly and blocking operations.');
        console.log('This is actually GOOD for security!');
        console.log('');
        console.log('To test the system, we have 3 options:');
        console.log('');
        console.log('1. 🚀 TEST THROUGH THE ACTUAL APP (Recommended)');
        console.log('   - Start your React app');
        console.log('   - Create real user accounts through the UI');
        console.log('   - Test the full flow with real authentication');
        console.log('');
        console.log('2. 🔑 USE SERVICE ROLE KEY (For admin testing)');
        console.log('   - Get your service role key from Supabase dashboard');
        console.log('   - Use it for admin operations');
        console.log('');
        console.log('3. 🧪 TEMPORARILY DISABLE RLS (Not recommended for production)');
        console.log('   - Disable RLS on tables for testing');
        console.log('   - Re-enable after testing');
        console.log('');
        console.log('🎯 RECOMMENDATION:');
        console.log('Start your React app and test through the actual UI!');
        console.log('This will test the real user flow with proper authentication.');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the RLS fix test
fixRLSForTesting();
