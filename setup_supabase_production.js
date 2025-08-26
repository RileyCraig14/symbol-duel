const { createClient } = require('@supabase/supabase-js');

// Production Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://vegzvwfceqcqnqujkaji.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyMDU1NzAsImV4cCI6MjA3MDc4MTU3MH0.QNfU9Pdm05Zyr5oLegPrztSZI9DDSghMHHv49HLYEVc',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZ3p2d2ZjZXFjcW5xdWprYWppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIwNTU3MCwiZXhwIjoyMDcwNzgxNTcwfQ.SQTob_GHmivdH57UgWeDuZDdmrWkYA5wLcQwzai52LE'
};

// Initialize Supabase client with service role for admin operations
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey);

console.log('🚀 Setting up Symbol Duel Production Database...\n');

// Database schema SQL
const DATABASE_SCHEMA = `
-- Complete Database Setup for Symbol Duel
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS public.compliance_logs CASCADE;
DROP TABLE IF EXISTS public.friends CASCADE;
DROP TABLE IF EXISTS public.tournament_players CASCADE;
DROP TABLE IF EXISTS public.tournaments CASCADE;
DROP TABLE IF EXISTS public.custom_puzzles CASCADE;
DROP TABLE IF EXISTS public.challenge_attempts CASCADE;
DROP TABLE IF EXISTS public.daily_challenges CASCADE;
DROP TABLE IF EXISTS public.game_results CASCADE;
DROP TABLE IF EXISTS public.game_participants CASCADE;
DROP TABLE IF EXISTS public.game_players CASCADE;
DROP TABLE IF EXISTS public.individual_games CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table with new schema
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    account_balance DECIMAL(10,2) DEFAULT 100.00,
    total_winnings DECIMAL(10,2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    tokens INTEGER DEFAULT 100,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_daily_challenge TIMESTAMP WITH TIME ZONE,
    birth_date DATE,
    location_state VARCHAR(2),
    compliance_verified BOOLEAN DEFAULT FALSE,
    compliance_verified_at TIMESTAMP WITH TIME ZONE,
    last_compliance_check TIMESTAMP WITH TIME ZONE,
    compliance_status VARCHAR(50) DEFAULT 'PENDING',
    is_verified_creator BOOLEAN DEFAULT FALSE,
    creator_bio TEXT,
    creator_website TEXT,
    creator_social_links JSONB,
    total_challenges_created INTEGER DEFAULT 0,
    total_revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    creator_rating DECIMAL(3,2) DEFAULT 0.00,
    creator_reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create individual_games table
CREATE TABLE public.individual_games (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INTEGER DEFAULT 6,
    current_players INTEGER DEFAULT 0,
    difficulty VARCHAR(20) DEFAULT 'medium',
    time_limit INTEGER DEFAULT 300,
    status VARCHAR(20) DEFAULT 'waiting',
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    active_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    winner_id UUID REFERENCES public.profiles(id),
    prize_pool DECIMAL(10,2),
    platform_fee DECIMAL(10,2)
);

-- Create game_players table
CREATE TABLE public.game_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.individual_games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    score INTEGER DEFAULT 0,
    time_taken INTEGER DEFAULT 0,
    puzzles_solved INTEGER DEFAULT 0,
    UNIQUE(game_id, player_id)
);

-- Create game_results table
CREATE TABLE public.game_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    game_id UUID REFERENCES public.individual_games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    final_score INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    puzzles_solved INTEGER NOT NULL,
    rank INTEGER,
    prize_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_challenges table
CREATE TABLE public.daily_challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_date DATE UNIQUE NOT NULL,
    puzzle_data JSONB NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    reward_tokens INTEGER DEFAULT 10,
    reward_points INTEGER DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge_attempts table
CREATE TABLE public.challenge_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER NOT NULL,
    tokens_earned INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tournaments table
CREATE TABLE public.tournaments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INTEGER DEFAULT 64,
    current_players INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'registration',
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE
);

-- Create tournament_players table
CREATE TABLE public.tournament_players (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    final_rank INTEGER,
    prize_amount DECIMAL(10,2) DEFAULT 0.00,
    UNIQUE(tournament_id, player_id)
);

-- Create compliance_logs table
CREATE TABLE public.compliance_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    details JSONB,
    compliance_status VARCHAR(20),
    location_state VARCHAR(2),
    age_verified BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_games_status ON public.individual_games(status);
CREATE INDEX IF NOT EXISTS idx_games_creator ON public.individual_games(creator_id);
CREATE INDEX IF NOT EXISTS idx_game_players_game ON public.game_players(game_id);
CREATE INDEX IF NOT EXISTS idx_game_players_player ON public.game_players(player_id);
CREATE INDEX IF NOT EXISTS idx_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for individual_games
CREATE POLICY "Anyone can view available games" ON public.individual_games
    FOR SELECT USING (status IN ('waiting', 'active'));

CREATE POLICY "Users can create games" ON public.individual_games
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Game creators can update their games" ON public.individual_games
    FOR UPDATE USING (auth.uid() = creator_id);

-- Create RLS policies for game_players
CREATE POLICY "Anyone can view game players" ON public.game_players
    FOR SELECT USING (true);

CREATE POLICY "Users can join games" ON public.game_players
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Create RLS policies for game_results
CREATE POLICY "Anyone can view game results" ON public.game_results
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own results" ON public.game_results
    FOR SELECT USING (auth.uid() = player_id);

-- Create RLS policies for daily_challenges
CREATE POLICY "Anyone can view daily challenges" ON public.daily_challenges
    FOR SELECT USING (true);

-- Create RLS policies for challenge_attempts
CREATE POLICY "Users can view their own attempts" ON public.challenge_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can submit attempts" ON public.challenge_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for tournaments
CREATE POLICY "Anyone can view tournaments" ON public.tournaments
    FOR SELECT USING (true);

CREATE POLICY "Users can create tournaments" ON public.tournaments
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Create RLS policies for tournament_players
CREATE POLICY "Anyone can view tournament players" ON public.tournament_players
    FOR SELECT USING (true);

CREATE POLICY "Users can join tournaments" ON public.tournament_players
    FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Create RLS policies for compliance_logs
CREATE POLICY "Users can view their own compliance logs" ON public.compliance_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create compliance logs" ON public.compliance_logs
    FOR INSERT WITH CHECK (true);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, account_balance, total_winnings, games_played, games_won, tokens, points)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'User' || substr(NEW.id::text, 1, 8)),
        100.00,
        0.00,
        0,
        0,
        100,
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to calculate platform fees
CREATE OR REPLACE FUNCTION public.calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN amount * 0.06; -- 6% platform fee
END;
$$ LANGUAGE plpgsql;

-- Create function to start a game
CREATE OR REPLACE FUNCTION public.start_individual_game(game_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.individual_games
    SET status = 'active', active_at = NOW()
    WHERE id = game_id AND status = 'waiting';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to finish a game
CREATE OR REPLACE FUNCTION public.finish_individual_game(game_id UUID, winner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    game_record RECORD;
    total_pot DECIMAL;
    platform_fee DECIMAL;
    prize_pool DECIMAL;
BEGIN
    -- Get game details
    SELECT * INTO game_record FROM public.individual_games WHERE id = game_id;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Calculate prize distribution
    total_pot := game_record.entry_fee * game_record.current_players;
    platform_fee := public.calculate_platform_fee(total_pot);
    prize_pool := total_pot - platform_fee;
    
    -- Update game status
    UPDATE public.individual_games
    SET 
        status = 'completed',
        winner_id = winner_id,
        prize_pool = prize_pool,
        platform_fee = platform_fee,
        completed_at = NOW()
    WHERE id = game_id;
    
    -- Update winner's profile
    UPDATE public.profiles
    SET 
        total_winnings = total_winnings + prize_pool,
        games_won = games_won + 1,
        games_played = games_played + 1
    WHERE id = winner_id;
    
    -- Update other players' profiles
    UPDATE public.profiles
    SET games_played = games_played + 1
    WHERE id IN (
        SELECT player_id FROM public.game_players 
        WHERE game_id = game_id AND player_id != winner_id
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
`;

