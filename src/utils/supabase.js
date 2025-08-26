// Simple working game service - no external dependencies
// This simulates a database with in-memory storage

// Mock data storage
let mockGames = [];
let mockPlayers = [];
let mockGamePlayers = [];

// Initialize with some sample data
const initializeMockData = () => {
  // Sample players
  mockPlayers = [
    { id: 'player-1', user_id: 'mock-user-1', username: 'Player1', email: 'player1@example.com' },
    { id: 'player-2', user_id: 'mock-user-2', username: 'Player2', email: 'player2@example.com' },
    { id: 'player-3', user_id: 'mock-user-3', username: 'Player3', email: 'player3@example.com' }
  ];

  // Sample games
  mockGames = [
    {
      id: 'game-1',
      title: '$25 Game',
      description: 'High stakes puzzle challenge',
      entry_fee: 25,
      max_players: 8,
      current_players: 2,
      status: 'lobby',
      creator_id: 'mock-user-1',
      creator_username: 'Player1',
      created_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
    },
    {
      id: 'game-2',
      title: '$15 Quick Game',
      description: 'Fast-paced puzzle fun',
      entry_fee: 15,
      max_players: 4,
      current_players: 3,
      status: 'countdown',
      creator_id: 'mock-user-2',
      creator_username: 'Player2',
      created_at: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
    }
  ];

  // Sample game players
  mockGamePlayers = [
    { id: 'gp-1', game_id: 'game-1', player_id: 'mock-user-1', player_username: 'Player1', joined_at: new Date(Date.now() - 300000).toISOString() },
    { id: 'gp-2', game_id: 'game-1', player_id: 'mock-user-2', player_username: 'Player2', joined_at: new Date(Date.now() - 240000).toISOString() },
    { id: 'gp-3', game_id: 'game-2', player_id: 'mock-user-2', player_username: 'Player2', joined_at: new Date(Date.now() - 600000).toISOString() },
    { id: 'gp-4', game_id: 'game-2', player_id: 'mock-user-3', player_username: 'Player3', joined_at: new Date(Date.now() - 540000).toISOString() },
    { id: 'gp-5', game_id: 'game-2', player_id: 'mock-user-1', player_username: 'Player1', joined_at: new Date(Date.now() - 480000).toISOString() }
  ];
};

// Initialize mock data
initializeMockData();

// Game service functions
export const gameService = {
  // Create a new game
  async createGame(gameData) {
    console.log('🎮 Creating game:', gameData);
    
    const newGame = {
      id: `game-${Date.now()}`,
      title: gameData.title,
      description: gameData.description,
      entry_fee: gameData.entryFee,
      max_players: gameData.maxPlayers,
      current_players: 1,
      status: 'lobby',
      creator_id: gameData.creatorId,
      creator_username: gameData.creatorUsername,
      created_at: new Date().toISOString()
    };
    
    console.log('✅ New game object created:', newGame);
    
    // Add to games array
    mockGames.unshift(newGame);
    
    // Add creator to game players
    const newGamePlayer = {
      id: `gp-${Date.now()}`,
      game_id: newGame.id,
      player_id: gameData.creatorId,
      player_username: gameData.creatorUsername,
      joined_at: new Date().toISOString()
    };
    mockGamePlayers.push(newGamePlayer);
    
    console.log('✅ Game created and added to mockGames:', newGame);
    console.log('📊 Total games now:', mockGames.length);
    return newGame;
  },

  // Get all available games
  async getAvailableGames() {
    const availableGames = mockGames.filter(game => game.status === 'lobby');
    console.log('📋 Available games:', availableGames.length);
    return availableGames;
  },

  // Join a game
  async joinGame(gameId, playerId) {
    console.log('👥 Joining game:', gameId, 'Player:', playerId);
    
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.current_players >= game.max_players) {
      throw new Error('Game is full');
    }
    
    if (game.status !== 'lobby') {
      throw new Error('Game is not accepting players');
    }
    
    // Check if player is already in the game
    const existingPlayer = mockGamePlayers.find(gp => gp.game_id === gameId && gp.player_id === playerId);
    if (existingPlayer) {
      console.log('⚠️ Player already in game');
      return game;
    }
    
    // Add player to game
    const newGamePlayer = {
      id: `gp-${Date.now()}`,
      game_id: gameId,
      player_id: playerId,
      player_username: 'Player', // This should come from user profile
      joined_at: new Date().toISOString()
    };
    mockGamePlayers.push(newGamePlayer);
    
    // Update game player count
    game.current_players += 1;
    
    console.log('✅ Player joined game. New count:', game.current_players);
    console.log('🎯 Game status:', game.status);
    
    // If enough players, change status to countdown
    if (game.current_players >= 3) {
      game.status = 'countdown';
      console.log('🚀 Game status changed to countdown!');
    }
    
    return game;
  },

  // Get game details
  async getGameDetails(gameId) {
    const game = mockGames.find(g => g.id === gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const players = mockGamePlayers
      .filter(gp => gp.game_id === gameId)
      .map(gp => ({
        player: {
          username: gp.player_username,
          email: 'player@example.com'
        },
        joined_at: gp.joined_at
      }));
    
    return {
      ...game,
      game_players: players
    };
  },

  // Get all games (for admin purposes)
  async getAllGames() {
    return mockGames;
  },

  // Reset mock data (for testing)
  resetMockData() {
    mockGames = [];
    mockPlayers = [];
    mockGamePlayers = [];
    initializeMockData();
  }
};

