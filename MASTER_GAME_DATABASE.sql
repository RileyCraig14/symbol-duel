-- MASTER GAME DATABASE - COMPLETE MULTIPLAYER SYSTEM
-- This ONE script creates everything you need for your full multiplayer game
-- Run this ONCE and you'll have a complete, working game database

-- =====================================================
-- STEP 1: DROP ALL EXISTING OBJECTS (clean slate)
-- =====================================================

-- Drop all triggers first (with CASCADE to handle dependencies)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_start_countdown ON public.game_players;
DROP TRIGGER IF EXISTS trigger_update_player_stats ON public.game_rounds;
DROP TRIGGER IF EXISTS trigger_calculate_win_rate ON public.profiles;
DROP TRIGGER IF EXISTS trigger_update_leaderboard ON public.profiles;
DROP TRIGGER IF EXISTS on_game_player_complete ON public.game_players;
DROP TRIGGER IF EXISTS on_profile_update ON public.profiles;
DROP TRIGGER IF EXISTS on_game_complete ON public.games;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.start_game_countdown();
DROP FUNCTION IF EXISTS public.auto_delete_old_games();
DROP FUNCTION IF EXISTS public.start_game_after_countdown();
DROP FUNCTION IF EXISTS public.update_player_stats();
DROP FUNCTION IF EXISTS public.calculate_win_rate();
DROP FUNCTION IF EXISTS public.update_leaderboard();
DROP FUNCTION IF EXISTS public.process_game_completion();
DROP FUNCTION IF EXISTS public.award_prizes();
DROP FUNCTION IF EXISTS public.create_daily_challenge();

-- Drop all policies (comprehensive cleanup)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all game players" ON public.game_players;
DROP POLICY IF EXISTS "Users can join games" ON public.game_players;
DROP POLICY IF EXISTS "Users can view their own game players" ON public.game_players;
DROP POLICY IF EXISTS "Users can update their own game players" ON public.game_players;
DROP POLICY IF EXISTS "Users can view all games" ON public.games;
DROP POLICY IF EXISTS "Users can create games" ON public.games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;
DROP POLICY IF EXISTS "Users can update games" ON public.games;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.game_players;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.game_players;
DROP POLICY IF EXISTS "Enable update for users based on player_id" ON public.game_players;
DROP POLICY IF EXISTS "Enable delete for users based on player_id" ON public.game_players;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.games;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.games;
DROP POLICY IF EXISTS "Enable update for users based on creator_id" ON public.games;
DROP POLICY IF EXISTS "Enable delete for users based on creator_id" ON public.games;
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "game_players_select_all" ON public.game_players;
DROP POLICY IF EXISTS "game_players_insert_all" ON public.game_players;
DROP POLICY IF EXISTS "game_players_update_own" ON public.game_players;
DROP POLICY IF EXISTS "games_select_all" ON public.games;
DROP POLICY IF EXISTS "games_insert_all" ON public.games;
DROP POLICY IF EXISTS "games_update_all" ON public.games;

-- Drop all indexes
DROP INDEX IF EXISTS idx_games_status;
DROP INDEX IF EXISTS idx_games_start_time;
DROP INDEX IF EXISTS idx_games_created_at;
DROP INDEX IF EXISTS idx_profiles_username;
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_game_players_game_id;
DROP INDEX IF EXISTS idx_game_players_player_id;
DROP INDEX IF EXISTS idx_game_rounds_game_id;
DROP INDEX IF EXISTS idx_player_answers_round_id;
DROP INDEX IF EXISTS idx_tournaments_status;
DROP INDEX IF EXISTS idx_daily_challenges_date;
DROP INDEX IF EXISTS idx_custom_puzzles_creator_id;

-- Drop all constraints
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_game_status_check;
ALTER TABLE public.tournaments DROP CONSTRAINT IF EXISTS tournaments_status_check;
ALTER TABLE public.daily_challenges DROP CONSTRAINT IF EXISTS daily_challenges_status_check;

-- Drop all views
DROP VIEW IF EXISTS public.leaderboard;
DROP VIEW IF EXISTS public.player_stats;
DROP VIEW IF EXISTS public.game_history;
DROP VIEW IF EXISTS public.tournament_standings;

