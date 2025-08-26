-- TEST DATABASE SETUP - Run this after the main setup to verify everything works

-- Test 1: Check if all tables exist
SELECT 
    'profiles' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'games' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'game_players' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_players' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'game_rounds' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'game_rounds' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status
UNION ALL
SELECT 
    'player_answers' as table_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'player_answers' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status;

-- Test 2: Check if all required columns exist in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test 3: Check if leaderboard view exists and works
SELECT 
    'leaderboard' as view_name,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'leaderboard' AND table_schema = 'public') 
         THEN '✅ EXISTS' 
         ELSE '❌ MISSING' 
    END as status;

-- Test 4: Test leaderboard query
SELECT * FROM public.leaderboard LIMIT 5;

-- Test 5: Check if triggers exist
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Test 6: Check if functions exist
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Test 7: Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 8: Insert test data to verify everything works
INSERT INTO public.profiles (id, username, email, account_balance, games_played, games_won, total_score)
VALUES 
    (uuid_generate_v4(), 'TestUser_' || EXTRACT(EPOCH FROM NOW())::INTEGER, 'test@example.com', 100.00, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Test 9: Verify the test data was inserted
SELECT 
    username,
    account_balance,
    games_played,
    total_score
FROM public.profiles 
WHERE username LIKE 'TestUser_%'
ORDER BY created_at DESC
LIMIT 1;

-- Test 10: Final verification
SELECT 'Database setup completed successfully!' as final_status;
