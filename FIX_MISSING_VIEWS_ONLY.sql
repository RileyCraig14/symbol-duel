-- FIX MISSING VIEWS ONLY
-- This ONLY adds what's missing, doesn't touch existing working tables

-- =====================================================
-- STEP 1: CREATE MISSING VIEWS
-- =====================================================

-- 1. PLAYER_STATS VIEW - Basic player statistics
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
    p.last_active,
    p.created_at,
    COUNT(DISTINCT gp.game_id) as games_joined
FROM public.profiles p
LEFT JOIN public.game_players gp ON p.id = gp.player_id
GROUP BY p.id, p.username, p.email, p.account_balance, p.total_winnings, p.games_played, p.games_won, p.total_score, p.win_rate, p.last_active, p.created_at;

-- 2. GAME_HISTORY VIEW - Basic game history
CREATE OR REPLACE VIEW public.game_history AS
SELECT 
    g.id as game_id,
    g.title,
    g.entry_fee,
    g.prize_pool,
    g.status,
    g.created_at as game_created,
    g.creator_username,
    gp.player_id,
    gp.player_username,
    gp.final_score,
    gp.final_rank,
    gp.winnings
FROM public.games g
JOIN public.game_players gp ON g.id = gp.game_id
ORDER BY g.created_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '🎉 MISSING VIEWS ADDED! 🎉' as status;
SELECT '✅ Player stats view created' as detail;
SELECT '✅ Game history view created' as detail;
SELECT '🚀 Your app should now be fully functional!' as detail;
