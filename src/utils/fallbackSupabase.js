// Fallback Supabase service for testing without database
// This simulates the real Supabase functionality

// Mock Supabase client
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signUp: async ({ email, password, options }) => {
      // Simulate successful signup
      const mockUser = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: options?.data || {}
      };
      return { data: { user: mockUser }, error: null };
    },
    signInWithPassword: async ({ email, password }) => {
      // Simulate successful signin
      const mockUser = {
        id: 'user-' + Date.now(),
        email: email,
        user_metadata: { username: 'TestUser' }
      };
      return { data: { user: mockUser }, error: null };
    },
    signOut: async () => ({ error: null }),
    onAuthStateChange: (callback) => {
      // Simulate auth state change
      setTimeout(() => {
        callback('SIGNED_IN', { user: { id: 'test-user', email: 'test@example.com' } });
      }, 1000);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  }
};

// Mock game service
export const realtimeGameService = {
  async createGame(gameData) {
    console.log('🎮 Creating game:', gameData);
    const mockGame = {
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
    return mockGame;
  },

  async getAvailableGames() {
    console.log('📋 Getting available games');
    // Return some mock games
    return [
      {
        id: 'game-1',
        title: '$25 Game',
        description: 'High stakes puzzle challenge',
        entry_fee: 25,
        max_players: 6,
        current_players: 2,
        status: 'lobby',
        creator_username: 'Player1',
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      {
        id: 'game-2',
        title: '$15 Quick Game',
        description: 'Fast-paced puzzle fun',
        entry_fee: 15,
        max_players: 4,
        current_players: 3,
        status: 'countdown',
        creator_username: 'Player2',
        created_at: new Date(Date.now() - 600000).toISOString()
      }
    ];
  },

  async joinGame(gameId) {
    console.log('👥 Joining game:', gameId);
    return { success: true };
  },

  async startGame(gameId, puzzles) {
    console.log('🚀 Starting game:', gameId, 'with puzzles:', puzzles.length);
    return { success: true };
  },

  subscribeToAvailableGames(callback) {
    console.log('🔄 Subscribing to game updates');
    // Simulate real-time updates
    setInterval(() => {
      callback({ eventType: 'UPDATE', new: { id: 'game-1' } });
    }, 5000);
    return { unsubscribe: () => {} };
  },

  subscribeToGame(gameId, callback) {
    console.log('🔄 Subscribing to game:', gameId);
    return { unsubscribe: () => {} };
  }
};

// Mock leaderboard service
export const realtimeLeaderboardService = {
  async getLeaderboard(limit = 50) {
    console.log('📊 Getting leaderboard');
    return [
      { id: '1', username: 'Champion', total_score: 2500, games_won: 25, games_played: 30, account_balance: 500, total_winnings: 1000, win_rate: 83.33, rank: 1 },
      { id: '2', username: 'PuzzleMaster', total_score: 2200, games_won: 22, games_played: 28, account_balance: 400, total_winnings: 800, win_rate: 78.57, rank: 2 },
      { id: '3', username: 'SymbolSage', total_score: 2000, games_won: 20, games_played: 25, account_balance: 350, total_winnings: 600, win_rate: 80.00, rank: 3 },
      { id: '4', username: 'RebusKing', total_score: 1800, games_won: 18, games_played: 22, account_balance: 300, total_winnings: 500, win_rate: 81.82, rank: 4 },
      { id: '5', username: 'EmojiExpert', total_score: 1600, games_won: 16, games_played: 20, account_balance: 250, total_winnings: 400, win_rate: 80.00, rank: 5 }
    ].slice(0, limit);
  },

  subscribeToLeaderboard(callback) {
    console.log('🔄 Subscribing to leaderboard updates');
    return { unsubscribe: () => {} };
  }
};

// Mock profile service
export const realtimeProfileService = {
  async getProfile(userId) {
    console.log('👤 Getting profile for:', userId);
    return {
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
  },

  subscribeToProfile(userId, callback) {
    console.log('🔄 Subscribing to profile updates for:', userId);
    return { unsubscribe: () => {} };
  }
};
