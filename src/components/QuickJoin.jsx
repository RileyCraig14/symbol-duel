import React from 'react';
import { getRandomPuzzles } from '../utils/puzzleGenerator';

const QuickJoin = ({ onStartMatch }) => {
  const handleQuickJoin = () => {
    const puzzles = getRandomPuzzles(6);
    const match = {
      id: Date.now().toString(),
      type: 'quick',
      puzzles,
      currentRound: 1,
      totalRounds: puzzles.length,
      startTime: new Date(),
      isActive: true
    };
    onStartMatch(match);
  };

  return (
    <div className="card max-w-2xl mx-auto text-center">
      <h2 className="text-4xl font-bold gradient-text mb-6">Quick Join</h2>
      <p className="text-lg text-gray-300 mb-8">Join a game and start playing instantly!</p>
      <div className="flex flex-col gap-6 mb-8">
        <button
          className="btn text-2xl w-full py-6 bg-primary text-primary"
          onClick={handleQuickJoin}
        >
          Join Game
        </button>
      </div>
      <button className="btn btn-outline w-full" onClick={() => window.history.back()}>Back</button>
    </div>
  );
};

export default QuickJoin;
