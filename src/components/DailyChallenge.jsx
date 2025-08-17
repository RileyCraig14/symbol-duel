import React, { useState, useEffect } from 'react';
import { dailyChallenges, gamification } from '../utils/supabase';
import { checkAnswer, calculateScore } from '../utils/puzzleGenerator';

const DailyChallenge = ({ onComplete, onClose }) => {
  const [challenge, setChallenge] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Load today's challenge
  useEffect(() => {
    const loadChallenge = async () => {
      try {
        const todayChallenge = await dailyChallenges.getToday();
        setChallenge(todayChallenge);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading daily challenge:', error);
        setError('Failed to load daily challenge');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!startTime || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setResult({
      isCorrect: false,
      timeTaken: 60,
      tokensEarned: 0,
      pointsEarned: 0,
      message: 'Time\'s up!'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim() || isAnswered) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const isCorrect = checkAnswer(userAnswer, challenge.custom_puzzles.answer);
    
    setIsAnswered(true);

    try {
      // Submit attempt to get rewards
      const attempt = await dailyChallenges.submitAttempt(
        challenge.id,
        isCorrect,
        timeTaken
      );

      setResult({
        isCorrect,
        timeTaken,
        tokensEarned: attempt.tokens_earned,
        pointsEarned: attempt.points_earned,
        message: isCorrect ? 'Correct!' : 'Wrong answer!'
      });

      // Call onComplete with results
      if (onComplete) {
        onComplete({
          isCorrect,
          tokensEarned: attempt.tokens_earned,
          pointsEarned: attempt.points_earned,
          timeTaken
        });
      }
    } catch (error) {
      console.error('Error submitting attempt:', error);
      setError('Failed to submit answer');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft > 30) return 'text-green-400';
    if (timeLeft > 15) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading daily challenge...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <button onClick={onClose} className="btn btn-primary">Close</button>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">No Challenge Today</h2>
        <p className="text-gray-300 mb-6">Check back tomorrow for a new daily challenge!</p>
        <button onClick={onClose} className="btn btn-primary">Close</button>
      </div>
    );
  }

  if (isAnswered) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Daily Challenge Complete!</h2>
        
        <div className={`text-2xl mb-4 ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
          {result.message}
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Time Taken</div>
              <div className="text-xl font-bold">{result.timeTaken}s</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Tokens Earned</div>
              <div className="text-xl font-bold text-yellow-400">+{result.tokensEarned}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Points Earned</div>
              <div className="text-xl font-bold text-blue-400">+{result.pointsEarned}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Answer</div>
              <div className="text-xl font-bold">{challenge.custom_puzzles.answer}</div>
            </div>
          </div>
        </div>
        
        <button onClick={onClose} className="btn btn-primary">Continue</button>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Daily Challenge</h2>
        <p className="text-gray-400">Solve today's puzzle to earn tokens and points!</p>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${getTimeColor()}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-sm text-gray-400">Time remaining</div>
      </div>

      {/* Puzzle Display */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">
          {challenge.custom_puzzles.symbols}
        </div>
        <div className="text-gray-400">What does this represent?</div>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Your Answer
          </label>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg"
            autoFocus
            disabled={isAnswered}
          />
        </div>
        
        <button
          type="submit"
          disabled={!userAnswer.trim() || isAnswered}
          className="btn btn-primary w-full text-lg py-3"
        >
          Submit Answer
        </button>
      </form>

      {/* Challenge Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <div className="text-center text-sm text-gray-400">
          <div className="mb-2">🎯 Solve correctly to earn tokens and points</div>
          <div>⚡ Faster solves earn bonus rewards</div>
          <div>🔥 Maintain your daily streak!</div>
        </div>
      </div>
    </div>
  );
};

export default DailyChallenge;
