import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CalendarClock, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Guarantee = () => {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: "60-Day Interview Guarantee",
      description: "If you don't get more interviews within 60 days of receiving your final resume, we'll rewrite it for free."
    },
    {
      icon: CalendarClock,
      title: "On-Time Delivery",
      description: "We promise to deliver your professionally crafted resume within the agreed-upon timeframe, typically 2-3 business days."
    },
    {
      icon: Repeat,
      title: "Unlimited Revisions",
      description: "Your satisfaction is paramount. We offer unlimited revisions for 7 days after you receive your first draft."
    }
  ];

  return (
    <section id="guarantee" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Our <span className="text-pr-blue-600">Promise to You</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We stand behind our work with a rock-solid guarantee to ensure your peace of mind.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
          {guarantees.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="w-20 h-20 bg-pr-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                <item.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guarantee;