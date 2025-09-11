import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BeforeAndAfter = () => {
  return (
    <section id="before-after" className="py-20 bg-pr-blue-600 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            From Overlooked to <span className="text-blue-300">Interview-Ready</span>
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            See the dramatic transformation our expert writers bring to your resume.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20"
          >
            <h3 className="text-2xl font-bold text-center mb-4">Before</h3>
            <div className="bg-gray-700 p-6 rounded-lg opacity-75">
              <p className="font-mono text-sm text-gray-300 leading-relaxed">
                <span className="font-bold">John Doe</span><br/>
                <span className="text-gray-400">jobseeker@email.com | 555-555-5555</span><br/><br/>
                Responsible for managing projects. Duties included planning, executing, and finalizing projects. Worked with team members. Handled customer communication.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-2xl shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-center mb-4 text-gray-900">After</h3>
            <div className="bg-gray-100 p-6 rounded-lg">
               <p className="font-sans text-sm text-gray-800 leading-relaxed">
                <span className="font-bold text-pr-blue-600 text-base">John Doe | PMP</span><br/>
                <span className="text-gray-600">john.doe@email.com | 555-555-5555 | linkedin.com/in/johndoe</span><br/><br/>
                <span className="font-bold text-pr-blue-700">Strategic Project Manager</span> with 5+ years of experience leading cross-functional teams to deliver projects on time and 15% under budget. Proven ability to drive product adoption by 40%.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAndAfter;