import React from 'react';
import { motion } from 'framer-motion';

const Stats = () => {
  const stats = [
    {
      number: "10,000+",
      label: "Resumes Created",
      description: "Successfully crafted for professionals worldwide"
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Clients land interviews within 30 days"
    },
    {
      number: "3x",
      label: "More Interviews",
      description: "Compared to self-written resumes"
    },
    {
      number: "48hrs",
      label: "Average Delivery",
      description: "Fast turnaround without compromising quality"
    }
  ];

  return (
    <section className="py-20 bg-pr-blue-600 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Proven Track Record
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Our numbers speak for themselves - we deliver results that transform careers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                className="text-5xl lg:text-6xl font-bold mb-4"
              >
                {stat.number}
              </motion.div>
              <h3 className="text-2xl font-semibold mb-2">{stat.label}</h3>
              <p className="text-blue-100">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;