import React, { useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthTest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setMessage('Testing Supabase connection...');
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        setMessage(`Connection Error: ${error.message}`);
        console.error('Supabase Error:', error);
      } else {
        setMessage('✅ Supabase connection successful!');
        console.log('Supabase Data:', data);
      }
    } catch (err) {
      setMessage(`❌ Connection failed: ${err.message}`);
      console.error('Connection Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Signing up...');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) {
        setMessage(`❌ Signup Error: ${error.message}`);
        console.error('Signup Error:', error);
      } else {
        setMessage('✅ Check your email for confirmation link!');
        console.log('Signup Success:', data);
      }
    } catch (err) {
      setMessage(`❌ Signup failed: ${err.message}`);
      console.error('Signup Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Signing in...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setMessage(`❌ Signin Error: ${error.message}`);
        console.error('Signin Error:', error);
      } else {
        setMessage('✅ Signin successful!');
        console.log('Signin Success:', data);
      }
    } catch (err) {
      setMessage(`❌ Signin failed: ${err.message}`);
      console.error('Signin Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Supabase Connection Test</h2>
      
      <div className="mb-6">
        <button 
          onClick={testConnection}
          disabled={loading}
          className="btn btn-primary w-full mb-4"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes('✅') ? 'bg-green-800 text-green-200' : 
            message.includes('❌') ? 'bg-red-800 text-red-200' : 
            'bg-blue-800 text-blue-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input w-full"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input w-full"
            placeholder="Password (min 6 chars)"
            minLength="6"
            required
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary flex-1"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="btn btn-outline flex-1"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthTest;
