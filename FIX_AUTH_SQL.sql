-- FIX AUTHENTICATION - Copy and paste this into your Supabase SQL Editor

-- Add missing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_daily_challenge TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified_creator BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_social_links JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_challenges_created INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_revenue_generated INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creator_reviews_count INTEGER DEFAULT 0;

-- Update existing profiles to have default values
UPDATE public.profiles SET 
    tokens = COALESCE(tokens, 100),
    points = COALESCE(points, 0),
    level = COALESCE(level, 1),
    experience = COALESCE(experience, 0),
    streak_days = COALESCE(streak_days, 0),
    is_verified_creator = COALESCE(is_verified_creator, FALSE),
    total_challenges_created = COALESCE(total_challenges_created, 0),
    total_revenue_generated = COALESCE(total_revenue_generated, 0),
    creator_rating = COALESCE(creator_rating, 0.00),
    creator_reviews_count = COALESCE(creator_reviews_count, 0)
WHERE tokens IS NULL OR points IS NULL OR level IS NULL;

-- Create trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, tokens, points, level, experience, streak_days)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User'), 100, 0, 1, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Success message
SELECT 'Authentication fixed! Users can now sign up and sign in.' as status;
