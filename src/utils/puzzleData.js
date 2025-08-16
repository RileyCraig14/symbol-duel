// Sample puzzle data for Symbol Duel
export const puzzleCategories = {
  ancient: {
    name: "Ancient Civilizations",
    icon: "🏛️",
    description: "Decode symbols from ancient Egypt, Greece, Rome, and more",
    puzzles: [
      {
        id: "ancient_1",
        symbols: "🏛️🧠🐉⚡🎭🔮",
        answer: "ancient wisdom",
        difficulty: 2,
        hint: "Think about what these symbols represent in ancient cultures",
        explanation: "These symbols represent the pursuit of knowledge and mystical understanding in ancient civilizations."
      },
      {
        id: "ancient_2",
        symbols: "👑💎⚔️🏰🐉",
        answer: "royal power",
        difficulty: 1,
        hint: "Symbols of authority and strength",
        explanation: "These symbols represent the power and authority of ancient rulers and kingdoms."
      },
      {
        id: "ancient_3",
        symbols: "🌊🔥🌪️🌍",
        answer: "four elements",
        difficulty: 1,
        hint: "The fundamental forces of nature",
        explanation: "The four classical elements: water, fire, air (wind), and earth."
      }
    ]
  },
  nature: {
    name: "Nature's Code",
    icon: "🌿",
    description: "Symbols hidden in the natural world",
    puzzles: [
      {
        id: "nature_1",
        symbols: "🌙⭐☀️🌌",
        answer: "celestial bodies",
        difficulty: 1,
        hint: "Objects you see in the sky",
        explanation: "These symbols represent the main celestial bodies visible from Earth."
      },
      {
        id: "nature_2",
        symbols: "🌸🌺🌻🌹",
        answer: "beautiful flowers",
        difficulty: 1,
        hint: "Colorful blooms of nature",
        explanation: "These are all types of beautiful flowering plants."
      },
      {
        id: "nature_3",
        symbols: "🐺🦁🐯🐻",
        answer: "wild predators",
        difficulty: 2,
        hint: "Fierce hunters of the animal kingdom",
        explanation: "These are apex predators found in various ecosystems around the world."
      }
    ]
  },
  fantasy: {
    name: "Fantasy Realms",
    icon: "🐉",
    description: "Magical creatures and enchanted symbols",
    puzzles: [
      {
        id: "fantasy_1",
        symbols: "🧙‍♂️🔮✨🌟",
        answer: "magic power",
        difficulty: 2,
        hint: "Supernatural abilities and mystical energy",
        explanation: "These symbols represent magical abilities and mystical forces."
      },
      {
        id: "fantasy_2",
        symbols: "🏰👑💎⚔️",
        answer: "noble castle",
        difficulty: 1,
        hint: "A royal residence with treasures",
        explanation: "These symbols represent a castle with royal inhabitants and valuable treasures."
      },
      {
        id: "fantasy_3",
        symbols: "🦄🌈🦋🦚",
        answer: "magical creatures",
        difficulty: 3,
        hint: "Mythical and enchanted beings",
        explanation: "These are all magical or mythical creatures from fantasy stories."
      }
    ]
  },
  modern: {
    name: "Modern Symbols",
    icon: "📱",
    description: "Contemporary symbols and digital expressions",
    puzzles: [
      {
        id: "modern_1",
        symbols: "💻📱⌚📺",
        answer: "digital devices",
        difficulty: 1,
        hint: "Electronic gadgets we use daily",
        explanation: "These are common digital devices used in modern technology."
      },
      {
        id: "modern_2",
        symbols: "🚗✈️🚢🚁",
        answer: "transportation",
        difficulty: 1,
        hint: "Ways to get from place to place",
        explanation: "These symbols represent different modes of transportation."
      },
      {
        id: "modern_3",
        symbols: "🎮🎲🎯🎪",
        answer: "entertainment",
        difficulty: 2,
        hint: "Activities for fun and amusement",
        explanation: "These symbols represent various forms of entertainment and games."
      }
    ]
  }
};

export const getRandomPuzzle = (category = null) => {
  if (category && puzzleCategories[category]) {
    const puzzles = puzzleCategories[category].puzzles;
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }
  
  // Get random puzzle from any category
  const allPuzzles = Object.values(puzzleCategories).flatMap(cat => cat.puzzles);
  return allPuzzles[Math.floor(Math.random() * allPuzzles.length)];
};

export const getPuzzleByDifficulty = (difficulty) => {
  const allPuzzles = Object.values(puzzleCategories).flatMap(cat => cat.puzzles);
  return allPuzzles.filter(puzzle => puzzle.difficulty === difficulty);
};

export const getCategoryInfo = (category) => {
  return puzzleCategories[category] || null;
};
