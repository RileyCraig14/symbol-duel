import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Real-time game service
export const realtimeGameService = {
  // Create a new game
  async createGame(gameData) {
    // Try to get current session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      // If no session, try to get user directly
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      var currentUser = user;
    } else {
      var currentUser = session.user;
    }

    const { data, error } = await supabase
      .from('games')
      .insert([{
        title: gameData.title,
        description: gameData.description,
        entry_fee: gameData.entryFee,
        max_players: gameData.maxPlayers,
        creator_id: currentUser.id,
        creator_username: gameData.creatorUsername,
        prize_pool: gameData.entryFee * gameData.maxPlayers
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get available games
  async getAvailableGames() {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players (
          id,
          player_id,
          player_username,
          joined_at
        )
      `)
      .eq('status', 'lobby')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Join a game
  async joinGame(gameId) {
    // Try to get current session first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      // If no session, try to get user directly
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      var currentUser = user;
    } else {
      var currentUser = session.user;
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, account_balance')
      .eq('id', currentUser.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    // Check if user has enough balance
    const { data: game } = await supabase
      .from('games')
      .select('entry_fee, current_players, max_players')
      .eq('id', gameId)
      .single();

    if (profile.account_balance < game.entry_fee) {
      throw new Error('Insufficient balance');
    }

    // Join the game
    const { data, error } = await supabase
      .from('game_players')
      .insert([{
        game_id: gameId,
        player_id: currentUser.id,
        player_username: profile.username
      }])
      .select()
      .single();

    if (error) throw error;

    // Update game player count
    const { error: updateError } = await supabase
      .from('games')
      .update({ 
        current_players: game.current_players + 1,
        status: game.current_players + 1 >= 3 ? 'countdown' : 'lobby'
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    // Deduct entry fee from user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ 
        account_balance: profile.account_balance - game.entry_fee,
        total_deposits: profile.total_deposits + game.entry_fee
      })
      .eq('id', currentUser.id);

    if (balanceError) throw balanceError;

    return data;
  },

  // Start a game
  async startGame(gameId, puzzles) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Update game status and store puzzle data
    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'active',
        game_data: { puzzles },
        started_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .eq('creator_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Create game rounds
    const rounds = puzzles.map((puzzle, index) => ({
      game_id: gameId,
      round_number: index + 1,
      puzzle_data: puzzle,
      time_limit: 30
    }));

    const { error: roundsError } = await supabase
      .from('game_rounds')
      .insert(rounds);

    if (roundsError) throw roundsError;

    return data;
  },

  // Submit answer
  async submitAnswer(gameId, roundNumber, answer, timeTaken) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get current round
    const { data: round } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('game_id', gameId)
      .eq('round_number', roundNumber)
      .single();

    if (!round) throw new Error('Round not found');

    // Check if answer is correct
    const isCorrect = answer.toLowerCase().trim() === round.puzzle_data.answer.toLowerCase().trim();
    const pointsEarned = isCorrect ? Math.max(10, 30 - timeTaken) : 0;

    // Submit answer
    const { data, error } = await supabase
      .from('player_answers')
      .insert([{
        game_id: gameId,
        round_id: round.id,
        player_id: user.id,
        answer,
        is_correct: isCorrect,
        time_taken: timeTaken,
        points_earned: pointsEarned
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Complete game
  async completeGame(gameId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate final scores and rankings
    const { data: answers } = await supabase
      .from('player_answers')
      .select(`
        player_id,
        points_earned,
        profiles!inner(username)
      `)
      .eq('game_id', gameId);

    // Calculate total scores per player
    const playerScores = {};
    answers.forEach(answer => {
      if (!playerScores[answer.player_id]) {
        playerScores[answer.player_id] = {
          player_id: answer.player_id,
          username: answer.profiles.username,
          total_score: 0
        };
      }
      playerScores[answer.player_id].total_score += answer.points_earned;
    });

    // Sort by score to get rankings
    const rankings = Object.values(playerScores).sort((a, b) => b.total_score - a.total_score);

    // Update game_players with final scores and rankings
    for (let i = 0; i < rankings.length; i++) {
      const ranking = rankings[i];
      const winnings = i === 0 ? await this.calculateWinnings(gameId) : 0; // Winner gets prize pool

      await supabase
        .from('game_players')
        .update({
          final_score: ranking.total_score,
          final_rank: i + 1,
          winnings: winnings
        })
        .eq('game_id', gameId)
        .eq('player_id', ranking.player_id);
    }

    // Update game status to completed (this will trigger the calculate_game_results function)
    const winner = rankings[0];
    const { data, error } = await supabase
      .from('games')
      .update({
        status: 'completed',
        winner_id: winner.player_id,
        winner_username: winner.username,
        completed_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;

    // Manually call calculate_game_results to ensure winnings are distributed
    try {
      const { error: calcError } = await supabase.rpc('calculate_game_results', { game_id: gameId });
      if (calcError) {
        console.log('⚠️ Auto-calculation failed, using manual fallback:', calcError.message);
        // Manual fallback: update winner's balance
        if (winner) {
          const prizePool = await this.calculateWinnings(gameId);
          await supabase
            .from('profiles')
            .update({ 
              total_winnings: supabase.sql`total_winnings + ${prizePool}`,
              games_won: supabase.sql`games_won + 1`
            })
            .eq('id', winner.player_id);
        }
      } else {
        console.log('✅ Game results calculated automatically');
      }
    } catch (calcError) {
      console.log('⚠️ Calculation error:', calcError.message);
    }

    return data;
  },

  // Calculate winnings
  async calculateWinnings(gameId) {
    const { data: game } = await supabase
      .from('games')
      .select('entry_fee, max_players')
      .eq('id', gameId)
      .single();

    return game.entry_fee * game.max_players; // Winner gets entire prize pool
  },

  // Subscribe to game updates
  subscribeToGame(gameId, callback) {
    return supabase
      .channel(`game-${gameId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`
      }, callback)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `game_id=eq.${gameId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to available games
  subscribeToAvailableGames(callback) {
    return supabase
      .channel('available-games')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: 'status=eq.lobby'
      }, callback)
      .subscribe();
  }
};

// Real-time leaderboard service
export const realtimeLeaderboardService = {
  // Get leaderboard
  async getLeaderboard(limit = 50) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  // Get user's rank
  async getUserRank(userId) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('rank')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data?.rank;
  },

  // Subscribe to leaderboard updates
  subscribeToLeaderboard(callback) {
    return supabase
      .channel('leaderboard')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles'
      }, callback)
      .subscribe();
  }
};

// Real-time profile service
export const realtimeProfileService = {
  // Get user profile
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update profile
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to profile updates
  subscribeToProfile(userId, callback) {
    return supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe();
  }
};
