-- WORKING DATABASE SCHEMA - COPY THIS INTO SUPABASE SQL EDITOR

-- Create tables
CREATE TABLE IF NOT EXISTS games (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INTEGER NOT NULL,
    current_players INTEGER DEFAULT 1,
    status TEXT DEFAULT 'lobby',
    creator_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    account_balance DECIMAL(10,2) DEFAULT 100.00,
    total_winnings DECIMAL(10,2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_players (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(game_id, player_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Simple policies - allow everything for now
CREATE POLICY "Allow all games" ON games FOR ALL USING (true);
CREATE POLICY "Allow all players" ON players FOR ALL USING (true);
CREATE POLICY "Allow all game_players" ON game_players FOR ALL USING (true);

-- Insert test data
INSERT INTO players (user_id, username, email) VALUES 
    ('test-user-1', 'TestPlayer1', 'test1@example.com'),
    ('test-user-2', 'TestPlayer2', 'test2@example.com'),
    ('test-user-3', 'TestPlayer3', 'test3@example.com')
ON CONFLICT (user_id) DO NOTHING;
