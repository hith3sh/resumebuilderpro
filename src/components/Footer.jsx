import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleSocialClick = (name) => {
    toast({
      title: `🚧 ${name} link isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀`
    });
  };

  const footerLinks = {
    services: [
      { name: 'Basic Resume', path: '/resume-services' },
      { name: 'Resume + Cover Letter', path: '/resume-services' },
      { name: 'Full Branding Package', path: '/resume-services' },
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Store', path: '/store' },
      { name: 'Job Advice', path: '/job-advice' },
      { name: 'Testimonials', path: '/testimonials' },
    ],
    support: [
      { name: 'Contact Us', path: '/contact' },
      { name: 'Login', path: '/login' },
    ]
  };

  const socialLinks = [
    { icon: Facebook, name: 'Facebook' },
    { icon: Twitter, name: 'Twitter' },
    { icon: Linkedin, name: 'LinkedIn' },
    { icon: Instagram, name: 'Instagram' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <Link to="/" className="flex items-center mb-6">
              <img
                src="https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/cd61e4949291516b560e6276a6cf34c9.png"
                alt="ProResume Designs Logo"
                className="h-14 md:h-16 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Transform your career with professionally crafted resumes that increase your interview chances.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <button
                  key={index}
                  onClick={() => handleSocialClick(social.name)}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pr-blue-600 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-xl font-bold mb-6">Services</p>
            <ul className="space-y-3">
              {footerLinks.services.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xl font-bold mb-6">Company</p>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-xl font-bold mb-6">Support</p>
            <ul className="space-y-3 mb-8">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>hello@proresumedesigns.com</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="border-t border-gray-800 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-center md:text-left">
              © {new Date().getFullYear()} ProResume Designs. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
              <Link to="/terms-of-service" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</Link>
              <Link to="/disclaimer" className="text-gray-400 hover:text-white transition-colors duration-200">Disclaimer</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;