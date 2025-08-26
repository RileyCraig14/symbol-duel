#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwNTU3MCwiZXhwIjoyMDcwNzgxNTcwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Setting up Symbol Duel database...\n');

  try {
    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'supabase', 'setup_database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('📋 Executing database setup...');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      try {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️  Warning: ${error.message}`);
          } else {
            successCount++;
          }
        }
      } catch (err) {
        console.log(`⚠️  Statement skipped: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Database setup completed!`);
    console.log(`   Successful statements: ${successCount}`);
    console.log(`   Warnings/errors: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Your Symbol Duel database is ready!');
      console.log('   You can now run the app with: npm start');
    } else {
      console.log('\n⚠️  Some database operations had warnings.');
      console.log('   The app should still work, but check the warnings above.');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n💡 Manual setup required:');
    console.log('   1. Go to your Supabase dashboard');
    console.log('   2. Open the SQL Editor');
    console.log('   3. Copy and paste the contents of supabase/setup_database.sql');
    console.log('   4. Run the SQL script');
  }
}

// Check if we have the required dependencies
try {
  require('@supabase/supabase-js');
} catch (error) {
  console.log('📦 Installing required dependencies...');
  require('child_process').execSync('npm install @supabase/supabase-js', { stdio: 'inherit' });
}

setupDatabase().catch(console.error);
