import { supabase } from './supabase';

// Creator Challenge Management
export const creatorChallenges = {
  // Create a new challenge
  create: async (challengeData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('creator_challenges')
        .insert({
          creator_id: user.id,
          title: challengeData.title,
          description: challengeData.description,
          entry_fee_tokens: challengeData.entryFee || 0,
          prize_pool_tokens: challengeData.prizePool || 0,
          challenge_type: challengeData.type || 'weekly',
          category: challengeData.category,
          tags: challengeData.tags || [],
          cover_image_url: challengeData.coverImage,
          max_players: challengeData.maxPlayers || 1000
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Get all active challenges (marketplace)
  getAll: async (filters = {}) => {
    try {
      let query = supabase
        .from('creator_challenges')
        .select(`
          *,
          profiles!creator_id(email, is_verified_creator, creator_bio),
          challenge_levels(count),
          challenge_analytics(total_entries, total_completions)
        `)
        .eq('status', 'active');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.creatorId) {
        query = query.eq('creator_id', filters.creatorId);
      }
      if (filters.featured) {
        query = query.eq('is_featured', true);
      }
      if (filters.maxEntryFee) {
        query = query.lte('entry_fee_tokens', filters.maxEntryFee);
      }

      // Order by featured first, then by creation date
      query = query.order('is_featured', { ascending: false })
                   .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Search challenges
  search: async (query, filters = {}) => {
    try {
      let supabaseQuery = supabase
        .from('creator_challenges')
        .select(`
          *,
          profiles!creator_id(email, is_verified_creator, creator_bio),
          challenge_levels(count),
          challenge_analytics(total_entries, total_completions)
        `)
        .eq('status', 'active');

      // Text search
      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      // Apply filters
      if (filters.category) {
        supabaseQuery = supabaseQuery.eq('category', filters.category);
      }
      if (filters.maxEntryFee) {
        supabaseQuery = supabaseQuery.lte('entry_fee_tokens', filters.maxEntryFee);
      }
      if (filters.featured) {
        supabaseQuery = supabaseQuery.eq('is_featured', true);
      }

      // Order by relevance (featured first, then by creation date)
      supabaseQuery = supabaseQuery
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error } = await supabaseQuery;
      if (error) throw error;

      // Record search for recommendations
      if (query && data.length > 0) {
        await supabase
          .from('user_search_history')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            search_query: query,
            search_category: filters.category
          });
      }

      return data;
    } catch (error) {
      console.error('Error searching challenges:', error);
      throw error;
    }
  },

  // Add levels to a challenge
  addLevel: async (challengeId, levelData) => {
    try {
      const { data, error } = await supabase
        .from('challenge_levels')
        .insert({
          challenge_id: challengeId,
          level_number: levelData.levelNumber,
          puzzle_data: {
            symbols: levelData.symbols,
            answer: levelData.answer,
            hints: levelData.hints || []
          },
          entry_cost_tokens: levelData.entryCost || 0,
          time_limit_seconds: levelData.timeLimit || 300,
          unlock_requirement: levelData.unlockRequirement
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding level:', error);
      throw error;
    }
  },

  // Add prizes to a challenge level
  addPrize: async (challengeId, levelId, prizeData) => {
    try {
      const { data, error } = await supabase
        .from('challenge_prizes')
        .insert({
          challenge_id: challengeId,
          level_id: levelId,
          prize_type: prizeData.type,
          prize_title: prizeData.title,
          prize_description: prizeData.description,
          prize_value: prizeData.value,
          token_reward: prizeData.tokenReward || 0,
          is_instant: prizeData.isInstant !== false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding prize:', error);
      throw error;
    }
  },

  // Join a challenge
  join: async (challengeId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user already joined
      const { data: existing } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (existing) {
        throw new Error('Already joined this challenge');
      }

      // Get challenge details
      const { data: challenge } = await supabase
        .from('creator_challenges')
        .select('entry_fee_tokens, current_players, max_players')
        .eq('id', challengeId)
        .single();

      if (!challenge) throw new Error('Challenge not found');
      if (challenge.current_players >= challenge.max_players) {
        throw new Error('Challenge is full');
      }

      // Check if user has enough tokens
      const { data: profile } = await supabase
        .from('profiles')
        .select('tokens')
        .eq('id', user.id)
        .single();

      if (profile.tokens < challenge.entry_fee_tokens) {
        throw new Error('Not enough tokens to join');
      }

      // Deduct entry fee and join challenge
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tokens: profile.tokens - challenge.entry_fee_tokens })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Join the challenge
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          total_tokens_spent: challenge.entry_fee_tokens
        })
        .select()
        .single();

      if (error) throw error;

      // Update challenge player count
      await supabase
        .from('creator_challenges')
        .update({ current_players: challenge.current_players + 1 })
        .eq('id', challengeId);

      return data;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  },

  // Get challenge details with levels and prizes
  getById: async (challengeId) => {
    try {
      const { data, error } = await supabase
        .from('creator_challenges')
        .select(`
          *,
          profiles!creator_id(email, is_verified_creator, creator_bio, creator_website),
          challenge_levels(
            *,
            challenge_prizes(*)
          ),
          challenge_analytics(*)
        `)
        .eq('id', challengeId)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenge:', error);
      throw error;
    }
  },

  // Get user's active challenges
  getUserChallenges: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          creator_challenges(
            *,
            profiles!creator_id(email, is_verified_creator)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }
  }
};

// Challenge Categories
export const challengeCategories = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
      } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
    }
  };

// Creator Profile Management
export const creatorProfiles = {
  // Become a creator
  becomeCreator: async (creatorData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          is_verified_creator: true,
          creator_bio: creatorData.bio,
          creator_website: creatorData.website,
          creator_social_links: creatorData.socialLinks || {}
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error becoming creator:', error);
      throw error;
    }
  },

  // Get creator profile
  getById: async (creatorId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          is_verified_creator,
          creator_bio,
          creator_website,
          creator_social_links,
          total_challenges_created,
          total_revenue_generated,
          creator_rating,
          creator_reviews_count
        `)
        .eq('id', creatorId)
        .eq('is_verified_creator', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching creator profile:', error);
      throw error;
    }
  },

  // Get creator's challenges
  getChallenges: async (creatorId) => {
    try {
      const { data, error } = await supabase
        .from('creator_challenges')
        .select(`
          *,
          challenge_levels(count),
          challenge_analytics(total_entries, total_completions)
        `)
        .eq('creator_id', creatorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching creator challenges:', error);
      throw error;
    }
  }
};
