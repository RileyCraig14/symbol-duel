import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('weekly'); // daily, weekly, monthly
  const [isLoading, setIsLoading] = useState(true);

  // Sample leaderboard data - in a real app, this would come from an API
  const sampleData = {
    daily: [
      { rank: 1, username: "SymbolMaster", score: 2847, avatar: "🧙‍♂️", change: "+2" },
      { rank: 2, username: "PuzzlePro", score: 2712, avatar: "🧠", change: "-1" },
      { rank: 3, username: "EmojiHunter", score: 2654, avatar: "🎯", change: "+5" },
      { rank: 4, username: "RuneReader", score: 2489, avatar: "📚", change: "+1" },
      { rank: 5, username: "MysticMind", score: 2341, avatar: "🔮", change: "-2" },
      { rank: 6, username: "SymbolSage", score: 2187, avatar: "🏛️", change: "+3" },
      { rank: 7, username: "PuzzlePirate", score: 2012, avatar: "🏴‍☠️", change: "new" },
      { rank: 8, username: "EmojiEmpress", score: 1987, avatar: "👑", change: "-1" },
      { rank: 9, username: "RuneRanger", score: 1876, avatar: "🏹", change: "+2" },
      { rank: 10, username: "MysticMage", score: 1754, avatar: "⚡", change: "-3" }
    ],
    weekly: [
      { rank: 1, username: "SymbolMaster", score: 15420, avatar: "🧙‍♂️", change: "+1" },
      { rank: 2, username: "PuzzlePro", score: 14876, avatar: "🧠", change: "-1" },
      { rank: 3, username: "EmojiHunter", score: 14234, avatar: "🎯", change: "+2" },
      { rank: 4, username: "RuneReader", score: 13891, avatar: "📚", change: "+1" },
      { rank: 5, username: "MysticMind", score: 13245, avatar: "🔮", change: "-2" },
      { rank: 6, username: "SymbolSage", score: 12876, avatar: "🏛️", change: "+4" },
      { rank: 7, username: "PuzzlePirate", score: 12432, avatar: "🏴‍☠️", change: "new" },
      { rank: 8, username: "EmojiEmpress", score: 11987, avatar: "👑", change: "-1" },
      { rank: 9, username: "RuneRanger", score: 11543, avatar: "🏹", change: "+3" },
      { rank: 10, username: "MysticMage", score: 10987, avatar: "⚡", change: "-2" }
    ],
    monthly: [
      { rank: 1, username: "SymbolMaster", score: 58743, avatar: "🧙‍♂️", change: "+1" },
      { rank: 2, username: "PuzzlePro", score: 56432, avatar: "🧠", change: "-1" },
      { rank: 3, username: "EmojiHunter", score: 53421, avatar: "🎯", change: "+3" },
      { rank: 4, username: "RuneReader", score: 51234, avatar: "📚", change: "+1" },
      { rank: 5, username: "MysticMind", score: 49876, avatar: "🔮", change: "-2" },
      { rank: 6, username: "SymbolSage", score: 47654, avatar: "🏛️", change: "+2" },
      { rank: 7, username: "PuzzlePirate", score: 45321, avatar: "🏴‍☠️", change: "new" },
      { rank: 8, username: "EmojiEmpress", score: 43210, avatar: "👑", change: "-1" },
      { rank: 9, username: "RuneRanger", score: 41876, avatar: "🏹", change: "+4" },
      { rank: 10, username: "MysticMage", score: 39876, avatar: "⚡", change: "-3" }
    ]
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLeaderboardData(sampleData[timeFilter]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeFilter, sampleData]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return rank;
    }
  };

  const getChangeColor = (change) => {
    if (change === 'new') return 'text-blue-400';
    if (change.startsWith('+')) return 'text-green-400';
    if (change.startsWith('-')) return 'text-red-400';
    return 'text-gray-400';
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setIsLoading(true);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="btn btn-outline flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text">Leaderboard</h1>
            <p className="text-gray-400">Top players this {timeFilter}</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Time Filter Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { key: 'daily', label: 'Daily', icon: Calendar },
              { key: 'weekly', label: 'Weekly', icon: TrendingUp },
              { key: 'monthly', label: 'Monthly', icon: Trophy }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleTimeFilterChange(key)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                  timeFilter === key
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="loading mx-auto mb-4"></div>
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="leaderboard">
              {leaderboardData.map((player, index) => (
                <motion.div
                  key={player.username}
                  className="leaderboard-row"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="leaderboard-rank flex items-center gap-3">
                    <span className="text-2xl">{getRankIcon(player.rank)}</span>
                    <span className="text-lg font-bold">{player.rank}</span>
                  </div>
                  
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-2xl">{player.avatar}</span>
                    <div>
                      <div className="font-semibold">{player.username}</div>
                      <div className="text-sm text-gray-400">
                        {timeFilter === 'daily' && 'Today'}
                        {timeFilter === 'weekly' && 'This Week'}
                        {timeFilter === 'monthly' && 'This Month'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-auto flex items-center gap-3">
                    <span className={`text-sm font-medium ${getChangeColor(player.change)}`}>
                      {player.change}
                    </span>
                    <div className="leaderboard-score">
                      {player.score.toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-xl font-bold mb-2">Total Players</h3>
            <p className="text-3xl font-bold text-primary">12,847</p>
          </motion.div>
          
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-4xl mb-2">🎯</div>
            <h3 className="text-xl font-bold mb-2">Puzzles Solved</h3>
            <p className="text-3xl font-bold text-secondary">89,432</p>
          </motion.div>
          
          <motion.div
            className="card text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-4xl mb-2">⚡</div>
            <h3 className="text-xl font-bold mb-2">Avg. Time</h3>
            <p className="text-3xl font-bold text-accent">1:23</p>
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to <span className="gradient-text">Compete</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join the challenge and see if you can make it to the top!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/play" className="btn btn-primary text-lg px-8 py-4">
                Start Playing
              </Link>
              <Link to="/packs" className="btn btn-outline text-lg px-8 py-4">
                View Packs
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
