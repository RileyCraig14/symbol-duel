import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, Star, Crown, Sparkles, Zap, Flame, Leaf } from 'lucide-react';

const Packs = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  const categories = [
    { key: 'all', label: 'All Packs', icon: Sparkles },
    { key: 'ancient', label: 'Ancient', icon: Crown },
    { key: 'nature', label: 'Nature', icon: Leaf },
    { key: 'fantasy', label: 'Fantasy', icon: Zap },
    { key: 'modern', label: 'Modern', icon: Flame }
  ];

  const packs = [
    {
      id: 1,
      name: "Ancient Egypt",
      description: "Decode hieroglyphs and unlock the secrets of the pharaohs",
      icon: "🏛️",
      category: "ancient",
      difficulty: 2,
      puzzleCount: 25,
      price: 0,
      isPremium: false,
      popularity: 95,
      rating: 4.8,
      featured: true
    },
    {
      id: 2,
      name: "Mystical Runes",
      description: "Ancient Nordic symbols and magical inscriptions",
      icon: "🔮",
      category: "ancient",
      difficulty: 3,
      puzzleCount: 30,
      price: 2.99,
      isPremium: true,
      popularity: 88,
      rating: 4.9,
      featured: true
    },
    {
      id: 3,
      name: "Nature's Code",
      description: "Symbols hidden in the natural world around us",
      icon: "🌿",
      category: "nature",
      difficulty: 1,
      puzzleCount: 20,
      price: 0,
      isPremium: false,
      popularity: 76,
      rating: 4.6,
      featured: false
    },
    {
      id: 4,
      name: "Fantasy Realms",
      description: "Magical creatures and enchanted symbols",
      icon: "🐉",
      category: "fantasy",
      difficulty: 2,
      puzzleCount: 28,
      price: 1.99,
      isPremium: true,
      popularity: 82,
      rating: 4.7,
      featured: false
    },
    {
      id: 5,
      name: "Modern Emojis",
      description: "Contemporary symbols and digital expressions",
      icon: "📱",
      category: "modern",
      difficulty: 1,
      puzzleCount: 35,
      price: 0,
      isPremium: false,
      popularity: 91,
      rating: 4.5,
      featured: false
    },
    {
      id: 6,
      name: "Celestial Signs",
      description: "Astrological symbols and cosmic patterns",
      icon: "⭐",
      category: "ancient",
      difficulty: 3,
      puzzleCount: 22,
      price: 3.99,
      isPremium: true,
      popularity: 79,
      rating: 4.9,
      featured: false
    },
    {
      id: 7,
      name: "Ocean Depths",
      description: "Marine symbols and underwater mysteries",
      icon: "🌊",
      category: "nature",
      difficulty: 2,
      puzzleCount: 18,
      price: 1.49,
      isPremium: true,
      popularity: 73,
      rating: 4.4,
      featured: false
    },
    {
      id: 8,
      name: "Tech Symbols",
      description: "Modern technology and digital age symbols",
      icon: "💻",
      category: "modern",
      difficulty: 2,
      puzzleCount: 32,
      price: 2.49,
      isPremium: true,
      popularity: 85,
      rating: 4.6,
      featured: false
    }
  ];

  const filteredPacks = packs
    .filter(pack => selectedCategory === 'all' || pack.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return b.popularity - a.popularity;
        case 'rating':
          return b.rating - a.rating;
        case 'difficulty':
          return a.difficulty - b.difficulty;
        case 'price':
          return a.price - b.price;
        default:
          return 0;
      }
    });

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 1: return 'text-green-400';
      case 2: return 'text-yellow-400';
      case 3: return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getDifficultyText = (diff) => {
    switch (diff) {
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="btn btn-outline flex items-center gap-2">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text">Puzzle Packs</h1>
            <p className="text-gray-400">Choose your challenge</p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === key
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-primary focus:outline-none"
          >
            <option value="popularity">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="difficulty">Easiest First</option>
            <option value="price">Lowest Price</option>
          </select>
        </div>

        {/* Featured Pack */}
        {filteredPacks.filter(pack => pack.featured).length > 0 && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center gradient-text">Featured Pack</h2>
            {filteredPacks.filter(pack => pack.featured).map(pack => (
              <div key={pack.id} className="card relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star size={14} />
                    Featured
                  </span>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="text-8xl">{pack.icon}</div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-3xl font-bold mb-4">{pack.name}</h3>
                    <p className="text-xl text-gray-300 mb-6">{pack.description}</p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(pack.difficulty)} bg-gray-800`}>
                        {getDifficultyText(pack.difficulty)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium text-blue-400 bg-gray-800">
                        {pack.puzzleCount} Puzzles
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium text-green-400 bg-gray-800">
                        ⭐ {pack.rating}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      {pack.isPremium ? (
                        <button className="btn btn-secondary flex items-center gap-2">
                          <Crown size={18} />
                          ${pack.price} - Unlock Pack
                        </button>
                      ) : (
                        <Link to="/play" className="btn btn-primary flex items-center gap-2">
                          Play Free
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Pack Grid */}
        <div className="pack-grid">
          {filteredPacks.filter(pack => !pack.featured).map((pack, index) => (
            <motion.div
              key={pack.id}
              className="pack-card relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              {pack.isPremium && (
                <div className="absolute top-4 right-4">
                  <Lock className="text-yellow-400" size={20} />
                </div>
              )}
              
              <div className="pack-icon">{pack.icon}</div>
              <h3 className="text-xl font-bold mb-3">{pack.name}</h3>
              <p className="text-gray-300 mb-4">{pack.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(pack.difficulty)} bg-gray-800`}>
                  {getDifficultyText(pack.difficulty)}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-400 bg-gray-800">
                  {pack.puzzleCount} Puzzles
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium text-green-400 bg-gray-800">
                  ⭐ {pack.rating}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                {pack.isPremium ? (
                  <span className="text-yellow-400 font-bold">${pack.price}</span>
                ) : (
                  <span className="text-green-400 font-bold">Free</span>
                )}
                
                {pack.isPremium ? (
                  <button className="btn btn-secondary text-sm px-4 py-2">
                    Unlock
                  </button>
                ) : (
                  <Link to="/play" className="btn btn-primary text-sm px-4 py-2">
                    Play
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to <span className="gradient-text">Unlock</span> More?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Premium packs offer exclusive content and advanced challenges
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/play" className="btn btn-primary text-lg px-8 py-4">
                Start Playing
              </Link>
              <Link to="/leaderboard" className="btn btn-outline text-lg px-8 py-4">
                View Leaderboard
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Packs;
