import React, { useState, useEffect, useCallback } from 'react';
import { getRandomPuzzles, checkAnswer } from './utils/puzzleGenerator';
import { supabase, auth, games, gamification, tournaments, dailyChallenges, customPuzzles } from './utils/supabase';
import PuzzleRound from './components/PuzzleRound';
import Account from './pages/Account';
import DailyChallenge from './components/DailyChallenge';
import CustomPuzzleCreator from './components/CustomPuzzleCreator';
import './styles/theme.css';

function App() {
  // Game state
  const [view, setView] = useState('main');
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [roundResults, setRoundResults] = useState([]);
  const [isPractice, setIsPractice] = useState(false);
  
  // Multiplayer game state
  const [multiplayerGame, setMultiplayerGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, playing, finished
  const [currentRound, setCurrentRound] = useState(0);
  const [roundTimer, setRoundTimer] = useState(30);
  const [roundAnswers, setRoundAnswers] = useState({});
  const [roundScores, setRoundScores] = useState({});

  // User authentication state
  const [user, setUser] = useState(null);

  // Game state for available games
  const [availableGames, setAvailableGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // Gamification state
  const [userProfile, setUserProfile] = useState(null);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showCustomPuzzleCreator, setShowCustomPuzzleCreator] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [availableTournaments, setAvailableTournaments] = useState([]);
  const [customPuzzles, setCustomPuzzles] = useState([]);

  // Start multiplayer game
  const startMultiplayerGame = (gameId, entryFee) => {
    const game = {
      id: gameId,
      entryFee,
      maxPlayers: 6,
      currentPlayers: 1,
      rounds: 6,
      puzzles: getRandomPuzzles(6),
      startTime: Date.now(),
      phase: 'waiting'
    };
    
    setMultiplayerGame(game);
    setPlayers([{ id: 'player1', name: 'You', score: 0 }]);
    setGamePhase('waiting');
    setCurrentRound(0);
    setRoundTimer(30);
    setRoundAnswers({});
    setRoundScores({});
    
    // Simulate other players joining
    setTimeout(() => {
      const newPlayers = [
        { id: 'player1', name: 'You', score: 0 },
        { id: 'player2', name: 'Player 2', score: 0 },
        { id: 'player3', name: 'Player 3', score: 0 }
      ];
      setPlayers(newPlayers);
      
      // Start countdown to game start
      setTimeout(() => {
        setGamePhase('playing');
        setCurrentRound(1);
        startRoundTimer();
      }, 5000);
    }, 2000);
  };

  // Start round timer
  const startRoundTimer = () => {
    setRoundTimer(30);
    const interval = setInterval(() => {
      setRoundTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          endRound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // End current round
  const endRound = () => {
    if (!multiplayerGame) return;
    
    // Calculate scores for this round
    const newRoundScores = { ...roundScores };
    Object.keys(roundAnswers).forEach(playerId => {
      const answer = roundAnswers[playerId];
      const puzzle = multiplayerGame.puzzles[currentRound - 1];
      const isCorrect = checkAnswer(answer, puzzle.answer);
      const score = isCorrect ? Math.max(0, 100 - (30 - roundTimer) * 3) : 0;
      
      newRoundScores[playerId] = (newRoundScores[playerId] || 0) + score;
      
      // Update player scores
      setPlayers(prev => prev.map(p => 
        p.id === playerId ? { ...p, score: p.score + score } : p
      ));
    });
    
    setRoundScores(newRoundScores);
    
    // Move to next round or end game
    if (currentRound < multiplayerGame.rounds) {
      setCurrentRound(prev => prev + 1);
      setRoundTimer(30);
      setRoundAnswers({});
      setTimeout(() => startRoundTimer(), 2000);
    } else {
      endGame();
    }
  };

  // End game
  const endGame = () => {
    setGamePhase('finished');
    
    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    
    // Calculate prize pool
    const prizePool = players.length * multiplayerGame.entryFee;
    const houseFee = Math.floor(prizePool * 0.1);
    const winnerPrize = prizePool - houseFee;
    
    alert(`Game Over! 🎉\n\nWinner: ${winner.name} with ${winner.score} points!\nPrize: $${winnerPrize}\nHouse Fee: $${houseFee}`);
  };

  // Submit answer for current round
  const submitMultiplayerAnswer = (answer) => {
    if (gamePhase !== 'playing') return;
    
    const playerId = 'player1'; // Current player
    setRoundAnswers(prev => ({
      ...prev,
      [playerId]: answer
    }));
    
    // Simulate other players answering
    setTimeout(() => {
      const otherPlayers = players.filter(p => p.id !== playerId);
      const newAnswers = { ...roundAnswers, [playerId]: answer };
      
      otherPlayers.forEach(player => {
        const randomAnswer = Math.random() > 0.3 ? 
          multiplayerGame.puzzles[currentRound - 1].answer : 
          'wrong answer';
        newAnswers[player.id] = randomAnswer;
      });
      
      setRoundAnswers(newAnswers);
    }, 1000 + Math.random() * 2000);
  };

  // Multiplayer Game UI Component
  const MultiplayerGame = () => {
    if (!multiplayerGame) return null;

    if (gamePhase === 'waiting') {
      return (
        <div className="card max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold gradient-text mb-6">Waiting for Players</h2>
          <div className="mb-6">
            <div className="text-lg text-gray-300 mb-2">Game #{multiplayerGame.id.slice(-5)}</div>
            <div className="text-sm text-gray-400">Entry Fee: ${multiplayerGame.entryFee}</div>
            <div className="text-sm text-gray-400">Rounds: {multiplayerGame.rounds}</div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            {players.map(player => (
              <div key={player.id} className="card text-center">
                <div className="text-lg font-bold">{player.name}</div>
                <div className="text-sm text-gray-400">Score: {player.score}</div>
              </div>
            ))}
          </div>
          
          <div className="text-xl text-primary font-bold mb-4">
            Game starts in 5 seconds...
          </div>
          
          <button className="btn btn-outline" onClick={() => {
            setMultiplayerGame(null);
            setView('main');
          }}>
            Leave Game
          </button>
        </div>
      );
    }

    if (gamePhase === 'playing') {
      const currentPuzzle = multiplayerGame.puzzles[currentRound - 1];
      
      return (
        <div className="card max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Round {currentRound} of {multiplayerGame.rounds}</h2>
            <div className="text-2xl font-bold text-primary">{roundTimer}s</div>
          </div>
          
          {/* Player Scores */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {players.map(player => (
              <div key={player.id} className={`card text-center ${player.id === 'player1' ? 'ring-2 ring-primary' : ''}`}>
                <div className="text-lg font-bold">{player.name}</div>
                <div className="text-xl text-primary font-bold">{player.score}</div>
                {roundAnswers[player.id] && (
                  <div className="text-sm text-gray-400">Answered</div>
                )}
              </div>
            ))}
          </div>
          
          {/* Current Puzzle */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {Array.isArray(currentPuzzle.symbols) ? 
                currentPuzzle.symbols.join('\n') : 
                currentPuzzle.symbols
              }
            </div>
          </div>
          
          {/* Answer Input */}
          <div className="text-center">
            <input
              type="text"
              placeholder="Type your answer..."
              className="input-box text-xl w-full max-w-md mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  submitMultiplayerAnswer(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            <button 
              className="btn btn-primary text-xl px-8"
              onClick={() => {
                const input = document.querySelector('input[placeholder="Type your answer..."]');
                if (input && input.value.trim()) {
                  submitMultiplayerAnswer(input.value.trim());
                  input.value = '';
                }
              }}
            >
              Submit Answer
            </button>
          </div>
        </div>
      );
    }

    if (gamePhase === 'finished') {
      const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
      const winner = sortedPlayers[0];
      const prizePool = players.length * multiplayerGame.entryFee;
      const houseFee = Math.floor(prizePool * 0.1);
      const winnerPrize = prizePool - houseFee;
      
      return (
        <div className="card max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold gradient-text mb-6">Game Over! 🎉</h2>
          
          <div className="mb-6">
            <div className="text-2xl font-bold text-primary mb-2">
              Winner: {winner.name}
            </div>
            <div className="text-lg text-gray-300">
              Final Score: {winner.score} points
            </div>
            <div className="text-lg text-success font-bold">
              Prize: ${winnerPrize}
            </div>
          </div>
          
          {/* Final Leaderboard */}
          <div className="grid gap-4 mb-8">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className={`card flex justify-between items-center ${
                index === 0 ? 'ring-2 ring-yellow-400 bg-yellow-900/20' : ''
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`text-2xl ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}`}>
                    {index + 1}
                  </div>
                  <div className="text-lg font-bold">{player.name}</div>
                </div>
                <div className="text-xl font-bold text-primary">{player.score}</div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-400 mb-6">
            Prize Pool: ${prizePool} | House Fee: ${houseFee}
          </div>
          
          <button 
            className="btn btn-primary text-xl px-8"
            onClick={() => {
              setMultiplayerGame(null);
              setView('main');
            }}
          >
            Play Again
          </button>
        </div>
      );
    }

    return null;
  };

  // Navigation handlers
  const goMain = () => setView('main');
  const goHowToPlay = () => setView('howtoplay');

  // Start a new match from QuickJoin
  const handleStartMatch = (match) => {
    setCurrentMatch(match);
    setCurrentRoundIdx(0);
    setRoundResults([]);
    setIsPractice(false);
    setView('match');
  };

  // Practice mode: just start a practice match with 6 random puzzles
  const handleStartPractice = () => {
    const puzzles = getRandomPuzzles(6);
    const match = {
      id: 'practice_' + Date.now(),
      puzzles,
      currentRound: 1,
      totalRounds: puzzles.length,
      startTime: new Date(),
      isActive: true
    };
    setCurrentMatch(match);
    setCurrentRoundIdx(0);
    setRoundResults([]);
    setIsPractice(true);
    setView('match');
  };

  // Handle answer for a round
  const handleRoundAnswer = (score, isCorrect, timeElapsed) => {
    setRoundResults((prev) => [
      ...prev,
      {
        round: currentRoundIdx + 1,
        score,
        isCorrect,
        timeElapsed,
        puzzle: currentMatch.puzzles[currentRoundIdx]
      }
    ]);
    setTimeout(() => {
      if (currentRoundIdx + 1 < currentMatch.puzzles.length) {
        setCurrentRoundIdx(currentRoundIdx + 1);
      } else {
        setView('summary');
      }
    }, 1000);
  };

  // Practice mode skip
  const handleSkip = () => {
    handleRoundAnswer(0, false, 30);
  };

  // Reset to main
  const handleBackToMenu = () => {
    setCurrentMatch(null);
    setCurrentRoundIdx(0);
    setRoundResults([]);
    setIsPractice(false);
    setView('main');
  };

  // Match summary
  const renderSummary = () => {
    const totalScore = roundResults.reduce((sum, r) => sum + r.score, 0);
    const correctAnswers = roundResults.filter(r => r.isCorrect).length;
    const totalRounds = roundResults.length;
    
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <h2 className="text-3xl font-bold gradient-text mb-6">
          {isPractice ? 'Practice Complete!' : 'Game Complete!'}
        </h2>
        
        <div className="text-2xl font-bold text-primary mb-6">
          Total Score: {totalScore}
        </div>
        
        <div className="text-lg text-gray-300 mb-6">
          You solved {correctAnswers} out of {totalRounds} puzzles
        </div>
        
        <div className="space-y-3 mb-8">
          {roundResults.map((result, index) => (
            <div key={index} className="flex justify-between items-center card">
              <span>Round {result.round}: {result.puzzle.symbols}</span>
              <span className={result.isCorrect ? 'text-success' : 'text-danger'}>
                {result.isCorrect ? `+${result.score}` : '0'}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex gap-4 justify-center">
          {isPractice && (
            <button className="btn btn-primary text-xl px-8" onClick={handleStartPractice}>
              Practice Again
            </button>
          )}
          <button className="btn btn-outline text-xl px-8" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  };

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
              await loadAvailableGames();
              await loadUserProfile();
              await loadTournaments();
              await loadCustomPuzzles();
            }
          }
        );
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Load available games
  const loadAvailableGames = useCallback(async () => {
    if (!user) return;
    
    setLoadingGames(true);
    try {
      const gamesData = await games.getAvailable();
      setAvailableGames(gamesData);
    } catch (error) {
      console.error('Error loading games:', error);
    } finally {
      setLoadingGames(false);
    }
  }, [user]);

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const profile = await gamification.getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, [user]);

  // Load tournaments
  const loadTournaments = useCallback(async () => {
    try {
      const tournamentsData = await tournaments.getAll();
      setAvailableTournaments(tournamentsData);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  }, []);

  // Load custom puzzles
  const loadCustomPuzzles = useCallback(async () => {
    try {
      const puzzlesData = await customPuzzles.getPublic();
      setCustomPuzzles(puzzlesData);
    } catch (error) {
      console.error('Error loading custom puzzles:', error);
    }
  }, []);

  // Join an existing game
  const handleJoinGame = async (gameId) => {
    if (!user) {
      alert('Please sign in to join a game');
      return;
    }
    
    try {
      await games.join(gameId);
      await loadAvailableGames(); // Refresh the list
      
      // Start the multiplayer game
      const game = availableGames.find(g => g.id === gameId);
      if (game) {
        startMultiplayerGame(gameId, game.entry_fee);
      }
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game: ' + error.message);
    }
  };

  // Create a new game
  const handleCreateGame = async (gameConfig) => {
    if (!user) {
      alert('Please sign in to create a game');
      return;
    }
    
    try {
      const newGame = await games.create(gameConfig.entryFee, gameConfig.rounds);
      
      // Start the multiplayer game
      startMultiplayerGame(newGame.id, newGame.entry_fee);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Failed to create game: ' + error.message);
    }
  };

  // Main page layout
  if (view === 'main') {
    return (
      <div className="max-w-3xl mx-auto mt-12">
        <div className="card text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-4">Symbol Duel</h1>
          <p className="text-lg text-gray-300 mb-6">Decode emoji puzzles. Compete. Practice. Win.</p>
          {!user ? (
            <div className="flex flex-col gap-4 items-center">
              <button className="btn btn-primary text-2xl w-full py-6" style={{fontSize:'2.2rem'}} onClick={() => setView('login')}>Sign In / Sign Up</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setView('practice')}>Practice</button>
              <button className="btn btn-outline text-xl w-full" onClick={goHowToPlay}>How to Play</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-center">
              <div className="text-center mb-4">
                <div className="text-lg text-gray-300">Welcome, {user.email}!</div>
                <div className="text-sm text-gray-400">Balance: $100.00</div>
                {userProfile && (
                  <div className="text-sm text-gray-400 mt-2">
                    🪙 {userProfile.tokens} tokens | ⭐ {userProfile.points} points | 🔥 {userProfile.streak_days} day streak
                  </div>
                )}
              </div>
              <button className="btn btn-primary text-2xl w-full py-6" style={{fontSize:'2.2rem'}} onClick={() => setView('joingame')}>Join Game</button>
              <button className="btn btn-secondary text-xl w-full" onClick={() => setView('creategame')}>Create Game</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setShowDailyChallenge(true)}>Daily Challenge</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setView('practice')}>Practice</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setShowTournaments(true)}>Tournaments</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setShowCustomPuzzleCreator(true)}>Create Puzzle</button>
              <button className="btn btn-outline text-xl w-full" onClick={goHowToPlay}>How to Play</button>
              <button className="btn btn-outline text-xl w-full" onClick={() => setView('account')}>Account</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'joingame') {
    if (!user) {
      return (
        <div className="card max-w-2xl mx-auto text-center mt-12">
          <h2 className="text-4xl font-bold gradient-text mb-6">Sign In Required</h2>
          <p className="text-lg text-gray-300 mb-8">Please sign in to join multiplayer games.</p>
          <button className="btn btn-primary text-xl px-8" onClick={() => setView('login')}>Sign In</button>
          <button className="btn btn-outline w-full mt-4" onClick={() => setView('main')}>Back</button>
        </div>
      );
    }

    return (
      <div className="card max-w-2xl mx-auto text-center mt-12">
        <h2 className="text-4xl font-bold gradient-text mb-6">Join Game</h2>
        <p className="text-lg text-gray-300 mb-8">Select an available game to join.</p>
        
        {loadingGames ? (
          <div className="text-center mb-8">
            <div className="loading mx-auto mb-4"></div>
            <p>Loading available games...</p>
          </div>
        ) : availableGames.length === 0 ? (
          <div className="text-center mb-8">
            <p className="text-gray-400 mb-4">No games available right now.</p>
            <button className="btn btn-primary text-xl px-8" onClick={() => setView('creategame')}>Create a Game</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 mb-8">
            {availableGames.map(game => (
              <button
                key={game.id}
                className={`btn btn-primary text-2xl w-full py-6 ${game.current_players >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => handleJoinGame(game.id)}
                disabled={game.current_players >= 6}
              >
                Game #{game.id.slice(-5)} (Entry Fee: ${game.entry_fee})
                <br />
                Players: {game.current_players}/6
              </button>
            ))}
          </div>
        )}
        
        <button className="btn btn-outline w-full" onClick={() => setView('main')}>Back</button>
      </div>
    );
  }

  if (view === 'creategame') {
    if (!user) {
      return (
        <div className="card max-w-2xl mx-auto text-center mt-12">
          <h2 className="text-4xl font-bold gradient-text mb-6">Sign In Required</h2>
          <p className="text-lg text-gray-300 mb-8">Please sign in to create multiplayer games.</p>
          <button className="btn btn-primary text-xl px-8" onClick={() => setView('login')}>Sign In</button>
          <button className="btn btn-outline w-full mt-4" onClick={() => setView('main')}>Back</button>
        </div>
      );
    }

    return (
      <div className="card max-w-2xl mx-auto text-center mt-12">
        <h2 className="text-4xl font-bold gradient-text mb-6">Create Game</h2>
        <p className="text-lg text-gray-300 mb-8">Set up a new game for others to join.</p>
        
        <div className="text-left mb-6">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Entry Fee ($)</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              defaultValue="5"
              className="input-box w-full text-center text-xl"
              id="entryFee"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Rounds</label>
            <select 
              className="input-box w-full text-center text-xl"
              id="rounds"
              defaultValue="6"
            >
              <option value="3">3 Rounds</option>
              <option value="6">6 Rounds</option>
              <option value="10">10 Rounds</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-400 mb-4">
            Max players: 6 (fixed)
          </div>
        </div>
        
        <button 
          className="btn btn-primary text-xl px-8 py-4 w-full"
          onClick={() => {
            const entryFee = parseInt(document.getElementById('entryFee').value);
            const rounds = parseInt(document.getElementById('rounds').value);
            handleCreateGame({ entryFee, rounds });
          }}
        >
          Create Game
        </button>
        
        <button className="btn btn-outline w-full mt-4" onClick={() => setView('main')}>Back</button>
      </div>
    );
  }

  if (view === 'practice') {
    return (
      <div className="card max-w-2xl mx-auto text-center mt-12">
        <h2 className="text-4xl font-bold gradient-text mb-6">Practice Mode</h2>
        <p className="text-lg text-gray-300 mb-8">Test your skills with 6 random emoji/text rebus puzzles!</p>
        <button className="btn btn-primary text-xl px-8 py-4" onClick={handleStartPractice}>Start Practice</button>
        <button className="btn btn-outline w-full mt-4" onClick={() => setView('main')}>Back</button>
      </div>
    );
  }

  if (view === 'howtoplay') {
    return (
      <div className="card max-w-2xl mx-auto text-left">
        <h2 className="text-2xl font-bold mb-4 gradient-text">How to Play</h2>
        <ul className="mb-4 text-lg">
          <li>🧩 Each puzzle is a sequence of emojis representing a phrase, idiom, or compound word.</li>
          <li>⌨️ Type your answer in the box. No hints!</li>
          <li>⏱️ Score is based on speed and accuracy.</li>
          <li>🏆 Quick Join: jump into a match instantly.</li>
          <li>🎯 Practice: play solo, skip puzzles, no leaderboard.</li>
          <li>👥 Quick Play: compete with others for prizes.</li>
        </ul>
        <div className="mb-2 font-semibold">Examples:</div>
        <ul className="mb-4 text-sm text-gray-400">
          <li>🍎 + 🥧 = "apple pie"</li>
          <li>🔥 + 🐕 = "hot dog"</li>
          <li>⭐ + 🔫 = "shooting star"</li>
        </ul>
        <button className="btn btn-primary w-full" onClick={goMain}>Got it!</button>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="card max-w-2xl mx-auto text-center mt-12">
        <h2 className="text-4xl font-bold gradient-text mb-6">Sign In / Sign Up</h2>
        <p className="text-lg text-gray-300 mb-8">Create an account or sign in to play multiplayer games!</p>
        
        <div className="text-left mb-6">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Email</label>
            <input 
              type="email" 
              className="input-box w-full text-center text-xl"
              id="loginEmail"
              placeholder="your@email.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Password</label>
            <input 
              type="password" 
              className="input-box w-full text-center text-xl"
              id="loginPassword"
              placeholder="••••••••"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-300">Username (for signup)</label>
            <input 
              type="text" 
              className="input-box w-full text-center text-xl"
              id="loginUsername"
              placeholder="Choose a username"
            />
          </div>
        </div>
        
        <div className="flex gap-4 justify-center mb-6">
          <button 
            className="btn btn-primary text-xl px-8 py-4"
            onClick={async () => {
              const email = document.getElementById('loginEmail').value;
              const password = document.getElementById('loginPassword').value;
              const username = document.getElementById('loginUsername').value;
              
              if (!email || !password) {
                alert('Please enter email and password');
                return;
              }
              
              try {
                if (username) {
                  // Sign up
                  await auth.signUp(email, password, username);
                  alert('Account created! Check your email to verify.');
                } else {
                  // Sign in
                  await auth.signIn(email, password);
                  setView('main');
                }
              } catch (error) {
                alert('Error: ' + error.message);
              }
            }}
          >
            {document.getElementById('loginUsername')?.value ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        
        <button className="btn btn-outline w-full" onClick={() => setView('main')}>Back</button>
      </div>
    );
  }

  if (view === 'account') {
    return <Account goBack={() => setView('main')} />;
  }

  if (view === 'match' && currentMatch) {
    const puzzle = currentMatch.puzzles[currentRoundIdx];
    if (!puzzle) {
      return renderSummary();
    }
    return (
      <PuzzleRound
        puzzle={puzzle}
        onAnswer={handleRoundAnswer}
        onSkip={isPractice ? handleSkip : undefined}
        roundNumber={currentRoundIdx + 1}
        totalRounds={currentMatch.puzzles.length}
        isPractice={isPractice}
      />
    );
  }

  if (view === 'summary') {
    return renderSummary();
  }

  // Show multiplayer game if active
  if (multiplayerGame) {
    return <MultiplayerGame />;
  }

  // Show daily challenge modal
  if (showDailyChallenge) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <DailyChallenge
          onComplete={(results) => {
            console.log('Daily challenge completed:', results);
            setShowDailyChallenge(false);
            // Refresh user profile to show new tokens/points
            loadUserProfile();
          }}
          onClose={() => setShowDailyChallenge(false)}
        />
      </div>
    );
  }

  // Show custom puzzle creator modal
  if (showCustomPuzzleCreator) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <CustomPuzzleCreator
          onPuzzleCreated={(puzzle) => {
            console.log('Puzzle created:', puzzle);
            setShowCustomPuzzleCreator(false);
            // Refresh custom puzzles list
            loadCustomPuzzles();
          }}
          onClose={() => setShowCustomPuzzleCreator(false)}
        />
      </div>
    );
  }

  // Show tournaments modal
  if (showTournaments) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="card max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold gradient-text mb-2">Tournaments</h2>
            <p className="text-gray-400">Join tournaments to compete and win tokens!</p>
            <button 
              onClick={() => setShowTournaments(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {availableTournaments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tournaments available right now.</p>
              <button className="btn btn-primary">Create Tournament</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {availableTournaments.map(tournament => (
                <div key={tournament.id} className="card p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">{tournament.name}</h3>
                      <p className="text-gray-400">{tournament.description}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        🪙 Entry: {tournament.entry_fee_tokens} tokens | 
                        👥 Players: {tournament.current_players}/{tournament.max_players} |
                        🏆 Prize Pool: {tournament.prize_pool_tokens} tokens
                      </div>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        // Join tournament logic here
                        alert('Tournament joining coming soon!');
                      }}
                    >
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default App;
