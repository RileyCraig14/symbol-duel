import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, RotateCcw, Home } from 'lucide-react';
import PuzzleDisplay from '../components/PuzzleDisplay';
import TimerBar from '../components/TimerBar';
import InputBox from '../components/InputBox';

const Play = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('waiting'); // waiting, playing, paused, completed
  const [currentPuzzle, setCurrentPuzzle] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintText, setHintText] = useState('');
  const [gameResult, setGameResult] = useState(null);

  // Sample puzzles - in a real app, these would come from an API
  const samplePuzzles = [
    {
      id: 1,
      symbols: '🏛️🧠🐉⚡🎭🔮',
      answer: 'ancient wisdom',
      difficulty: 2,
      category: 'mystical',
      hint: 'Think about what these symbols represent in ancient cultures'
    },
    {
      id: 2,
      symbols: '🌊🔥🌪️🌍',
      answer: 'four elements',
      difficulty: 1,
      category: 'classical',
      hint: 'The fundamental forces of nature'
    },
    {
      id: 3,
      symbols: '👑💎⚔️🏰🐉',
      answer: 'fantasy adventure',
      difficulty: 3,
      category: 'fantasy',
      hint: 'A genre of storytelling with magical creatures'
    }
  ];

  const startGame = useCallback(() => {
    const randomPuzzle = samplePuzzles[Math.floor(Math.random() * samplePuzzles.length)];
    setCurrentPuzzle(randomPuzzle);
    setTimeLeft(120); // 2 minutes
    setScore(0);
    setAttempts(0);
    setGameState('playing');
    setShowHint(false);
    setHintText('');
    setGameResult(null);
  }, [samplePuzzles]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, timeLeft, endGame]);

  const endGame = (reason) => {
    setGameState('completed');
    if (reason === 'correct') {
      const timeBonus = Math.floor(timeLeft * 2);
      const difficultyBonus = currentPuzzle.difficulty * 100;
      const finalScore = 500 + timeBonus + difficultyBonus - (attempts * 50);
      setScore(finalScore);
      setGameResult({ success: true, message: 'Correct! Well done!' });
    } else if (reason === 'timeout') {
      setGameResult({ success: false, message: 'Time\'s up! Better luck next time.' });
    }
  };

  const handleSubmit = async (answer) => {
    setAttempts(prev => prev + 1);
    
    if (answer.toLowerCase() === currentPuzzle.answer.toLowerCase()) {
      endGame('correct');
    } else {
      // Wrong answer - continue playing
      if (attempts >= 2) {
        setShowHint(true);
        setHintText(currentPuzzle.hint);
      }
    }
  };

  const handleHint = () => {
    if (currentPuzzle) {
      setShowHint(true);
      setHintText(currentPuzzle.hint);
    }
  };

  const resetGame = () => {
    startGame();
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={goHome}
            className="btn btn-outline flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Back to Home
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text">Symbol Duel</h1>
            <p className="text-gray-400">Decode the symbols!</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Score</div>
            <div className="text-2xl font-bold text-success">{score}</div>
          </div>
        </div>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {gameState === 'waiting' && (
            <motion.div
              key="waiting"
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to Play?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Decode the symbols and beat the clock!
              </p>
              <motion.button
                onClick={startGame}
                className="btn btn-primary text-xl px-12 py-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </motion.div>
          )}

          {gameState === 'playing' && currentPuzzle && (
            <motion.div
              key="playing"
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TimerBar 
                timeLeft={timeLeft} 
                totalTime={120} 
                isRunning={true}
              />
              
              <PuzzleDisplay 
                symbols={currentPuzzle.symbols}
                difficulty={currentPuzzle.difficulty}
              />
              
              <div className="mb-6">
                <span className="text-sm text-gray-400">
                  Attempts: {attempts} | Category: {currentPuzzle.category}
                </span>
              </div>
              
              <InputBox 
                onSubmit={handleSubmit}
                onHint={handleHint}
                placeholder="What do these symbols mean?"
              />
              
              {showHint && (
                <motion.div
                  className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <p className="text-blue-300">
                    <strong>💡 Hint:</strong> {hintText}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {gameState === 'completed' && (
            <motion.div
              key="completed"
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="mb-8">
                {gameResult?.success ? (
                  <div className="text-6xl mb-4">🎉</div>
                ) : (
                  <div className="text-6xl mb-4">😔</div>
                )}
                
                <h2 className="text-4xl font-bold mb-4">
                  {gameResult?.success ? 'Congratulations!' : 'Game Over'}
                </h2>
                
                <p className="text-xl text-gray-300 mb-6">
                  {gameResult?.message}
                </p>
                
                {gameResult?.success && (
                  <div className="text-3xl font-bold text-success mb-6">
                    Final Score: {score}
                  </div>
                )}
                
                <div className="text-gray-400 mb-8">
                  <p>Symbols: {currentPuzzle?.symbols}</p>
                  <p>Answer: {currentPuzzle?.answer}</p>
                  <p>Attempts: {attempts}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={resetGame}
                  className="btn btn-primary flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} />
                  Play Again
                </motion.button>
                
                <Link to="/leaderboard" className="btn btn-secondary flex items-center gap-2">
                  <Trophy size={18} />
                  View Leaderboard
                </Link>
                
                <motion.button
                  onClick={goHome}
                  className="btn btn-outline flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Home size={18} />
                  Back to Home
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Play;
