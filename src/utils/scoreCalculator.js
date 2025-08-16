// Score calculation utilities for Symbol Duel

export const calculateScore = ({
  timeLeft,
  totalTime,
  difficulty,
  attempts,
  bonusMultiplier = 1
}) => {
  // Base score for completing the puzzle
  let baseScore = 500;
  
  // Time bonus (more time left = higher score)
  const timePercentage = timeLeft / totalTime;
  const timeBonus = Math.floor(timePercentage * 300);
  
  // Difficulty bonus (harder puzzles = higher score)
  const difficultyBonus = difficulty * 100;
  
  // Attempt penalty (more attempts = lower score)
  const attemptPenalty = attempts * 50;
  
  // Calculate final score
  let finalScore = baseScore + timeBonus + difficultyBonus - attemptPenalty;
  
  // Apply bonus multiplier (for special events, streaks, etc.)
  finalScore = Math.floor(finalScore * bonusMultiplier);
  
  // Ensure minimum score
  finalScore = Math.max(finalScore, 100);
  
  return finalScore;
};

export const getScoreBreakdown = ({
  timeLeft,
  totalTime,
  difficulty,
  attempts,
  bonusMultiplier = 1
}) => {
  const baseScore = 500;
  const timePercentage = timeLeft / totalTime;
  const timeBonus = Math.floor(timePercentage * 300);
  const difficultyBonus = difficulty * 100;
  const attemptPenalty = attempts * 50;
  
  return {
    baseScore,
    timeBonus,
    difficultyBonus,
    attemptPenalty,
    bonusMultiplier,
    total: calculateScore({
      timeLeft,
      totalTime,
      difficulty,
      attempts,
      bonusMultiplier
    })
  };
};

export const getScoreGrade = (score) => {
  if (score >= 1000) return { grade: 'S', color: 'text-purple-400', label: 'Legendary' };
  if (score >= 800) return { grade: 'A', color: 'text-green-400', label: 'Excellent' };
  if (score >= 600) return { grade: 'B', color: 'text-blue-400', label: 'Good' };
  if (score >= 400) return { grade: 'C', color: 'text-yellow-400', label: 'Average' };
  if (score >= 200) return { grade: 'D', color: 'text-orange-400', label: 'Poor' };
  return { grade: 'F', color: 'text-red-400', label: 'Failed' };
};

export const calculateStreakBonus = (currentStreak) => {
  // Bonus multiplier for consecutive correct answers
  if (currentStreak >= 10) return 2.0;
  if (currentStreak >= 7) return 1.8;
  if (currentStreak >= 5) return 1.5;
  if (currentStreak >= 3) return 1.2;
  return 1.0;
};

export const calculateDailyBonus = (dayOfWeek) => {
  // Bonus for playing on specific days
  const dayBonuses = {
    0: 1.1, // Sunday
    1: 1.0, // Monday
    2: 1.0, // Tuesday
    3: 1.0, // Wednesday
    4: 1.0, // Thursday
    5: 1.2, // Friday
    6: 1.3  // Saturday
  };
  
  return dayBonuses[dayOfWeek] || 1.0;
};

export const getPerformanceStats = (scores) => {
  if (!scores || scores.length === 0) {
    return {
      average: 0,
      highest: 0,
      lowest: 0,
      total: 0,
      count: 0
    };
  }
  
  const total = scores.reduce((sum, score) => sum + score, 0);
  const average = total / scores.length;
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  
  return {
    average: Math.round(average),
    highest,
    lowest,
    total,
    count: scores.length
  };
};
