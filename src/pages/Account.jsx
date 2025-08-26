import React from 'react';
import DepositFunds from '../components/DepositFunds';

// Gambling stats component
const GamblingStats = ({ userProfile }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-primary">💰</div>
        <div className="text-sm text-gray-400">Balance</div>
        <div className="text-xl font-bold">${userProfile?.account_balance?.toFixed(2) || '0.00'}</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-green-400">🏆</div>
        <div className="text-sm text-gray-400">Total Winnings</div>
        <div className="text-xl font-bold">${userProfile?.total_winnings?.toFixed(2) || '0.00'}</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-blue-400">🎮</div>
        <div className="text-sm text-gray-400">Games Played</div>
        <div className="text-xl font-bold">{userProfile?.games_played || 0}</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-yellow-400">✅</div>
        <div className="text-sm text-gray-400">Games Won</div>
        <div className="text-xl font-bold">{userProfile?.games_won || 0}</div>
      </div>
    </div>
  );
};

const Account = ({ user, userProfile, onBack }) => {

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">My Account</h1>
          <p className="text-xl text-gray-300">Manage your profile and funds</p>
          
          {/* Back Button */}
          <button
            onClick={onBack}
            className="btn btn-outline mt-4"
          >
            ← Back to Home
          </button>
        </div>

        {/* Account Stats */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">💰 Account Statistics</h2>
          <GamblingStats userProfile={userProfile} />
        </div>

        {/* Deposit Funds Section */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">💳 Deposit Funds</h2>
          <p className="text-gray-300 mb-6">
            Add money to your account to participate in games and tournaments.
          </p>
          <DepositFunds user={user} userProfile={userProfile} />
        </div>
      </div>
    </div>
  );
};

export default Account;
