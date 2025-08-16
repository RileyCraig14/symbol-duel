import { loadStripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Your actual Stripe publishable key
const stripePromise = loadStripe('pk_test_51KnY2IBN2FMJdfxFOsfSTjLX7DmPS4bFYlkBZWtJVqOkOKMF8DnM5wQy3jz3TJ117czECU6SOQn1yzasxgqB5ktC00aDNVePjg');

export const stripe = stripePromise;

// Payment functions
export const payments = {
  // Create payment intent for adding funds
  createPaymentIntent: async (amount) => {
    try {
      // This would call your backend API
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
        }),
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Payment intent error:', error);
      throw error;
    }
  },

  // Process entry fee payment
  processEntryFee: async (amount, userId) => {
    try {
      // Deduct from user's balance in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          balance: supabase.sql`balance - ${amount}`,
          total_games: supabase.sql`total_games + 1`
        })
        .eq('id', userId)
        .gte('balance', amount) // Ensure sufficient balance
        .select()
        .single();
      
      if (error) throw error;
      
      // Record transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'entry_fee',
        amount: -amount,
        description: `Game entry fee`
      });
      
      return { success: true, newBalance: data.balance };
    } catch (error) {
      console.error('Entry fee error:', error);
      throw error;
    }
  },

  // Distribute winnings
  distributeWinnings: async (gameId, winnerId, amount) => {
    try {
      // Add winnings to user's balance
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          balance: supabase.sql`balance + ${amount}`,
          total_wins: supabase.sql`total_wins + 1`,
          total_earnings: supabase.sql`total_earnings + ${amount}`
        })
        .eq('id', winnerId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Record transaction
      await supabase.from('transactions').insert({
        user_id: winnerId,
        type: 'winnings',
        amount: amount,
        description: `Game winnings from game ${gameId}`
      });
      
      return { success: true, newBalance: data.balance };
    } catch (error) {
      console.error('Winnings error:', error);
      throw error;
    }
  },

  // Add funds to account
  addFunds: async (amount, paymentMethodId) => {
    try {
      // This would integrate with Stripe payment
      // For now, simulate adding funds
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      // Update balance
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          balance: supabase.sql`balance + ${amount}`
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        amount: amount,
        description: `Added funds via Stripe`
      });
      
      return { success: true, newBalance: data.balance };
    } catch (error) {
      console.error('Add funds error:', error);
      throw error;
    }
  }
};

// Stripe Elements configuration
export const stripeConfig = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};
