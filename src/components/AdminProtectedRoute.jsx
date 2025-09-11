import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, ShieldOff } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (profile?.role !== 'admin') {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center p-4">
        <ShieldOff className="h-24 w-24 text-red-500 mb-4" />
        <h1 className="text-4xl font-bold text-gray-800">Access Denied</h1>
        <p className="text-lg text-gray-600 mt-2">You do not have permission to view this page.</p>
        <Navigate to="/profile" replace />
      </div>
    );
  }

  return children;
};

export default AdminProtectedRoute;