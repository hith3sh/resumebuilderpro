import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const TermsOfServicePage = () => {
  const lastUpdated = "September 8, 2025";

  return (
    <>
      <Helmet>
        <title>Terms of Service - ProResume Designs</title>
        <meta name="description" content="Read the Terms of Service for using ProResume Designs' website and services." />
        <meta property="og:title" content="Terms of Service - ProResume Designs" />
        <meta property="og:description" content="Read the Terms of Service for using ProResume Designs' website and services." />
      </Helmet>
      <div className="bg-gray-50 py-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Terms of Service</h1>
            <p className="text-gray-500 mb-8">Last Updated: {lastUpdated}</p>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>Welcome to ProResume Designs. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Services Provided</h2>
              <p>ProResume Designs provides professional resume writing, career coaching, and related document creation services. We also offer a resume analysis tool to provide automated feedback.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. User Accounts</h2>
              <p>To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Payments and Refunds</h2>
              <p>All payments for services are due upfront. Due to the personalized and digital nature of our work, all sales are final. We do not offer refunds once a service has been rendered or work has begun. However, we are committed to your satisfaction and will work with you to revise documents as outlined in your service agreement.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Intellectual Property</h2>
              <p>All content on this website, including text, graphics, logos, and software, is the property of ProResume Designs or its content suppliers and is protected by international copyright laws. The documents created for you are for your personal use only and may not be resold or redistributed.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Limitation of Liability</h2>
              <p>ProResume Designs does not guarantee job placement or specific career outcomes. Our services are designed to enhance your job-seeking materials. We are not liable for any decisions you make based on our advice or for any direct or indirect damages resulting from the use of our services.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last Updated" date on this page. Your continued use of the site after such changes constitutes your acceptance of the new terms.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p>If you have any questions about these Terms, please contact us at <a href="mailto:hello@proresumedesigns.com" className="text-pr-blue-600 hover:underline">hello@proresumedesigns.com</a>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default TermsOfServicePage;