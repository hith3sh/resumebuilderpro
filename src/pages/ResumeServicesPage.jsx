import React from 'react';
import { Helmet } from 'react-helmet';
import Services from '@/components/Services';
import { motion } from 'framer-motion';
import { usePageTracking } from '@/hooks/usePageTracking';

const ResumeServicesPage = () => {
  usePageTracking('/resume-services');
  return (
    <>
      <Helmet>
        <title>Resume Services - ProResume Designs</title>
        <meta name="description" content="Explore our professional resume writing packages, from basic resume optimization to full branding packages including cover letters and LinkedIn profiles." />
        <meta property="og:title" content="Resume Services - ProResume Designs" />
        <meta property="og:description" content="Explore our professional resume writing packages, from basic resume optimization to full branding packages including cover letters and LinkedIn profiles." />
      </Helmet>
      <div className="pt-24 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl lg:text-6xl font-bold mb-4">
            Our <span className="text-pr-blue-600">Resume Services</span>
          </h1>
        </motion.div>
        <Services />
      </div>
    </>
  );
};

export default ResumeServicesPage;