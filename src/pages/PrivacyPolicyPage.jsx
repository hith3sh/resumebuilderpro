import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
  const lastUpdated = "September 8, 2025";

  return (
    <>
      <Helmet>
        <title>Privacy Policy - ProResume Designs</title>
        <meta name="description" content="Learn how ProResume Designs collects, uses, and protects your personal information." />
        <meta property="og:title" content="Privacy Policy - ProResume Designs" />
        <meta property="og:description" content="Learn how ProResume Designs collects, uses, and protects your personal information." />
      </Helmet>
      <div className="bg-gray-50 py-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Privacy Policy</h1>
            <p className="text-gray-500 mb-8">Last Updated: {lastUpdated}</p>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>ProResume Designs is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your personal information.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>
              <p>We may collect the following types of information:</p>
              <ul>
                <li><strong>Personal Identification Information:</strong> Name, email address, phone number, etc.</li>
                <li><strong>Professional Information:</strong> Career history, skills, education, and resume files you provide.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, such as IP address and browser type.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Your Information</h2>
              <p>Your information is used to:</p>
              <ul>
                <li>Provide and personalize our resume writing and analysis services.</li>
                <li>Process payments and manage your account.</li>
                <li>Communicate with you about your order and our services.</li>
                <li>Improve our website and service offerings.</li>
              </ul>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Security</h2>
              <p>We implement a variety of security measures to maintain the safety of your personal information. Your resume and personal data are stored securely and are only accessible by authorized personnel.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Disclosure</h2>
              <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website or servicing you (e.g., payment processors, cloud storage), so long as those parties agree to keep this information confidential.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Your Rights</h2>
              <p>You have the right to access, update, or delete your personal information. You can manage your profile information by logging into your account or by contacting us directly.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Cookies</h2>
              <p>Our website may use cookies to enhance your experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of the site.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@proresumedesigns.com" className="text-pr-blue-600 hover:underline">hello@proresumedesigns.com</a>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;