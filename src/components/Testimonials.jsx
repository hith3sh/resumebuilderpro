import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Manager",
      industry: "Technology & SaaS",
      content: "ProResume Designs transformed my career! I went from getting zero responses to landing 5 interviews in just 2 weeks. The quality is exceptional.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      industry: "Fintech",
      content: "The ATS optimization really works. My resume now passes through all the screening systems and I'm getting calls from top tech companies.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Financial Analyst",
      industry: "Investment Banking",
      content: "Worth every penny! The writers understood my industry perfectly and highlighted my achievements in a way I never could. Highly recommended!",
      rating: 5,
    },
    {
      name: "David Thompson",
      role: "Project Manager",
      industry: "Construction & Engineering",
      content: "I was skeptical at first, but the results speak for themselves. Got my dream job within a month of using their service. Amazing work!",
      rating: 5,
    },
    {
      name: "Jessica Lee",
      role: "Registered Nurse",
      industry: "Healthcare",
      content: "Transitioning to a new healthcare specialty was tough. My new resume opened doors I didn't think were possible. I'm so grateful!",
      rating: 5,
    },
    {
      name: "Robert Martinez",
      role: "Sales Director",
      industry: "Enterprise Software",
      content: "Exceptional service! The team understood my sales background and created a resume that showcases my achievements perfectly. Highly professional.",
      rating: 5,
    },
    {
      name: "Olivia Green",
      role: "Graphic Designer",
      industry: "Creative & Media",
      content: "They perfectly captured my creative portfolio in a professional format. The visual appeal of my new resume is stunning. I've had so many compliments!",
      rating: 5,
    },
    {
      name: "Ben Carter",
      role: "Product Manager",
      industry: "E-commerce",
      content: "The impact was immediate. The clarity and focus of my new resume helped me land a senior product role at a fast-growing startup.",
      rating: 5,
    },
    {
      name: "Chloe Davis",
      role: "Human Resources Generalist",
      industry: "Corporate HR",
      content: "As an HR professional, I'm picky about resumes. This team exceeded all my expectations. They truly are experts in their field.",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center mb-6">
                <img
                  className="w-16 h-16 rounded-full object-cover mr-4"
                  alt={`${testimonial.name} profile photo`}
                  src={`https://i.pravatar.cc/150?u=${testimonial.name}`} />
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600">{testimonial.role}</p>
                  <p className="text-sm font-semibold text-pr-blue-600">{testimonial.industry}</p>
                </div>
              </div>

              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              <div className="relative flex-grow">
                <Quote className="w-8 h-8 text-pr-blue-100 absolute -top-2 -left-2" />
                <p className="text-gray-700 leading-relaxed pl-6">
                  "{testimonial.content}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;