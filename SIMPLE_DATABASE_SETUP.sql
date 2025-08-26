-- Simple Database Setup - Run this if the main setup fails
-- This creates a minimal working database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.player_answers CASCADE;
DROP TABLE IF EXISTS public.game_rounds CASCADE;
DROP TABLE IF EXISTS public.game_players CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP VIEW IF EXISTS public.leaderboard CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    account_balance DECIMAL(10,2) DEFAULT 100.00,
    total_winnings DECIMAL(10,2) DEFAULT 0.00,
    total_deposits DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create games table
CREATE TABLE public.games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 6,
    current_players INTEGER DEFAULT 1,
    status TEXT DEFAULT 'lobby' CHECK (status IN ('lobby', 'countdown', 'active', 'completed', 'cancelled')),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    creator_username TEXT NOT NULL,
    prize_pool DECIMAL(10,2) DEFAULT 0.00,
    winner_id UUID REFERENCES public.profiles(id),
    winner_username TEXT,
    game_data JSONB,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_players table
CREATE TABLE public.game_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player_username TEXT NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    final_score INTEGER DEFAULT 0,
    final_rank INTEGER,
    winnings DECIMAL(10,2) DEFAULT 0.00,
    UNIQUE(game_id, player_id)
);

-- Create game_rounds table
CREATE TABLE public.game_rounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    puzzle_data JSONB NOT NULL,
    time_limit INTEGER DEFAULT 30,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create player_answers table
CREATE TABLE public.player_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    round_id UUID REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    answer TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INTEGER,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard view
CREATE VIEW public.leaderboard AS
SELECT 
    p.id,
    p.username,
    p.account_balance,
    p.total_winnings,
    p.games_played,
    p.games_won,
    p.total_score,
    CASE 
        WHEN p.games_played > 0 THEN ROUND((p.games_won::DECIMAL / p.games_played::DECIMAL) * 100, 2)
        ELSE 0 
    END as win_rate,
    RANK() OVER (ORDER BY p.total_score DESC) as rank,
    p.created_at
FROM public.profiles p
WHERE p.games_played > 0
ORDER BY p.total_score DESC;

-- Create indexes
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_games_created_at ON public.games(created_at);
CREATE INDEX idx_game_players_game_id ON public.game_players(game_id);
CREATE INDEX idx_game_players_player_id ON public.game_players(player_id);
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_total_score ON public.profiles(total_score);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Users can create games" ON public.games FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Game creators can update their games" ON public.games FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can view all game players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Users can join games" ON public.game_players FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Users can leave games" ON public.game_players FOR DELETE USING (auth.uid() = player_id);

CREATE POLICY "Users can view game rounds" ON public.game_rounds FOR SELECT USING (true);
CREATE POLICY "Game creators can manage rounds" ON public.game_rounds FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.games 
        WHERE id = game_id AND creator_id = auth.uid()
    )
);

CREATE POLICY "Users can view all answers" ON public.player_answers FOR SELECT USING (true);
CREATE POLICY "Users can submit their own answers" ON public.player_answers FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, email, account_balance)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || EXTRACT(EPOCH FROM NOW())::INTEGER),
        NEW.email,
        100.00
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update player stats when game completes
CREATE OR REPLACE FUNCTION public.update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        games_played = games_played + 1,
        games_won = CASE WHEN NEW.final_rank = 1 THEN games_won + 1 ELSE games_won END,
        total_score = total_score + NEW.final_score,
        account_balance = account_balance + NEW.winnings,
        total_winnings = total_winnings + NEW.winnings,
        updated_at = NOW()
    WHERE id = NEW.player_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when game player completes
DROP TRIGGER IF EXISTS on_game_player_complete ON public.game_players;
CREATE TRIGGER on_game_player_complete
    AFTER UPDATE OF final_score, final_rank, winnings ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.update_player_stats();

-- Insert sample data
INSERT INTO public.profiles (id, username, email, account_balance, games_played, games_won, total_score)
VALUES 
    (uuid_generate_v4(), 'TestPlayer1', 'test1@example.com', 150.00, 5, 3, 1250),
    (uuid_generate_v4(), 'TestPlayer2', 'test2@example.com', 200.00, 8, 4, 2100),
    (uuid_generate_v4(), 'TestPlayer3', 'test3@example.com', 75.00, 3, 1, 800)
ON CONFLICT (id) DO NOTHING;
