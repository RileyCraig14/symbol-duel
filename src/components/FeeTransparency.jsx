import React from 'react';
import { Info } from 'lucide-react';

const FeeTransparency = ({ entryFee, playerCount = 6, showDetails = false }) => {
  const platformFee = 0.06; // 6%
  const totalEntryFees = entryFee * playerCount;
  const platformFeeAmount = totalEntryFees * platformFee;
  const netPrizePool = totalEntryFees - platformFeeAmount;

  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-5 h-5 text-blue-400" />
        <h4 className="font-semibold text-white">Fee Breakdown</h4>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Total Entry Fees:</span>
          <span className="text-white">${totalEntryFees.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">Platform Fee (6%):</span>
          <span className="text-red-400">-${platformFeeAmount.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-600 pt-2">
          <div className="flex justify-between">
            <span className="text-gray-300 font-semibold">Net Prize Pool:</span>
            <span className="text-green-400 font-bold">${netPrizePool.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-600">
          <p className="text-xs text-gray-400">
            The platform fee covers operational costs, payment processing, and compliance requirements. 
            Winner takes the entire net prize pool.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeeTransparency;
