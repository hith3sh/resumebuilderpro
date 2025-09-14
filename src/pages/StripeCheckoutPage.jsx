import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import EmbeddedStripeCheckout from '@/components/EmbeddedStripeCheckout';
import { formatCurrency } from '@/api/StripeApi';

// Function to get the correct image based on product title
const getProductImage = (title) => {
  const imageMap = {
    'Basic Resume': '/basic_resume.webp',
    'Resume + Cover Letter': '/resume_&_coverletter.webp',
    'Full Branding Package': '/full_branding_package.webp'
  };
  
  return imageMap[title] || 'https://via.placeholder.com/150';
};

const StripeCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const initializingRef = useRef(false);

  // Initialize checkout data
  useEffect(() => {
    // Prevent multiple initializations
    if (initializingRef.current) {
      return;
    }

    if (!location.state?.items) {
      toast({
        title: "No items found",
        description: "Please select items to checkout.",
        variant: "destructive",
      });
      navigate('/resume-services');
      return;
    }

    // Check if this is a guest checkout
    const isGuestCheckout = location.state?.isGuest || !user;

    // For guest checkout, we don't require login
    if (!isGuestCheckout && !user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a purchase.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Mark as initializing
    initializingRef.current = true;

    const checkoutItems = location.state.items;
    const total = checkoutItems.reduce((sum, item) =>
      sum + (item.price * (item.quantity || 1)), 0
    );

    console.log('Setting up checkout - only should happen once');
    setItems(checkoutItems);
    setTotalAmount(total);
    setIsGuest(isGuestCheckout);
    setIsLoading(false);
  }, [location.state, user, navigate, toast]);


  return (
    <>
      <Helmet>
        <title>Checkout - ProResume Designs</title>
        <meta name="description" content="Complete your purchase securely with Stripe." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isGuest ? 'Guest Checkout' : 'Secure Checkout'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isGuest ? 'Complete your purchase securely as a guest' : 'Complete your purchase safely and securely'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg h-fit"
            >
              <div className="flex items-center mb-4">
                <ShoppingCart className="w-5 h-5 mr-2 text-pr-blue-600" />
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>

              {/* Guest Info Section */}
              {isGuest && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <h3 className="font-medium text-blue-900">Guest Checkout</h3>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    An account will be created for you after successful payment
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center py-4 border-b border-gray-100 gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Quantity: {item.quantity || 1}
                      </p>
                      <div className="w-32 h-32 rounded-lg overflow-hidden shadow-sm">
                        <img
                          src={getProductImage(item.product_name)}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {formatCurrency(item.price * (item.quantity || 1))}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total</span>
                    <span className="text-pr-blue-600">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              {/* <h2 className="text-xl font-semibold mb-4">Payment Information</h2> */}
              
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pr-blue-600"></div>
                  <span className="ml-2">Setting up secure payment...</span>
                </div>
              ) : (
                <div>
                  <EmbeddedStripeCheckout
                    items={items}
                    totalAmount={totalAmount}
                    isGuest={isGuest}
                    guestData={null}
                    metadata={{
                      user_email: user?.email || 'guest_checkout',
                      isGuest: isGuest,
                      checkout_type: isGuest ? 'guest' : 'authenticated'
                    }}
                  />
                </div>
              )}
              
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

export default StripeCheckoutPage;