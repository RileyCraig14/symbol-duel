// Stripe Integration for Symbol Duel
import { loadStripe } from '@stripe/stripe-js';

// Production Stripe Configuration
const STRIPE_CONFIG = {
  publishableKey: 'pk_live_51KnY2IBN2FMJdfxFCYBRR3cntr5oe6fj2wSWMIjnpVQ9loZgUWg0SmORk0n8weQKhd3GyH4OZzw3LX0XrDuR6cWm008EDyoGPJ',
  secretKey: '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'
};

// Initialize Stripe
export const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);

// Platform fee configuration
export const PLATFORM_FEE_PERCENTAGE = 6; // 6%

// Calculate platform fee
export const calculatePlatformFee = (amount) => {
  return (amount * PLATFORM_FEE_PERCENTAGE) / 100;
};

// Calculate prize pool after platform fee
export const calculatePrizePool = (totalAmount) => {
  const platformFee = calculatePlatformFee(totalAmount);
  return totalAmount - platformFee;
};

// Validate entry fee
export const validateEntryFee = (amount) => {
  const minFee = 1.00;
  const maxFee = 1000.00;
  
  if (amount < minFee || amount > maxFee) {
    return {
      valid: false,
      message: `Entry fee must be between $${minFee.toFixed(2)} and $${maxFee.toFixed(2)}`
    };
  }
  
  return { valid: true };
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Stripe configuration object
export const stripeConfig = {
  publishableKey: STRIPE_CONFIG.publishableKey,
  currency: 'usd',
  paymentMethods: ['card'],
  mode: 'payment',
  successUrl: `${window.location.origin}/account?payment=success`,
  cancelUrl: `${window.location.origin}/account?payment=cancelled`,
};

export default stripePromise;
