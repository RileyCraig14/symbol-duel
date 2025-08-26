-- IMMEDIATE FIX - DISABLE RLS TO ALLOW LOGIN

-- Disable RLS on profiles table completely
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Make sure your profile exists and is accessible
INSERT INTO public.profiles (id, username, tokens, points, level, experience, streak_days)
SELECT 
    au.id,
    'Rileycraig30',
    100, 0, 1, 0, 0
FROM auth.users au
WHERE au.email = 'rileycraig14@gmail.com'
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    tokens = EXCLUDED.tokens,
    points = EXCLUDED.points,
    level = EXCLUDED.level,
    experience = EXCLUDED.experience,
    streak_days = EXCLUDED.streak_days;

-- Success message
SELECT 'RLS disabled! You can now sign in immediately.' as status;