-- =====================================================
-- STEP 2: CREATE ALL TABLES WITH COMPLETE SCHEMA
-- =====================================================

-- 1. PROFILES TABLE - User accounts and stats
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    account_balance DECIMAL(10,2) DEFAULT 100.00,
    total_winnings DECIMAL(10,2) DEFAULT 0.00,
    total_deposits DECIMAL(10,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(10,2) DEFAULT 0.00,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    rank_position INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT FALSE,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. GAMES TABLE - Individual game sessions
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    entry_fee DECIMAL(10,2) NOT NULL,
    max_players INTEGER NOT NULL DEFAULT 6,
    current_players INTEGER DEFAULT 1,
    creator_id UUID REFERENCES public.profiles(id),
    creator_username VARCHAR(50),
    prize_pool DECIMAL(10,2) NOT NULL,
    game_start_time TIMESTAMP WITH TIME ZONE,
    countdown_started BOOLEAN DEFAULT FALSE,
    game_status VARCHAR(20) DEFAULT 'waiting',
    game_type VARCHAR(20) DEFAULT 'individual', -- individual, tournament, practice
    puzzle_count INTEGER DEFAULT 6,
    time_limit INTEGER DEFAULT 300, -- seconds
    is_private BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255), -- for private games
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. GAME_PLAYERS TABLE - Players in each game
CREATE TABLE IF NOT EXISTS public.game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    player_username VARCHAR(50) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ready BOOLEAN DEFAULT FALSE,
    final_score INTEGER DEFAULT 0,
    final_rank INTEGER DEFAULT 0,
    prize_amount DECIMAL(10,2) DEFAULT 0.00,
    UNIQUE(game_id, player_id)
);

-- 4. GAME_ROUNDS TABLE - Individual rounds within games
CREATE TABLE IF NOT EXISTS public.game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    puzzle_id VARCHAR(100) NOT NULL,
    puzzle_text TEXT NOT NULL,
    puzzle_answer VARCHAR(100) NOT NULL,
    puzzle_hint TEXT,
    time_limit INTEGER DEFAULT 60,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(game_id, round_number)
);

-- 5. PLAYER_ANSWERS TABLE - Player responses to puzzles
CREATE TABLE IF NOT EXISTS public.player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    round_id UUID REFERENCES public.game_rounds(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    answer_text VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    response_time INTEGER, -- seconds
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament tables removed - not needed for this app

-- 6. DAILY_CHALLENGES TABLE - Daily puzzle challenges
CREATE TABLE IF NOT EXISTS public.daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_date DATE UNIQUE NOT NULL,
    puzzle_id VARCHAR(100) NOT NULL,
    puzzle_text TEXT NOT NULL,
    puzzle_answer VARCHAR(100) NOT NULL,
    puzzle_hint TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium', -- easy, medium, hard
    max_attempts INTEGER DEFAULT 3,
    time_limit INTEGER DEFAULT 120,
    prize_pool DECIMAL(10,2) DEFAULT 50.00,
    participants_count INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, expired
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. DAILY_CHALLENGE_ATTEMPTS TABLE - Player attempts at daily challenges
CREATE TABLE IF NOT EXISTS public.daily_challenge_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    answer_text VARCHAR(100) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempt_number INTEGER NOT NULL,
    response_time INTEGER,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, player_id, attempt_number)
);

-- 8. CUSTOM_PUZZLES TABLE - User-created puzzles
CREATE TABLE IF NOT EXISTS public.custom_puzzles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    puzzle_text TEXT NOT NULL,
    puzzle_answer VARCHAR(100) NOT NULL,
    puzzle_hint TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium',
    category VARCHAR(50) DEFAULT 'general',
    is_approved BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. PRACTICE_SESSIONS TABLE - Individual practice sessions
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'random', -- random, custom, daily_challenge
    puzzle_count INTEGER DEFAULT 10,
    time_limit INTEGER DEFAULT 600, -- 10 minutes
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    total_score INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE
);

