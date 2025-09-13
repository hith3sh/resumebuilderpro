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
      // Get the current session to ensure we have a valid token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('User not authenticated');
      }

      // Create a Checkout Session via our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
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
        setError(`Failed to create checkout session: ${error.message}`);
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
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-3">Embedded Checkout - Development Limitation</h3>
        <p className="text-amber-700 mb-4">Stripe's embedded checkout requires HTTPS to function properly. On localhost HTTP, the payment form cannot load due to browser security policies.</p>
        <p className="font-medium text-amber-800 mb-2">Solutions:</p>
        <ul className="list-disc list-inside text-amber-700 space-y-1 mb-4">
          <li>Deploy to a production environment with HTTPS</li>
          <li>Use one of the working payment forms below for local testing</li>
          <li>Set up local HTTPS development environment</li>
        </ul>
        <p className="italic text-amber-600">The embedded checkout will work perfectly in production with HTTPS.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-3">Checkout Error</h3>
        <p className="text-red-700 mb-4">Error: {error}</p>
        <button 
          onClick={() => {setError(null); setClientSecret(null);}} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Create a stable key based on essential checkout data and client secret state
  const checkoutKey = `checkout-${totalAmount}-${items.map(i => `${i.product_id}-${i.quantity || 1}`).join('-')}-${clientSecret || 'no-secret'}`;

  return (
    <div className="rounded-lg overflow-hidden">
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