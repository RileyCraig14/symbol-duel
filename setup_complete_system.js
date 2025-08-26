#!/usr/bin/env node

// Complete System Setup Script
// This script will help you set up the entire multiplayer betting system

const fs = require('fs');
const path = require('path');

console.log('🚀 Symbol Duel - Complete System Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, 'env.local');

if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file...');
    if (fs.existsSync(envLocalPath)) {
        fs.copyFileSync(envLocalPath, envPath);
        console.log('✅ .env file created from template');
    } else {
        console.log('❌ env.local template not found');
    }
} else {
    console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing dependencies...');
    console.log('Run: npm install');
} else {
    console.log('✅ Dependencies already installed');
}

// Check if Supabase files exist
const supabaseFiles = [
    'src/utils/realSupabase.js',
    'WORKING_DATABASE_SETUP.sql',
    'TEST_DATABASE.sql'
];

console.log('\n📋 Checking required files...');
supabaseFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
    }
});

console.log('\n🎯 SETUP INSTRUCTIONS:');
console.log('======================');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. In your Supabase dashboard, go to SQL Editor');
console.log('3. Copy and paste the contents of WORKING_DATABASE_SETUP.sql');
console.log('4. Run the SQL script');
console.log('5. Copy and paste the contents of TEST_DATABASE.sql');
console.log('6. Run the test script to verify everything works');
console.log('7. In Supabase Settings > API, copy your Project URL and anon key');
console.log('8. Update your .env file with the Supabase credentials');
console.log('9. Run: npm start');
console.log('10. Open http://localhost:3000 and test with friends!');

console.log('\n🎮 WHAT YOU\'LL HAVE:');
console.log('====================');
console.log('✅ Real user authentication');
console.log('✅ $100 fake money for all new users');
console.log('✅ Real-time multiplayer games');
console.log('✅ Live leaderboards');
console.log('✅ Game lobbies with player joining');
console.log('✅ Puzzle solving with scoring');
console.log('✅ Winner takes all prize pools');
console.log('✅ Complete game history tracking');

console.log('\n🔧 TROUBLESHOOTING:');
console.log('===================');
console.log('If you get database errors:');
console.log('- Make sure you ran WORKING_DATABASE_SETUP.sql first');
console.log('- Check that all tables were created');
console.log('- Verify your Supabase URL and key in .env');
console.log('- Check browser console for error messages');

console.log('\n📞 NEED HELP?');
console.log('=============');
console.log('1. Check browser console (F12) for errors');
console.log('2. Verify Supabase project is active');
console.log('3. Make sure all environment variables are set');
console.log('4. Test with multiple browser windows/devices');

console.log('\n🎉 Ready to build your multiplayer betting empire!');