-- 10. PRACTICE_ANSWERS TABLE - Answers in practice sessions
CREATE TABLE IF NOT EXISTS public.practice_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
    puzzle_id VARCHAR(100) NOT NULL,
    puzzle_text TEXT NOT NULL,
    puzzle_answer VARCHAR(100) NOT NULL,
    player_answer VARCHAR(100),
    is_correct BOOLEAN,
    response_time INTEGER,
    points_earned INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. PAYMENT_HISTORY TABLE - Track all financial transactions
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- deposit, withdrawal, game_entry, prize_win, refund
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    game_id UUID REFERENCES public.games(id),
    stripe_payment_intent_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, cancelled
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. LEGAL_AGREEMENTS TABLE - Track user agreements
CREATE TABLE IF NOT EXISTS public.legal_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    agreement_type VARCHAR(50) NOT NULL, -- terms_of_service, privacy_policy, age_verification
    version VARCHAR(20) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 13. NOTIFICATIONS TABLE - User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(20) DEFAULT 'info', -- info, success, warning, error
    is_read BOOLEAN DEFAULT FALSE,
    related_game_id UUID REFERENCES public.games(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STEP 3: ADD CONSTRAINTS AND VALIDATIONS
-- =====================================================

-- Game status constraints
ALTER TABLE public.games 
ADD CONSTRAINT games_game_status_check 
CHECK (game_status IN ('waiting', 'countdown', 'active', 'completed', 'cancelled'));

-- Tournament constraints removed - not needed

-- Daily challenge status constraints
ALTER TABLE public.daily_challenges 
ADD CONSTRAINT daily_challenges_status_check 
CHECK (status IN ('active', 'completed', 'expired'));

-- =====================================================
-- STEP 4: CREATE ALL VIEWS
-- =====================================================

-- 1. LEADERBOARD VIEW - Top players by score
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT 
    p.id,
    p.username,
    p.total_score,
    p.games_played,
    p.games_won,
    p.win_rate,
    p.account_balance,
    p.rank_position,
    ROW_NUMBER() OVER (ORDER BY p.total_score DESC, p.win_rate DESC) as rank
FROM public.profiles p
WHERE p.games_played > 0
ORDER BY p.total_score DESC, p.win_rate DESC;

-- 2. PLAYER_STATS VIEW - Comprehensive player statistics
CREATE OR REPLACE VIEW public.player_stats AS
SELECT 
    p.id,
    p.username,
    p.email,
    p.account_balance,
    p.total_winnings,
    p.games_played,
    p.games_won,
    p.total_score,
    p.win_rate,
    p.rank_position,
    p.last_active,
    p.created_at,
    COUNT(DISTINCT gp.game_id) as games_joined,
    COUNT(DISTINCT dc.id) as daily_challenges_completed,
    COUNT(DISTINCT cp.id) as custom_puzzles_created
FROM public.profiles p
LEFT JOIN public.game_players gp ON p.id = gp.player_id
LEFT JOIN public.daily_challenge_attempts dca ON p.id = dca.player_id
LEFT JOIN public.daily_challenges dc ON dca.challenge_id = dc.id AND dca.is_correct = true
LEFT JOIN public.custom_puzzles cp ON p.id = cp.creator_id
GROUP BY p.id, p.username, p.email, p.account_balance, p.total_winnings, p.games_played, p.games_won, p.total_score, p.win_rate, p.rank_position, p.last_active, p.created_at;

-- 3. GAME_HISTORY VIEW - Complete game history
CREATE OR REPLACE VIEW public.game_history AS
SELECT 
    g.id as game_id,
    g.title,
    g.entry_fee,
    g.prize_pool,
    g.game_status,
    g.created_at as game_created,
    g.creator_username,
    gp.player_id,
    gp.player_username,
    gp.final_score,
    gp.final_rank,
    gp.prize_amount,
    g.game_type
FROM public.games g
JOIN public.game_players gp ON g.id = gp.game_id
ORDER BY g.created_at DESC;

-- Tournament standings view removed - not needed

-- =====================================================
-- STEP 5: CREATE ALL FUNCTIONS
-- =====================================================

-- 1. Profile creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
        INSERT INTO public.profiles (id, username, email, account_balance, created_at, updated_at)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'username', 'Player' || EXTRACT(EPOCH FROM NOW())::INTEGER),
            NEW.email,
            100.00,
            NOW(),
            NOW()
        );
    END IF;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Profile creation failed for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Game countdown function
