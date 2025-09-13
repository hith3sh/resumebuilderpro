import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

// Initialize Stripe
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log('Stripe publishable key:', publishableKey);
const stripePromise = loadStripe(publishableKey);

const CheckoutForm = ({ clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  console.log('CheckoutForm - stripe loaded:', !!stripe);
  console.log('CheckoutForm - elements loaded:', !!elements);
  console.log('CheckoutForm - clientSecret:', clientSecret);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        onError && onError(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
        onSuccess && onSuccess(paymentIntent);
        navigate('/success?payment_intent=' + paymentIntent.id);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-pr-blue-600" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <PaymentElement 
          options={{
            layout: "tabs"
          }}
        />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isLoading}
        className="w-full bg-pr-blue-600 hover:bg-pr-blue-700 text-white py-3"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Complete Payment
          </>
        )}
      </Button>
    </form>
  );
};

const StripeCheckoutForm = ({ 
  clientSecret, 
  onSuccess, 
  onError,
  appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#2563eb',
    }
  }
}) => {
  console.log('StripeCheckoutForm - clientSecret received:', !!clientSecret);
  console.log('StripeCheckoutForm - full clientSecret:', clientSecret);

  if (!clientSecret) {
    console.log('No clientSecret, showing loading...');
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pr-blue-600" />
        <span className="ml-2">Loading payment form...</span>
      </div>
    );
  }

  // Use key prop to force remount when clientSecret changes
  return (
    <Elements
      key={clientSecret}
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance,
      }}
    >
      <CheckoutForm 
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
};

export default StripeCheckoutForm;