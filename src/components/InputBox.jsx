import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Lightbulb, X } from 'lucide-react';

const InputBox = ({ onSubmit, onHint, isDisabled = false, placeholder = "Enter your answer..." }) => {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isDisabled) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(input.trim());
      setInput('');
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isDisabled) {
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isDisabled || isSubmitting}
            className="input-box pr-12"
            autoComplete="off"
            autoFocus
          />
          
          {input && (
            <motion.button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <X size={20} />
            </motion.button>
          )}
          
          <motion.button
            type="submit"
            disabled={!input.trim() || isDisabled || isSubmitting}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSubmitting ? (
              <div className="loading"></div>
            ) : (
              <Send size={20} />
            )}
          </motion.button>
        </div>
        
        <div className="flex gap-4">
          <motion.button
            type="button"
            onClick={onHint}
            className="btn btn-outline flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Lightbulb size={18} />
            Get Hint
          </motion.button>
        </div>
      </form>
      
      {isDisabled && (
        <motion.div
          className="text-center mt-4 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Game paused or completed
        </motion.div>
      )}
    </div>
  );
};

export default InputBox;
