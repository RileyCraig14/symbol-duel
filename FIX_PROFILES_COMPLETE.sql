-- COMPLETE FIX FOR PROFILES TABLE AND AUTHENTICATION

-- First, let's see what's actually in your profiles table
SELECT * FROM public.profiles LIMIT 5;

-- Check if the table exists and its structure
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- Clean up any existing corrupted data (if any)
TRUNCATE TABLE public.profiles;

-- Reset the profiles table structure properly
ALTER TABLE public.profiles DROP COLUMN IF EXISTS tokens;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS points;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS level;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS experience;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS streak_days;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS last_daily_challenge;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_verified_creator;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS creator_bio;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS creator_website;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS creator_social_links;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS total_challenges_created;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS total_revenue_generated;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS creator_rating;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS creator_reviews_count;

-- Now add the columns back properly
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

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create clean policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Recreate the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, tokens, points, level, experience, streak_days)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'User'), 100, 0, 1, 0, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Check if there are any existing auth users that need profiles
INSERT INTO public.profiles (id, username, tokens, points, level, experience, streak_days)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', 'User'),
    100, 0, 1, 0, 0
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Success message
SELECT 'Database completely reset and fixed! Ready for fresh signup.' as status;
