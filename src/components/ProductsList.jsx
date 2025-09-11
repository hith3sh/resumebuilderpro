import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Check, ArrowRight } from 'lucide-react';
import { getProducts, getProductQuantities, formatCurrency } from '@/api/EcommerceApi';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2Y5ZWZmIi8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzQzMzk4MiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K";

const ProductCard = ({ product, index }) => {
  const isPopular = product.title === 'Resume + Cover Letter';
  const displayVariant = useMemo(() => product.variants[0], [product]);
  const hasSale = useMemo(() => displayVariant && displayVariant.sale_price_in_cents !== null, [displayVariant]);
  const displayPrice = useMemo(() => formatCurrency(hasSale ? displayVariant.sale_price_in_cents : displayVariant.price_in_cents, product.currency), [product, displayVariant, hasSale]);
  const originalPrice = useMemo(() => hasSale ? formatCurrency(displayVariant.price_in_cents, product.currency) : null, [product, displayVariant, hasSale]);
  const features = useMemo(() => {
    try {
      const parsed = JSON.parse(product.description);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      const strippedHtml = product.description?.replace(/<[^>]+>/g, '');
      return strippedHtml ? [strippedHtml] : [];
    }
  }, [product.description]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative rounded-2xl p-8 shadow-lg border hover:shadow-2xl transition-all duration-300 flex flex-col ${
        isPopular 
          ? 'bg-pr-blue-500 text-white border-pr-blue-600' 
          : 'bg-white border-gray-100'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold shadow-md">
          Most Popular
        </div>
      )}
      
      <div className="block flex-grow flex flex-col">
        <div className="relative mb-6">
            <img
              src={product.image ||placeholderImage}
              alt={product.title}
              className="w-full h-56 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
        </div>
        
        <div className="flex-grow">
          <h3 className={`text-2xl font-bold mb-3 ${isPopular ? 'text-white' : 'text-gray-900'}`}>{product.title}</h3>
          <p className={`${isPopular ? 'text-pr-blue-100' : 'text-gray-600'} mb-4 min-h-[40px]`}>{product.subtitle || ' '}</p>
          
          <div className="flex items-baseline mb-6">
            <span className={`text-4xl font-bold ${isPopular ? 'text-white' : 'text-pr-blue-600'}`}>{displayPrice}</span>
            {hasSale && (
                <span className={`text-lg line-through ml-2 ${isPopular ? 'text-pr-blue-200' : 'text-gray-400'}`}>{originalPrice}</span>
            )}
          </div>
          
          <ul className="space-y-3 mb-8">
            {features.map((feature, featureIndex) => (
              <li key={featureIndex} className="flex items-start space-x-3">
                <Check className={`w-5 h-5 mt-1 shrink-0 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                <span className={isPopular ? 'text-pr-blue-100' : 'text-gray-700'}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <Button 
        asChild
        className={`w-full mt-auto ${isPopular 
          ? 'bg-white text-pr-blue-600 hover:bg-gray-200' 
          : 'bg-pr-blue-600 text-white hover:bg-pr-blue-700'}`}
      >
        <Link to={`/product/${product.id}`}>
            View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </motion.div>
  );
};

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductsWithQuantities = async () => {
      try {
        setLoading(true);
        setError(null);

        const productsResponse = await getProducts({ sort_by: 'order', order: 'ASC' });

        if (productsResponse.products.length === 0) {
          setProducts([]);
          return;
        }

        const productIds = productsResponse.products.map(product => product.id);

        const quantitiesResponse = await getProductQuantities({
          fields: 'inventory_quantity',
          product_ids: productIds
        });

        const variantQuantityMap = new Map();
        quantitiesResponse.variants.forEach(variant => {
          variantQuantityMap.set(variant.id, variant.inventory_quantity);
        });

        const productsWithQuantities = productsResponse.products.map(product => ({
          ...product,
          variants: product.variants.map(variant => ({
            ...variant,
            inventory_quantity: variantQuantityMap.get(variant.id) ?? variant.inventory_quantity
          }))
        }));

        setProducts(productsWithQuantities);
      } catch (err) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductsWithQuantities();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-16 w-16 text-pr-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">
        <p>Error loading products: {error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8 bg-gray-100 rounded-lg">
        <p>No products available at the moment. Please add your services in the Online Store integration.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductsList;