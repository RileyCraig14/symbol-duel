import React from 'react';
import { motion } from 'framer-motion';

const PuzzleDisplay = ({ symbols, isRevealed = false }) => {
  return (
    <div className="text-6xl mb-4">
      {Array.isArray(symbols) ? (
        <div style={{ whiteSpace: 'pre-line' }}>{symbols.join('\n')}</div>
      ) : (
        symbols
      )}
    </div>
  );
};

export default PuzzleDisplay;
