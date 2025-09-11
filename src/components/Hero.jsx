import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { toast } = useToast();

  const handleLearnMore = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast({
        title: "🚧 Learn More feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀"
      });
    }
  };

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img  className="w-full h-full object-cover object-[center_60%]" alt="Professionals in business attire shaking hands in a modern office during a job interview" src="https://images.unsplash.com/photo-1698047681820-f26b00b6c639" />
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-4 max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
        >
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>Trusted by 10,000+ professionals</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl lg:text-7xl font-bold leading-tight drop-shadow-lg"
        >
          Land Your <span className="text-blue-300">Dream Job</span> With Expert Resumes
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto mt-6"
        >
          Transform your career with professionally crafted resumes that increase your interview chances by 3x. Our expert writers know what employers want.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-pr-blue-600 text-white px-8 py-4 text-lg pulse-glow hover:bg-pr-blue-700">
              <Link to="/resume-services">
                Resume Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLearnMore}
              className="px-8 py-4 text-lg bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-pr-blue-600"
            >
              Learn More
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;