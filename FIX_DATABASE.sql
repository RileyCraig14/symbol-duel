-- Fix Database - Add missing columns if they don't exist
-- Run this in your Supabase SQL Editor if you get column errors

-- Add total_score column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'total_score') THEN
        ALTER TABLE public.profiles ADD COLUMN total_score INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add win_rate column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'win_rate') THEN
        ALTER TABLE public.profiles ADD COLUMN win_rate DECIMAL(5,2) DEFAULT 0.00;
    END IF;
END $$;

-- Recreate the leaderboard view
DROP VIEW IF EXISTS public.leaderboard;
CREATE OR REPLACE VIEW public.leaderboard AS
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

-- Update existing profiles to have total_score = 0 if NULL
UPDATE public.profiles 
SET total_score = 0 
WHERE total_score IS NULL;

-- Update existing profiles to have win_rate = 0 if NULL
UPDATE public.profiles 
SET win_rate = 0 
WHERE win_rate IS NULL;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
