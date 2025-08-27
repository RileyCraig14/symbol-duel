import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent on your backend
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (paymentError) {
        setError(paymentError.message);
        onError?.(paymentError.message);
      } else {
        onSuccess?.();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      onError?.('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-lg p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

const StripePayment = ({ amount, onSuccess, onError }) => {
  if (!stripePromise) {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <p className="text-red-400 mb-4">Stripe payment is not configured for testing.</p>
        <p className="text-gray-400">You can still test the app with fake money!</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <Elements stripe={stripePromise}>
        <CheckoutForm 
          amount={amount} 
          onSuccess={onSuccess} 
          onError={onError} 
        />
      </Elements>
    </div>
  );
};

export default StripePayment;
