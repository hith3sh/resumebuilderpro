import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SuccessPage = () => {
  return (
    <>
      <Helmet>
        <title>Information Submitted - ProResume Designs</title>
        <meta name="description" content="Thank you for submitting your information." />
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
          <h1 className="text-4xl font-bold text-gray-800 mt-6 mb-2">Thank You!</h1>
          <p className="text-gray-600 text-lg mb-6">Your information has been submitted successfully. We will be in touch shortly to get started on your resume!</p>
          
          <p className="text-gray-500 mb-8">You will receive an email confirmation shortly.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/store">
                <ShoppingBag className="mr-2 h-4 w-4" /> Browse More Services
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go to Homepage
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SuccessPage;