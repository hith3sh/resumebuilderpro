import { supabase } from '@/lib/customSupabaseClient';
import { formatCurrency } from '@/api/StripeApi';

/**
 * Create a temporary guest order before payment
 * @param {Object} params - Guest order parameters
 * @param {Array} params.items - Items to purchase
 * @param {string} params.email - Guest email
 * @param {number} params.amount - Total amount in cents
 * @param {string} params.currency - Currency code (default: USD)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<{tempOrderId: string, clientSecret: string}>}
 */
export async function createGuestCheckout({
  items,
  email,
  amount,
  currency = 'USD',
  metadata = {}
}) {
  try {
    // Store temporary guest order data in sessionStorage
    const tempOrderId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const guestOrderData = {
      tempOrderId,
      email,
      items,
      amount,
      currency,
      metadata: {
        ...metadata,
        isGuest: true,
        guestEmail: email
      },
      timestamp: Date.now()
    };

    // Store in sessionStorage for retrieval after payment
    sessionStorage.setItem('guestOrderData', JSON.stringify(guestOrderData));
    sessionStorage.setItem(`guestOrder_${tempOrderId}`, JSON.stringify(guestOrderData));

    // Create payment intent via Supabase Edge Function (no auth required for guest)
    const { data, error } = await supabase.functions.invoke('create-guest-payment-intent', {
      body: {
        amount,
        currency,
        items,
        email,
        tempOrderId,
        metadata: guestOrderData.metadata
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }

    return {
      tempOrderId,
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId
    };
  } catch (error) {
    console.error('Error creating guest checkout:', error);
    throw new Error('Failed to create guest checkout');
  }
}

/**
 * Process guest order after successful payment
 * Creates user account and associates order with the new account
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} tempOrderId - Temporary order ID
 * @returns {Promise<{user: Object, order: Object, isNewAccount: boolean}>}
 */
export async function processGuestOrderCompletion(paymentIntentId, tempOrderId) {
  try {
    // Retrieve guest order data
    const guestOrderDataString = sessionStorage.getItem(`guestOrder_${tempOrderId}`);
    if (!guestOrderDataString) {
      throw new Error('Guest order data not found');
    }

    const guestOrderData = JSON.parse(guestOrderDataString);
    const { email, items, amount, currency, metadata } = guestOrderData;

    // Process via Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('process-guest-order', {
      body: {
        paymentIntentId,
        tempOrderId,
        email,
        items,
        amount,
        currency,
        metadata
      }
    });

    if (error) throw error;

    // Clean up session storage
    sessionStorage.removeItem('guestOrderData');
    sessionStorage.removeItem(`guestOrder_${tempOrderId}`);

    return {
      user: data.user,
      order: data.order,
      isNewAccount: data.isNewAccount,
      existingOrdersMerged: data.existingOrdersMerged || false
    };
  } catch (error) {
    console.error('Error processing guest order:', error);
    throw new Error('Failed to process guest order');
  }
}

/**
 * Check if an email already has an account
 * @param {string} email - Email to check
 * @returns {Promise<{exists: boolean, userId?: string}>}
 */
export async function checkEmailExists(email) {
  try {
    const { data, error } = await supabase.functions.invoke('check-email-exists', {
      body: { email }
    });

    if (error) throw error;

    return {
      exists: data.exists,
      userId: data.userId
    };
  } catch (error) {
    console.error('Error checking email:', error);
    return { exists: false };
  }
}

/**
 * Get guest order data from session storage
 * @param {string} tempOrderId - Temporary order ID
 * @returns {Object|null} Guest order data
 */
export function getGuestOrderData(tempOrderId = null) {
  try {
    if (tempOrderId) {
      const data = sessionStorage.getItem(`guestOrder_${tempOrderId}`);
      return data ? JSON.parse(data) : null;
    } else {
      const data = sessionStorage.getItem('guestOrderData');
      return data ? JSON.parse(data) : null;
    }
  } catch (error) {
    console.error('Error retrieving guest order data:', error);
    return null;
  }
}

/**
 * Clear guest order data from session storage
 * @param {string} tempOrderId - Temporary order ID to clear
 */
export function clearGuestOrderData(tempOrderId = null) {
  try {
    if (tempOrderId) {
      sessionStorage.removeItem(`guestOrder_${tempOrderId}`);
    }
    sessionStorage.removeItem('guestOrderData');
  } catch (error) {
    console.error('Error clearing guest order data:', error);
  }
}

/**
 * Validate guest checkout data
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result
 */
export function validateGuestCheckoutData(data) {
  const errors = [];

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push('At least one item is required');
  }

  if (!data.amount || data.amount <= 0) {
    errors.push('Valid amount is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default {
  createGuestCheckout,
  processGuestOrderCompletion,
  checkEmailExists,
  getGuestOrderData,
  clearGuestOrderData,
  validateGuestCheckoutData
};