import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Trophy, Users, Clock } from 'lucide-react';
import PuzzleDisplay from './PuzzleDisplay';
import TimerBar from './TimerBar';
import InputBox from './InputBox';

const TournamentMatch = ({ match, onMatchComplete, onExitMatch }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [roundState, setRoundState] = useState('waiting'); // waiting, playing, completed
  const [timeLeft, setTimeLeft] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState('');
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [matchComplete, setMatchComplete] = useState(false);

  const currentPuzzle = match.puzzles[currentRound];
  const totalRounds = match.puzzles.length;
  const isLastRound = currentRound === totalRounds - 1;

  // Start round timer
  useEffect(() => {
    if (roundState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endRound('timeout');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [roundState, timeLeft]);

  // Start new round
  const startRound = useCallback(() => {
    setRoundState('playing');
    setTimeLeft(120); // 2 minutes per round
    setPlayerAnswer('');
    setRoundScore(0);
    setShowRoundResult(false);
  }, []);

  // End current round
  const endRound = useCallback((reason) => {
    setRoundState('completed');
    
    let score = 0;
    let result = { round: currentRound + 1, status: 'failed', score: 0 };

    if (reason === 'correct') {
      // Calculate score based on time left and difficulty
      const timeBonus = Math.floor(timeLeft * 2);
      const difficultyBonus = match.difficulty === 'easy' ? 100 : match.difficulty === 'medium' ? 200 : 400;
      score = 500 + timeBonus + difficultyBonus;
      result = { round: currentRound + 1, status: 'correct', score, timeLeft };
    } else if (reason === 'skip') {
      result = { round: currentRound + 1, status: 'skipped', score: 0 };
    } else if (reason === 'timeout') {
      result = { round: currentRound + 1, status: 'timeout', score: 0 };
    }

    setRoundScore(score);
    setTotalScore(prev => prev + score);
    setRoundResults(prev => [...prev, result]);
    setShowRoundResult(true);
  }, [currentRound, timeLeft, match.difficulty]);

  // Handle answer submission
  const handleSubmitAnswer = useCallback(async (answer) => {
    if (answer.toLowerCase() === currentPuzzle.answer.toLowerCase()) {
      endRound('correct');
    } else {
      // Wrong answer - continue playing
      setPlayerAnswer(answer);
    }
  }, [currentPuzzle.answer, endRound]);

  // Skip current round
  const handleSkip = useCallback(() => {
    endRound('skip');
  }, [endRound]);

  // Move to next round
  const nextRound = useCallback(() => {
    if (isLastRound) {
      completeMatch();
    } else {
      setCurrentRound(prev => prev + 1);
      setRoundState('waiting');
      setTimeout(startRound, 2000); // 2 second delay between rounds
    }
  }, [isLastRound, startRound]);

  // Complete the entire match
  const completeMatch = useCallback(() => {
    setMatchComplete(true);
    onMatchComplete({
      totalScore,
      rounds: roundResults,
      matchId: match.id
    });
  }, [totalScore, roundResults, match.id, onMatchComplete]);

  // Auto-start first round
  useEffect(() => {
    if (currentRound === 0 && roundState === 'waiting') {
      setTimeout(startRound, 1000);
    }
  }, [currentRound, roundState, startRound]);

  if (matchComplete) {
    return (
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold gradient-text mb-6">Match Complete!</h1>
            <div className="card mb-8">
              <div className="text-6xl mb-4">🏆</div>
              <div className="text-3xl font-bold text-primary mb-2">Final Score: {totalScore}</div>
              <div className="text-gray-400">You completed {totalRounds} rounds</div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Round Results</h3>
                <div className="space-y-2">
                  {roundResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center p-2 rounded bg-gray-800">
                      <span>Round {result.round}</span>
                      <span className={`font-bold ${
                        result.status === 'correct' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {result.status === 'correct' ? `+${result.score}` : result.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-xl font-bold mb-4">Performance Stats</h3>
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span>Correct Answers:</span>
                    <span className="font-bold text-green-400">
                      {roundResults.filter(r => r.status === 'correct').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Skipped Rounds:</span>
                    <span className="font-bold text-yellow-400">
                      {roundResults.filter(r => r.status === 'skipped').length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeouts:</span>
                    <span className="font-bold text-red-400">
                      {roundResults.filter(r => r.status === 'timeout').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                Play Again
              </button>
              <button onClick={onExitMatch} className="btn btn-outline">
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            onClick={onExitMatch}
            className="btn btn-outline flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={18} />
            Exit Match
          </motion.button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold gradient-text">Tournament Match</h1>
            <p className="text-gray-400">
              Round {currentRound + 1} of {totalRounds} • {match.difficulty} difficulty
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-400">Total Score</div>
            <div className="text-2xl font-bold text-success">{totalScore}</div>
          </div>
        </div>

        {/* Round Progress */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Round Progress</h3>
            <span className="text-sm text-gray-400">
              {currentRound + 1} / {totalRounds}
            </span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: totalRounds }, (_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all ${
                  i < currentRound
                    ? 'bg-green-500'
                    : i === currentRound
                    ? 'bg-primary'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Game Area */}
        <AnimatePresence mode="wait">
          {roundState === 'waiting' && (
            <motion.div
              key="waiting"
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-2xl font-bold mb-4">Get Ready!</h2>
              <p className="text-gray-400 mb-8">Round {currentRound + 1} starting soon...</p>
              <div className="loading mx-auto"></div>
            </motion.div>
          )}

          {roundState === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Timer */}
              <TimerBar timeLeft={timeLeft} totalTime={120} isRunning={true} />
              
              {/* Puzzle Display */}
              <div className="mb-8">
                <PuzzleDisplay 
                  symbols={currentPuzzle.symbols}
                  difficulty={match.difficulty === 'easy' ? 1 : match.difficulty === 'medium' ? 2 : 3}
                />
              </div>
              
              {/* Input and Controls */}
              <div className="flex flex-col items-center gap-4">
                <InputBox
                  onSubmit={handleSubmitAnswer}
                  placeholder="What do these symbols represent?"
                  isDisabled={false}
                />
                
                <motion.button
                  onClick={handleSkip}
                  className="btn btn-outline flex items-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SkipForward size={18} />
                  Skip Round (0 points)
                </motion.button>
              </div>
            </motion.div>
          )}

          {roundState === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-12"
            >
              <div className={`text-6xl mb-6 ${
                roundScore > 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {roundScore > 0 ? '✅' : '❌'}
              </div>
              
              <h2 className="text-2xl font-bold mb-4">
                {roundScore > 0 ? 'Correct!' : 'Round Complete'}
              </h2>
              
              {roundScore > 0 ? (
                <div className="text-3xl font-bold text-success mb-4">
                  +{roundScore} points!
                </div>
              ) : (
                <div className="text-xl text-gray-400 mb-4">
                  {roundResults[roundResults.length - 1]?.status === 'skipped' 
                    ? 'You skipped this round' 
                    : 'Time ran out'}
                </div>
              )}
              
              <div className="text-gray-400 mb-8">
                Answer: <span className="font-semibold text-white">{currentPuzzle.answer}</span>
              </div>
              
              <motion.button
                onClick={nextRound}
                className="btn btn-primary text-lg px-8 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLastRound ? 'Finish Match' : 'Next Round'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TournamentMatch;
