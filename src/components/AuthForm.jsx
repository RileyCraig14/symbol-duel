import React, { useState } from 'react';
// Force use real Supabase for production
const realSupabase = require('../utils/realSupabase');
const supabase = realSupabase.supabase;

const AuthForm = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up validation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        if (!formData.username.trim()) {
          throw new Error('Username is required');
        }

        // Sign up with Supabase
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              phone: formData.phone
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          console.log('✅ User signed up successfully:', data.user.email);
          // Profile will be created automatically by database trigger
          onAuthSuccess(data.user);
        }
      } else {
        // Sign in validation
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }

        // Sign in with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          console.log('✅ User signed in successfully:', data.user.email);
          onAuthSuccess(data.user);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setFormData({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-200 max-w-md w-full shadow-xl">
      <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Symbol Duel</h1>
      <p className="text-gray-600 text-center mb-8">
        {isSignUp ? 'Create your account' : 'Sign in to your account'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 auth-form">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required={isSignUp}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: 'black' }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-black mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ color: 'black' }}
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">Phone (Optional)</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: 'black' }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-black mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            style={{ color: 'black' }}
          />
        </div>

        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm password"
              required={isSignUp}
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              style={{ color: 'black' }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
          style={{ color: 'white', fontWeight: 'bold' }}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={toggleMode}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
