// Individual Game Fee Management System
// Handles platform fees, prize calculations, and fee transparency for individual games

// Platform fee percentage (6% as requested)
export const PLATFORM_FEES = {
  STANDARD: 0.06,      // 6% - Standard games
  PREMIUM: 0.06,        // 6% - Premium games (same rate)
  VIP: 0.06,           // 6% - VIP games (same rate)
  MAXIMUM: 0.06         // 6% - Maximum allowed (fixed rate)
};

// Game entry fee tiers
export const GAME_ENTRY_FEES = {
  QUICK_PLAY: {
    min: 1,
    max: 10,
    recommended: 5,
    description: 'Quick puzzle games'
  },
  STANDARD: {
    min: 5,
    max: 25,
    recommended: 10,
    description: 'Standard puzzle games'
  },
  PREMIUM: {
    min: 10,
    max: 50,
    recommended: 25,
    description: 'Premium puzzle games'
  },
  CHAMPIONSHIP: {
    min: 25,
    max: 100,
    recommended: 50,
    description: 'Championship level games'
  }
};

// Fee calculation functions
export const gameFees = {
  // Get platform fee (always 6%)
  getPlatformFee: () => {
    return PLATFORM_FEES.STANDARD; // Fixed at 6%
  },

  // Calculate total entry fees
  calculateTotalEntryFees: (entryFee, playerCount) => {
    return entryFee * playerCount;
  },

  // Calculate platform fee amount
  calculatePlatformFee: (entryFee, playerCount) => {
    const totalFees = gameFees.calculateTotalEntryFees(entryFee, playerCount);
    const feePercentage = gameFees.getPlatformFee();
    return Math.round(totalFees * feePercentage * 100) / 100; // Round to 2 decimal places
  },

  // Calculate net prize pool (after platform fee)
  calculateNetPrizePool: (entryFee, playerCount) => {
    const totalFees = gameFees.calculateTotalEntryFees(entryFee, playerCount);
    const platformFee = gameFees.calculatePlatformFee(entryFee, playerCount);
    return totalFees - platformFee;
  },

  // Calculate winner's prize (assuming winner-takes-all)
  calculateWinnerPrize: (entryFee, playerCount) => {
    return gameFees.calculateNetPrizePool(entryFee, playerCount);
  },

  // Calculate fee breakdown for transparency
  getFeeBreakdown: (entryFee, playerCount) => {
    const totalFees = gameFees.calculateTotalEntryFees(entryFee, playerCount);
    const platformFee = gameFees.calculatePlatformFee(entryFee, playerCount);
    const netPrizePool = gameFees.calculateNetPrizePool(entryFee, playerCount);
    const feePercentage = gameFees.getPlatformFee() * 100;

    return {
      entryFee,
      playerCount,
      totalEntryFees: totalFees,
      platformFee,
      platformFeePercentage: feePercentage,
      netPrizePool,
      winnerPrize: netPrizePool,
      feePerPlayer: platformFee / playerCount,
      playerProfit: netPrizePool - entryFee // How much winner gains
    };
  },

  // Validate entry fee is within legal bounds
  validateEntryFee: (entryFee, gameType = 'STANDARD') => {
    // Allow any round number from $1 to $100
    return entryFee >= 1 && entryFee <= 100 && Number.isInteger(entryFee);
  },

  // Get recommended entry fee for game type
  getRecommendedEntryFee: (gameType = 'STANDARD') => {
    const tier = GAME_ENTRY_FEES[gameType.toUpperCase()];
    return tier ? tier.recommended : GAME_ENTRY_FEES.STANDARD.recommended;
  },

  // Format fee display for UI
  formatFeeDisplay: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  },

  // Get fee transparency message
  getTransparencyMessage: () => {
    const feePercentage = gameFees.getPlatformFee() * 100;
    
    return {
      title: 'Fee Transparency',
      message: `This game has a ${feePercentage}% platform fee. The remaining ${100 - feePercentage}% goes directly to the prize pool.`,
      details: [
        'Platform fees cover operational costs and legal compliance',
        'All fees are clearly displayed before entry',
        'Prize calculations are transparent and verifiable',
        'No hidden charges or surprise deductions',
        '6% fee is standard for skill-based gaming platforms'
      ]
    };
  },

  // Calculate expected value for players
  calculateExpectedValue: (entryFee, playerCount, winProbability = 0.5) => {
    const winnerPrize = gameFees.calculateWinnerPrize(entryFee, playerCount);
    const expectedValue = (winnerPrize * winProbability) - entryFee;
    
    return {
      expectedValue,
      isPositive: expectedValue > 0,
      roi: ((expectedValue / entryFee) * 100).toFixed(1)
    };
  }
};

// Game pricing presets
export const GAME_PRESETS = {
  QUICK_PLAY: {
    name: 'Quick Play',
    entryFee: 5,
    maxPlayers: 6,
    gameType: 'QUICK_PLAY',
    description: 'Fast puzzle challenges',
    duration: '5-10 minutes',
    difficulty: 'Easy to Medium'
  },
  
  STANDARD: {
    name: 'Standard Game',
    entryFee: 10,
    maxPlayers: 6,
    gameType: 'STANDARD',
    description: 'Regular puzzle competitions',
    duration: '10-15 minutes',
    difficulty: 'Medium'
  },
  
  PREMIUM: {
    name: 'Premium Challenge',
    entryFee: 25,
    maxPlayers: 6,
    gameType: 'PREMIUM',
    description: 'Advanced puzzle challenges',
    duration: '15-20 minutes',
    difficulty: 'Medium to Hard'
  },
  
  CHAMPIONSHIP: {
    name: 'Championship',
    entryFee: 50,
    maxPlayers: 6,
    gameType: 'CHAMPIONSHIP',
    description: 'Elite puzzle competitions',
    duration: '20-30 minutes',
    difficulty: 'Hard'
  }
};

// Export individual functions for direct use
export const getPlatformFee = gameFees.getPlatformFee;
export const calculateTotalEntryFees = gameFees.calculateTotalEntryFees;
export const calculatePlatformFee = gameFees.calculatePlatformFee;
export const calculateNetPrizePool = gameFees.calculateNetPrizePool;
export const calculateWinnerPrize = gameFees.calculateWinnerPrize;
export const getFeeBreakdown = gameFees.getFeeBreakdown;
export const validateEntryFee = gameFees.validateEntryFee;
export const getRecommendedEntryFee = gameFees.getRecommendedEntryFee;
export const formatFeeDisplay = gameFees.formatFeeDisplay;
export const getTransparencyMessage = gameFees.getTransparencyMessage;
export const calculateExpectedValue = gameFees.calculateExpectedValue;
