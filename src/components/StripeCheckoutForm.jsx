import React, { useState } from 'react';
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
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
          <PaymentElement 
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: '',
                  email: '',
                }
              }
            }}
          />
        </div>
        
        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-pr-blue-600 hover:bg-pr-blue-700 text-white py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Complete Payment
            </>
          )}
        </Button>
      </form>
    </div>
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