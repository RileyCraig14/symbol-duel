// Matchmaking system for Symbol Duel tournaments
// Handles creating, joining, and managing multiplayer matches

// In-memory match storage (replace with Supabase in production)
let activeMatches = new Map();
let matchQueue = new Map();

// Match statuses
export const MATCH_STATUS = {
  WAITING: 'waiting',      // Waiting for players
  STARTING: 'starting',    // Countdown to start
  PLAYING: 'playing',      // Active gameplay
  FINISHED: 'finished'     // Match completed
};

// Player statuses
export const PLAYER_STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  FINISHED: 'finished',
  DISCONNECTED: 'disconnected'
};

// Match configuration
export const MATCH_CONFIG = {
  MIN_PLAYERS: 5,
  MAX_PLAYERS: 10,
  COUNTDOWN_TIME: 10, // seconds
  ROUND_TIME: 120,    // seconds per round
  MAX_WAIT_TIME: 60   // seconds to wait for players
};

// Create a new match
export const createMatch = async (config) => {
  const matchId = generateMatchId();
  
  const match = {
    id: matchId,
    difficulty: config.difficulty,
    rounds: config.rounds,
    entryFee: config.entryFee,
    status: MATCH_STATUS.WAITING,
    createdAt: Date.now(),
    players: [],
    puzzles: [],
    settings: {
      roundTime: MATCH_CONFIG.ROUND_TIME,
      maxWaitTime: MATCH_CONFIG.MAX_WAIT_TIME,
      prizeDistribution: {
        first: 0.70,   // 70% to 1st place
        second: 0.20,  // 20% to 2nd place
        third: 0.10    // 10% to 3rd place
      }
    },
    metadata: {
      category: config.category || 'general',
      estimatedPrize: config.estimatedPrize || 0,
      createdBy: config.userId || 'anonymous'
    }
  };

  activeMatches.set(matchId, match);
  
  // Start match lifecycle
  startMatchLifecycle(matchId);
  
  return match;
};

// Join an existing match
export const joinMatch = async (matchId, player) => {
  const match = activeMatches.get(matchId);
  
  if (!match) {
    throw new Error('Match not found');
  }
  
  if (match.status !== MATCH_STATUS.WAITING) {
    throw new Error('Match is no longer accepting players');
  }
  
  if (match.players.length >= MATCH_CONFIG.MAX_PLAYERS) {
    throw new Error('Match is full');
  }
  
  // Check if player already in match
  const existingPlayer = match.players.find(p => p.id === player.id);
  if (existingPlayer) {
    throw new Error('Player already in match');
  }
  
  // Add player to match
  const newPlayer = {
    ...player,
    joinedAt: Date.now(),
    status: PLAYER_STATUS.READY,
    score: 0,
    roundResults: [],
    currentRound: 0
  };
  
  match.players.push(newPlayer);
  
  // Check if we should start the match
  if (match.players.length >= MATCH_CONFIG.MIN_PLAYERS) {
    await startMatch(matchId);
  }
  
  return match;
};

// Quick join - find or create a match
export const quickJoin = async (config) => {
  // First, try to find an existing match
  const existingMatch = findOpenMatch(config);
  
  if (existingMatch) {
    return await joinMatch(existingMatch.id, config.player);
  }
  
  // Create a new match if none found
  const newMatch = await createMatch(config);
  await joinMatch(newMatch.id, config.player);
  
  return newMatch;
};

// Find an open match that matches criteria
export const findOpenMatch = (config) => {
  for (const [matchId, match] of activeMatches) {
    if (match.status === MATCH_STATUS.WAITING &&
        match.difficulty === config.difficulty &&
        match.entryFee === config.entryFee &&
        match.players.length < MATCH_CONFIG.MAX_PLAYERS) {
      return match;
    }
  }
  return null;
};

