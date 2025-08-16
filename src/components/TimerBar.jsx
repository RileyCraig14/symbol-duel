import React from 'react';
import { motion } from 'framer-motion';

const TimerBar = ({ timeLeft, totalTime, isRunning = true }) => {
  const percentage = (timeLeft / totalTime) * 100;
  
  const getTimerColor = (percent) => {
    if (percent > 60) return 'bg-green-500';
    if (percent > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-container mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Time Remaining</span>
        <motion.span
          className={`text-lg font-bold ${getTimerColor(percentage).replace('bg-', 'text-')}`}
          animate={{ scale: isRunning ? [1, 1.1, 1] : 1 }}
          transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
        >
          {formatTime(timeLeft)}
        </motion.span>
      </div>
      
      <div className="timer-bar">
        <motion.div
          className={`timer-fill ${getTimerColor(percentage)}`}
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1,
            ease: "linear"
          }}
        />
      </div>
      
      {timeLeft <= 10 && (
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="text-red-400 font-bold text-sm">
            ⚠️ Time's running out!
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default TimerBar;
