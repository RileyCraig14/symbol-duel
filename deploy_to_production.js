#!/usr/bin/env node

// Deploy to Production Script
// This script will help you deploy your multiplayer betting website

const fs = require('fs');

console.log('🚀 DEPLOYING SYMBOL DUEL TO PRODUCTION');
console.log('======================================\n');

// Step 1: Check if all files are ready
console.log('📋 Checking deployment readiness...');

const requiredFiles = [
    'src/App.jsx',
    'src/components/IndividualGameSystem.jsx',
    'src/components/Leaderboard.jsx',
    'src/components/AuthForm.jsx',
    'src/utils/realSupabase.js',
    'WORKING_DATABASE_SETUP.sql',
    'package.json',
    'vercel.json'
];

let allFilesReady = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log('✅', file);
    } else {
        console.log('❌', file, '- MISSING');
        allFilesReady = false;
    }
});

if (!allFilesReady) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

// Step 2: Create environment file
console.log('\n🔧 Creating environment file...');
const envContent = `# Symbol Duel - Production Environment
REACT_APP_SUPABASE_URL=https://vegzvwfceqcqnqujkaji.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc

# App Configuration
REACT_APP_APP_NAME=Symbol Duel
REACT_APP_APP_URL=https://symbol-duel.vercel.app

# Development flags
REACT_APP_DEBUG=true
REACT_APP_FAKE_MONEY=true`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ Created .env.local with Supabase credentials');

// Step 3: Create deployment instructions
console.log('\n📝 Creating deployment instructions...');

const deploymentInstructions = `
# 🚀 DEPLOYMENT INSTRUCTIONS

## STEP 1: Set Up Supabase Database

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Open your project: https://vegzvwfceqcqnqujkaji.supabase.co
3. Go to SQL Editor
4. Copy and paste the contents of WORKING_DATABASE_SETUP.sql
5. Click "Run" to create all tables
6. Copy and paste the contents of TEST_DATABASE.sql
7. Click "Run" to verify everything works

## STEP 2: Deploy to Vercel

1. Push your code to GitHub:
   \`\`\`bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   \`\`\`

2. Go to Vercel: https://vercel.com
3. Click "New Project"
4. Import your GitHub repository: RileyCraig14/symbol-duel
5. Add environment variables:
   - REACT_APP_SUPABASE_URL: https://vegzvwfceqcqnqujkaji.supabase.co
   - REACT_APP_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc
6. Click "Deploy"

## STEP 3: Test Your Live Website

1. Your app will be live at: https://symbol-duel.vercel.app
2. Create an account (you'll get $100 fake money)
3. Create a game with an entry fee
4. Share the URL with friends
5. Everyone can join and play together!

## STEP 4: Share with Friends

Share this URL: https://symbol-duel.vercel.app

Everyone can:
- Sign up and get $100 fake money
- Create games with entry fees
- Join each other's games
- Play real-time multiplayer puzzles
- Win prize pools
- See live leaderboards

## 🎉 YOU'RE LIVE!

Your multiplayer betting website is now live and ready for real users!
`;

fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', deploymentInstructions);
console.log('✅ Created DEPLOYMENT_INSTRUCTIONS.md');

// Step 4: Create a quick test script
console.log('\n🧪 Creating test script...');

const testScript = `#!/usr/bin/env node

// Quick Test Script
console.log('🧪 Testing production deployment...');

// Test 1: Check if app builds
const { exec } = require('child_process');

exec('npm run build', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ Build failed:', error.message);
        return;
    }
    console.log('✅ App builds successfully');
    console.log('🚀 Ready for deployment!');
});

console.log('📋 Next steps:');
console.log('1. Run: npm run build');
console.log('2. Set up Supabase database');
console.log('3. Deploy to Vercel');
console.log('4. Share with friends!');
`;

fs.writeFileSync('test_production.js', testScript);
console.log('✅ Created test_production.js');

// Final summary
console.log('\n🎉 DEPLOYMENT READY!');
console.log('====================');
console.log('✅ All files checked and ready');
console.log('✅ Environment file created');
console.log('✅ Deployment instructions created');
console.log('✅ Test script created');

console.log('\n🚀 NEXT STEPS:');
console.log('===============');
console.log('1. Set up Supabase database (run WORKING_DATABASE_SETUP.sql)');
console.log('2. Push to GitHub: git add . && git commit -m "Ready for production" && git push');
console.log('3. Deploy to Vercel with environment variables');
console.log('4. Share https://symbol-duel.vercel.app with friends!');

console.log('\n📋 FILES CREATED:');
console.log('==================');
console.log('✅ .env.local - Environment variables');
console.log('✅ DEPLOYMENT_INSTRUCTIONS.md - Step-by-step guide');
console.log('✅ test_production.js - Test script');

console.log('\n🎮 Your multiplayer betting website is ready for production!');
`;

fs.writeFileSync('deploy_to_production.js', deployScript);
console.log('✅ Created deploy_to_production.js');

// Run the deployment script
console.log('\n🚀 Running deployment script...');
require('./deploy_to_production.js');
