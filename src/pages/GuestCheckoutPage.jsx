import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, CheckCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatCurrency } from '@/api/StripeApi';
import { processGuestOrderCompletion, getGuestOrderData } from '@/api/GuestCheckoutApi';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Function to get the correct image based on product title
const getProductImage = (title) => {
  const imageMap = {
    'Basic Resume': '/basic_resume.webp',
    'Resume + Cover Letter': '/resume_&_coverletter.webp',
    'Full Branding Package': '/full_branding_package.webp'
  };

  return imageMap[title] || 'https://via.placeholder.com/150';
};

const CheckoutForm = ({ clientSecret, guestData, product, tempOrderId, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
          return_url: `${window.location.origin}/guest-success`,
          payment_method_data: {
            billing_details: {
              name: `${guestData.firstName} ${guestData.lastName}`,
              email: guestData.email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Payment failed',
          description: error.message,
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);

        // Process the guest order completion
        try {
          const result = await processGuestOrderCompletion(paymentIntent.id, tempOrderId);
          onPaymentSuccess(result);
        } catch (processingError) {
          console.error('Error processing guest order:', processingError);
          toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: 'Payment succeeded but there was an issue processing your order. Please contact support.',
          });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: 'There was a problem processing your payment. Please try again.',
      });
    }

    setIsLoading(false);
  };

  if (paymentSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Processing your order and creating your account...
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || isLoading}
      >
        {isLoading ? 'Processing...' : `Pay ${formatCurrency(guestData.amount)}`}
      </Button>
    </form>
  );
};

const GuestCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (initializingRef.current) return;

    if (!location.state?.tempOrderId || !location.state?.clientSecret) {
      toast({
        title: "Invalid checkout session",
        description: "Please start your checkout again.",
        variant: "destructive",
      });
      navigate('/resume-services');
      return;
    }

    initializingRef.current = true;
    setCheckoutData(location.state);
    setIsLoading(false);
  }, [location.state, navigate, toast]);

  const handlePaymentSuccess = async (result) => {
    try {
      if (result.isNewAccount) {
        toast({
          title: "Account Created!",
          description: `Welcome! We've created an account for ${result.user.email}. Check your email for login details.`,
        });
      } else {
        toast({
          title: "Order Complete!",
          description: `Your order has been added to your existing account.`,
        });
      }

      // Navigate to success page
      navigate('/guest-success', {
        state: {
          order: result.order,
          user: result.user,
          isNewAccount: result.isNewAccount
        }
      });
    } catch (error) {
      console.error('Error handling payment success:', error);
      navigate('/');
    }
  };

  if (isLoading || !checkoutData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading checkout...</span>
      </div>
    );
  }

  const { tempOrderId, clientSecret, guestData, product } = checkoutData;

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
      },
    },
  };

  return (
    <>
      <Helmet>
        <title>Guest Checkout - ProResume Designs</title>
        <meta name="description" content="Complete your purchase securely as a guest." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Guest Checkout</h1>
            <p className="text-gray-600 mt-1">Complete your purchase securely</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg h-fit"
            >
              <div className="flex items-center mb-4">
                <ShoppingCart className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              {/* Customer Info */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  <h3 className="font-medium text-blue-900">Customer Details</h3>
                </div>
                <p className="text-sm text-blue-700">
                  {guestData.firstName} {guestData.lastName}
                </p>
                <p className="text-sm text-blue-700">{guestData.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center py-4 border-b border-gray-100 gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{product.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">Quantity: 1</p>
                    <div className="w-32 h-32 rounded-lg overflow-hidden shadow-sm">
                      <img
                        src={getProductImage(product.title)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(product.price_in_cents)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      {formatCurrency(guestData.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Account Creation:</strong> We'll automatically create an account for you after payment and send login details to your email.
                </p>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <Elements stripe={stripePromise} options={stripeOptions}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  guestData={guestData}
                  product={product}
                  tempOrderId={tempOrderId}
                  onPaymentSuccess={handlePaymentSuccess}
                />
              </Elements>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuestCheckoutPage;