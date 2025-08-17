import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vegzvwfceqcqnqujkaji.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions for common operations
export const auth = {
  // Sign up new user
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    })
    
    if (error) throw error
    
    // Create profile after successful signup
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        balance: 100.00 // Give new users $100 starting balance
      })
    }
    
    return data
  },

  // Sign in existing user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

// Game management functions
// New gamification functions
export const gamification = {
  // Get user profile with tokens and points
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Award tokens and points
  awardTokens: async (userId, tokens, points = 0, experience = 0) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        tokens: supabase.sql`tokens + ${tokens}`,
        points: supabase.sql`points + ${points}`,
        experience: supabase.sql`experience + ${experience}`
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Spend tokens
  spendTokens: async (userId, amount) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        tokens: supabase.sql`tokens - ${amount}`
      })
      .eq('id', userId)
      .gte('tokens', amount) // Ensure sufficient tokens
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update streak
  updateStreak: async (userId) => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_daily_challenge, streak_days')
      .eq('id', userId)
      .single()
    
    if (profile?.last_daily_challenge === today) {
      return profile.streak_days // Already updated today
    }
    
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let newStreak = 1
    if (profile?.last_daily_challenge === yesterdayStr) {
      newStreak = (profile.streak_days || 0) + 1
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        streak_days: newStreak,
        last_daily_challenge: today
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const games = {
  // Create a new game
  create: async (entryFee, rounds) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('games')
      .insert({
        entry_fee: entryFee,
        rounds,
        created_by: user.id,
        status: 'waiting'
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Add creator as first player
    await supabase.from('game_players').insert({
      game_id: data.id,
      player_id: user.id
    })
    
    return data
  },

  // Get available games
  getAvailable: async () => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        created_by,
        game_players(count)
      `)
      .eq('status', 'waiting')
      .lt('current_players', 6)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Join a game
  join: async (gameId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Add player to game
    const { error: joinError } = await supabase
      .from('game_players')
      .insert({
        game_id: gameId,
        player_id: user.id
      })
    
    if (joinError) throw joinError
    
    // Update player count
    const { error: updateError } = await supabase
      .from('games')
      .update({ current_players: supabase.sql`current_players + 1` })
      .eq('id', gameId)
    
    if (updateError) throw updateError
    
    return { success: true }
  },

  // Get game details
  getById: async (gameId) => {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        game_players(
          player_id,
          profiles(username)
        )
      `)
      .eq('id', gameId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Tournament functions
export const tournaments = {
  // Create tournament
  create: async (tournamentData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        ...tournamentData,
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get all tournaments
  getAll: async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        created_by,
        tournament_players(count)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Join tournament
  join: async (tournamentId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Get tournament details
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('entry_fee_tokens')
      .eq('id', tournamentId)
      .single()
    
    if (!tournament) throw new Error('Tournament not found')
    
    // Spend tokens to join
    await gamification.spendTokens(user.id, tournament.entry_fee_tokens)
    
    // Add player to tournament
    const { data, error } = await supabase
      .from('tournament_players')
      .insert({
        tournament_id: tournamentId,
        player_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update tournament player count
    await supabase
      .from('tournaments')
      .update({ current_players: supabase.sql`current_players + 1` })
      .eq('id', tournamentId)
    
    return data
  }
}

// Daily challenges
export const dailyChallenges = {
  // Get today's challenge
  getToday: async () => {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_challenges')
      .select(`
        *,
        custom_puzzles(*)
      `)
      .eq('challenge_date', today)
      .single()
    
    if (error) throw error
    return data
  },

  // Submit challenge attempt
  submitAttempt: async (challengeId, isCorrect, timeTaken) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Calculate rewards
    let tokensEarned = 0
    let pointsEarned = 0
    
    if (isCorrect) {
      tokensEarned = 10 // Base tokens for solving
      pointsEarned = 50 // Base points for solving
      
      // Bonus for speed
      if (timeTaken < 30) {
        tokensEarned += 5
        pointsEarned += 25
      }
    }
    
    // Record attempt
    const { data, error } = await supabase
      .from('challenge_attempts')
      .insert({
        challenge_id: challengeId,
        user_id: user.id,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
        tokens_earned: tokensEarned,
        points_earned: pointsEarned
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Award tokens and points
    if (isCorrect) {
      await gamification.awardTokens(user.id, tokensEarned, pointsEarned)
      await gamification.updateStreak(user.id)
    }
    
    return data
  }
}

// Custom puzzles
export const customPuzzles = {
  // Create custom puzzle
  create: async (puzzleData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('custom_puzzles')
      .insert({
        ...puzzleData,
        creator_id: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get public puzzles
  getPublic: async () => {
    const { data, error } = await supabase
      .from('custom_puzzles')
      .select(`
        *,
        profiles(username)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get user's puzzles
  getUserPuzzles: async (userId) => {
    const { data, error } = await supabase
      .from('custom_puzzles')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Friends system
export const friends = {
  // Send friend request
  sendRequest: async (friendUsername) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Find friend by username
    const { data: friend } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', friendUsername)
      .single()
    
    if (!friend) throw new Error('User not found')
    
    // Send friend request
    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friend.id
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get friend requests
  getRequests: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        profiles!friends_user_id_fkey(username)
      `)
      .eq('friend_id', user.id)
      .eq('status', 'pending')
    
    if (error) throw error
    return data
  },

  // Accept friend request
  acceptRequest: async (requestId) => {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const realtime = {
  // Subscribe to game updates
  subscribeToGame: (gameId, callback) => {
    return supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games', filter: `id=eq.${gameId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'game_players', filter: `game_id=eq.${gameId}` },
        callback
      )
      .subscribe()
  },

  // Subscribe to player answers
  subscribeToAnswers: (gameId, callback) => {
    return supabase
      .channel(`answers:${gameId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'player_answers', filter: `game_id=eq.${gameId}` },
        callback
      )
      .subscribe()
  }
}
