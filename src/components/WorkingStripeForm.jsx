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
  const [isLoading, setIsLoading] = useState(false);

  console.log('WorkingStripeForm - stripe:', !!stripe, 'elements:', !!elements);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message);
      } else {
        setMessage("An unexpected error occurred.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div style={{ border: '2px solid blue', padding: '20px', margin: '10px' }}>
      <h3>Working Stripe Form (Payment Intents API)</h3>
      <form id="payment-form" onSubmit={handleSubmit}>
        <PaymentElement id="payment-element" />
        <button 
          disabled={isLoading || !stripe || !elements} 
          id="submit"
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#0570de',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          <span id="button-text">
            {isLoading ? 'Processing...' : 'Pay now'}
          </span>
        </button>
        {message && <div id="payment-message" style={{marginTop: '10px', color: 'red'}}>{message}</div>}
      </form>
    </div>
  );
};

const WorkingStripeForm = ({ clientSecret }) => {
  console.log('WorkingStripeForm clientSecret:', clientSecret);

  if (!clientSecret) {
    return <div>No client secret provided</div>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default WorkingStripeForm;