import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { stripe, payments } from '../utils/stripe';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Stripe payment form component
const PaymentForm = ({ onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      // Create payment intent
      const { clientSecret } = await payments.createPaymentIntent(amount);
      
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        onError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Add funds to account
        await payments.addFunds(amount);
        onSuccess(amount);
        elements.getElement(CardElement).clear();
      }
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Amount to Add ($)
        </label>
        <select 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
        >
          <option value={5}>$5</option>
          <option value={10}>$10</option>
          <option value={25}>$25</option>
          <option value={50}>$50</option>
          <option value={100}>$100</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Card Details
        </label>
        <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg">
          <CardElement 
            options={{
              style: {
                base: {
                  color: '#ffffff',
                  fontSize: '16px',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Processing...' : `Add $${amount}`}
      </button>
    </form>
  );
};

const Account = ({ goBack }) => {
  const [user, setUser] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [message, setMessage] = useState('');

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Load user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('balance, username, total_games, total_wins, total_earnings')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setUserBalance(profile.balance || 0);
          }
          
          // Load transaction history
          const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          if (transactions) {
            setTransactionHistory(transactions);
          }
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

  // Handle payment success
  const handlePaymentSuccess = async (amount) => {
    setMessage(`Successfully added $${amount} to your account!`);
    setShowPaymentForm(false);
    
    // Reload user data
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();
    
    if (profile) {
      setUserBalance(profile.balance);
    }
    
    // Reload transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transactions) {
      setTransactionHistory(transactions);
    }
    
    setTimeout(() => setMessage(''), 5000);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage) => {
    setMessage(`Payment failed: ${errorMessage}`);
    setTimeout(() => setMessage(''), 5000);
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
      
      <div className="mb-8 p-6 bg-gray-900 rounded-lg shadow">
        <div className="text-lg mb-2">Current Balance:</div>
        <div className="text-4xl font-bold text-green-400 mb-4">${userBalance.toFixed(2)}</div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowPaymentForm(!showPaymentForm)}
        >
          {showPaymentForm ? 'Cancel' : 'Add Funds'}
        </button>
      </div>
      
      {showPaymentForm && (
        <div className="mb-8 p-6 bg-gray-900 rounded-lg shadow">
          <h4 className="text-lg font-semibold mb-4">Add Funds with Stripe</h4>
          <Elements stripe={stripe}>
            <PaymentForm 
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          </Elements>
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Transaction History</h3>
        <div className="bg-gray-800 rounded-lg p-4">
          {transactionHistory.length === 0 ? (
            <div className="text-gray-400">No transactions yet.</div>
          ) : (
            <ul>
              {transactionHistory.map(tx => (
                <li key={tx.id} className="flex justify-between py-2 border-b border-gray-700 last:border-b-0">
                  <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                  <span className={tx.amount > 0 ? 'text-green-400' : 'text-red-400'}>
                    {tx.amount > 0 ? '+' : ''}${tx.amount}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
