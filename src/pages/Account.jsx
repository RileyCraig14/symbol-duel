import React, { useState, useEffect } from 'react';
import { supabase, gamification } from '../utils/supabase';

// Gamification stats component
const GamificationStats = ({ userProfile }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-yellow-400">🪙</div>
        <div className="text-sm text-gray-400">Tokens</div>
        <div className="text-xl font-bold">{userProfile?.tokens || 0}</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-blue-400">⭐</div>
        <div className="text-sm text-gray-400">Points</div>
        <div className="text-xl font-bold">{userProfile?.points || 0}</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-red-400">🔥</div>
        <div className="text-sm text-gray-400">Streak</div>
        <div className="text-xl font-bold">{userProfile?.streak_days || 0} days</div>
      </div>
      <div className="text-center p-4 bg-gray-800 rounded-lg">
        <div className="text-2xl font-bold text-green-400">📊</div>
        <div className="text-sm text-gray-400">Level</div>
        <div className="text-xl font-bold">{userProfile?.level || 1}</div>
      </div>
    </div>
  );
};

const Account = ({ goBack }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Load user profile with gamification data
          const profile = await gamification.getProfile(user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      goBack();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p>Loading account...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Not Signed In</h2>
        <p className="text-gray-400 mb-6">Please sign in to view your account.</p>
        <button onClick={goBack} className="btn btn-primary">Back to Main</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={goBack} className="btn btn-outline">&larr; Back</button>
        <button onClick={handleLogout} className="btn btn-outline text-red-400 hover:text-red-300">Sign Out</button>
      </div>
      
      <h2 className="text-3xl font-bold mb-6">My Account</h2>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Successfully') 
            ? 'bg-green-900 text-green-300' 
            : 'bg-red-900 text-red-300'
        }`}>
          {message}
        </div>
      )}
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="text-sm text-gray-400 mb-2">Signed in as:</div>
        <div className="text-lg font-semibold">{user.email}</div>
      </div>
      
                        {/* Gamification Stats */}
                  <GamificationStats userProfile={userProfile} />
    </div>
  );
};

export default Account;