// Start a match
export const startMatch = async (matchId) => {
  const match = activeMatches.get(matchId);
  
  if (!match || match.status !== MATCH_STATUS.WAITING) {
    return;
  }
  
  // Generate puzzles for the match
  const { generateTournamentPuzzles } = await import('./aiPuzzleGenerator.js');
  match.puzzles = await generateTournamentPuzzles(
    match.difficulty, 
    match.rounds, 
    match.metadata.category
  );
  
  // Update match status
  match.status = MATCH_STATUS.STARTING;
  match.startedAt = Date.now();
  
  // Start countdown
  startMatchCountdown(matchId);
};

// Start match countdown
const startMatchCountdown = (matchId) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  let countdown = MATCH_CONFIG.COUNTDOWN_TIME;
  
  const countdownInterval = setInterval(() => {
    if (countdown > 0) {
      countdown--;
      // Emit countdown event (replace with your event system)
      emitMatchEvent(matchId, 'countdown', { countdown });
    } else {
      clearInterval(countdownInterval);
      beginMatch(matchId);
    }
  }, 1000);
};

// Begin actual gameplay
const beginMatch = (matchId) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  match.status = MATCH_STATUS.PLAYING;
  match.gameStartedAt = Date.now();
  
  // Update all players to playing status
  match.players.forEach(player => {
    player.status = PLAYER_STATUS.PLAYING;
  });
  
  // Emit match start event
  emitMatchEvent(matchId, 'start', { 
    puzzles: match.puzzles,
    roundTime: match.settings.roundTime 
  });
};

// Submit round answer
export const submitRoundAnswer = async (matchId, playerId, roundNumber, answer, timeSpent) => {
  const match = activeMatches.get(matchId);
  if (!match || match.status !== MATCH_STATUS.PLAYING) {
    throw new Error('Match is not active');
  }
  
  const player = match.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found in match');
  }
  
  const puzzle = match.puzzles[roundNumber - 1];
  if (!puzzle) {
    throw new Error('Invalid round number');
  }
  
  // Calculate score
  const isCorrect = answer.toLowerCase() === puzzle.answer.toLowerCase();
  let score = 0;
  
  if (isCorrect) {
    const timeBonus = Math.floor((match.settings.roundTime - timeSpent) * 2);
    const difficultyBonus = getDifficultyBonus(match.difficulty);
    score = 500 + timeBonus + difficultyBonus;
  }
  
  // Record round result
  const roundResult = {
    round: roundNumber,
    answer,
    correct: isCorrect,
    score,
    timeSpent,
    submittedAt: Date.now()
  };
  
  player.roundResults.push(roundResult);
  player.score += score;
  player.currentRound = roundNumber;
  
  // Check if player finished all rounds
  if (roundNumber === match.rounds) {
    player.status = PLAYER_STATUS.FINISHED;
    player.finishedAt = Date.now();
    
    // Check if all players finished
    const allFinished = match.players.every(p => p.status === PLAYER_STATUS.FINISHED);
    if (allFinished) {
      await finishMatch(matchId);
    }
  }
  
  return { score, correct: isCorrect, roundResult };
};

// Skip round
export const skipRound = async (matchId, playerId, roundNumber) => {
  return await submitRoundAnswer(matchId, playerId, roundNumber, '', 0);
};

// Finish match and calculate results
export const finishMatch = async (matchId) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  match.status = MATCH_STATUS.FINISHED;
  match.finishedAt = Date.now();
  
  // Sort players by score
  const sortedPlayers = [...match.players].sort((a, b) => b.score - a.score);
  
  // Calculate prizes
  const totalPrizePool = match.players.length * match.entryFee;
  const prizes = calculatePrizes(sortedPlayers, totalPrizePool, match.settings.prizeDistribution);
  
  // Update match results
  match.results = {
    players: sortedPlayers.map((player, index) => ({
      ...player,
      rank: index + 1,
      prize: prizes[index] || 0
    })),
    totalPrizePool,
    prizes
  };
  
  // Emit match complete event
  emitMatchEvent(matchId, 'complete', match.results);
  
  // Clean up match after delay
  setTimeout(() => {
    activeMatches.delete(matchId);
  }, 300000); // 5 minutes
};

