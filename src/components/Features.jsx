import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Trophy, Clock, CheckCircle } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: "ATS-Optimized",
      description: "Our resumes pass through Applicant Tracking Systems with 95% success rate"
    },
    {
      icon: Zap,
      title: "Fast Turnaround",
      description: "Get your professional resume delivered within 48 hours or less"
    },
    {
      icon: Users,
      title: "Expert Writers",
      description: "Certified resume writers with 10+ years of industry experience"
    },
    {
      icon: Trophy,
      title: "Proven Results",
      description: "3x higher interview callback rate compared to DIY resumes"
    },
    {
      icon: Clock,
      title: "Unlimited Revisions",
      description: "We work with you until you're 100% satisfied with your resume"
    },
    {
      icon: CheckCircle,
      title: "Money-Back Guarantee",
      description: "Full refund if you don't get an interview within 60 days"
    }
  ];

  return (
    <section className="py-20 bg-blue-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Why Choose <span className="text-pr-blue-600">ProResume Designs</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine industry expertise with cutting-edge technology to deliver resumes that get results
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-pr-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;