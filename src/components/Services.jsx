import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Layers, Award, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { getProducts } from '@/api/ProductsApi';
import { formatCurrency } from '@/api/StripeApi';

const ServiceCard = ({ service, index }) => {
  const { toast } = useToast();
  const isPopular = service.title === 'Resume + Cover Letter';

  const handleServiceClick = () => {
    toast({
      title: '🚧 Product Not Found 🚧',
      description: "This service isn't linked to a product. Please ensure titles match in your Online Store.",
      variant: 'destructive',
    });
  };

  const hasSale = useMemo(() => service.salePrice, [service.salePrice]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative rounded-2xl p-8 shadow-lg border hover:shadow-2xl transition-all duration-300 flex flex-col ${
        isPopular 
          ? 'bg-pr-blue-500 text-white border-pr-blue-600 lg:scale-105' 
          : 'bg-white border-gray-100'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold shadow-md">
          Most Popular
        </div>
      )}

      <div className="flex-grow flex flex-col">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
          isPopular ? 'bg-white/20' : 'bg-pr-blue-600'
        }`}>
          <service.icon className={`w-8 h-8 ${isPopular ? 'text-white' : 'text-white'}`} />
        </div>
        <h3 className={`text-2xl font-bold mb-3 ${isPopular ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
        <p className={`${isPopular ? 'text-pr-blue-100' : 'text-gray-600'} mb-4 flex-grow min-h-[72px]`}>{service.description}</p>
        
        <div className="flex items-baseline mb-6">
          <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-pr-blue-600'}`}>
            {service.displayPrice}
          </span>
          {hasSale && (
            <span className={`text-lg line-through ml-3 ${isPopular ? 'text-pr-blue-200' : 'text-gray-400'}`}>
              {service.originalPrice}
            </span>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {service.features.map((feature, featureIndex) => (
            <li key={featureIndex} className="flex items-start space-x-3">
              {feature.included ? (
                <Check className={`w-5 h-5 mt-1 shrink-0 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
              ) : (
                <X className={`w-5 h-5 mt-1 shrink-0 ${isPopular ? 'text-red-300' : 'text-red-500'}`} />
              )}
              <span className={isPopular ? 'text-pr-blue-100' : 'text-gray-700'}>{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        onClick={!service.productId ? handleServiceClick : undefined}
        asChild={!!service.productId}
        className={`w-full mt-auto ${isPopular 
          ? 'bg-white text-pr-blue-600 hover:bg-gray-200' 
          : 'bg-pr-blue-600 text-white hover:bg-pr-blue-700'}`}
        disabled={!service.productId}
      >
        {service.productId ? (
            <Link to={`/product/${service.productId}`}>Choose Package</Link>
        ) : (
            <span>Not Available</span>
        )}
      </Button>
    </motion.div>
  );
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const serviceTemplates = useMemo(() => [
    {
      icon: FileText,
      title: "Basic Resume",
      description: "Get a professionally written, ATS-friendly resume to land more interviews.",
      features: [
        { text: "Optimized Resume (ATS-friendly)", included: true },
        { text: "Targeted Cover Letter", included: false },
        { text: "Optimized LinkedIn Profile", included: false },
        { text: "Alignment across all assets", included: false },
        { text: "Boosted recruiter visibility", included: true },
        { text: "Increased interview opportunities", included: true },
      ],
      matchWith: "Basic Resume", // Direct match with database product name
    },
    {
      icon: Layers,
      title: "Resume + Cover Letter",
      description: "A powerful duo to make a strong impression on recruiters.",
      features: [
        { text: "Optimized Resume (ATS-friendly)", included: true },
        { text: "Targeted Cover Letter", included: true },
        { text: "Optimized LinkedIn Profile", included: false },
        { text: "Alignment across all assets", included: false },
        { text: "Boosted recruiter visibility", included: true },
        { text: "Increased interview opportunities", included: true },
      ],
      matchWith: "Resume + Cover Letter", // Direct match with database product name
    },
    {
      icon: Award,
      title: "Full Branding Package",
      description: "The complete package to dominate your job search.",
      features: [
        { text: "Optimized Resume (ATS-friendly)", included: true },
        { text: "Targeted Cover Letter", included: true },
        { text: "Optimized LinkedIn Profile", included: true },
        { text: "Alignment across all assets", included: true },
        { text: "Boosted recruiter visibility", included: true },
        { text: "Increased interview opportunities", included: true },
      ],
      matchWith: "Full Branding Package", // Direct match with database product name
    }
  ], []);

  useEffect(() => {
    const fetchAndMapProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const { products } = await getProducts();
        
        // Debug: Log products to see if original_price_cents is included
        console.log('Products from API:', products);
        
        const productsMap = new Map(products.map(p => [p.title, p]));

        const mappedServices = serviceTemplates.map(template => {
          const product = productsMap.get(template.matchWith);
          if (product) {
            console.log(`Product ${template.matchWith}:`, {
              price_in_cents: product.price_in_cents,
              original_price_cents: product.original_price_cents,
              hasOriginalPrice: !!product.original_price_cents
            });
            
            const displayPrice = formatCurrency(product.price_in_cents, product.currency);
            const originalPrice = product.original_price_cents 
              ? formatCurrency(product.original_price_cents, product.currency)
              : null;
            const hasSale = product.original_price_cents && product.original_price_cents > product.price_in_cents;

            console.log(`Mapped service ${template.matchWith}:`, {
              displayPrice,
              originalPrice,
              hasSale
            });

            return {
              ...template,
              productId: product.id,
              displayPrice,
              originalPrice,
              salePrice: hasSale ? product.price_in_cents : null,
              description: product.subtitle || template.description,
            };
          }
          return { ...template, productId: null, displayPrice: 'N/A', originalPrice: null, salePrice: null };
        });

        // Sort services by price (lowest to highest)
        const sortedServices = [...mappedServices].sort((a, b) => {
          const priceA = parseFloat(a.displayPrice.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.displayPrice.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });

        setServices(sortedServices);
      } catch (err) {
        setError(err.message || 'Failed to load services.');
        setServices(serviceTemplates.map(t => ({ ...t, productId: null, displayPrice: 'Error', originalPrice: null, salePrice: null })));
      } finally {
        setLoading(false);
      }
    };

    fetchAndMapProducts();
  }, [serviceTemplates]);

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-16 w-16 text-pr-blue-600 animate-spin" />
          </div>
        ) : error ? (
           <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg flex justify-center items-center">
             <AlertCircle className="h-6 w-6 mr-3" />
            <p>Error loading services: {error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 items-start">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Services;