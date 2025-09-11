import React from 'react';
import { Helmet } from 'react-helmet';
import Testimonials from '@/components/Testimonials';
import { motion } from 'framer-motion';

const TestimonialsPage = () => {
  return (
    <>
      <Helmet>
        <title>Client Testimonials - ProResume Designs</title>
        <meta name="description" content="Read success stories from thousands of professionals who landed their dream jobs with help from ProResume Designs. See what our clients are saying." />
        <meta property="og:title" content="Client Testimonials - ProResume Designs" />
        <meta property="og:description" content="Read success stories from thousands of professionals who landed their dream jobs with help from ProResume Designs." />
      </Helmet>
      <div className="pt-24 bg-gray-50">
         <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center pb-16"
        >
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            Success <span className="text-pr-blue-600">Stories</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how we've helped professionals like you achieve their career goals.
          </p>
        </motion.div>
        <Testimonials />
      </div>
    </>
  );
};

export default TestimonialsPage;