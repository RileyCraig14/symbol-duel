import React, { useState } from 'react';
import StripePayment from './StripePayment';

const DepositFunds = ({ userProfile, onDepositSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStripePayment, setShowStripePayment] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate deposit processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(`Successfully deposited $${amount}`);
      setAmount('');
      
      // Call success callback if provided
      if (onDepositSuccess) {
        onDepositSuccess();
      }
    } catch (error) {
      setError('Failed to process deposit: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">💰 Deposit Funds</h3>
      
      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deposit Amount ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="1"
            max="1000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount (e.g., 50.00)"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Minimum: $1.00 | Maximum: $1,000.00
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            type="submit"
            disabled={loading || !amount}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Deposit $${amount || '0.00'}`}
          </button>
          
          <button
            type="button"
            onClick={() => setShowStripePayment(true)}
            disabled={!amount}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
          >
            Pay with Card
          </button>
        </div>
      </form>

      {/* Stripe Payment Modal */}
      {showStripePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-xl font-semibold text-white">💳 Credit Card Payment</h4>
              <button
                onClick={() => setShowStripePayment(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <StripePayment
              amount={parseFloat(amount)}
              onSuccess={(paymentIntent) => {
                setSuccess(`Payment successful! $${amount} added to your account.`);
                setAmount('');
                setShowStripePayment(false);
                if (onDepositSuccess) {
                  onDepositSuccess();
                }
              }}
              onError={(error) => {
                setError('Payment failed: ' + error);
                setShowStripePayment(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          Current Balance: <span className="text-green-400 font-semibold">${userProfile?.account_balance?.toFixed(2) || '0.00'}</span>
        </p>
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
        <h4 className="text-blue-400 font-semibold mb-2">💡 How it works:</h4>
        <ul className="text-sm text-blue-300 space-y-1">
          <li>• Add funds to your account balance</li>
          <li>• Use balance to join games and tournaments</li>
          <li>• Win real money prizes (minus 6% platform fee)</li>
          <li>• Withdraw winnings to your bank account</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositFunds;
