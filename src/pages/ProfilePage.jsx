import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Only proceed if we have a user and are not loading
    if (!authLoading && user) {
      // If we have a profile, redirect immediately
      if (profile) {
        setRedirecting(true);
        if (profile.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // If no profile yet, wait a bit for it to load
        const timer = setTimeout(() => {
          if (!profile) {
            // If still no profile after timeout, redirect to dashboard anyway
            setRedirecting(true);
            navigate('/dashboard', { replace: true });
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, profile, authLoading, navigate]);

  if (authLoading || redirecting) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          {redirecting ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back!</h2>
              <p className="text-gray-600">Redirecting you to your dashboard...</p>
            </>
          ) : (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
              <p className="text-gray-600">Please wait while we verify your account.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // If no user, this shouldn't happen due to ProtectedRoute, but just in case
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600" />
      </div>
    );
  }

  // This component should only show loading since it immediately redirects
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600" />
    </div>
  );
};

export default ProfilePage;