import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Medal, Crown, Star } from 'lucide-react';
// Force use real Supabase for production
const realSupabase = require('../utils/realSupabase');
const realtimeLeaderboardService = realSupabase.realtimeLeaderboardService;

const Leaderboard = ({ onBack }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      
      try {
        const data = await realtimeLeaderboardService.getLeaderboard(50);
        setLeaderboardData(data);
        console.log('📊 Loaded leaderboard data:', data.length, 'players');
      } catch (error) {
        console.error('Error loading leaderboard:', error);
        // Fallback to empty array
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();

    // Subscribe to real-time leaderboard updates
    const subscription = realtimeLeaderboardService.subscribeToLeaderboard((payload) => {
      console.log('🔄 Leaderboard update received:', payload);
      loadLeaderboard(); // Reload when updates occur
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [timeframe]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-300" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="btn btn-outline"
          >
            ← Back
          </button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-gray-300 mb-6">Top players by total winnings</p>
          
          {/* Timeframe Selector */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setTimeframe('all')}
              className={`btn ${
                timeframe === 'all' 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`btn ${
                timeframe === 'month' 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeframe('week')}
              className={`btn ${
                timeframe === 'week' 
                  ? 'btn-primary' 
                  : 'btn-outline'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-gray-400">No leaderboard data available yet.</p>
              <p className="text-gray-500 text-sm mt-2">Play some games to see rankings!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((player, index) => {
                const rank = index + 1;
                return (
                  <motion.div
                    key={player.username}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        <span className={`text-lg font-bold ${getRankColor(rank)}`}>
                          #{rank}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{player.username}</h3>
                        <p className="text-sm text-gray-400">
                          {player.games_played || 0} games played • {player.games_won || 0} wins
                        </p>
                        <p className="text-xs text-gray-500">
                          Win Rate: {player.win_rate || 0}% • Score: {player.total_score || 0}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-400">
                        ${(player.total_winnings || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-400">Total Winnings</div>
                      <div className="text-xs text-gray-500">
                        Balance: ${(player.account_balance || 0).toFixed(2)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
