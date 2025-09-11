import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const DisclaimerPage = () => {
  const lastUpdated = "September 8, 2025";

  return (
    <>
      <Helmet>
        <title>Disclaimer - ProResume Designs</title>
        <meta name="description" content="Disclaimer for ProResume Designs' services and website content." />
        <meta property="og:title" content="Disclaimer - ProResume Designs" />
        <meta property="og:description" content="Disclaimer for ProResume Designs' services and website content." />
      </Helmet>
      <div className="bg-gray-50 py-12 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl shadow-lg">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">Disclaimer</h1>
            <p className="text-gray-500 mb-8">Last Updated: {lastUpdated}</p>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p>The information provided by ProResume Designs on our website and through our services is for general informational purposes only. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">No Guarantee of Employment or Interviews</h2>
              <p>ProResume Designs provides professional writing and career-related services to improve the quality and presentation of your professional documents. While our services are designed to enhance your candidacy and increase your chances of securing interviews, we do not, under any circumstances, guarantee job placement, interviews, or any specific career outcomes. Your success is dependent on numerous factors outside of our control, including but not limited to market conditions, your qualifications, your effort in the job search process, and employer decisions.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Professional and Informational Content</h2>
              <p>The content on our website, including blog posts, articles, and advice, is for informational purposes only and does not constitute professional, financial, or legal advice. You should not rely solely on this information and should consult with a qualified professional for advice tailored to your individual situation.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">Resume Analysis Tool</h2>
              <p>Our automated resume analysis tool provides a score and feedback based on a predefined algorithm. This score is an estimate and intended for educational purposes. It may not accurately reflect how a specific company's Applicant Tracking System (ATS) or a human recruiter will evaluate your resume. We are not liable for any discrepancies or outcomes based on the tool's analysis.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Limitation of Liability</h2>
              <p>Under no circumstance shall ProResume Designs, its directors, employees, or affiliates be liable for any direct, indirect, incidental, consequential, or special damages of any kind, including, without limitation, lost profits, lost revenue, or similar damages, arising from your use of our services or website, or for any other claim related in any way to your use of the service. Our liability is limited to the maximum extent permitted by law.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">External Links Disclaimer</h2>
              <p>Our website may contain links to external websites that are not provided or maintained by or in any way affiliated with ProResume Designs. Please note that we do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
              
              <h2 className="text-2xl font-bold mt-8 mb-4">Contact Us</h2>
              <p>If you have any questions about this Disclaimer, please contact us at <a href="mailto:hello@proresumedesigns.com" className="text-pr-blue-600 hover:underline">hello@proresumedesigns.com</a>.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default DisclaimerPage;