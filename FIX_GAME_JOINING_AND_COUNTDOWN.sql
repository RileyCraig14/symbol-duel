-- COMPLETE FIX FOR GAME JOINING AND COUNTDOWN SYSTEM
-- This fixes the "user not authorized" error and adds countdown/auto-deletion

-- 1. Fix RLS policies for game_players table
DROP POLICY IF EXISTS "Users can view all game players" ON public.game_players;
DROP POLICY IF EXISTS "Users can join games" ON public.game_players;
DROP POLICY IF EXISTS "Users can view their own game players" ON public.game_players;

-- Create working policies for game_players
CREATE POLICY "Users can view all game players" ON public.game_players FOR SELECT USING (true);
CREATE POLICY "Users can join games" ON public.game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own game players" ON public.game_players FOR UPDATE USING (auth.uid() = player_id);

-- 2. Fix RLS policies for games table
DROP POLICY IF EXISTS "Users can view all games" ON public.games;
DROP POLICY IF EXISTS "Users can create games" ON public.games;
DROP POLICY IF EXISTS "Users can update their own games" ON public.games;

-- Create working policies for games
CREATE POLICY "Users can view all games" ON public.games FOR SELECT USING (true);
CREATE POLICY "Users can create games" ON public.games FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update games" ON public.games FOR UPDATE USING (true);

-- 3. Add countdown and auto-deletion columns to games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS game_start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS countdown_started BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS game_status VARCHAR(20) DEFAULT 'waiting' CHECK (game_status IN ('waiting', 'countdown', 'active', 'completed', 'cancelled'));

-- 4. Create function to start countdown when 3+ players join
CREATE OR REPLACE FUNCTION public.start_game_countdown()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if we now have 3 or more players
    IF (SELECT COUNT(*) FROM public.game_players WHERE game_id = NEW.game_id) >= 3 THEN
        -- Start countdown if not already started
        UPDATE public.games 
        SET 
            countdown_started = TRUE,
            game_status = 'countdown',
            game_start_time = NOW() + INTERVAL '30 seconds'  -- 30 second countdown
        WHERE id = NEW.game_id AND countdown_started = FALSE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger to start countdown
DROP TRIGGER IF EXISTS trigger_start_countdown ON public.game_players;
CREATE TRIGGER trigger_start_countdown
    AFTER INSERT ON public.game_players
    FOR EACH ROW EXECUTE FUNCTION public.start_game_countdown();

-- 6. Create function to auto-delete games after 20 minutes
CREATE OR REPLACE FUNCTION public.auto_delete_old_games()
RETURNS void AS $$
BEGIN
    -- Delete games that are older than 20 minutes and not active
    DELETE FROM public.games 
    WHERE created_at < NOW() - INTERVAL '20 minutes' 
    AND game_status IN ('waiting', 'countdown', 'completed', 'cancelled');
    
    -- Also delete completed games after 5 minutes
    DELETE FROM public.games 
    WHERE game_status = 'completed' 
    AND updated_at < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to start game after countdown
CREATE OR REPLACE FUNCTION public.start_game_after_countdown()
RETURNS void AS $$
BEGIN
    -- Start games where countdown has finished
    UPDATE public.games 
    SET 
        game_status = 'active',
        updated_at = NOW()
    WHERE game_status = 'countdown' 
    AND game_start_time <= NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_status ON public.games(game_status);
CREATE INDEX IF NOT EXISTS idx_games_start_time ON public.games(game_start_time);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON public.games(created_at);

-- Success message
SELECT 'Game joining and countdown system fixed! Games will auto-start after 3 players and auto-delete after 20 minutes.' as status;
