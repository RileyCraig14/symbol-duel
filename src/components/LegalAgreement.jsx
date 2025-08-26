import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, MapPin, Calendar } from 'lucide-react';

const LegalAgreement = ({ onAccept, onDecline, userLocation, userAge }) => {
  const [agreed, setAgreed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAccept = () => {
    if (agreed) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        className="bg-gray-800 rounded-2xl p-8 border border-gray-700 max-w-2xl w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">⚖️</div>
          <h1 className="text-3xl font-bold text-white mb-4">Legal Agreement Required</h1>
          <p className="text-gray-300">
            Before you can play real-money games, please review and accept our terms
          </p>
        </div>

        {/* Location and Age Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <MapPin className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Location</div>
            <div className="text-lg font-semibold text-white">
              {userLocation?.state || 'Detecting...'}
            </div>
            <div className="text-xs text-gray-500">
              {userLocation?.isLegal ? '✅ Legal' : '❌ Restricted'}
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 text-center">
            <Calendar className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400">Age</div>
            <div className="text-lg font-semibold text-white">
              {userAge || 'Verifying...'}
            </div>
            <div className="text-xs text-gray-500">
              {userAge >= 18 ? '✅ 18+' : '❌ Under 18'}
            </div>
          </div>
        </div>

        {/* Legal Terms */}
        <div className="bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Terms of Service</h3>
          
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>This is a skill-based puzzle game, not gambling</span>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>All games require skill, strategy, and puzzle-solving ability</span>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>No element of chance determines the outcome</span>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>You must be 18 years or older to play for real money</span>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <span>A 6% platform fee applies to all games</span>
            </div>
            
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <span>Real-money prizes only available in legal jurisdictions</span>
            </div>
          </div>

          {showDetails && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-600"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <h4 className="font-semibold text-white mb-2">Additional Details</h4>
              <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                <li>Games expire after 20 minutes if not enough players join</li>
                <li>Entry fees are automatically refunded for expired games</li>
                <li>Winner takes the entire prize pool (minus platform fee)</li>
                <li>All games are 6 rounds with 30-second time limits</li>
                <li>Practice mode is available for free</li>
              </ul>
            </motion.div>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-primary hover:text-primary-dark text-sm mt-3"
          >
            {showDetails ? 'Show less' : 'Show more details'}
          </button>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-primary bg-gray-700 border-gray-600 rounded focus:ring-primary focus:ring-2"
          />
          <label htmlFor="agree" className="text-gray-300">
            I have read and agree to the terms of service and confirm I am at least 18 years old
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onDecline}
            className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Decline
          </button>
          
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors"
          >
            Accept & Continue
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By accepting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LegalAgreement;
