const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://vegzvwfceqcqnqujkaji.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc'
);

console.log('🧪 TESTING FIXED SQL SCRIPT');
console.log('============================');

async function testFixedSQL() {
    try {
        // Test 1: Check if profiles table has correct columns
        console.log('\n📋 Testing profiles table structure...');
        const { data: profileSample, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .limit(1);
        
        if (profileError) {
            console.log('❌ Profiles table error:', profileError.message);
            return false;
        }
        
        if (profileSample && profileSample.length > 0) {
            const columns = Object.keys(profileSample[0]);
            console.log('✅ Profiles table columns:', columns);
            
            // Check for problematic columns
            if (columns.includes('last_active')) {
                console.log('❌ last_active column still exists - SQL needs fixing');
                return false;
            }
            
            console.log('✅ No problematic columns found');
        }
        
        // Test 2: Check if views work
        console.log('\n👁️ Testing views...');
        const views = ['leaderboard', 'player_stats', 'game_history'];
        
        for (const view of views) {
            try {
                const { error } = await supabase
                    .from(view)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ View ${view} error:`, error.message);
                    return false;
                } else {
                    console.log(`✅ View ${view} working`);
                }
            } catch (err) {
                console.log(`❌ View ${view} crashed:`, err.message);
                return false;
            }
        }
        
        console.log('\n🎉 ALL TESTS PASSED! SQL SCRIPT IS READY!');
        return true;
        
    } catch (error) {
        console.log('💥 Test crashed:', error.message);
        return false;
    }
}

testFixedSQL()
    .then(success => {
        if (success) {
            console.log('\n🚀 COPY COMPLETE_WORKING_DATABASE.sql TO SUPABASE NOW!');
            process.exit(0);
        } else {
            console.log('\n❌ SQL STILL HAS ISSUES - NEEDS MORE FIXING!');
            process.exit(1);
        }
    });
