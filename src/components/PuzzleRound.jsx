import React, { useState, useEffect, useCallback } from 'react';
import { checkAnswer, calculateScore } from '../utils/puzzleGenerator';

const PuzzleRound = ({ 
  puzzle, 
  onAnswer, 
  onSkip, 
  timeLimit = 30, 
  isPractice = false,
  roundNumber,
  totalRounds 
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isAnswered, setIsAnswered] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  // Reset state when puzzle changes
  useEffect(() => {
    setUserAnswer('');
    setTimeLeft(timeLimit);
    setIsAnswered(false);
    setRoundScore(0);
    setShowResult(false);
  }, [puzzle, timeLimit]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeout();
    }
  }, [timeLeft, isAnswered]);

  const handleTimeout = useCallback(() => {
    setIsAnswered(true);
    setRoundScore(0);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(0, false, timeLimit);
    }, 2000);
  }, [onAnswer, timeLimit]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isAnswered) return;

    const isCorrect = checkAnswer(userAnswer, puzzle.answer);
    const timeElapsed = timeLimit - timeLeft;
    const score = calculateScore(timeElapsed, isCorrect);
    
    setIsAnswered(true);
    setRoundScore(score);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(score, isCorrect, timeElapsed);
    }, 2000);
  }, [userAnswer, isAnswered, puzzle.answer, timeLimit, timeLeft, onAnswer]);

  const handleSkip = useCallback(() => {
    if (isPractice && !isAnswered) {
      onSkip();
    }
  }, [isPractice, isAnswered, onSkip]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 20) return 'text-green-400';
    if (timeLeft > 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Helper to render puzzle display (emoji/text or stacked text)
  const renderPuzzleDisplay = () => {
    if (Array.isArray(puzzle.symbols)) {
      // Stacked text idiom
      return (
        <div className="text-3xl mb-4 flex flex-col items-center">
          {puzzle.symbols.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      );
    }
    // Default: show emoji/text
    return <div className="text-6xl mb-4">{puzzle.symbols}</div>;
  };

  if (!puzzle) {
    return (
      <div className="card text-center">
        <div className="loading mx-auto mb-4"></div>
        <p className="text-gray-400">Loading puzzle...</p>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Round Progress */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-400 mb-2">Round {roundNumber} of {totalRounds}</div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalRounds }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < roundNumber - 1 ? 'bg-green-500' : 
                i === roundNumber - 1 ? 'bg-primary' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${getTimeColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-400">Time Remaining</div>
      </div>

      {/* Puzzle Display */}
      <div className="text-center mb-8">
        {renderPuzzleDisplay()}
        <div className="text-lg text-gray-400">
          Decode the emoji sequence into a phrase or word
        </div>
      </div>

      {/* Answer Form */}
      {!isAnswered && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="input-box text-center text-xl"
              autoFocus
              disabled={isAnswered}
            />
          </div>
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!userAnswer.trim() || isAnswered}
            >
              Submit Answer
            </button>
            {isPractice && (
              <button
                type="button"
                onClick={handleSkip}
                className="btn btn-outline"
                disabled={isAnswered}
              >
                Skip Puzzle
              </button>
            )}
          </div>
        </form>
      )}

      {/* Result Display */}
      {showResult && (
        <div className="text-center space-y-4">
          {roundScore > 0 ? (
            <div className="text-3xl font-bold text-success mb-4">
              +{roundScore} points!
            </div>
          ) : (
            <div className="text-3xl font-bold text-danger mb-4">
              Incorrect!
            </div>
          )}
          
          <div className="text-lg">
            <div className="mb-2">Your answer: <span className="font-semibold">{userAnswer || 'No answer'}</span></div>
            <div className="mb-2">Correct answer: <span className="font-semibold text-success">{puzzle.answer}</span></div>
            <div className="text-gray-400">Time taken: {timeLimit - timeLeft} seconds</div>
          </div>
          
          <div className="text-sm text-gray-400">
            {roundScore > 0 ? 'Great job!' : 'Keep trying!'}
          </div>
        </div>
      )}

      {/* Difficulty Badge */}
      {/* The difficulty badge/label is removed as puzzles no longer have a difficulty field. */}
    </div>
  );
};

export default PuzzleRound;
