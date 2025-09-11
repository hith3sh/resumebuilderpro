import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCta = () => {
  return (
    <section id="final-cta" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative bg-pr-blue-600 rounded-3xl p-12 text-center text-white overflow-hidden"
        >
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full"></div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto mb-10">
              Stop letting opportunities pass you by. Invest in a professionally written resume and start getting the interviews you deserve.
            </p>
            <Button asChild size="lg" className="bg-white text-pr-blue-600 px-10 py-6 text-lg font-bold hover:bg-gray-200 transition-transform duration-300 hover:scale-105">
              <Link to="/resume-services">
                Resume Services
                <ArrowRight className="ml-3 w-6 h-6" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCta;