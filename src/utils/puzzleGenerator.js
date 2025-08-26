import puzzlesData from './rebus-puzzles.json';

function normalizeAnswer(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Fallback puzzles in case JSON import fails
const FALLBACK_PUZZLES = [
  { symbols: '🌙⭐☀️', answer: 'night and day' },
  { symbols: '🐉⚔️👑', answer: 'dragon warrior' },
  { symbols: '🌊🔥🌪️🌍', answer: 'four elements' },
  { symbols: '🍎👁️', answer: 'apple of my eye' },
  { symbols: '🔥🐶', answer: 'hot dog' },
  { symbols: '⭐🔫', answer: 'shooting star' },
  { symbols: '☕💔', answer: 'coffee break' },
  { symbols: '🖨️🐱', answer: 'copycat' },
  { symbols: '🌟⚔️', answer: 'star wars' },
  { symbols: '🦇🧔', answer: 'batman' },
  { symbols: '🍌🤸', answer: 'banana split' },
  { symbols: '🤢🍇', answer: 'sour grapes' },
  { symbols: '💔', answer: 'heartbreak' },
  { symbols: '🍋🚗', answer: 'lemon car' },
  { symbols: '🐢🏁', answer: 'slow race' },
  { symbols: '🌪️👀', answer: 'eye of the storm' },
  { symbols: '🍎🗽', answer: 'big apple' },
  { symbols: '🐺🐑🧥', answer: 'wolf in sheep clothing' },
  { symbols: '1️⃣🌙🔵', answer: 'once in a blue moon' },
  { symbols: '🦶👄', answer: 'foot in mouth' },
  { symbols: '⌚🐶', answer: 'watchdog' },
  { symbols: '🍬🗣️', answer: 'sweet talk' },
  { symbols: '🇫🇷🍞', answer: 'french toast' },
  { symbols: '👍⚔️', answer: 'thumb war' },
  { symbols: '📏🪱', answer: 'tapeworm' },
  { symbols: '🔥👊', answer: 'firefighter' },
  { symbols: '❤️📧', answer: 'love letter' },
  { symbols: '🌎🏆', answer: 'world cup' }
];

// Try to load puzzles from JSON, fallback to hardcoded array
let PUZZLES = [];
try {
  console.log('📚 Loading puzzles from JSON...');
  console.log('📊 JSON data received:', puzzlesData);
  
  if (puzzlesData && puzzlesData.puzzles && Array.isArray(puzzlesData.puzzles)) {
    PUZZLES = puzzlesData.puzzles.map(p => ({
      ...p,
      symbols: Array.isArray(p.symbols) ? p.symbols.join('') : p.symbols,
      answer: p.answer,
    }));
    console.log('✅ Loaded', PUZZLES.length, 'puzzles from JSON');
  } else {
    console.warn('⚠️ JSON structure not as expected, using fallback puzzles');
    PUZZLES = FALLBACK_PUZZLES;
  }
} catch (error) {
  console.error('❌ Error loading JSON puzzles:', error);
  console.log('🔄 Using fallback puzzles instead');
  PUZZLES = FALLBACK_PUZZLES;
}

export const getRandomPuzzles = (count = 6) => {
  console.log('🎲 Getting random puzzles, count:', count);
  console.log('📊 Available puzzles:', PUZZLES.length);
  
  if (PUZZLES.length === 0) {
    console.error('❌ No puzzles available! PUZZLES array is empty');
    console.log('🔄 Using fallback puzzles');
    PUZZLES = FALLBACK_PUZZLES;
  }
  
  const shuffled = [...PUZZLES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, PUZZLES.length));
  
  console.log('✅ Generated puzzles:', selected);
  return selected;
};

export const checkAnswer = (userAnswer, correctAnswer) => {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
};

export const calculateScore = (timeElapsed, isCorrect, baseScore = 100) => {
  if (!isCorrect) return 0;
  const timePenalty = Math.min(timeElapsed, baseScore - 10);
  return Math.max(10, baseScore - timePenalty);
};
