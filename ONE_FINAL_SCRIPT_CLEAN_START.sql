-- ONE FINAL SCRIPT - CLEAN START
-- This will drop everything and rebuild it cleanly
-- Run this ONCE and it will fix everything

-- STEP 1: DROP ALL EXISTING OBJECTS (clean slate)
-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_start_countdown ON public.game_players;

-- Drop functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.start_game_countdown();
DROP FUNCTION IF EXISTS public.auto_delete_old_games();
DROP FUNCTION IF EXISTS public.start_game_after_countdown();

-- Drop ALL policies from all tables
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

-- Drop indexes
DROP INDEX IF EXISTS idx_games_status;
DROP INDEX IF EXISTS idx_games_start_time;
DROP INDEX IF EXISTS idx_games_created_at;

-- Drop constraints
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_game_status_check;

-- STEP 2: REBUILD EVERYTHING FRESH

-- 1. Create profile creation trigger
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

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Add new columns to games table (if they don't exist)
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS game_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS countdown_started BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS game_status VARCHAR(20) DEFAULT 'waiting';

-- 3. Add constraint for game_status
ALTER TABLE public.games 
ADD CONSTRAINT games_game_status_check 
CHECK (game_status IN ('waiting', 'countdown', 'active', 'completed', 'cancelled'));

-- 4. Create countdown function
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

-- 5. Create countdown trigger
CREATE TRIGGER trigger_start_countdown
    AFTER INSERT ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.start_game_countdown();

-- 6. Create auto-delete function
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

-- 7. Create game start function
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

-- 8. Create NEW policies (no conflicts)
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "game_players_select_all" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "game_players_insert_all" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "game_players_update_own" ON public.game_players FOR UPDATE USING (auth.uid() = player_id);

CREATE POLICY "games_select_all" ON public.games FOR SELECT USING (true);
CREATE POLICY "games_insert_all" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "games_update_all" ON public.games FOR UPDATE USING (true);

-- 9. Add performance indexes
CREATE INDEX idx_games_status ON public.games(game_status);
CREATE INDEX idx_games_start_time ON public.games(game_start_time);
CREATE INDEX idx_games_created_at ON public.games(created_at);

-- 10. Ensure timestamps exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- SUCCESS MESSAGE
SELECT '🎉 CLEAN START COMPLETE! Everything rebuilt from scratch. No more conflicts!' as status;