// Function to execute SQL statements
async function executeSQL(sql) {
  try {
    console.log('🔧 Executing database schema...');
    
    // Split SQL into individual statements and execute them
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Execute each statement using Supabase client
          const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });
          
          if (error) {
            console.log('⚠️  RPC method not available, trying direct execution...');
            // Try to execute the statement directly
            await supabase.from('profiles').select('*').limit(1); // Test connection
            console.log('✅ Connection test successful');
            break;
          }
        } catch (e) {
          console.log('❌ Direct SQL execution not available');
          console.log('💡 You need to run the SQL manually in Supabase SQL Editor');
          return false;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.log('❌ SQL execution failed:', error.message);
    return false;
  }
}

// Main setup function
async function setupDatabase() {
  try {
    console.log('🔧 Setting up Symbol Duel database...\n');
    
    // Test connection
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      console.log('\n💡 Please check your Supabase credentials and try again.');
      return false;
    }
    
    console.log('✅ Supabase connection successful!\n');
    
    // Check current database state
    console.log('📊 Checking current database state...');
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.log('❌ Cannot access profiles table:', profilesError.message);
    } else {
      console.log(`✅ Found ${existingProfiles.length} existing profiles`);
    }
    
    // Check if individual_games table exists
    try {
      const { data: games, error: gamesError } = await supabase
        .from('individual_games')
        .select('*')
        .limit(1);
      
      if (gamesError) {
        console.log('❌ Individual_games table does not exist');
        console.log('💡 Need to create the complete database schema');
      } else {
        console.log('✅ Individual_games table exists');
      }
    } catch (e) {
      console.log('❌ Individual_games table does not exist');
    }
    
    console.log('\n📋 Database Setup Instructions:');
    console.log('================================');
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
    console.log('2. Select your project: vegzvwfceqcqnqujkaji');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the SQL schema from setup_database.sql');
    console.log('5. Click "Run" to execute the schema');
    console.log('\n💡 The SQL file contains all the tables, policies, and functions needed');
    
    return true;
    
  } catch (error) {
    console.log('❌ Database setup failed:', error.message);
    return false;
  }
}

// Run setup
if (require.main === module) {
  setupDatabase().then(success => {
    if (success) {
      console.log('\n🎉 Database setup instructions provided!');
      console.log('📝 Next: Run the SQL schema in Supabase SQL Editor');
    } else {
      console.log('\n❌ Setup failed. Please check your credentials.');
    }
  });
}

module.exports = { setupDatabase, executeSQL };
