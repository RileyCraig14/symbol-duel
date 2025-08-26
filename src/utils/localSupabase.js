// Local Supabase Service for Testing
// This simulates Supabase functionality using the local database

import localDB from './localDatabase.js';

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async ({ email, password, options }) => {
      console.log('🔐 Local signup:', email);
      const mockUser = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: options?.data || {}
      };
      return { data: { user: mockUser }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      console.log('🔐 Local signin:', email);
      const mockUser = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: { username: 'TestUser' }
      };
      return { data: { user: mockUser }, error: null };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback) => {
      console.log('🔄 Local auth state change listener');
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', { user: { id: 'test-user', email: 'test@example.com' } });
      }, 1000);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Local game service
export const realtimeGameService = {
  async createGame(gameData) {
    console.log('🎮 Creating game:', gameData);
    
    const game = {
      id: 'game-' + Date.now(),
      title: gameData.title,
      description: gameData.description,
      entry_fee: gameData.entryFee,
      max_players: gameData.maxPlayers,
      current_players: 1,
      status: 'lobby',
      creator_id: 'test-user',
      creator_username: gameData.creatorUsername,
      prize_pool: gameData.entryFee * gameData.maxPlayers,
      created_at: new Date().toISOString()
    };

    // Add to local database
    localDB.tables.games.set(game.id, game);
    
    console.log('✅ Game created:', game);
    return game;
  },

  async getAvailableGames() {
    console.log('📋 Getting available games');
    const games = Array.from(localDB.tables.games.values())
      .filter(game => game.status === 'lobby')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    console.log('✅ Available games:', games.length);
    return games;
  },

  async joinGame(gameId) {
    console.log('👥 Joining game:', gameId);
    
    const game = localDB.tables.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.current_players >= game.max_players) {
      throw new Error('Game is full');
    }

    // Add player to game
    const playerId = 'gp-' + Date.now();
    const player = {
      id: playerId,
      game_id: gameId,
      player_id: 'test-user',
      player_username: 'TestUser',
      joined_at: new Date().toISOString()
    };

    localDB.tables.game_players.set(playerId, player);
    
    // Update game player count
    game.current_players += 1;
    if (game.current_players >= 3) {
      game.status = 'countdown';
    }
    localDB.tables.games.set(gameId, game);

    console.log('✅ Joined game:', gameId, 'Players:', game.current_players);
    return { success: true, game };
  },

  async startGame(gameId, puzzles) {
    console.log('🚀 Starting game:', gameId, 'with puzzles:', puzzles.length);
    
    const game = localDB.tables.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Update game status
    game.status = 'active';
    game.started_at = new Date().toISOString();
    game.game_data = { puzzles };
    localDB.tables.games.set(gameId, game);

    console.log('✅ Game started:', gameId);
    return { success: true, game };
  },

  subscribeToAvailableGames(callback) {
    console.log('🔄 Subscribing to game updates');
    // Simulate real-time updates
    setInterval(() => {
      const games = Array.from(localDB.tables.games.values())
        .filter(game => game.status === 'lobby');
      callback({ eventType: 'UPDATE', new: games[0] });
    }, 5000);
    return { unsubscribe: () => {} };
  },

  subscribeToGame(gameId, callback) {
    console.log('🔄 Subscribing to game:', gameId);
    return { unsubscribe: () => {} };
  }
};

// Local leaderboard service
export const realtimeLeaderboardService = {
  async getLeaderboard(limit = 50) {
    console.log('📊 Getting leaderboard');
    const leaderboard = localDB.leaderboard.slice(0, limit);
    console.log('✅ Leaderboard entries:', leaderboard.length);
    return leaderboard;
  },

  subscribeToLeaderboard(callback) {
    console.log('🔄 Subscribing to leaderboard updates');
    return { unsubscribe: () => {} };
  }
};

// Local profile service
export const realtimeProfileService = {
  async getProfile(userId) {
    console.log('👤 Getting profile for:', userId);
    const profile = localDB.tables.profiles.get(userId) || {
      id: userId,
      username: 'TestUser',
      email: 'test@example.com',
      account_balance: 100.00,
      total_winnings: 0.00,
      total_deposits: 0.00,
      total_withdrawals: 0.00,
      games_played: 0,
      games_won: 0,
      total_score: 0,
      win_rate: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return profile;
  },

  subscribeToProfile(userId, callback) {
    console.log('🔄 Subscribing to profile updates for:', userId);
    return { unsubscribe: () => {} };
  }
};

// Export database for debugging
export { localDB };
