import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51S6X1LBJ7w0jc5nAoFVCc0FKs77Qw2mwxirnacakZGh4KykXI79MZ4FBpHjWLenvSmDi4ic1AvXnKJr7jk0JezAV00xvBVromo');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState('');

  console.log('Simple CheckoutForm rendered - stripe:', !!stripe, 'elements:', !!elements);

  useEffect(() => {
    if (stripe && elements) {
      console.log('Stripe and Elements are ready');
      
      // Wait a bit for PaymentElement to mount
      const timer = setTimeout(() => {
        const paymentElement = elements.getElement('payment');
        if (paymentElement) {
          console.log('PaymentElement found');
          
          paymentElement.on('ready', () => {
            console.log('PaymentElement is ready');
          });
          
          paymentElement.on('change', (event) => {
            console.log('PaymentElement changed:', event);
          });
          
          paymentElement.on('focus', () => {
            console.log('PaymentElement focused');
          });
          
          paymentElement.on('blur', () => {
            console.log('PaymentElement blurred');
          });

          paymentElement.on('loaderror', (event) => {
            console.error('PaymentElement load error:', event);
          });
        } else {
          console.log('PaymentElement not found after timeout');
        }
      }, 100);

      // Also check immediately
      const paymentElement = elements.getElement('payment');
      if (paymentElement) {
        console.log('PaymentElement found immediately');
      } else {
        console.log('PaymentElement not found immediately');
      }

      return () => clearTimeout(timer);
    }
  }, [stripe, elements]);

  if (!stripe || !elements) {
    return <div>Loading Stripe...</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid black' }}>
      <h3>Simple Payment Form Test</h3>
      <div style={{ border: '1px solid red', padding: '10px', margin: '10px 0', minHeight: '200px' }}>
        <PaymentElement 
          onReady={() => console.log('PaymentElement onReady callback')}
          onChange={(event) => console.log('PaymentElement onChange:', event)}
        />
      </div>
      <button disabled>Test Button</button>
      {message && <div>{message}</div>}
    </div>
  );
};

const SimpleStripeForm = ({ clientSecret }) => {
  console.log('SimpleStripeForm rendered with clientSecret:', !!clientSecret);
  console.log('Full clientSecret:', clientSecret);
  console.log('ClientSecret format check:', {
    length: clientSecret?.length,
    startsWith_pi: clientSecret?.startsWith('pi_'),
    contains_secret: clientSecret?.includes('_secret_'),
    format: clientSecret?.match(/^pi_[a-zA-Z0-9]+_secret_[a-zA-Z0-9]+$/) ? 'valid' : 'invalid'
  });

  if (!clientSecret) {
    return <div>No client secret provided</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
        loader: 'auto'
      }}
    >
      <CheckoutForm />
    </Elements>
  );
};

export default SimpleStripeForm;