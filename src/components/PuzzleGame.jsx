import React, { useState, useEffect, useRef, useCallback } from 'react';

const PuzzleGame = ({ gameId, user, onGameComplete, onBack, gameData }) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [score, setScore] = useState(0);

  const timerRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log('🧩 PuzzleGame mounted with gameData:', gameData);
    console.log('🎮 Game ID:', gameId);
    console.log('📊 Puzzles received:', gameData?.puzzles);
    console.log('📊 Puzzles count:', gameData?.puzzles?.length || 0);
  }, [gameData, gameId]);

  // Use game-specific puzzles if provided, otherwise fall back to all puzzles
  const puzzles = gameData?.puzzles || [];
  const currentPuzzle = puzzles[currentPuzzleIndex];

  console.log('🔍 Current puzzles array:', puzzles);
  console.log('🔍 Current puzzle:', currentPuzzle);
  console.log('🔍 Current puzzle index:', currentPuzzleIndex);

  // Define nextPuzzle function before using it in useEffect
  const nextPuzzle = useCallback(() => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setIsCorrect(false);
      setTimeLeft(30);
      setIsActive(true);
    } else {
      // Game completed
      onGameComplete({
        won: score > 50,
        score: score,
        totalPuzzles: puzzles.length,
        completedPuzzles: currentPuzzleIndex + 1
      });
    }
  }, [currentPuzzleIndex, puzzles.length, score, onGameComplete]);

  // Start timer immediately
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

  // Handle answer display
  useEffect(() => {
    if (showAnswer) {
      const timer = setTimeout(() => {
        setShowAnswer(false);
        nextPuzzle();
      }, 2000);

      return () => clearTimeout(timer);
    };
  }, [showAnswer, nextPuzzle]); // Include nextPuzzle dependency

  const handleTimeUp = () => {
    setIsActive(false);
    setShowAnswer(true);
    setIsCorrect(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userAnswer.trim()) return;
    
    const correct = userAnswer.toLowerCase().trim() === currentPuzzle.answer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowAnswer(true);
    setIsActive(false);
    
    if (correct) {
      const points = Math.max(1, 30 - timeLeft);
      setScore(score + points);
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // If no puzzles available, show error
  if (!puzzles.length || !currentPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-400">No puzzles available</p>
          <button
            onClick={onBack}
            className="btn btn-primary mt-4"
          >
            Go Back
          </button>
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
          <h1 className="text-4xl font-bold text-white mb-4">🧩 Puzzle Game</h1>
          <p className="text-gray-300 mb-6">Solve the rebus puzzle before time runs out!</p>
          
          {/* Game Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{score}</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{timeLeft}s</div>
                <div className="text-sm text-gray-400">Time Left</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{currentPuzzleIndex + 1}/{puzzles.length}</div>
                <div className="text-sm text-gray-400">Puzzle</div>
              </div>
            </div>
          </div>
        </div>

        {/* Puzzle Display */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-6">{currentPuzzle.symbols}</div>
            <p className="text-gray-400 mb-4">What does this represent?</p>
            
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black placeholder-gray-500 mb-4"
                disabled={!isActive}
                autoFocus
              />
              
              <button
                type="submit"
                disabled={!isActive || !userAnswer.trim()}
                className={`btn w-full ${
                  !isActive || !userAnswer.trim()
                    ? 'btn-disabled'
                    : 'btn-primary'
                }`}
              >
                Submit Answer
              </button>
            </form>
          </div>
        </div>

        {/* Answer Display */}
        {showAnswer && (
          <div className={`bg-gray-800 rounded-lg p-6 border ${
            isCorrect ? 'border-green-500' : 'border-red-500'
          } text-center mb-6`}>
            <div className="text-4xl mb-4">
              {isCorrect ? '✅' : '❌'}
            </div>
            <h3 className={`text-2xl font-bold mb-2 ${
              isCorrect ? 'text-green-400' : 'text-red-400'
            }`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </h3>
            <p className="text-gray-300 mb-2">
              Answer: <span className="font-semibold text-white">{currentPuzzle.answer}</span>
            </p>
            {currentPuzzle.hint && (
              <p className="text-gray-400 text-sm">Hint: {currentPuzzle.hint}</p>
            )}
            {isCorrect && (
              <p className="text-green-400 font-semibold mt-2">
                +{Math.max(1, 30 - timeLeft)} points!
              </p>
            )}
            <p className="text-gray-400 text-sm mt-4">Next puzzle in 2 seconds...</p>
          </div>
        )}

        {/* Progress */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">📊 Progress</h3>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentPuzzleIndex + 1) / puzzles.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-center">
            Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGame;
