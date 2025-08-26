// Multiplayer Test Script for Symbol Duel
// Run this in your browser console to test everything

console.log('🧪 STARTING MULTIPLAYER TESTS...');

// Test 1: Check if Supabase is connected
async function testSupabaseConnection() {
  console.log('🔌 Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('games').select('count').limit(1);
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
    return false;
  }
}

// Test 2: Create fake test accounts
async function createTestAccounts() {
  console.log('👥 Creating test accounts...');
  
  const testUsers = [
    { id: 'test-user-1', username: 'TestPlayer1', email: 'test1@symbolduel.com' },
    { id: 'test-user-2', username: 'TestPlayer2', email: 'test2@symbolduel.com' },
    { id: 'test-user-3', username: 'TestPlayer3', email: 'test3@symbolduel.com' }
  ];
  
  for (const user of testUsers) {
    try {
      const { data, error } = await supabase
        .from('players')
        .upsert([user], { onConflict: 'user_id' })
        .select();
      
      if (error) throw error;
      console.log(`✅ Created/Updated player: ${user.username}`);
    } catch (error) {
      console.error(`❌ Failed to create player ${user.username}:`, error);
    }
  }
}

// Test 3: Create a test game
async function createTestGame() {
  console.log('🎮 Creating test game...');
  
  try {
    const gameData = {
      title: 'Test Multiplayer Game',
      description: 'Testing multiplayer functionality',
      entry_fee: 25.00,
      max_players: 6,
      creator_id: 'test-user-1'
    };
    
    const { data, error } = await supabase
      .from('games')
      .insert([gameData])
      .select()
      .single();
    
    if (error) throw error;
    console.log('✅ Test game created:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to create test game:', error);
    return null;
  }
}

// Test 4: Join the test game
async function joinTestGame(gameId) {
  console.log('🚪 Joining test game...');
  
  try {
    const { data, error } = await supabase
      .rpc('join_game_simple', {
        game_uuid: gameId,
        player_uuid: 'test-user-2'
      });
    
    if (error) throw error;
    console.log('✅ Player 2 joined game');
    
    // Join with player 3
    const { data: data2, error: error2 } = await supabase
      .rpc('join_game_simple', {
        game_uuid: gameId,
        player_uuid: 'test-user-3'
      });
    
    if (error2) throw error2;
    console.log('✅ Player 3 joined game');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to join game:', error);
    return false;
  }
}

// Test 5: Check game status
async function checkGameStatus(gameId) {
  console.log('📊 Checking game status...');
  
  try {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players(
          player:players(username)
        )
      `)
      .eq('id', gameId)
      .single();
    
    if (error) throw error;
    
    console.log('✅ Game status:', {
      id: data.id,
      status: data.status,
      current_players: data.current_players,
      max_players: data.max_players,
      players: data.game_players.map(gp => gp.player.username)
    });
    
    return data;
  } catch (error) {
    console.error('❌ Failed to check game status:', error);
    return null;
  }
}

// Test 6: Test real-time subscriptions
function testRealTimeSubscriptions(gameId) {
  console.log('📡 Testing real-time subscriptions...');
  
  const subscription = supabase
    .channel(`test-game:${gameId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
      (payload) => {
        console.log('🔄 Real-time game update:', payload);
      }
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
      (payload) => {
        console.log('🔄 Real-time player update:', payload);
      }
    )
    .subscribe();
  
  console.log('✅ Real-time subscription active');
  return subscription;
}

// Test 7: Start the game
async function startTestGame(gameId) {
  console.log('🚀 Starting test game...');
  
  try {
    const { data, error } = await supabase
      .rpc('start_game_simple', {
        game_uuid: gameId
      });
    
    if (error) throw error;
    console.log('✅ Game started successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to start game:', error);
    return false;
  }
}

// Test 8: Clean up test data
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Delete test games
    const { error: gamesError } = await supabase
      .from('games')
      .delete()
      .eq('creator_id', 'test-user-1');
    
    if (gamesError) throw gamesError;
    
    // Delete test players
    const { error: playersError } = await supabase
      .from('players')
      .delete()
      .in('user_id', ['test-user-1', 'test-user-2', 'test-user-3']);
    
    if (playersError) throw playersError;
    
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 STARTING COMPREHENSIVE MULTIPLAYER TESTS...\n');
  
  // Test 1: Connection
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.log('❌ Cannot continue without Supabase connection');
    return;
  }
  
  // Test 2: Create accounts
  await createTestAccounts();
  
  // Test 3: Create game
  const game = await createTestGame();
  if (!game) {
    console.log('❌ Cannot continue without test game');
    return;
  }
  
  // Test 4: Join game
  const joined = await joinTestGame(game.id);
  if (!joined) {
    console.log('❌ Cannot continue without players joining');
    return;
  }
  
  // Test 5: Check status
  await checkGameStatus(game.id);
  
  // Test 6: Real-time
  const subscription = testRealTimeSubscriptions(game.id);
  
  // Test 7: Start game
  await startTestGame(game.id);
  
  // Final status check
  await checkGameStatus(game.id);
  
  // Wait a bit then cleanup
  setTimeout(async () => {
    subscription.unsubscribe();
    await cleanupTestData();
    console.log('\n🎉 ALL TESTS COMPLETED!');
  }, 5000);
}

// Export for manual testing
window.testMultiplayer = {
  runAllTests,
  testSupabaseConnection,
  createTestAccounts,
  createTestGame,
  joinTestGame,
  checkGameStatus,
  testRealTimeSubscriptions,
  startTestGame,
  cleanupTestData
};

console.log('🧪 Test functions loaded! Run testMultiplayer.runAllTests() to start testing');
