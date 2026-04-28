import Stripe from "stripe"

/**
 * Centralized Stripe Configuration
 * * Provides a single source of truth for Stripe SDK settings.
 */
export const stripeConfig = {
  // Cast as any to avoid string literal mismatch errors with the Stripe constructor
  apiVersion: "2025-11-17.clover" as any,
  typescript: true as const,
}

/**
 * Initialize a Stripe instance with standard configuration
 */
export const getStripeInstance = (apiKey?: string) => {
  const key = apiKey || process.env.STRIPE_SECRET_KEY
  if (!key) return null
  
  return new Stripe(key, stripeConfig)
}