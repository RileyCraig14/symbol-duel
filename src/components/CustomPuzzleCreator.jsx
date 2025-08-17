import React, { useState } from 'react';
import { customPuzzles } from '../utils/supabase';

const CustomPuzzleCreator = ({ onPuzzleCreated, onClose }) => {
  const [symbols, setSymbols] = useState('');
  const [answer, setAnswer] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbols.trim() || !answer.trim()) return;

    setLoading(true);
    try {
      const puzzle = await customPuzzles.create({
        symbols: symbols.trim(),
        answer: answer.trim(),
        difficulty,
        is_public: isPublic
      });

      if (onPuzzleCreated) {
        onPuzzleCreated(puzzle);
      }
    } catch (error) {
      console.error('Error creating puzzle:', error);
      alert('Failed to create puzzle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Create Custom Puzzle</h2>
        <p className="text-gray-400">Design your own rebus puzzle for others to solve!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Puzzle Symbols
          </label>
          <input
            type="text"
            value={symbols}
            onChange={(e) => setSymbols(e.target.value)}
            placeholder="Enter emojis, text, or symbols..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg"
            required
          />
          <div className="text-sm text-gray-400 mt-1">
            Use emojis, text, or a combination (e.g., "🍎👁️" or "HEAD OVER HEELS")
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Answer
          </label>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="What does this puzzle represent?"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <select
              value={isPublic ? 'public' : 'private'}
              onChange={(e) => setIsPublic(e.target.value === 'public')}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !symbols.trim() || !answer.trim()}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Creating...' : 'Create Puzzle'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomPuzzleCreator;
