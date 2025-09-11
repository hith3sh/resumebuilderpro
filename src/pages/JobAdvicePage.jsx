import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const JobAdvicePage = () => {
  const { toast } = useToast();

  const handleReadMore = (title) => {
    toast({
      title: `🚧 The blog post "${title}" isn't available yet, but great content is coming soon! 🚀`,
    });
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 Blog search isn't implemented yet—but it's a great idea for a future update! 🚀",
    });
  };

  const featuredPost = {
    title: '5 Common Resume Mistakes and How to Fix Them',
    excerpt: 'Is your resume getting ignored by recruiters? You might be making one of these common mistakes. Learn how to identify and fix them to significantly boost your interview chances.',
    category: 'Resume Tips',
    date: 'August 28, 2025',
    image: 'A person reviewing a resume with red marks on it'
  };

  const blogPosts = [
    {
      title: 'How to Write a Cover Letter That Gets Noticed',
      category: 'Cover Letters',
      date: 'August 25, 2025',
      image: 'A person typing on a laptop with a coffee cup nearby'
    },
    {
      title: 'Optimizing Your LinkedIn Profile for Job Hunting',
      category: 'LinkedIn',
      date: 'August 22, 2025',
      image: 'A laptop screen showing a professional LinkedIn profile'
    },
    {
      title: 'Navigating the ATS: A Guide for Job Seekers',
      category: 'Job Search',
      date: 'August 19, 2025',
      image: 'An abstract graphic representing a flowchart or system'
    },
  ];

  return (
    <>
      <Helmet>
        <title>Job Advice Blog - ProResume Designs</title>
        <meta name="description" content="Get the latest job search tips, resume advice, and career guidance from the experts at ProResume Designs. Our blog helps you stay ahead in your career." />
        <meta property="og:title" content="Job Advice Blog - ProResume Designs" />
        <meta property="og:description" content="Get the latest job search tips, resume advice and career guidance from the experts at ProResume Designs." />
      </Helmet>
      <div className="pt-24 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              Career Insights & <span className="text-pr-blue-600">Job Advice</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your expert guide to navigating the modern job market.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="relative h-64 lg:h-full rounded-xl overflow-hidden">
                <img  className="w-full h-full object-cover" alt={featuredPost.image} src="https://images.unsplash.com/photo-1686643184179-e4b65e15022e" />
              </div>
              <div>
                <span className="text-pr-blue-600 font-semibold">{featuredPost.category}</span>
                <h2 className="text-3xl font-bold my-3">{featuredPost.title}</h2>
                <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                <p className="text-sm text-gray-500 mb-6">{featuredPost.date}</p>
                <Button onClick={() => handleReadMore(featuredPost.title)}>
                  Read Full Article <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogPosts.map((post, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group">
                <div className="h-48 overflow-hidden">
                  <img  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={post.image} src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                </div>
                <div className="p-6">
                  <span className="text-pr-blue-600 font-semibold text-sm">{post.category}</span>
                  <h3 className="text-xl font-bold my-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{post.date}</p>
                  <button onClick={() => handleReadMore(post.title)} className="font-semibold text-pr-blue-700 hover:text-pr-blue-900">
                    Read More <ArrowRight className="inline w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default JobAdvicePage;