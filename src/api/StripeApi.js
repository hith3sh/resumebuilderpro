import { supabase } from '@/lib/customSupabaseClient';

// Utility function to format currency
export const formatCurrency = (priceInCents, currency = 'USD') => {
  const amount = (priceInCents / 100).toFixed(2);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Create a Stripe Payment Intent via Supabase Edge Function
 * @param {Object} params - Payment parameters
 * @param {Array} params.items - Items to purchase
 * @param {number} params.amount - Total amount in cents
 * @param {string} params.currency - Currency code (default: USD)
 * @param {Object} params.metadata - Additional metadata
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
export async function createPaymentIntent({
  items,
  amount,
  currency = 'USD',
  metadata = {}
}) {
  try {
    // Get the current session to ensure we have a valid token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        amount,
        currency,
        items,
        metadata
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw error;
    }
    
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

/**
 * Confirm payment and create order record
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {string} userId - User ID from Supabase auth
 * @param {Array} items - Ordered items
 * @returns {Promise<Object>} Order record
 */
export async function confirmPaymentAndCreateOrder(paymentIntentId, userId, items) {
  try {
    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: {
        paymentIntentId,
        userId,
        items
      }
    });

    if (error) throw error;
    
    return data.order;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw new Error('Failed to confirm payment and create order');
  }
}

/**
 * Get user's purchase history
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of user's orders
 */
export async function getUserOrders(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          price,
          quantity
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw new Error('Failed to fetch order history');
  }
}

/**
 * Get order by ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export async function getOrder(orderId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          price,
          quantity
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order details');
  }
}