import React, { useState, useEffect, useCallback } from 'react';
import Home from './pages/Home';
import Account from './pages/Account';
import Leaderboard from './components/Leaderboard';
import IndividualGameSystem from './components/IndividualGameSystem';
import PuzzleGame from './components/PuzzleGame';
import PracticeMode from './components/PracticeMode';
import AuthForm from './components/AuthForm';
import './styles/theme.css';

// Force use real Supabase for production
const realSupabase = require('./utils/realSupabase');
const supabase = realSupabase.supabase;
const realtimeProfileService = realSupabase.realtimeProfileService;
// eslint-disable-next-line no-unused-vars
const realtimeGameService = realSupabase.realtimeGameService;
// eslint-disable-next-line no-unused-vars
const realtimeLeaderboardService = realSupabase.realtimeLeaderboardService;

console.log('✅ Using real Supabase for production');
console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Present' : 'Missing');

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [currentGame, setCurrentGame] = useState(null);
  const [currentGameData, setCurrentGameData] = useState(null); // Store full game data including puzzles
  const [isLoading, setIsLoading] = useState(true);

  // Initialize app with real Supabase authentication
  const initializeApp = useCallback(async () => {
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Get user profile
        try {
          const profile = await realtimeProfileService.getProfile(session.user.id);
          setUserProfile(profile);
          console.log('✅ User authenticated:', session.user.email);
          console.log('✅ User profile loaded:', profile);
        } catch (error) {
          console.error('❌ Error loading profile on init:', error);
          // If profile doesn't exist, create it manually
          if (error.message.includes('No rows found') || error.message.includes('not found')) {
            console.log('🔧 Creating profile manually on init...');
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                  id: session.user.id,
                  username: session.user.user_metadata?.username || `Player${Date.now()}`,
                  email: session.user.email,
                  account_balance: 100.00
                }])
                .select()
                .single();
              
              if (createError) {
                console.error('❌ Failed to create profile manually on init:', createError);
              } else {
                console.log('✅ Profile created manually on init:', newProfile);
                setUserProfile(newProfile);
              }
            } catch (createError) {
              console.error('❌ Failed to create profile manually on init:', createError);
            }
          }
        }
      } else {
        console.log('ℹ️ No active session');
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize app and listen for auth changes
  useEffect(() => {
    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        
        if (session?.user) {
          setUser(session.user);
          
          // Get user profile
          try {
            console.log('🔍 Attempting to load profile for user:', session.user.id);
            const profile = await realtimeProfileService.getProfile(session.user.id);
            console.log('✅ Profile loaded after auth change:', profile);
            setUserProfile(profile);
          } catch (error) {
            console.error('❌ Error loading profile after auth change:', error);
            // If profile doesn't exist, create it manually
            if (error.message.includes('No rows found') || error.message.includes('not found')) {
              console.log('🔧 Creating profile manually...');
              try {
                // Create profile manually using direct Supabase call
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert([{
                    id: session.user.id,
                    username: session.user.user_metadata?.username || `Player${Date.now()}`,
                    email: session.user.email,
                    account_balance: 100.00
                  }])
                  .select()
                  .single();
                
                if (createError) {
                  console.error('❌ Failed to create profile manually:', createError);
                } else {
                  console.log('✅ Profile created manually:', newProfile);
                  setUserProfile(newProfile);
                }
              } catch (createError) {
                console.error('❌ Failed to create profile manually:', createError);
              }
            }
          }
        } else {
          setUser(null);
          setUserProfile(null);
          setCurrentView('home');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeApp]);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  const handleCreateGame = () => {
    setCurrentView('createGame');
  };

  const handleJoinGame = (gameId) => {
    if (gameId) {
      setCurrentGame(gameId);
      setCurrentView('game');
    } else {
      setCurrentView('createGame');
    }
  };

  const handleGameStart = (gameId, gameData) => {
    console.log('🎮 handleGameStart called with gameId:', gameId);
    console.log('🎮 Game data:', gameData);
    console.log('🔄 Setting currentGame and changing view to game');
    
    setCurrentGame(gameId);
    setCurrentGameData(gameData); // Store the full game data
    setCurrentView('game');
    
    console.log('✅ Navigation complete - should now show PuzzleGame');
  };

  const handleGameComplete = (result) => {
    setCurrentGame(null);
    setCurrentView('home');
    // Update mock profile
    if (userProfile) {
      const updatedProfile = {
        ...userProfile,
        games_played: (userProfile.games_played || 0) + 1,
        games_won: result.won ? (userProfile.games_won || 0) + 1 : (userProfile.games_won || 0),
        total_winnings: result.won ? (userProfile.total_winnings || 0) + 50 : (userProfile.total_winnings || 0)
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('symbol-duel-profile', JSON.stringify(updatedProfile));
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentGame(null);
    setCurrentGameData(null); // Clear game data when returning home
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
      setCurrentView('home');
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setUser(null);
      setUserProfile(null);
      setCurrentView('home');
    }
  };

  const handleAuthSuccess = async (user) => {
    try {
      setUser(user);
      
      // Wait a moment for the database trigger to potentially create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get user profile (should be created automatically by database trigger)
      const profile = await realtimeProfileService.getProfile(user.id);
      setUserProfile(profile);
      
      console.log('✅ Auth success, profile loaded:', profile);
    } catch (error) {
      console.error('Error loading profile after auth success:', error);
      // Profile doesn't exist, create it manually
      console.log('🔧 Creating profile manually after auth success...');
      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            username: user.user_metadata?.username || `Player${Date.now()}`,
            email: user.email,
            account_balance: 100.00
          }])
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Failed to create profile manually after auth success:', createError);
        } else {
          console.log('✅ Profile created manually after auth success:', newProfile);
          setUserProfile(newProfile);
        }
      } catch (createError) {
        console.error('❌ Failed to create profile manually after auth success:', createError);
      }
    }
  };

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  // Show loading if user exists but profile not loaded yet
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Render different views
  switch (currentView) {
    case 'home':
      return (
        <Home
          userProfile={userProfile}
          onNavigate={handleNavigate}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onLogout={handleLogout}
        />
      );

    case 'account':
      return (
        <Account
          user={user}
          userProfile={userProfile}
          onBack={handleBackToHome}
        />
      );

    case 'leaderboard':
      return (
        <Leaderboard
          onBack={handleBackToHome}
        />
      );

    case 'createGame':
      return (
        <IndividualGameSystem
          user={user}
          userProfile={userProfile}
          onGameStart={handleGameStart}
          onBack={handleBackToHome}
        />
      );

    case 'game':
      return (
        <PuzzleGame
          gameId={currentGame}
          user={user}
          onGameComplete={handleGameComplete}
          onBack={handleBackToHome}
          gameData={currentGameData}
        />
      );

    case 'practice':
      return (
        <PracticeMode
          onBack={handleBackToHome}
        />
      );

    default:
      return (
        <Home
          userProfile={userProfile}
          onNavigate={handleNavigate}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onLogout={handleLogout}
        />
      );
  }
}

export default App;
