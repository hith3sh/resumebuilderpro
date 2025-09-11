import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Mail, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setIsSubmitting(true);
    setCooldown(60);

    try {
      const redirectTo = `${window.location.origin}/profile`;

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

  const isButtonDisabled = isSubmitting || !email || cooldown > 0;
  const buttonText = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
        </>
      );
    }
    if (cooldown > 0) {
      return `Wait ${cooldown}s`;
    }
    return (
      <>
        <LogIn className="mr-2 h-5 w-5" /> Send Login Link
      </>
    );
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
            <h1 className="text-3xl font-bold text-gray-800">Customer Portal</h1>
            <p className="text-gray-500">Enter your email to receive a secure login link.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <Button type="submit" className="w-full bg-pr-blue-600 text-white py-3 text-lg hover:bg-pr-blue-700" disabled={isButtonDisabled}>
              {buttonText()}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            New here? Your account is created automatically after your first purchase.
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoginPage;