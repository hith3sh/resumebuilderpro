import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ProductsList from '@/components/ProductsList';

const StorePage = () => {
  return (
    <>
      <Helmet>
        <title>Resume Services - ProResume Designs</title>
        <meta name="description" content="Browse our exclusive resume service packages. Find the perfect solution to elevate your job search." />
        <meta property="og:title" content="Resume Services - ProResume Designs" />
        <meta property="og:description" content="Browse our exclusive resume service packages." />
      </Helmet>
      <div className="pt-24 pb-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              Our <span className="text-pr-blue-600">Resume Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find the perfect package to launch your career to the next level. Each plan is designed for maximum impact.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <ProductsList />
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StorePage;