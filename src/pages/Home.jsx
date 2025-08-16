import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, Clock, TrendingUp, Plus, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = ({ onNavigate, userProfile, availableGames = [], onJoinGame, onCreateGame }) => {
  const formatTimeUntilStart = (startTime) => {
    const now = Date.now();
    const timeLeft = startTime - now;
    
    if (timeLeft <= 0) return 'Starting now...';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '😊';
      case 'medium': return '😐';
      case 'hard': return '😤';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-green-400';
      case 'starting': return 'text-yellow-400';
      case 'playing': return 'text-blue-400';
      case 'finished': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold gradient-text mb-4">Symbol Duel</h1>
          <p className="text-xl text-gray-300 mb-6">Compete in puzzle tournaments for real prizes!</p>
          
          {/* User Stats */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userProfile.coins}</div>
              <div className="text-sm text-gray-400">Coins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{userProfile.totalWinnings}</div>
              <div className="text-sm text-gray-400">Total Winnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{userProfile.matchesPlayed}</div>
              <div className="text-sm text-gray-400">Matches Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger">{userProfile.bestScore}</div>
              <div className="text-sm text-gray-400">Best Score</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <Link to="/account" className="btn btn-outline">My Account</Link>
            <motion.button
              onClick={() => onNavigate('quickjoin')}
              className="btn btn-primary text-lg px-8 py-3 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              Quick Join
            </motion.button>
            
            <motion.button
              onClick={onCreateGame}
              className="btn btn-secondary text-lg px-8 py-3 flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              Create Tournament
            </motion.button>
          </div>
        </motion.div>

        {/* Available Games */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Available Tournaments</h2>
            <motion.button
              onClick={() => onNavigate('quickjoin')}
              className="btn btn-outline flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4 h-4" />
              View All
            </motion.button>
          </div>

          {availableGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">No tournaments available</h3>
              <p className="text-gray-400 mb-6">Be the first to create one!</p>
              <motion.button
                onClick={onCreateGame}
                className="btn btn-primary flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Tournament
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
              {availableGames.slice(0, 6).map((game) => (
                <motion.div
                  key={game.id}
                  className="card hover:scale-105 transition-transform cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onJoinGame(game.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getDifficultyIcon(game.difficulty)}</span>
                      <span className={`font-semibold ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
                      </span>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(game.status)}`}>
                      {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rounds:</span>
                      <span className="font-medium">{game.rounds}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Entry Fee:</span>
                      <span className="font-medium text-primary">${game.entryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Players:</span>
                      <span className="font-medium">{game.currentPlayers}/{game.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Starts in:</span>
                      <span className="font-medium text-warning">
                        {formatTimeUntilStart(game.startTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">by {game.createdBy}</span>
                    <motion.button
                      className="btn btn-primary text-sm px-4 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Join
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 md-grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="card text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold mb-2">Tournament Mode</h3>
            <p className="text-gray-400">Compete against other players in timed puzzle challenges</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-xl font-bold mb-2">Quick Matches</h3>
            <p className="text-gray-400">Jump into games that are starting soon</p>
          </div>
          
          <div className="card text-center">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-xl font-bold mb-2">Real Prizes</h3>
            <p className="text-gray-400">Win coins and climb the leaderboard</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
