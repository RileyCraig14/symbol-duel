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
