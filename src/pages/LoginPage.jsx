import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Mail, LogIn, Loader2, ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('magiclink'); // 'signin', 'signup', 'magiclink'
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;
      
      if (authMode === 'signin') {
        result = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
      } else if (authMode === 'signup') {
        const redirectTo = import.meta.env.VITE_REDIRECT_URL || `${window.location.origin}/profile`;
        result = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            emailRedirectTo: redirectTo,
          },
        });
      }

      if (result.error) {
        throw result.error;
      }

      if (authMode === 'signin') {
        toast({
          title: "Welcome back!",
          description: "You have been successfully signed in.",
        });
        navigate('/profile');
      } else {
        toast({
          title: "Account created!",
          description: result.data?.user?.email_confirmed_at 
            ? "You have been successfully signed up and can now access your account."
            : "Please check your email to verify your account.",
        });
        if (result.data?.user?.email_confirmed_at) {
          navigate('/profile');
        }
      }
    } catch (error) {
      toast({
        title: authMode === 'signin' ? "Sign in failed" : "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsSubmitting(true);
    setCooldown(60);

    try {
      const redirectTo = import.meta.env.VITE_REDIRECT_URL || `${window.location.origin}/profile`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Check your email!",
        description: `A login link has been sent to ${email}.`,
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error sending link",
        description: error.message,
        variant: "destructive",
      });
      setCooldown(5); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmailAuthDisabled = isSubmitting || !email || (authMode !== 'magiclink' && !password);
  const isMagicLinkDisabled = isSubmitting || !email || cooldown > 0;
  
  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {authMode === 'magiclink' ? 'Sending...' : 'Processing...'}
        </>
      );
    }
    
    if (authMode === 'magiclink' && cooldown > 0) {
      return `Wait ${cooldown}s`;
    }
    
    if (authMode === 'signin') {
      return (
        <>
          <LogIn className="mr-2 h-5 w-5" /> Sign In
        </>
      );
    } else if (authMode === 'signup') {
      return (
        <>
          <UserPlus className="mr-2 h-5 w-5" /> Sign Up
        </>
      );
    } else {
      return (
        <>
          <Mail className="mr-2 h-5 w-5" /> Send Magic Link
        </>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - ProResume Designs</title>
        <meta name="description" content="Access your ProResume Designs customer portal." />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 text-gray-600 hover:text-gray-900"
            aria-label="Go back"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-pr-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-pr-blue-600">ProResume Designs</span>
            </Link>
            <h1 className="text-3xl font-bold text-gray-800">
              {authMode === 'magiclink' ? 'Access Your Account' : authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-500">
              {authMode === 'magiclink'
                ? 'Enter your email to receive a secure login link'
                : authMode === 'signin'
                ? 'Sign in to access your account'
                : 'Create your account to get started'
              }
            </p>
          </div>

          {/* Auth Mode Selector */}
          <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setAuthMode('magiclink')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'magiclink'
                  ? 'bg-white text-pr-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signin'
                  ? 'bg-white text-pr-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'signup'
                  ? 'bg-white text-pr-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={authMode === 'magiclink' ? handleMagicLink : handleEmailAuth} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {(authMode === 'signin' || authMode === 'signup') && (
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder={authMode === 'signup' ? "Create a strong password" : "Enter your password"}
                    required
                    minLength={authMode === 'signup' ? 6 : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {authMode === 'signup' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-pr-blue-600 text-white py-3 text-lg hover:bg-pr-blue-700" 
              disabled={authMode === 'magiclink' ? isMagicLinkDisabled : isEmailAuthDisabled}
            >
              {getButtonContent()}
            </Button>
          </form>

          {authMode === 'magiclink' && (
            <p className="text-center text-sm text-gray-500 mt-8">
              New here? Your account is created automatically when you use the magic link.
            </p>
          )}

          {(authMode === 'signin' || authMode === 'signup') && (
            <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
              {authMode === 'signin' && (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-pr-blue-600 hover:text-pr-blue-700 font-medium"
                  >
                    Sign up here
                  </button>
                </p>
              )}
              {authMode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-pr-blue-600 hover:text-pr-blue-700 font-medium"
                  >
                    Sign in here
                  </button>
                </p>
              )}
              <p>
                Prefer passwordless login?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('magiclink')}
                  className="text-pr-blue-600 hover:text-pr-blue-700 font-medium"
                >
                  Use magic link
                </button>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;