-- FRESH START - COMPLETE SYMBOL DUEL DATABASE
-- This script creates everything from scratch with no conflicts

-- Step 1: Drop all existing tables and start fresh
DROP TABLE IF EXISTS public.challenge_attempts CASCADE;
DROP TABLE IF EXISTS public.daily_challenges CASCADE;
DROP TABLE IF EXISTS public.stripe_transactions CASCADE;
DROP TABLE IF EXISTS public.game_results CASCADE;
DROP TABLE IF EXISTS public.game_players CASCADE;
DROP TABLE IF EXISTS public.individual_games CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 2: Create fresh profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  account_balance DECIMAL(10,2) DEFAULT 100.00,
  total_winnings DECIMAL(10,2) DEFAULT 0.00,
  total_deposits DECIMAL(10,2) DEFAULT 0.00,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create fresh individual_games table
CREATE TABLE public.individual_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  entry_fee DECIMAL(10,2) NOT NULL CHECK (entry_fee BETWEEN 1.00 AND 100.00),
  max_players INTEGER NOT NULL CHECK (max_players BETWEEN 2 AND 10),
  current_players INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('waiting', 'active', 'completed')),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.profiles(id),
  prize_pool DECIMAL(10,2) DEFAULT 0.00
);

-- Step 4: Create fresh game_players table
CREATE TABLE public.game_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID NOT NULL REFERENCES public.individual_games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entry_fee_paid DECIMAL(10,2) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  final_score INTEGER DEFAULT 0,
  puzzles_solved INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  rank INTEGER,
  prize_amount DECIMAL(10,2) DEFAULT 0.00,
  is_winner BOOLEAN DEFAULT FALSE,
  UNIQUE(game_id, player_id)
);

-- Step 5: Create indexes for performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_games_creator ON public.individual_games(creator_id);
CREATE INDEX idx_games_status ON public.individual_games(status);
CREATE INDEX idx_game_players_game ON public.game_players(game_id);
CREATE INDEX idx_game_players_player ON public.game_players(player_id);

-- Step 6: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;

-- Step 7: Create simple, working RLS policies
-- Profiles: Users can create and manage their own profile
CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- Games: Users can create and view games
CREATE POLICY "Users can create games" ON public.individual_games
FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view games" ON public.individual_games
FOR SELECT USING (true);

CREATE POLICY "Users can update their own games" ON public.individual_games
FOR UPDATE USING (auth.uid() = creator_id);

-- Game Players: Users can join games and view players
CREATE POLICY "Users can join games" ON public.game_players
FOR INSERT WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Anyone can view game players" ON public.game_players
FOR SELECT USING (true);

-- Step 8: Create helper functions
CREATE OR REPLACE FUNCTION public.start_game(game_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.individual_games 
  SET status = 'active', started_at = NOW() 
  WHERE id = game_id AND status = 'waiting';
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Insert a test profile (optional - for testing)
INSERT INTO public.profiles (id, username, email, account_balance) 
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'TestUser',
  'test@example.com',
  100.00
) ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT '🎉 FRESH START COMPLETE! Symbol Duel database is ready!' as status;
