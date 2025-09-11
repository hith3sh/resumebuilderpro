import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqData = [
  {
    question: "What is the turnaround time for a resume?",
    answer: "Our standard turnaround time is 2-3 business days. We also offer a 24-hour rush service for an additional fee if you need it faster."
  },
  {
    question: "Are your resumes ATS-friendly?",
    answer: "Absolutely! All our resumes are specifically designed and formatted to pass through Applicant Tracking Systems (ATS) used by the majority of companies today. We ensure your skills and experience get seen by a human recruiter."
  },
  {
    question: "Who will be writing my resume?",
    answer: "Your resume will be crafted by a certified professional resume writer who has experience in your specific industry. We match you with a writer who understands the nuances and keywords relevant to your career path."
  },
  {
    question: "What if I'm not satisfied with my resume?",
    answer: "Your satisfaction is our priority. We offer a 7-day period of unlimited revisions after you receive the first draft. We'll work with you to make any changes until you are 100% happy with the final product."
  },
  {
    question: "Do you offer services other than resumes?",
    answer: "Yes! We offer a range of career services, including professionally written cover letters, LinkedIn profile optimization, and interview coaching. You can choose these in our packages or as standalone services."
  }
];

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      layout 
      className="border-b border-gray-200 py-6"
    >
      <motion.button
        className="w-full flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-gray-800">{question}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isOpen ? 'minus' : 'plus'}
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <Minus className="w-5 h-5 text-pr-blue-600" /> : <Plus className="w-5 h-5 text-pr-blue-600" />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-gray-600 mt-4 pr-10">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Faq = () => {
  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Frequently Asked <span className="text-pr-blue-600">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <FaqItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Faq;