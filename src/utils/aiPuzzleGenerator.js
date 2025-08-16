// AI Puzzle Generator for Symbol Duel
// Uses GPT-4 API for dynamic puzzle generation with fallback to static puzzles

// Fallback puzzle templates for when AI is unavailable
const fallbackPuzzles = {
  easy: [
    { symbols: '🌊🔥🌪️🌍', answer: 'four elements', category: 'nature', explanation: 'The four classical elements of nature' },
    { symbols: '🌸🌺🌻🌹', answer: 'beautiful flowers', category: 'nature', explanation: 'Common types of flowering plants' },
    { symbols: '🐺🦁🐯🐻', answer: 'wild predators', category: 'animals', explanation: 'Apex predators from different ecosystems' },
    { symbols: '🚗✈️🚢🚁', answer: 'transportation', category: 'modern', explanation: 'Different modes of transportation' },
    { symbols: '💻📱⌚📺', answer: 'digital devices', category: 'technology', explanation: 'Common electronic gadgets' },
    { symbols: '🌙⭐☀️🌌', answer: 'celestial bodies', category: 'space', explanation: 'Objects visible in the night sky' },
    { symbols: '🎮🎲🎯🎪', answer: 'entertainment', category: 'leisure', explanation: 'Activities for fun and amusement' },
    { symbols: '🍕🍔🌮🍜', answer: 'fast food', category: 'food', explanation: 'Popular quick meal options' }
  ],
  medium: [
    { symbols: '🏛️🧠🐉⚡🎭🔮', answer: 'ancient wisdom', category: 'culture', explanation: 'Symbols representing knowledge and mysticism' },
    { symbols: '👑💎⚔️🏰🐉', answer: 'royal power', category: 'fantasy', explanation: 'Symbols of authority and strength' },
    { symbols: '🧙‍♂️🔮✨🌟', answer: 'magic power', category: 'fantasy', explanation: 'Supernatural abilities and mystical forces' },
    { symbols: '🏰👑💎⚔️', answer: 'noble castle', category: 'fantasy', explanation: 'A castle with royal inhabitants and treasures' },
    { symbols: '🦄🌈🦋🦚', answer: 'magical creatures', category: 'fantasy', explanation: 'Mythical and enchanted beings' },
    { symbols: '🌍🌱♻️💧', answer: 'environmental protection', category: 'modern', explanation: 'Symbols of eco-friendly practices' },
    { symbols: '🎭🎬🎪🎨', answer: 'performing arts', category: 'culture', explanation: 'Various forms of artistic expression' },
    { symbols: '⚡🔋💡💻', answer: 'electric power', category: 'technology', explanation: 'Sources and uses of electrical energy' }
  ],
  hard: [
    { symbols: '🏺📜🔮⚱️🗿', answer: 'ancient artifacts', category: 'archaeology', explanation: 'Historical objects from ancient civilizations' },
    { symbols: '🧬🔬🧪🧫', answer: 'scientific research', category: 'science', explanation: 'Tools and symbols of laboratory work' },
    { symbols: '🎭🎪🎨🎬🎭', answer: 'theater performance', category: 'arts', explanation: 'Live dramatic entertainment and expression' },
    { symbols: '🌊🌪️🔥🌍⚡', answer: 'natural disasters', category: 'nature', explanation: 'Powerful forces of nature that cause destruction' },
    { symbols: '🏛️📚🎓⚖️', answer: 'academic institutions', category: 'education', explanation: 'Places of higher learning and knowledge' },
    { symbols: '🕰️⏰⌛⏱️', answer: 'time measurement', category: 'concepts', explanation: 'Various ways humans track and measure time' },
    { symbols: '🎭🎪🎨🎬🎭🎪', answer: 'performing arts complex', category: 'culture', explanation: 'A comprehensive center for artistic performances' },
    { symbols: '🌍🌱♻️💧🌱♻️', answer: 'sustainability movement', category: 'environment', explanation: 'Global effort to protect and preserve the environment' }
  ]
};

// GPT-4 API integration for dynamic puzzle generation
class AIPuzzleGenerator {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REACT_APP_OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  // Generate a puzzle using GPT-4
  async generatePuzzle(difficulty, category = null) {
    if (!this.apiKey) {
      console.warn('No OpenAI API key provided, using fallback puzzles');
      return this.getFallbackPuzzle(difficulty, category);
    }

    try {
      const prompt = this.createPrompt(difficulty, category);
      const response = await this.callGPT4(prompt);
      
      if (response && response.choices && response.choices[0]) {
        const puzzle = this.parseGPTResponse(response.choices[0].message.content);
        if (puzzle) {
          return {
            ...puzzle,
            difficulty,
            category: category || puzzle.category,
            aiGenerated: true
          };
        }
      }
    } catch (error) {
      console.error('GPT-4 puzzle generation failed:', error);
    }

    // Fallback to static puzzles if AI generation fails
    return this.getFallbackPuzzle(difficulty, category);
  }

  // Create a prompt for GPT-4
  createPrompt(difficulty, category) {
    const difficultyDescriptions = {
      easy: 'simple and obvious connections',
      medium: 'moderate complexity with cultural references',
      hard: 'complex combinations requiring deep thinking'
    };

    const categoryContext = category ? ` in the category of ${category}` : '';

    return `Generate a puzzle for a symbol decoding game with these requirements:

Difficulty: ${difficulty} (${difficultyDescriptions[difficulty]})
Category: ${category || 'general knowledge'}
Format: 3-6 emojis that represent a single concept, phrase, or answer

Requirements:
- The emojis should clearly represent the answer when combined
- The answer should be 1-4 words maximum
- Make it challenging but solvable for ${difficulty} level
- Avoid overly abstract or subjective interpretations

Response format (JSON only):
{
  "symbols": "emoji1emoji2emoji3",
  "answer": "the answer",
  "category": "category name",
  "explanation": "brief explanation of the connection"
}

Example for ${difficulty} level:
${this.getExamplePrompt(difficulty)}`;
  }

  // Get example prompt based on difficulty
  getExamplePrompt(difficulty) {
    const examples = {
      easy: '{"symbols": "🌊🔥🌪️🌍", "answer": "four elements", "category": "nature", "explanation": "The four classical elements"}',
      medium: '{"symbols": "🏛️🧠🐉⚡", "answer": "ancient wisdom", "category": "culture", "explanation": "Symbols of knowledge and mysticism"}',
      hard: '{"symbols": "🏺📜🔮⚱️🗿", "answer": "ancient artifacts", "category": "archaeology", "explanation": "Historical objects from ancient civilizations"}'
    };
    return examples[difficulty] || examples.medium;
  }

  // Call GPT-4 API
  async callGPT4(prompt) {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a puzzle designer for a symbol decoding game. Generate creative, solvable puzzles that test players\' knowledge and pattern recognition skills.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`GPT-4 API error: ${response.status}`);
    }

    return await response.json();
  }

  // Parse GPT response
  parseGPTResponse(content) {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const puzzle = JSON.parse(jsonMatch[0]);
        
        // Validate puzzle structure
        if (puzzle.symbols && puzzle.answer && puzzle.category && puzzle.explanation) {
          return puzzle;
        }
      }
    } catch (error) {
      console.error('Failed to parse GPT response:', error);
    }
    return null;
  }

  // Get fallback puzzle
  getFallbackPuzzle(difficulty, category = null) {
    const puzzles = fallbackPuzzles[difficulty] || fallbackPuzzles.medium;
    
    if (category) {
      const categoryPuzzles = puzzles.filter(p => p.category === category);
      if (categoryPuzzles.length > 0) {
        return categoryPuzzles[Math.floor(Math.random() * categoryPuzzles.length)];
      }
    }
    
    return puzzles[Math.floor(Math.random() * puzzles.length)];
  }

  // Generate multiple puzzles for a tournament
  async generateTournamentPuzzles(difficulty, roundCount, category = null) {
    const puzzles = [];
    
    for (let i = 0; i < roundCount; i++) {
      const puzzle = await this.generatePuzzle(difficulty, category);
      puzzles.push({
        ...puzzle,
        roundNumber: i + 1,
        id: `puzzle_${difficulty}_${i + 1}_${Date.now()}`
      });
    }
    
    return puzzles;
  }

  // Validate puzzle difficulty
  validateDifficulty(puzzle, targetDifficulty) {
    const answerLength = puzzle.answer.split(' ').length;
    const symbolCount = puzzle.symbols.length;
    
    switch (targetDifficulty) {
      case 'easy':
        return answerLength <= 2 && symbolCount <= 4;
      case 'medium':
        return answerLength <= 3 && symbolCount <= 5;
      case 'hard':
        return answerLength <= 4 && symbolCount <= 6;
      default:
        return true;
    }
  }
}

// Export singleton instance
export const puzzleGenerator = new AIPuzzleGenerator();

// Export individual functions for convenience
export const generatePuzzle = (difficulty, category) => puzzleGenerator.generatePuzzle(difficulty, category);
export const generateTournamentPuzzles = (difficulty, roundCount, category) => puzzleGenerator.generateTournamentPuzzles(difficulty, roundCount, category);

// Export fallback puzzles for offline use
export { fallbackPuzzles };