// Player service functions
export const playerService = {
  // Get or create a player
  async getOrCreatePlayer(userId, userData) {
    let player = mockPlayers.find(p => p.user_id === userId);
    
    if (!player) {
      player = {
        id: `player-${Date.now()}`,
        user_id: userId,
        username: userData.username || 'Player',
        email: userData.email || 'player@example.com'
      };
      mockPlayers.push(player);
    }
    
    return player;
  },

  // Get player by ID
  async getPlayer(playerId) {
    return mockPlayers.find(p => p.id === playerId);
  }
};

// Mock Supabase client (for compatibility)
export const supabase = {
  from: (table) => ({
    select: (columns) => ({
      eq: (field, value) => ({
        single: () => {
          const item = mockPlayers.find(p => p[field] === value);
          return { data: item, error: item ? null : { code: 'PGRST116' } };
        }
      }),
      limit: (count) => ({
        data: mockGames.slice(0, count),
        error: null
      }),
      data: mockGames,
      error: null
    }),
    insert: (data) => {
      const newItem = { ...data[0], id: `game-${Date.now()}` };
      mockGames.unshift(newItem);
      return { data: newItem, error: null };
    },
    update: (updates) => ({
      eq: (field, value) => {
        const index = mockGames.findIndex(g => g[field] === value);
        if (index !== -1) {
          mockGames[index] = { ...mockGames[index], ...updates };
        }
        return { error: null };
      }
    }),
    delete: () => ({
      eq: (field, value) => {
        const index = mockGames.findIndex(g => g[field] === value);
        if (index !== -1) {
          mockGames.splice(index, 1);
        }
        return { error: null };
      }
    })
  }),
  channel: () => ({
    on: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} })
      })
    })
  })
};

// Custom Puzzles Service
export const customPuzzles = {
  async create(puzzleData) {
    const newPuzzle = {
      id: `puzzle-${Date.now()}`,
      ...puzzleData,
      created_at: new Date().toISOString(),
      created_by: 'mock-user',
      is_public: puzzleData.is_public || true
    };
    
    // In a real app, this would save to database
    console.log('Created custom puzzle:', newPuzzle);
    return newPuzzle;
  },

  async getPublic() {
    // Return some sample public puzzles
    return [
      {
        id: 'sample-1',
        symbols: '🌙⭐☀️',
        answer: 'night and day',
        difficulty: 'easy',
        is_public: true,
        created_by: 'Player1'
      }
    ];
  }
};

// Daily Challenges Service
export const dailyChallenges = {
  async getToday() {
    // Return today's challenge
    const challenges = [
      {
        id: 'daily-1',
        symbols: '🐉⚔️👑',
        answer: 'dragon warrior',
        difficulty: 'medium',
        tokens_reward: 50,
        points_reward: 100,
        expires_at: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
      },
      {
        id: 'daily-2',
        symbols: '🌊🔥🌪️🌍',
        answer: 'four elements',
        difficulty: 'easy',
        tokens_reward: 25,
        points_reward: 50,
        expires_at: new Date(Date.now() + 86400000).toISOString()
      }
    ];
    
    // Return a random challenge for today
    const randomIndex = Math.floor(Math.random() * challenges.length);
    return challenges[randomIndex];
  },

  async submitAttempt(challengeId, isCorrect, timeTaken) {
    // Calculate rewards based on performance
    const baseTokens = isCorrect ? 25 : 5;
    const basePoints = isCorrect ? 50 : 10;
    
    // Bonus for speed
    const timeBonus = isCorrect ? Math.max(0, 60 - timeTaken) : 0;
    
    return {
      tokens_earned: baseTokens + timeBonus,
      points_earned: basePoints + (timeBonus * 2),
      challenge_id: challengeId,
      submitted_at: new Date().toISOString()
    };
  }
};

// Tournament Service
export const tournamentService = {
  async getActiveTournaments() {
    return [
      {
        id: 'tournament-1',
        name: 'Weekly Championship',
        entry_fee: 50,
        prize_pool: 500,
        max_players: 32,
        current_players: 16,
        status: 'registration',
        start_date: new Date(Date.now() + 86400000).toISOString()
      }
    ];
  },

  async joinTournament(tournamentId, playerId) {
    console.log(`Player ${playerId} joined tournament ${tournamentId}`);
    return { success: true, tournament_id: tournamentId };
  }
};

// Leaderboard Service
export const leaderboardService = {
  async getTopPlayers(limit = 10) {
    return [
      { id: 'player-1', username: 'Champion', score: 2500, games_won: 25, rank: 1 },
      { id: 'player-2', username: 'PuzzleMaster', score: 2200, games_won: 22, rank: 2 },
      { id: 'player-3', username: 'SymbolSage', score: 2000, games_won: 20, rank: 3 },
      { id: 'player-4', username: 'RebusKing', score: 1800, games_won: 18, rank: 4 },
      { id: 'player-5', username: 'EmojiExpert', score: 1600, games_won: 16, rank: 5 }
    ].slice(0, limit);
  },

  async getPlayerRank(playerId) {
    const players = await this.getTopPlayers(100);
    const player = players.find(p => p.id === playerId);
    return player ? player.rank : null;
  }
};
