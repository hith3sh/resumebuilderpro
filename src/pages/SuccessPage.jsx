import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrder } from '@/api/StripeApi';
import { useToast } from '@/components/ui/use-toast';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const sessionId = searchParams.get('session_id');
  const paymentIntentId = searchParams.get('payment_intent');
  const isPaymentSuccess = !!(sessionId || paymentIntentId);

  useEffect(() => {
    if (sessionId || paymentIntentId) {
      fetchOrderDetails();
    }
  }, [sessionId, paymentIntentId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      if (sessionId) {
        // For embedded checkout, we get session_id
        console.log('Processing successful checkout with session:', sessionId);
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully. We're setting up your account!",
        });

        // For guest checkout, account creation happens in webhook
        // Show appropriate message
        if (!paymentIntentId) {
          toast({
            title: "Account Created!",
            description: "An account has been created for you. Check your email for login details.",
            duration: 5000,
          });
        }
      } else if (paymentIntentId) {
        // For direct payment intents
        console.log('Processing payment intent:', paymentIntentId);
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully.",
        });
      }
    } catch (error) {
      console.error('Error processing success:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was an issue processing your payment confirmation.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4 pt-24">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-pr-blue-600" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isPaymentSuccess ? 'Payment Successful' : 'Information Submitted'} - ProResume Designs</title>
        <meta name="description" content={isPaymentSuccess ? "Thank you for your purchase!" : "Thank you for submitting your information."} />
      </Helmet>
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mt-6 mb-2">
            {isPaymentSuccess ? 'Payment Successful!' : 'Thank You!'}
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            {isPaymentSuccess
              ? 'Your payment has been processed successfully. We will start working on your resume right away!'
              : 'Your information has been submitted successfully. We will be in touch shortly to get started on your resume!'
            }
          </p>

          {sessionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 text-sm">
                <strong>Account Setup:</strong> {paymentIntentId ? 'Your order is linked to your account.' : 'An account has been created for you using your email. Check your inbox for login details!'}
              </p>
            </div>
          )}

          {isPaymentSuccess && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                <strong>Next Steps:</strong> Please complete the questionnaire to provide us with all the details needed for your resume.
              </p>
            </div>
          )}

          <p className="text-gray-500 mb-8">You will receive an email confirmation shortly.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isPaymentSuccess ? (
              <>
                <Button asChild>
                  <Link to="/questionnaire">
                    <CheckCircle className="mr-2 h-4 w-4" /> Complete Questionnaire
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" /> View My Orders
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/resume-services">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Browse More Services
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go to Homepage
                  </Link>
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;