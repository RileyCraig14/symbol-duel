import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Clock, Trophy, Zap, Target } from 'lucide-react';

const CreateGame = ({ onCreateGame, userProfile }) => {
  const [gameName, setGameName] = useState('');
  const [rounds, setRounds] = useState(8);
  const [entryFee, setEntryFee] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(16);
  const [startDelay, setStartDelay] = useState(60); // seconds
  const [isCreating, setIsCreating] = useState(false);

  const roundOptions = [5, 6, 7, 8, 9, 10, 12, 15];
  const entryFeeOptions = [1, 2, 5, 10, 25, 50];
  const playerOptions = [8, 16, 24, 32, 50];
  const startDelayOptions = [30, 60, 120, 300]; // 30s, 1min, 2min, 5min

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      alert('Please enter a game name!');
      return;
    }

    setIsCreating(true);
    try {
      await onCreateGame({
        name: gameName.trim(),
        rounds,
        entryFee,
        maxPlayers,
        startDelay
      });
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="create-game-container">
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold gradient-text mb-4">Create New Tournament</h2>
        <p className="text-gray-300 text-lg">Set up your own competitive puzzle challenge!</p>
      </motion.div>

      <div className="grid grid-cols-1 md-grid-cols-2 gap-6 mb-8">
        {/* Game Name */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Tournament Name
          </h3>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Enter tournament name..."
            className="input-box w-full"
            maxLength={50}
          />
          <p className="text-sm text-gray-400 mt-2">
            {gameName.length}/50 characters
          </p>
        </div>

        {/* Rounds Selection */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Number of Rounds
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {roundOptions.map((round) => (
              <motion.button
                key={round}
                onClick={() => setRounds(round)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  rounds === round
                    ? 'border-primary bg-primary-10 text-primary'
                    : 'border-gray-600 hover-border-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {round} Rounds
              </motion.button>
            ))}
          </div>
        </div>

        {/* Entry Fee Selection */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Entry Fee
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {entryFeeOptions.map((fee) => (
              <motion.button
                key={fee}
                onClick={() => setEntryFee(fee)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  entryFee === fee
                    ? 'border-primary bg-primary-10 text-primary'
                    : 'border-gray-600 hover-border-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                ${fee}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Max Players */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Maximum Players
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {playerOptions.map((players) => (
              <motion.button
                key={players}
                onClick={() => setMaxPlayers(players)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  maxPlayers === players
                    ? 'border-primary bg-primary-10 text-primary'
                    : 'border-gray-600 hover-border-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {players} Players
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Delay */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Start Delay
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {startDelayOptions.map((delay) => (
              <motion.button
                key={delay}
                onClick={() => setStartDelay(delay)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  startDelay === delay
                    ? 'border-primary bg-primary-10 text-primary'
                    : 'border-gray-600 hover-border-gray-500'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {delay < 60 ? `${delay}s` : `${Math.floor(delay / 60)}m`}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Tournament Preview */}
      <div className="card mb-8">
        <div className="text-center">
          <h3 className="text-xl font-bold mb-4">Tournament Preview</h3>
          <div className="grid grid-cols-2 md-grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{rounds}</div>
              <div className="text-sm text-gray-400">Rounds</div>
              <div className="font-semibold">Puzzles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">${entryFee}</div>
              <div className="text-sm text-gray-400">Entry Fee</div>
              <div className="font-semibold">Per Player</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">~${entryFee * maxPlayers}</div>
              <div className="text-sm text-gray-400">Prize Pool</div>
              <div className="font-semibold">Estimated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Button */}
      <div className="text-center">
        <motion.button
          onClick={handleCreateGame}
          disabled={isCreating || !gameName.trim()}
          className="btn btn-primary text-xl px-12 py-4 flex items-center gap-3 mx-auto disabled-opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCreating ? (
            <>
              <div className="loading"></div>
              Creating Tournament...
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              Create Tournament
            </>
          )}
        </motion.button>
        
        <p className="text-gray-400 mt-4 text-sm">
          You'll automatically join the tournament • First place wins 70% of prize pool
        </p>
      </div>
    </div>
  );
};

export default CreateGame;
