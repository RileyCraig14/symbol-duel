// Local Database System for Testing
// This simulates the Supabase database locally using in-memory storage

class LocalDatabase {
  constructor() {
    this.tables = {
      profiles: new Map(),
      games: new Map(),
      game_players: new Map(),
      game_rounds: new Map(),
      player_answers: new Map()
    };
    this.leaderboard = [];
    this.initializeSampleData();
  }

  // Initialize with sample data
  initializeSampleData() {
    console.log('🗄️ Initializing local database with sample data...');
    
    // Create sample profiles
    const sampleProfiles = [
      { id: 'user-1', username: 'Alice', email: 'alice@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 },
      { id: 'user-2', username: 'Bob', email: 'bob@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 },
      { id: 'user-3', username: 'Charlie', email: 'charlie@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 },
      { id: 'user-4', username: 'Diana', email: 'diana@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 },
      { id: 'user-5', username: 'Eve', email: 'eve@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 },
      { id: 'user-6', username: 'Frank', email: 'frank@test.com', account_balance: 100.00, games_played: 0, games_won: 0, total_score: 0, win_rate: 0.00 }
    ];

    sampleProfiles.forEach(profile => {
      this.tables.profiles.set(profile.id, { ...profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    });

    // Create sample games
    const sampleGames = [
      { 
        id: 'game-1', 
        title: '$25 High Stakes', 
        description: 'High stakes puzzle challenge', 
        entry_fee: 25.00, 
        max_players: 6, 
        current_players: 2, 
        status: 'lobby', 
        creator_id: 'user-1', 
        creator_username: 'Alice', 
        prize_pool: 150.00,
        created_at: new Date(Date.now() - 300000).toISOString()
      },
      { 
        id: 'game-2', 
        title: '$15 Quick Game', 
        description: 'Fast-paced puzzle fun', 
        entry_fee: 15.00, 
        max_players: 4, 
        current_players: 3, 
        status: 'countdown', 
        creator_id: 'user-2', 
        creator_username: 'Bob', 
        prize_pool: 60.00,
        created_at: new Date(Date.now() - 600000).toISOString()
      }
    ];

    sampleGames.forEach(game => {
      this.tables.games.set(game.id, game);
    });

    // Create sample game players
    const samplePlayers = [
      { id: 'gp-1', game_id: 'game-1', player_id: 'user-1', player_username: 'Alice', joined_at: new Date(Date.now() - 300000).toISOString() },
      { id: 'gp-2', game_id: 'game-1', player_id: 'user-2', player_username: 'Bob', joined_at: new Date(Date.now() - 200000).toISOString() },
      { id: 'gp-3', game_id: 'game-2', player_id: 'user-2', player_username: 'Bob', joined_at: new Date(Date.now() - 600000).toISOString() },
      { id: 'gp-4', game_id: 'game-2', player_id: 'user-3', player_username: 'Charlie', joined_at: new Date(Date.now() - 500000).toISOString() },
      { id: 'gp-5', game_id: 'game-2', player_id: 'user-4', player_username: 'Diana', joined_at: new Date(Date.now() - 400000).toISOString() }
    ];

    samplePlayers.forEach(player => {
      this.tables.game_players.set(player.id, player);
    });

    this.updateLeaderboard();
    console.log('✅ Local database initialized with sample data');
  }

  // Simulate SQL queries
  async query(sql, params = []) {
    console.log('🔍 Executing SQL:', sql);
    console.log('📊 Params:', params);

    // Parse simple SQL queries
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.includes('select') && sqlLower.includes('from profiles')) {
      return this.selectProfiles(sql, params);
    } else if (sqlLower.includes('select') && sqlLower.includes('from games')) {
      return this.selectGames(sql, params);
    } else if (sqlLower.includes('select') && sqlLower.includes('from game_players')) {
      return this.selectGamePlayers(sql, params);
    } else if (sqlLower.includes('select') && sqlLower.includes('from leaderboard')) {
      return this.selectLeaderboard(sql, params);
    } else if (sqlLower.includes('insert into profiles')) {
      return this.insertProfile(sql, params);
    } else if (sqlLower.includes('insert into games')) {
      return this.insertGame(sql, params);
    } else if (sqlLower.includes('insert into game_players')) {
      return this.insertGamePlayer(sql, params);
    } else if (sqlLower.includes('update profiles')) {
      return this.updateProfile(sql, params);
    } else if (sqlLower.includes('update games')) {
      return this.updateGame(sql, params);
    }

    return { data: [], error: null };
  }

  selectProfiles(sql, params) {
    const profiles = Array.from(this.tables.profiles.values());
    return { data: profiles, error: null };
  }

  selectGames(sql, params) {
    const games = Array.from(this.tables.games.values());
    return { data: games, error: null };
  }

  selectGamePlayers(sql, params) {
    const players = Array.from(this.tables.game_players.values());
    return { data: players, error: null };
  }

  selectLeaderboard(sql, params) {
    return { data: this.leaderboard, error: null };
  }

  insertProfile(sql, params) {
    const id = 'user-' + Date.now();
    const profile = {
      id,
      username: params[0] || 'Player' + Date.now(),
      email: params[1] || 'test@example.com',
      account_balance: 100.00,
      games_played: 0,
      games_won: 0,
      total_score: 0,
      win_rate: 0.00,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.tables.profiles.set(id, profile);
    return { data: profile, error: null };
  }

  insertGame(sql, params) {
    const id = 'game-' + Date.now();
    const game = {
      id,
      title: params[0] || 'New Game',
      description: params[1] || 'A fun puzzle game',
      entry_fee: params[2] || 25.00,
      max_players: params[3] || 6,
      current_players: 1,
      status: 'lobby',
      creator_id: params[4] || 'user-1',
      creator_username: params[5] || 'Player',
      prize_pool: (params[2] || 25.00) * (params[3] || 6),
      created_at: new Date().toISOString()
    };
    this.tables.games.set(id, game);
    return { data: game, error: null };
  }

  insertGamePlayer(sql, params) {
    const id = 'gp-' + Date.now();
    const player = {
      id,
      game_id: params[0],
      player_id: params[1],
      player_username: params[2],
      joined_at: new Date().toISOString()
    };
    this.tables.game_players.set(id, player);
    return { data: player, error: null };
  }

  updateProfile(sql, params) {
    const profile = this.tables.profiles.get(params[0]);
    if (profile) {
      Object.assign(profile, params[1]);
      profile.updated_at = new Date().toISOString();
      this.tables.profiles.set(params[0], profile);
      this.updateLeaderboard();
      return { data: profile, error: null };
    }
    return { data: null, error: 'Profile not found' };
  }

  updateGame(sql, params) {
    const game = this.tables.games.get(params[0]);
    if (game) {
      Object.assign(game, params[1]);
      this.tables.games.set(params[0], game);
      return { data: game, error: null };
    }
    return { data: null, error: 'Game not found' };
  }

  updateLeaderboard() {
    const profiles = Array.from(this.tables.profiles.values());
    this.leaderboard = profiles
      .filter(p => p.games_played > 0)
      .sort((a, b) => b.total_score - a.total_score)
      .map((profile, index) => ({
        ...profile,
        rank: index + 1
      }));
  }

  // Get all data for debugging
  getAllData() {
    return {
      profiles: Array.from(this.tables.profiles.values()),
      games: Array.from(this.tables.games.values()),
      game_players: Array.from(this.tables.game_players.values()),
      leaderboard: this.leaderboard
    };
  }
}

// Create singleton instance
const localDB = new LocalDatabase();

export default localDB;
