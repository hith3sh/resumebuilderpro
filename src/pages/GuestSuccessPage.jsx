import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, User, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/api/StripeApi';

const GuestSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state?.order) {
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!location.state?.order) {
    return null;
  }

  const { order, user, isNewAccount } = location.state;

  return (
    <>
      <Helmet>
        <title>Order Complete - ProResume Designs</title>
        <meta name="description" content="Your order has been successfully completed." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 text-center"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isNewAccount ? 'Welcome to ProResume!' : 'Order Complete!'}
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
            </motion.div>

            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-50 rounded-lg p-6 mb-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono text-gray-900">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium capitalize">
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Account Information */}
            {isNewAccount && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6"
              >
                <div className="flex items-center justify-center mb-4">
                  <User className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Account Created</h3>
                </div>
                <p className="text-blue-700 text-sm mb-3">
                  We've created an account for you with email: <strong>{user.email}</strong>
                </p>
                <div className="flex items-center justify-center text-sm text-blue-600">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>Check your email for login instructions</span>
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6"
            >
              <h3 className="font-semibold text-amber-900 mb-3">What's Next?</h3>
              <div className="text-sm text-amber-800 space-y-2">
                <p>📝 You'll be redirected to a questionnaire to provide details for your resume</p>
                <p>⏰ Our team will start working on your order within 24 hours</p>
                <p>📧 You'll receive updates via email throughout the process</p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="space-y-3"
            >
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate('/questionnaire', { state: { orderId: order.id } })}
              >
                Start Questionnaire
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  {isNewAccount ? 'Login to Your Account' : 'Go to Dashboard'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <p className="text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:support@proresumedesign.com" className="text-blue-600 hover:underline">
                  support@proresumedesign.com
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default GuestSuccessPage;