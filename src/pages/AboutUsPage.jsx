import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Target, PenTool, Sparkles } from 'lucide-react';

const AboutUsPage = () => {
  return (
    <>
      <Helmet>
        <title>Our Story - ProResume Designs</title>
        <meta name="description" content="Discover the story behind ProResume Designs. We are a team of career experts and storytellers dedicated to crafting resumes that open doors to dream jobs." />
        <meta property="og:title" content="Our Story - ProResume Designs" />
        <meta property="og:description" content="Discover the story behind ProResume Designs, a team of experts dedicated to helping professionals achieve their career ambitions." />
      </Helmet>
      <div className="pt-24 pb-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
              From <span className="text-pr-blue-600">Potential</span> to <span className="text-pr-blue-600">Profession</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our story isn't just about writing resumes. It's about unlocking the career you were meant to have.
            </p>
          </motion.div>

          <div className="space-y-24">
            <motion.section
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">The Spark of an Idea</h2>
                <p className="text-lg text-gray-700 mb-4">
                  ProResume Designs was born from a simple observation: countless talented professionals were being overlooked. We saw brilliant individuals with incredible experience struggling to get their foot in the door, their resumes lost in a sea of digital applications.
                </p>
                <p className="text-lg text-gray-700">
                  We realized the problem wasn't a lack of skill, but a lack of effective storytelling. A resume isn't just a document; it's your professional handshake, your first impression, and your most powerful marketing tool. We knew we could change the game.
                </p>
              </div>
              <div className="order-1 lg:order-2 h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                <img  className="w-full h-full object-cover" alt="A person looking thoughtfully at a laptop screen in a modern cafe" src="https://images.unsplash.com/photo-1561765013-85bb94024f37" />
              </div>
            </motion.section>

            <motion.section
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                <img  className="w-full h-full object-cover" alt="Close-up of a designer's hands editing a resume on a large monitor" src="https://images.unsplash.com/photo-1703647113881-4bd028df841f" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Mastering the Craft</h2>
                <p className="text-lg text-gray-700 mb-4">
                  We became obsessed with the art and science of resume writing. We dove deep into the world of Applicant Tracking Systems (ATS), learning how to craft documents that sail through the algorithms. We studied the psychology of recruiters, understanding what makes them pause, read, and reach out.
                </p>
                <p className="text-lg text-gray-700">
                  Our approach combines data-driven optimization with the timeless power of narrative. We don't just list your accomplishments; we weave them into a compelling story that showcases your unique value and aligns perfectly with your career goals.
                </p>
              </div>
            </motion.section>

            <motion.section
              className="text-center py-20 bg-white rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-12">Our Core Philosophy</h2>
              <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto px-6">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-pr-blue-100 flex items-center justify-center mb-4">
                    <Target className="w-10 h-10 text-pr-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Precision</h3>
                  <p className="text-gray-600">Every word is chosen with purpose to target the right roles and attract the right attention.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-pr-blue-100 flex items-center justify-center mb-4">
                    <PenTool className="w-10 h-10 text-pr-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Storytelling</h3>
                  <p className="text-gray-600">We transform your career history into a compelling narrative of growth and achievement.</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-pr-blue-100 flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-pr-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Impact</h3>
                  <p className="text-gray-600">Our goal is simple: create documents that get you interviews and help you land your dream job.</p>
                </div>
              </div>
            </motion.section>

            <motion.section
              className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="order-2 lg:order-1">
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Success is Our Story</h2>
                <p className="text-lg text-gray-700 mb-4">
                  Today, ProResume Designs is more than a service; it's a partnership. We've helped thousands of professionals across every industry take the next, most important step in their careers.
                </p>
                <p className="text-lg text-gray-700">
                  Your ambition fuels our passion. We are committed to being your trusted advisors, your expert wordsmiths, and your biggest advocates on the path to career fulfillment. Let's write your next chapter, together.
                </p>
              </div>
              <div className="order-1 lg:order-2 h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                <img  className="w-full h-full object-cover" alt="A confident professional woman smiling and walking into a modern office building" src="https://images.unsplash.com/photo-1676777508421-c51b7b50df1f" />
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutUsPage;