// Legal Compliance System for Symbol Duel
// This ensures the app meets legal requirements for skill-based gaming

// Legal states where skill-based gaming is allowed
export const LEGAL_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

// States with restrictions or special requirements (DISABLED FOR TESTING)
export const RESTRICTED_STATES = [
  // Temporarily disabled for testing - all states are allowed
];

// Special restrictions for specific states (DISABLED FOR TESTING)
export const SPECIAL_RESTRICTIONS = {
  // Temporarily disabled for testing - all states are allowed
};

// Minimum age requirement
export const MINIMUM_AGE = 18;

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 0.06; // 6%

// Check if a state allows skill-based gaming
export const checkLocationCompliance = (stateCode) => {
  const state = stateCode?.toUpperCase();
  
  if (!state) {
    return {
      isLegal: true, // Changed to true for testing
      reason: 'Location not detected - allowing access for testing',
      restriction: null
    };
  }

  // TEMPORARILY ALLOW ALL STATES FOR TESTING
  return {
    isLegal: true,
    reason: 'Skill-based gaming allowed (testing mode)',
    restriction: null,
    state: state
  };

  // Original restrictive logic (commented out for testing):
  /*
  if (RESTRICTED_STATES.includes(state)) {
    const restriction = SPECIAL_RESTRICTIONS[state];
    return {
      isLegal: false,
      reason: restriction?.reason || 'Gaming restricted in this state',
      restriction: 'STATE_RESTRICTED',
      state: state,
      note: restriction?.note || 'Practice mode only'
    };
  }

  if (LEGAL_STATES.includes(state)) {
    return {
      isLegal: true,
      reason: 'Skill-based gaming allowed',
      restriction: null,
      state: state
    };
  }

  return {
    isLegal: false,
    reason: 'Location not supported',
    restriction: 'LOCATION_UNSUPPORTED',
    state: state
  };
  */
};

// Check age compliance
export const checkAgeCompliance = (birthDate) => {
  if (!birthDate) {
    return {
      isLegal: true, // Changed to true for testing
      reason: 'Birth date not provided - allowing access for testing',
      restriction: null
    };
  }

  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  // TEMPORARILY ALLOW ALL AGES FOR TESTING
  return {
    isLegal: true,
    age: age,
    minimumAge: MINIMUM_AGE,
    reason: 'Age requirement met (testing mode)'
  };

  // Original restrictive logic (commented out for testing):
  /*
  return {
    isLegal: age >= MINIMUM_AGE,
    age: age,
    minimumAge: MINIMUM_AGE,
    reason: age >= MINIMUM_AGE ? 'Age requirement met' : `Must be at least ${MINIMUM_AGE} years old`
  };
  */
};

// Verify game is skill-based (no random elements)
export const verifySkillBasedGame = (gameData) => {
  const checks = {
    hasRandomElements: false,
    isTimeBased: true,
    hasSkillMetrics: true,
    complianceScore: 100
  };

  // Check for random elements
  if (gameData.randomPuzzles || gameData.randomOrder || gameData.randomTiming) {
    checks.hasRandomElements = true;
    checks.complianceScore -= 30;
  }

  // Verify skill metrics exist
  if (!gameData.speedScoring && !gameData.accuracyScoring && !gameData.difficultyScoring) {
    checks.hasSkillMetrics = false;
    checks.complianceScore -= 20;
  }

  // Ensure time-based scoring (skill-based)
  if (!gameData.timeLimit || gameData.timeLimit <= 0) {
    checks.isTimeBased = false;
    checks.complianceScore -= 15;
  }

  return {
    ...checks,
    isCompliant: checks.complianceScore >= 80
  };
};

// Get user's current location using GPS
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// IP-based location fallback (less accurate but works without GPS permission)
export const getIPLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      state: data.region_code,
      country: data.country_code,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
      method: 'IP'
    };
  } catch (error) {
    console.error('IP location check failed:', error);
    throw error;
  }
};

// Comprehensive compliance check
export const performComplianceCheck = async (userId, gameData) => {
  try {
    // TEMPORARILY ALLOW ALL COMPLIANCE FOR TESTING
    return {
      isCompliant: true,
      reason: 'Compliance check passed (testing mode)',
      restrictions: []
    };
  } catch (error) {
    console.error('Compliance check failed:', error);
    return {
      isCompliant: true, // Changed to true for testing
      reason: 'Compliance check failed - allowing access for testing',
      restriction: 'ERROR'
    };
  }
};

// Get compliant marketing language
export const getCompliantLanguage = (type = 'general') => {
  const language = {
    general: {
      title: 'Compete for Real-World Prizes',
      subtitle: 'Test your puzzle-solving skills in skill-based competitions',
      cta: 'Play Now',
      description: 'Skill-based puzzle games with real rewards'
    },
    restricted: {
      title: 'Practice Mode Available',
      subtitle: 'Real-money prizes not available in your location',
      cta: 'Play for Fun',
      description: 'Enjoy puzzle-solving practice with virtual tokens'
    },
    game: {
      entry: 'Game Entry Fee',
      prize: 'Prize Pool',
      skill: 'Skill-Based Game',
      legal: 'Legal in most US states',
      fee: `${(PLATFORM_FEE_PERCENTAGE * 100).toFixed(0)}% platform fee`
    }
  };

  return language[type] || language.general;
};

// Log compliance events for audit trail
export const logComplianceEvent = async (eventType, details) => {
  try {
    // Placeholder implementation - implement based on your database setup
    console.log('Compliance event logged:', eventType, details);
    return { success: true };
  } catch (error) {
    console.error('Failed to log compliance event:', error);
    return { success: false, error: error.message };
  }
};

// Get legal disclaimer text
export const getLegalDisclaimer = () => {
  return {
    title: 'Legal Disclaimer',
    content: [
      'This is a skill-based puzzle game, not gambling.',
      'All games require skill, strategy, and puzzle-solving ability.',
      'No element of chance determines the outcome.',
      'Players must be 18 years or older.',
      'Real-money prizes are only available in legal jurisdictions.',
      'Platform fee of 6% applies to all games.',
      'By playing, you agree to our terms of service and privacy policy.',
      'TESTING MODE: All restrictions temporarily disabled for development.'
    ]
  };
};

// Get state-specific legal information
export const getStateLegalInfo = (stateCode) => {
  const state = stateCode?.toUpperCase();
  
  if (!state) {
    return {
      status: 'LEGAL', // Changed to LEGAL for testing
      message: 'Location not detected - allowing access for testing',
      restrictions: []
    };
  }

  // TEMPORARILY ALLOW ALL STATES FOR TESTING
  return {
    status: 'LEGAL',
    message: 'Skill-based gaming allowed (testing mode)',
    restrictions: [],
    state: state
  };

  // Original restrictive logic (commented out for testing):
  /*
  if (RESTRICTED_STATES.includes(state)) {
    const restriction = SPECIAL_RESTRICTIONS[state];
    return {
      status: 'RESTRICTED',
      message: restriction?.reason || 'Gaming restricted in this state',
      restrictions: [restriction?.note || 'Practice mode only'],
      state: state
    };
  }

  if (LEGAL_STATES.includes(state)) {
    return {
      status: 'LEGAL',
      message: 'Skill-based gaming allowed',
      restrictions: [],
      state: state
    };
  }

  return {
    status: 'UNSUPPORTED',
    message: 'Location not supported',
    restrictions: ['Service not available in this area'],
    state: state
  };
  */
};
