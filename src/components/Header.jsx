import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Header = () => {
  const { user, profile } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Resume Services', path: '/resume-services' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'About Us', path: '/about' },
  ];

  const activeLinkStyle = {
    color: '#3b82f6',
    fontWeight: '600',
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <img  class="h-10 w-auto" alt="ProResume Designs Logo" src="https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/1575594ce0d9f6d8f9b38680907405e4.png" />
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className="text-gray-600 hover:text-pr-blue-600 transition-colors"
                style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            {profile?.role === 'admin' && (
              <Link to="/admin">
                <Button variant="ghost" size="icon" aria-label="Admin Dashboard">
                  <Shield className="h-6 w-6 text-pr-blue-600" />
                </Button>
              </Link>
            )}
            <Link to={user ? "/profile" : "/login"}>
              <Button variant="ghost" size="icon" aria-label="User Profile">
                <User className="h-6 w-6 text-gray-600" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;