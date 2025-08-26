import React from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, Plus, BookOpen } from 'lucide-react';




const Home = ({ onNavigate, userProfile, availableGames = [], onJoinGame, onCreateGame, onLogout }) => {


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
          <p className="text-xl text-gray-300 mb-6">Compete in individual puzzle games for real money prizes!</p>
          
          {/* User Stats - Mobile-friendly vertical layout */}
          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            <div className="text-center bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-primary">
                ${userProfile?.account_balance?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">Balance</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-green-400">
                ${userProfile?.total_winnings?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">Total Winnings</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-blue-400">
                {userProfile?.games_played || 0}
              </div>
              <div className="text-sm text-gray-400">Games Played</div>
            </div>
            <div className="text-center bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-2xl font-bold text-yellow-400">
                {userProfile?.games_won || 0}
              </div>
              <div className="text-sm text-gray-400">Games Won</div>
            </div>
          </div>

          {/* Action Buttons - Mobile-friendly vertical layout */}
          <div className="flex flex-col gap-3 mb-8 max-w-sm mx-auto">
            <motion.button
              onClick={() => onNavigate('account')}
              className="btn btn-outline text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              My Account
            </motion.button>
            <motion.button
              onClick={onLogout}
              className="btn btn-outline text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Logout
            </motion.button>
            <motion.button
              onClick={() => onNavigate('leaderboard')}
              className="btn btn-outline text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </motion.button>
            
            <motion.button
              onClick={() => onNavigate('practice')}
              className="btn btn-outline text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-5 h-5" />
              Practice Mode
            </motion.button>
            
            <motion.button
              onClick={() => onNavigate('createGame')}
              className="btn btn-primary text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" />
              Quick Join
            </motion.button>
            
            <motion.button
              onClick={onCreateGame}
              className="btn btn-secondary text-lg py-3 flex items-center justify-center gap-2 w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              Create Game
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
            <h2 className="text-3xl font-bold">Available Games</h2>
            <motion.button
              onClick={() => onNavigate('createGame')}
              className="btn btn-outline flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-4 h-4" />
              View All
            </motion.button>
          </div>

          {availableGames.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">No games available</h3>
              <p className="text-gray-400 mb-6">Be the first to create one!</p>
              <motion.button
                onClick={onCreateGame}
                className="btn btn-primary flex items-center gap-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                Create Game
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <span className="text-2xl">🎯</span>
                      <span className="font-semibold text-primary">
                        Game #{game.id.slice(-5)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-green-400">
                      {game.status || 'Waiting'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2">Puzzle Challenge</h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rounds:</span>
                      <span className="font-medium">6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Entry Fee:</span>
                      <span className="font-medium text-primary">${game.entry_fee || game.entryFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Players:</span>
                      <span className="font-medium">{game.current_players || game.currentPlayers || 0}/6</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Time Limit:</span>
                      <span className="font-medium">30s</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">
                      {game.status === 'starting' ? 'Starting soon...' : 'Join now'}
                    </span>
                    <button className="btn btn-primary text-sm px-4 py-2">
                      Join
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>


      </div>
    </div>
  );
};

export default Home;
