import React, { useState, useEffect } from 'react';
import { getRandomPuzzles } from '../utils/puzzleGenerator';

// Force use real Supabase for production
const realSupabase = require('../utils/realSupabase');
const realtimeGameService = realSupabase.realtimeGameService;

const IndividualGameSystem = ({ user, userProfile, onGameStart }) => {
  const [showCreateGame, setShowCreateGame] = useState(false);
  const [availableGames, setAvailableGames] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // Simple form state
  const [entryFee, setEntryFee] = useState(20);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');

  // Load games on component mount and subscribe to real-time updates
  useEffect(() => {
    loadAvailableGames();
    
    // Subscribe to real-time game updates
    const subscription = realtimeGameService.subscribeToAvailableGames((payload) => {
      console.log('🔄 Game update received:', payload);
      loadAvailableGames(); // Reload games when changes occur
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown timers
      setAvailableGames(prev => [...prev]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadAvailableGames = async () => {
    try {
      const games = await realtimeGameService.getAvailableGames();
      setAvailableGames(games);
      console.log('📋 Loaded available games:', games.length);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const handleCreateGame = async () => {
    if (!user || !userProfile) {
      alert('Please sign in to create a game');
      return;
    }

    if (!entryFee || !maxPlayers) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const gameData = {
        title: gameTitle || `$${entryFee} Game`,
        description: gameDescription || `Entry fee: $${entryFee}`,
        entryFee: entryFee,
        maxPlayers: maxPlayers,
        creatorId: user.id,
        creatorUsername: userProfile.username || 'Player'
      };

      await realtimeGameService.createGame(gameData);
      
      // Reload games and reset form
      await loadAvailableGames();
      setShowCreateGame(false);
      setEntryFee(20);
      setMaxPlayers(6);
      setGameTitle('');
      setGameDescription('');
      
      alert('Game created successfully!');
      
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = async (gameId) => {
    try {
      console.log('🎮 Attempting to join game:', gameId);
      await realtimeGameService.joinGame(gameId);
      await loadAvailableGames();
      alert('Successfully joined the game!');
    } catch (error) {
      console.error('❌ Error joining game:', error);
      console.error('❌ Error details:', error.message);
      alert(`Failed to join game: ${error.message}`);
    }
  };

  const handleStartGame = async (gameId) => {
    try {
      console.log('🎮 Starting game:', gameId);
      
      // Generate random puzzles for the game
      const puzzles = getRandomPuzzles(6);
      console.log('🧩 Generated puzzles:', puzzles);
      
      // Create game data with puzzles
      const gameData = {
        id: gameId,
        puzzles: puzzles,
        entryFee: availableGames.find(g => g.id === gameId)?.entry_fee || 20,
        maxPlayers: availableGames.find(g => g.id === gameId)?.max_players || 6,
        title: availableGames.find(g => g.id === gameId)?.title || 'Puzzle Game'
      };
      
      console.log('🎯 Game data created:', gameData);
      console.log('📊 Puzzles count:', gameData.puzzles.length);
      
      // Start the game in the database
      await realtimeGameService.startGame(gameId, puzzles);
      
      // Call the onGameStart function to start the game
      onGameStart(gameId, gameData);
      
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const getGameStatus = (game) => {
    if (game.game_status === 'countdown') {
      if (game.game_start_time) {
        const now = new Date();
        const startTime = new Date(game.game_start_time);
        const timeLeft = Math.max(0, Math.ceil((startTime - now) / 1000));
        return `Starting in ${timeLeft}s`;
      }
      return 'Starting soon!';
    }
    if (game.game_status === 'active') return 'Game Active';
    if (game.game_status === 'completed') return 'Completed';
    if (game.current_players >= game.max_players) return 'Game Full';
    return 'Waiting for Players';
  };

  const getStatusColor = (game) => {
    if (game.game_status === 'countdown') return 'text-yellow-400';
    if (game.game_status === 'active') return 'text-blue-400';
    if (game.game_status === 'completed') return 'text-gray-400';
    if (game.current_players >= game.max_players) return 'text-red-400';
    return 'text-green-400';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">Individual Games</h1>
        <p className="text-xl text-gray-300">
          Create and join skill-based puzzle competitions with real-money prizes!
        </p>
      </div>

      {/* Account Summary */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">💰 Account Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">${userProfile?.account_balance || 0}</div>
            <div className="text-gray-400">Balance</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">${userProfile?.total_winnings || 0}</div>
            <div className="text-gray-400">Total Winnings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">{userProfile?.games_played || 0}</div>
            <div className="text-gray-400">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{userProfile?.games_won || 0}</div>
            <div className="text-gray-400">Games Won</div>
          </div>
        </div>
      </div>

      {/* Create Game Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">🎮 Create New Game</h2>
          <button
            onClick={() => setShowCreateGame(!showCreateGame)}
            className="btn btn-primary"
          >
            {showCreateGame ? 'Cancel' : 'Create Game'}
          </button>
        </div>

        {showCreateGame && (
          <div className="bg-gray-700 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Fee ($)</label>
                <input
                  type="number"
                  value={entryFee}
                  onChange={(e) => setEntryFee(parseInt(e.target.value) || 0)}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  placeholder="20"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Players</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                  min="2"
                  max="10"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  placeholder="6"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Game Title (Optional)</label>
                <input
                  type="text"
                  value={gameTitle}
                  onChange={(e) => setGameTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  placeholder="Enter custom game title"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={gameDescription}
                  onChange={(e) => setGameDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
                  placeholder="Enter game description"
                />
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={handleCreateGame}
                disabled={isCreating}
                className="btn btn-primary text-lg px-8 py-3"
              >
                {isCreating ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Available Games */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">🎯 Available Games</h2>
          <button
            onClick={loadAvailableGames}
            className="btn btn-outline"
          >
            Refresh
          </button>
        </div>

        {availableGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl text-gray-400 mb-2">No games available</h3>
            <p className="text-gray-500">Create a new game to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableGames.map((game) => (
              <div key={game.id} className="bg-gray-700 rounded-lg p-6 border border-gray-600">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">{game.title}</h3>
                  <span className="text-2xl font-bold text-green-400">${game.entry_fee}</span>
                </div>
                
                <p className="text-gray-300 mb-4">{game.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400">Entry Fee</div>
                    <div className="text-lg font-semibold text-white">${game.entry_fee}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Players</div>
                    <div className="text-lg font-semibold text-white">{game.current_players}/{game.max_players}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Puzzles</div>
                    <div className="text-lg font-semibold text-white">6</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Status</div>
                    <div className={`text-lg font-semibold ${getStatusColor(game)}`}>
                      {getGameStatus(game)}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 mb-4">
                  Created by: {game.creator_username}
                </div>
                
                <button
                  onClick={() => handleJoinGame(game.id)}
                  disabled={game.current_players >= game.max_players || game.game_status === 'countdown' || game.game_status === 'active' || game.game_status === 'completed'}
                  className="w-full btn btn-primary mb-2"
                >
                  {game.current_players >= game.max_players ? 'Game Full' : 
                   game.game_status === 'countdown' ? 'Starting Soon' : 
                   game.game_status === 'active' ? 'Game Active' :
                   game.game_status === 'completed' ? 'Completed' : 'Quick Join'}
                </button>
                
                {/* Start Game button for joined players */}
                {game.current_players > 1 && game.status === 'lobby' && (
                  <button
                    onClick={() => handleStartGame(game.id)}
                    className="w-full btn btn-success"
                  >
                    Start Game
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualGameSystem;