// Calculate prize distribution
const calculatePrizes = (players, totalPrizePool, distribution) => {
  const prizes = [];
  
  if (players.length >= 1) {
    prizes.push(Math.floor(totalPrizePool * distribution.first));
  }
  if (players.length >= 2) {
    prizes.push(Math.floor(totalPrizePool * distribution.second));
  }
  if (players.length >= 3) {
    prizes.push(Math.floor(totalPrizePool * distribution.third));
  }
  
  return prizes;
};

// Get difficulty bonus
const getDifficultyBonus = (difficulty) => {
  switch (difficulty) {
    case 'easy': return 100;
    case 'medium': return 200;
    case 'hard': return 400;
    default: return 100;
  }
};

// Match lifecycle management
const startMatchLifecycle = (matchId) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  // Auto-start match after max wait time
  const waitTimer = setTimeout(() => {
    const currentMatch = activeMatches.get(matchId);
    if (currentMatch && currentMatch.status === MATCH_STATUS.WAITING) {
      if (currentMatch.players.length >= MATCH_CONFIG.MIN_PLAYERS) {
        startMatch(matchId);
      } else {
        // Cancel match if not enough players
        cancelMatch(matchId, 'Not enough players');
      }
    }
  }, match.settings.maxWaitTime * 1000);
  
  // Store timer reference
  match.waitTimer = waitTimer;
};

// Cancel match
export const cancelMatch = (matchId, reason) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  // Clear timers
  if (match.waitTimer) {
    clearTimeout(match.waitTimer);
  }
  
  // Refund entry fees (in production, integrate with payment system)
  match.players.forEach(player => {
    // Emit refund event
    emitMatchEvent(matchId, 'refund', { playerId: player.id, amount: match.entryFee });
  });
  
  // Remove match
  activeMatches.delete(matchId);
  
  // Emit cancel event
  emitMatchEvent(matchId, 'cancel', { reason });
};

// Get match info
export const getMatch = (matchId) => {
  return activeMatches.get(matchId);
};

// Get active matches
export const getActiveMatches = () => {
  return Array.from(activeMatches.values());
};

// Get player's active match
export const getPlayerMatch = (playerId) => {
  for (const [matchId, match] of activeMatches) {
    if (match.players.find(p => p.id === playerId)) {
      return match;
    }
  }
  return null;
};

// Leave match
export const leaveMatch = async (matchId, playerId) => {
  const match = activeMatches.get(matchId);
  if (!match) return;
  
  const playerIndex = match.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) return;
  
  // Remove player
  match.players.splice(playerIndex, 1);
  
  // If match is waiting and not enough players, cancel it
  if (match.status === MATCH_STATUS.WAITING && match.players.length < MATCH_CONFIG.MIN_PLAYERS) {
    cancelMatch(matchId, 'Not enough players after player left');
  }
  
  // If match is playing and player was active, mark as disconnected
  if (match.status === MATCH_STATUS.PLAYING) {
    // Player forfeits the match
    emitMatchEvent(matchId, 'playerLeft', { playerId, reason: 'left' });
  }
};

// Utility functions
const generateMatchId = () => {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Event emission (replace with your preferred event system)
const emitMatchEvent = (matchId, event, data) => {
  // In production, use WebSockets, Server-Sent Events, or similar
  console.log(`Match ${matchId} event: ${event}`, data);
  
  // Dispatch custom event for local use
  const customEvent = new CustomEvent('matchEvent', {
    detail: { matchId, event, data }
  });
  window.dispatchEvent(customEvent);
};

// Export match status constants
export { MATCH_STATUS, PLAYER_STATUS, MATCH_CONFIG };