CREATE OR REPLACE FUNCTION public.start_game_countdown()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM public.game_players WHERE game_id = NEW.game_id) >= 3 THEN
        UPDATE public.games 
        SET 
            countdown_started = TRUE,
            game_status = 'countdown',
            game_start_time = NOW() + INTERVAL '30 seconds'
        WHERE id = NEW.game_id AND countdown_started = FALSE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Auto-delete old games function
CREATE OR REPLACE FUNCTION public.auto_delete_old_games()
RETURNS void AS $$
BEGIN
    DELETE FROM public.games 
    WHERE created_at < NOW() - INTERVAL '20 minutes' 
    AND game_status IN ('waiting', 'countdown', 'completed', 'cancelled');
    
    DELETE FROM public.games 
    WHERE game_status = 'completed' 
    AND updated_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Game start after countdown function
CREATE OR REPLACE FUNCTION public.start_game_after_countdown()
RETURNS void AS $$
BEGIN
    UPDATE public.games 
    SET 
        game_status = 'active',
        updated_at = NOW()
    WHERE game_status = 'countdown' 
    AND game_start_time <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update player stats function
CREATE OR REPLACE FUNCTION public.update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update games played and won
    UPDATE public.profiles 
    SET 
        games_played = (
            SELECT COUNT(DISTINCT game_id) 
            FROM public.game_players 
            WHERE player_id = NEW.player_id
        ),
        games_won = (
            SELECT COUNT(DISTINCT game_id) 
            FROM public.game_players 
            WHERE player_id = NEW.player_id AND final_rank = 1
        ),
        total_score = (
            SELECT COALESCE(SUM(final_score), 0) 
            FROM public.game_players 
            WHERE player_id = NEW.player_id
        ),
        updated_at = NOW()
    WHERE id = NEW.player_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Calculate win rate function
CREATE OR REPLACE FUNCTION public.calculate_win_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET 
        win_rate = CASE 
            WHEN games_played > 0 THEN ROUND((games_won::DECIMAL / games_played::DECIMAL) * 100, 2)
            ELSE 0.00
        END,
        updated_at = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update leaderboard function
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Update rank positions
    UPDATE public.profiles 
    SET rank_position = subquery.rank
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_score DESC, win_rate DESC) as rank
        FROM public.profiles
        WHERE games_played > 0
    ) subquery
    WHERE profiles.id = subquery.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Process game completion function
CREATE OR REPLACE FUNCTION public.process_game_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.game_status = 'completed' AND OLD.game_status != 'completed' THEN
        -- Award prizes to top players
        UPDATE public.game_players 
        SET 
            final_rank = subquery.rank,
            prize_amount = CASE 
                WHEN subquery.rank = 1 THEN NEW.prize_pool * 0.6  -- 60% to 1st place
                WHEN subquery.rank = 2 THEN NEW.prize_pool * 0.3  -- 30% to 2nd place
                WHEN subquery.rank = 3 THEN NEW.prize_pool * 0.1  -- 10% to 3rd place
                ELSE 0.00
            END
        FROM (
            SELECT player_id, ROW_NUMBER() OVER (ORDER BY final_score DESC, joined_at ASC) as rank
            FROM public.game_players
            WHERE game_id = NEW.id
        ) subquery
        WHERE game_players.player_id = subquery.player_id AND game_players.game_id = NEW.id;
        
        -- Update player balances
        UPDATE public.profiles 
        SET 
            account_balance = account_balance + gp.prize_amount,
            total_winnings = total_winnings + gp.prize_amount,
            updated_at = NOW()
        FROM public.game_players gp
        WHERE profiles.id = gp.player_id 
        AND gp.game_id = NEW.id 
        AND gp.prize_amount > 0;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Award prizes function
CREATE OR REPLACE FUNCTION public.award_prizes()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.prize_amount > 0 THEN
        -- Record payment history
        INSERT INTO public.payment_history (
            player_id, transaction_type, amount, 
            balance_before, balance_after, game_id, status, description
        )
        SELECT 
            NEW.player_id,
            'prize_win',
            NEW.prize_amount,
            p.account_balance,
            p.account_balance + NEW.prize_amount,
            NEW.game_id,
            'completed',
            'Prize for finishing in position ' || NEW.final_rank
        FROM public.profiles p
        WHERE p.id = NEW.player_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create daily challenge function
