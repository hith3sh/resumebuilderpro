import React from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, UserCheck, FileText } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UploadCloud,
      title: "Upload Your Info",
      description: "Securely upload your current resume and fill out our simple questionnaire about your career goals."
    },
    {
      icon: UserCheck,
      title: "We Match You With a Writer",
      description: "Our system analyzes your profile to match you with a certified writer who specializes in your industry."
    },
    {
      icon: FileText,
      title: "Receive Your New Resume",
      description: "Get your professionally written, ATS-optimized resume within days, ready to land you more interviews."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            How It <span className="text-pr-blue-600">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined process makes it easy to get a resume that gets results.
          </p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-300 -translate-y-1/2"></div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-pr-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-12 h-12 text-pr-blue-600" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-pr-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-50">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;