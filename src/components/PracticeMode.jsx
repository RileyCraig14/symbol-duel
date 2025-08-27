import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PracticeMode = ({ user, onBack }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  const timerRef = useRef(null);
  const answerDisplayRef = useRef(null);

  // Limited puzzle set for practice (no recycling)
  const practicePuzzles = [
    { symbols: "🏹❤️", answer: "love struck" },
    { symbols: "➡️🏡", answer: "homeward bound" },
    { symbols: "🧩🧠", answer: "puzzle brain" },
    { symbols: "🎬🍿🌙", answer: "movie night" },
    { symbols: "📺🔁", answer: "rerun" },
    { symbols: "📞🏃", answer: "call it in" },
    { symbols: "🛒💀", answer: "shop till you drop" },
    { symbols: "🪱👂", answer: "earworm" },
    { symbols: "🗓️🔜", answer: "coming soon" },
    { symbols: "🦵🧱", answer: "legwork" },
    { symbols: "🪄✨", answer: "abracadabra" },
    { symbols: "🌲🌲🌲", answer: "forest" },
    { symbols: "🕯️📚", answer: "reading light" },
    { symbols: "😊🪞", answer: "man in the mirror" },
    { symbols: "✈️🌙", answer: "fly by night" }
  ];

  const currentPuzzle = practicePuzzles[currentPuzzleIndex];

  // Define nextPuzzle function before using it in useEffect
  const nextPuzzle = () => {
    if (currentPuzzleIndex < practicePuzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
      setUserAnswer('');
      setIsCorrect(false);
      startTimer();
    } else {
      setGameCompleted(true);
    }
  };

  // Define startTimer function before using it in nextPuzzle
  const startTimer = () => {
    setIsActive(true);
    setTimeLeft(30);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (showAnswer) {
      const timer = setTimeout(() => {
        setShowAnswer(false);
        nextPuzzle();
      }, 3000); // 3 seconds as requested

      return () => clearTimeout(timer);
    }
  }, [showAnswer, currentPuzzleIndex, nextPuzzle]);

  const handleTimeUp = () => {
    setIsActive(false);
    setShowAnswer(true);
    setIsCorrect(false);
    setAttempts(prev => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const correct = userAnswer.toLowerCase().trim() === currentPuzzle.answer.toLowerCase();
    setIsCorrect(correct);
    setShowAnswer(true);
    setIsActive(false);

    if (correct) {
      setScore(prev => prev + Math.max(1, timeLeft)); // Bonus for speed
    }
    setAttempts(prev => prev + 1);
  };

  const previousPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(prev => prev - 1);
      setUserAnswer('');
      setIsCorrect(false);
      startTimer();
    }
  };

  const resetGame = () => {
    setCurrentPuzzleIndex(0);
    setUserAnswer('');
    setScore(0);
    setAttempts(0);
    setShowAnswer(false);
    setIsCorrect(false);
    setGameCompleted(false);
    setTimeLeft(30);
    setIsActive(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  // Anti-cheating: Prevent right-click and text selection
  const preventCheating = (e) => {
    e.preventDefault();
    return false;
  };

  if (gameCompleted) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Practice Complete!</h2>
          
          <div className="space-y-4 mb-8">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{score}</div>
              <div className="text-gray-400">Total Score</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{practicePuzzles.length}</div>
              <div className="text-gray-400">Puzzles Solved</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{attempts}</div>
              <div className="text-gray-400">Total Attempts</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetGame}
              className="btn btn-primary w-full"
            >
              Practice Again
            </button>
            
            <button
              onClick={onBack}
              className="btn btn-outline w-full"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
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
          <h1 className="text-4xl font-bold text-white mb-2">Practice Mode</h1>
          <p className="text-gray-300">Master the puzzles before playing for real money!</p>
          
          <div className="flex justify-center items-center space-x-6 mt-4">
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-primary font-semibold">{currentPuzzleIndex + 1}</span>
              <span className="text-gray-400"> / {practicePuzzles.length}</span>
            </div>
            
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <span className="text-green-400 font-semibold">{score}</span>
              <span className="text-gray-400"> points</span>
            </div>
          </div>
        </div>

        {/* Puzzle Display */}
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-6">
          <div className="text-center">
            {/* Timer */}
            <div className="mb-6">
              <div className="text-2xl font-bold text-white mb-2">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Puzzle Symbols */}
            <div 
              className="text-8xl mb-8 select-none"
              onContextMenu={preventCheating}
              onSelect={preventCheating}
            >
              {currentPuzzle.symbols}
            </div>

            {/* Answer Input */}
            {!showAnswer && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer..."
                  className="w-full max-w-md px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg focus:outline-none focus:border-primary"
                  autoFocus
                  disabled={!isActive}
                />
                
                <div className="space-x-4">
                  <button
                    type="submit"
                    disabled={!isActive || !userAnswer.trim()}
                    className={`btn ${
                      !isActive || !userAnswer.trim()
                        ? 'btn-disabled'
                        : 'btn-primary'
                    }`}
                  >
                    Submit Answer
                  </button>
                  
                  {!isActive && (
                    <button
                      type="button"
                      onClick={startTimer}
                      className="btn btn-green"
                    >
                      Start Timer
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Answer Display */}
            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  ref={answerDisplayRef}
                  className="mt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className={`text-2xl font-bold mb-4 ${
                    isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                  </div>
                  
                  <div className="text-xl text-white mb-4">
                    Answer: <span className="font-semibold">{currentPuzzle.answer}</span>
                  </div>
                  
                  <div className="text-gray-400 text-sm">
                    Moving to next puzzle in 3 seconds...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={previousPuzzle}
            disabled={currentPuzzleIndex === 0 || showAnswer}
            className={`btn ${
              currentPuzzleIndex === 0 || showAnswer
                ? 'btn-disabled'
                : 'btn-outline'
            }`}
          >
            ← Previous
          </button>
          
          <div className="text-gray-400">
            Puzzle {currentPuzzleIndex + 1} of {practicePuzzles.length}
          </div>
          
          <button
            onClick={nextPuzzle}
            disabled={currentPuzzleIndex === practicePuzzles.length - 1 || showAnswer}
            className={`btn ${
              currentPuzzleIndex === practicePuzzles.length - 1 || showAnswer
                ? 'btn-disabled'
                : 'btn-outline'
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PracticeMode;
