import puzzlesData from './rebus-puzzles.json';

function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

const PUZZLES = Array.isArray(puzzlesData)
  ? puzzlesData.map(p => ({
      ...p,
      symbols: p.symbols,
      answer: p.answer,
    }))
  : [];

export const getRandomPuzzles = (count = 6) => {
  const shuffled = [...PUZZLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const checkAnswer = (userAnswer, correctAnswer) => {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

export const calculateScore = (timeElapsed, isCorrect, baseScore = 100) => {
  if (!isCorrect) return 0;
  const timePenalty = Math.min(timeElapsed, baseScore - 10);
  return Math.max(10, baseScore - timePenalty);
};
