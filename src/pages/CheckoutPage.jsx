import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { initializeCheckout } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { product, selectedVariant } = location.state || {};

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  if (!product || !selectedVariant) {
    return <Navigate to="/resume-services" replace />;
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const successUrl = `${window.location.origin}/questionnaire?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = window.location.origin + location.pathname;

      const checkoutPayload = {
        items: [{ variant_id: selectedVariant.id, quantity: 1 }],
        successUrl,
        cancelUrl,
        billing_address_collection: 'never',
        checkout_data: {
          email: formData.email,
          custom_fields: [
            {
              id: 'full_name',
              value: `${formData.firstName} ${formData.lastName}`.trim(),
            },
            {
              id: 'phone',
              value: formData.phone,
            },
          ],
        },
      };

      const { url } = await initializeCheckout(checkoutPayload);
      window.location.href = url;

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'There was a problem initializing checkout. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  const currentPrice = selectedVariant.sale_price_in_cents_formatted || selectedVariant.price_in_cents_formatted;

  return (
    <>
      <Helmet>
        <title>Checkout - ProResume Designs</title>
        <meta name="description" content="Complete your purchase for ProResume Designs services." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-8">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 border-b pb-3">Order Summary</h2>
                <div className="flex items-center space-x-4">
                  <img src={product.image} alt={product.title} className="w-20 h-20 rounded-md object-cover" />
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-gray-500">{selectedVariant.title}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total</span>
                    <span>{currentPrice}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information Form */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                  </div>
                  <Button type="submit" size="lg" className="w-full mt-6" disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Proceed to Payment
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;