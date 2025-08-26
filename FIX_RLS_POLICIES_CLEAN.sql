-- FIX RLS POLICIES - Clean version that handles existing policies

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view games" ON public.games;
DROP POLICY IF EXISTS "Creators can edit games" ON public.games;
DROP POLICY IF EXISTS "Anyone can create games" ON public.games;
DROP POLICY IF EXISTS "Anyone can view game players" ON public.game_players;
DROP POLICY IF EXISTS "Users can join games" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can view game rounds" ON public.game_rounds;
DROP POLICY IF EXISTS "Anyone can create game rounds" ON public.game_rounds;
DROP POLICY IF EXISTS "Players can view answers in their games" ON public.player_answers;
DROP POLICY IF EXISTS "Players can submit answers" ON public.player_answers;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;

-- Now create the correct policies
-- Profiles: Users can view, update, and insert their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games: Anyone can view, creators can edit
CREATE POLICY "Anyone can view games" ON public.games
  FOR SELECT USING (true);

CREATE POLICY "Creators can edit games" ON public.games
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Anyone can create games" ON public.games
  FOR INSERT WITH CHECK (true);

-- Game players: Anyone can view, players can join
CREATE POLICY "Anyone can view game players" ON public.game_players
  FOR SELECT USING (true);

CREATE POLICY "Users can join games" ON public.game_players
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Game rounds: Anyone can view
CREATE POLICY "Anyone can view game rounds" ON public.game_rounds
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create game rounds" ON public.game_rounds
  FOR INSERT WITH CHECK (true);

-- Player answers: Players can see all answers in their games
CREATE POLICY "Players can view answers in their games" ON public.player_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.game_players 
      WHERE game_id = player_answers.game_id 
      AND player_id = auth.uid()
    )
  );

CREATE POLICY "Players can submit answers" ON public.player_answers
  FOR INSERT WITH CHECK (auth.uid() = player_id);

-- Transactions: Users can only see their own
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Success message
SELECT 'RLS policies fixed! Authentication should now work properly.' as status;
