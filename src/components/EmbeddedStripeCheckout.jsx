import React, { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { supabase } from '@/lib/customSupabaseClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const EmbeddedStripeCheckout = ({ items, totalAmount, metadata = {} }) => {
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const fetchClientSecret = async () => {
    if (clientSecret) {
      return clientSecret; // Return existing client secret to prevent re-fetching
    }

    console.log('Fetching client secret for embedded checkout...');
    setError(null);
    
    try {
      // Create a Checkout Session via our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items,
          totalAmount,
          metadata: {
            source: 'embedded_checkout',
            ...metadata
          }
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        setError('Failed to create checkout session');
        throw error;
      }

      console.log('Checkout session created successfully:', data);
      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (err) {
      console.error('Fetch client secret error:', err);
      setError(err.message || 'Unknown error occurred');
      throw err;
    }
  };

  // Check if we're on localhost HTTP and show appropriate message
  const isLocalhost = window.location.protocol === 'http:' && window.location.hostname === 'localhost';

  if (isLocalhost) {
    return (
      <div style={{ border: '2px solid orange', padding: '20px', margin: '10px' }}>
        <h3>⚠️ Embedded Checkout - Development Limitation</h3>
        <p>Stripe's embedded checkout requires HTTPS to function properly. On localhost HTTP, the payment form cannot load due to browser security policies.</p>
        <p><strong>Solutions:</strong></p>
        <ul>
          <li>Deploy to a production environment with HTTPS</li>
          <li>Use one of the working payment forms below for local testing</li>
          <li>Set up local HTTPS development environment</li>
        </ul>
        <p><em>The embedded checkout will work perfectly in production with HTTPS.</em></p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ border: '2px solid red', padding: '20px', margin: '10px' }}>
        <h3>Checkout Error</h3>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={() => {setError(null); setClientSecret(null);}} style={{ padding: '10px', marginTop: '10px' }}>
          Try Again
        </button>
      </div>
    );
  }

  // Create a stable key based on essential checkout data
  const checkoutKey = `checkout-${totalAmount}-${items.map(i => `${i.product_id}-${i.quantity || 1}`).join('-')}`;

  return (
    <div style={{ border: '2px solid green', padding: '20px', margin: '10px' }}>
      <h3>Embedded Stripe Checkout</h3>
      <EmbeddedCheckoutProvider
        key={checkoutKey}
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

export default EmbeddedStripeCheckout;