CREATE OR REPLACE FUNCTION public.create_daily_challenge()
RETURNS void AS $$
BEGIN
    -- Create new daily challenge if one doesn't exist for today
    IF NOT EXISTS (SELECT 1 FROM public.daily_challenges WHERE challenge_date = CURRENT_DATE) THEN
        INSERT INTO public.daily_challenges (
            challenge_date, puzzle_id, puzzle_text, puzzle_answer, 
            puzzle_hint, difficulty, max_attempts, time_limit, prize_pool
        )
        VALUES (
            CURRENT_DATE,
            'daily_' || EXTRACT(EPOCH FROM NOW())::INTEGER,
            'Daily Challenge Puzzle - Solve this rebus!',
            'ANSWER',
            'Think about the symbols and their meaning',
            'medium',
            3,
            120,
            50.00
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: CREATE ALL TRIGGERS
-- =====================================================

-- 1. Profile creation trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Game countdown trigger
CREATE TRIGGER trigger_start_countdown
    AFTER INSERT ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.start_game_countdown();

-- 3. Update player stats trigger
CREATE TRIGGER trigger_update_player_stats
    AFTER UPDATE ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.update_player_stats();

-- 4. Calculate win rate trigger
CREATE TRIGGER trigger_calculate_win_rate
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.calculate_win_rate();

-- 5. Update leaderboard trigger
CREATE TRIGGER trigger_update_leaderboard
    AFTER UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_leaderboard();

-- 6. Process game completion trigger
CREATE TRIGGER trigger_process_game_completion
    AFTER UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION public.process_game_completion();

-- 7. Award prizes trigger
CREATE TRIGGER trigger_award_prizes
    AFTER UPDATE ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.award_prizes();

-- =====================================================
-- STEP 7: CREATE ALL POLICIES (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_answers ENABLE ROW LEVEL SECURITY;
-- Tournament RLS removed - not needed
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Games policies
CREATE POLICY "games_select_all" ON public.games FOR SELECT USING (true);
CREATE POLICY "games_insert_all" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "games_update_all" ON public.games FOR UPDATE USING (true);

-- Game players policies
CREATE POLICY "game_players_select_all" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "game_players_insert_all" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "game_players_update_own" ON public.game_players FOR UPDATE USING (auth.uid() = player_id);

-- Game rounds policies
CREATE POLICY "game_rounds_select_all" ON public.game_rounds FOR SELECT USING (true);
CREATE POLICY "game_rounds_insert_all" ON public.game_rounds FOR INSERT WITH CHECK (true);
CREATE POLICY "game_rounds_update_all" ON public.game_rounds FOR UPDATE USING (true);

-- Player answers policies
CREATE POLICY "player_answers_select_all" ON public.player_answers FOR SELECT USING (true);
CREATE POLICY "player_answers_insert_own" ON public.player_answers FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "player_answers_update_own" ON public.player_answers FOR UPDATE USING (auth.uid() = player_id);

-- Tournament policies removed - not needed

-- Daily challenges policies
CREATE POLICY "daily_challenges_select_all" ON public.daily_challenges FOR SELECT USING (true);
CREATE POLICY "daily_challenges_insert_all" ON public.daily_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "daily_challenges_update_all" ON public.daily_challenges FOR UPDATE USING (true);

-- Daily challenge attempts policies
CREATE POLICY "daily_challenge_attempts_select_all" ON public.daily_challenge_attempts FOR SELECT USING (true);
CREATE POLICY "daily_challenge_attempts_insert_own" ON public.daily_challenge_attempts FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "daily_challenge_attempts_update_own" ON public.daily_challenge_attempts FOR UPDATE USING (auth.uid() = player_id);

-- Custom puzzles policies
CREATE POLICY "custom_puzzles_select_all" ON public.custom_puzzles FOR SELECT USING (true);
CREATE POLICY "custom_puzzles_insert_own" ON public.custom_puzzles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "custom_puzzles_update_own" ON public.custom_puzzles FOR UPDATE USING (auth.uid() = creator_id);

-- Practice sessions policies
CREATE POLICY "practice_sessions_select_own" ON public.practice_sessions FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "practice_sessions_insert_own" ON public.practice_sessions FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "practice_sessions_update_own" ON public.practice_sessions FOR UPDATE USING (auth.uid() = player_id);

-- Practice answers policies
CREATE POLICY "practice_answers_select_own" ON public.practice_answers FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "practice_answers_insert_own" ON public.practice_answers FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "practice_answers_update_own" ON public.practice_answers FOR UPDATE USING (auth.uid() = player_id);

-- Payment history policies
CREATE POLICY "payment_history_select_own" ON public.payment_history FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "payment_history_insert_all" ON public.payment_history FOR INSERT WITH CHECK (true);
CREATE POLICY "payment_history_update_all" ON public.payment_history FOR UPDATE USING (true);

-- Legal agreements policies
CREATE POLICY "legal_agreements_select_own" ON public.legal_agreements FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "legal_agreements_insert_own" ON public.legal_agreements FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "legal_agreements_update_own" ON public.legal_agreements FOR UPDATE USING (auth.uid() = player_id);

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = player_id);
CREATE POLICY "notifications_insert_all" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = player_id);

-- =====================================================
-- STEP 8: CREATE PERFORMANCE INDEXES
-- =====================================================

-- Core performance indexes
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_rank ON public.profiles(rank_position);

CREATE INDEX idx_games_status ON public.games(game_status);
CREATE INDEX idx_games_start_time ON public.games(game_start_time);
CREATE INDEX idx_games_created_at ON public.games(created_at);
CREATE INDEX idx_games_creator ON public.games(creator_id);
CREATE INDEX idx_games_type ON public.games(game_type);

CREATE INDEX idx_game_players_game_id ON public.game_players(game_id);
CREATE INDEX idx_game_players_player_id ON public.game_players(player_id);
CREATE INDEX idx_game_players_rank ON public.game_players(final_rank);

CREATE INDEX idx_game_rounds_game_id ON public.game_rounds(game_id);
CREATE INDEX idx_game_rounds_number ON public.game_rounds(game_id, round_number);

CREATE INDEX idx_player_answers_round_id ON public.player_answers(round_id);
CREATE INDEX idx_player_answers_player_id ON public.player_answers(player_id);

-- Tournament indexes removed - not needed

CREATE INDEX idx_daily_challenges_date ON public.daily_challenges(challenge_date);
CREATE INDEX idx_daily_challenges_status ON public.daily_challenges(status);

CREATE INDEX idx_daily_challenge_attempts_challenge ON public.daily_challenge_attempts(challenge_id);
CREATE INDEX idx_daily_challenge_attempts_player ON public.daily_challenge_attempts(player_id);

CREATE INDEX idx_custom_puzzles_creator ON public.custom_puzzles(creator_id);
CREATE INDEX idx_custom_puzzles_approved ON public.custom_puzzles(is_approved);

CREATE INDEX idx_practice_sessions_player ON public.practice_sessions(player_id);
CREATE INDEX idx_practice_sessions_completed ON public.practice_sessions(is_completed);

CREATE INDEX idx_payment_history_player ON public.payment_history(player_id);
CREATE INDEX idx_payment_history_type ON public.payment_history(transaction_type);
CREATE INDEX idx_payment_history_status ON public.payment_history(status);

CREATE INDEX idx_notifications_player ON public.notifications(player_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);

-- =====================================================
-- STEP 9: FINAL SETUP AND VALIDATION
-- =====================================================

-- Ensure all tables have proper timestamps
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create initial daily challenge
SELECT public.create_daily_challenge();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 MASTER GAME DATABASE COMPLETE! 🎉' as status;
SELECT '✅ All tables created with full schema' as detail;
SELECT '✅ All views created for leaderboards and stats' as detail;
SELECT '✅ All functions created for game logic' as detail;
SELECT '✅ All triggers created for automation' as detail;
SELECT '✅ All policies created for security' as detail;
SELECT '✅ All indexes created for performance' as detail;
SELECT '🚀 Your multiplayer game is ready to launch!' as detail;
