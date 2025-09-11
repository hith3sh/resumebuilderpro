import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { getProduct, initializeCheckout } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShoppingCart, ArrowLeft, Info, Star } from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await getProduct(id);
        setProduct(productData);
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch product details.',
        });
        navigate('/resume-services');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const handlePurchase = async () => {
    if (!selectedVariant) return;
    setIsProcessing(true);

    try {
      const successUrl = `${window.location.origin}/questionnaire?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = window.location.origin + window.location.pathname;

      const checkoutPayload = {
        items: [{ variant_id: selectedVariant.id, quantity: 1 }],
        successUrl,
        cancelUrl,
        billing_address_collection: 'never',
        customer_fields_mode: 'required_fields',
        required_fields: ['email', 'full_name', 'phone'],
      };
      
      const { url } = await initializeCheckout(checkoutPayload);
      window.location.href = url;

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout Error',
        description: 'There was a problem initiating checkout. Please try again.',
      });
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 text-pr-blue-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => navigate('/resume-services')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Store
        </Button>
      </div>
    );
  }
  
  const currentPrice = selectedVariant?.sale_price_in_cents_formatted || selectedVariant?.price_in_cents_formatted;
  const originalPrice = selectedVariant?.sale_price_in_cents_formatted ? selectedVariant?.price_in_cents_formatted : null;

  return (
    <>
      <Helmet>
        <title>{product.title} - ProResume Designs</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>
      <div className="bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start"
          >
            <div className="w-full">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="aspect-w-1 aspect-h-1"
              >
                <img
                  src={product.image || 'https://via.placeholder.com/600'}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{product.title}</h1>
                
                <div className="mt-4 flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="ml-2 text-sm text-gray-500">(5.0/5) from 100+ reviews</p>
                </div>
                
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">{currentPrice}</span>
                  {originalPrice && (
                    <span className="ml-2 text-xl text-gray-500 line-through">{originalPrice}</span>
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="prose prose-lg text-gray-600"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />

              {product.variants.length > 1 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h3 className="text-sm text-gray-900 font-medium">Service Level:</h3>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {product.variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                        onClick={() => setSelectedVariant(variant)}
                        className="w-full"
                      >
                        {variant.title}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="pt-6"
              >
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {isProcessing ? 'Processing...' : 'Purchase Service'}
                </Button>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mt-6"
              >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">After your purchase, you'll be redirected to a questionnaire to provide all necessary details for your resume.</p>
                    </div>
                  </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;