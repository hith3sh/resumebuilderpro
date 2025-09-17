import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { getUserOrders } from '@/api/StripeApi';
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  LogOut, 
  Award, 
  ChevronRight,
  ShoppingCart,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Package
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const UserDashboardPage = () => {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchPurchaseHistory();
    }
  }, [profile]);

  const fetchPurchaseHistory = async () => {
    setLoading(true);
    try {
      const orders = await getUserOrders(user.id);
      setPurchases(orders || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      // Don't show error toast for missing table, just log it
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const InfoCard = ({ icon, label, value, action }) => (
    <div className="bg-white border border-gray-200 p-6 rounded-xl hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-pr-blue-600 bg-blue-50 rounded-lg">
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 mt-1">{value || 'Not provided'}</p>
          </div>
        </div>
        {action && action}
      </div>
    </div>
  );

  const PurchaseCard = ({ purchase }) => (
    <div className="bg-white border border-gray-200 p-6 rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-pr-blue-600 bg-blue-50 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Order #{purchase.id?.slice(-8)}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {purchase.order_items?.map(item => item.product_name).join(', ') || 'Resume Service'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              {new Date(purchase.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm font-medium text-green-600 mt-1">
              <CreditCard className="w-4 h-4 inline mr-1" />
              ${(purchase.total_amount / 100).toFixed(2)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                purchase.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : purchase.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : purchase.status === 'processing'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {purchase.status?.charAt(0).toUpperCase() + purchase.status?.slice(1) || 'Completed'}
              </span>
              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                purchase.payment_status === 'paid' 
                  ? 'bg-green-100 text-green-800' 
                  : purchase.payment_status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {purchase.payment_status?.charAt(0).toUpperCase() + purchase.payment_status?.slice(1) || 'Paid'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          {purchase.status === 'completed' && !profile?.name && (
            <Button size="sm" variant="outline" onClick={() => navigate('/questionnaire')}>
              <FileText className="w-4 h-4 mr-1" /> Complete Questionnaire
            </Button>
          )}
          {purchase.status === 'completed' && profile?.name && (
            <Button size="sm" variant="outline" disabled>
              <Eye className="w-4 h-4 mr-1" /> Order Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const AnalysisReportDialog = ({ analysis }) => {
    console.log('Analysis data in dialog:', analysis);

    if (!analysis) {
      return (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ATS Analysis Report</DialogTitle>
            <DialogDescription>
              No analysis data available
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-gray-600">Analysis results not found. Please try submitting your resume again.</p>
          </div>
        </DialogContent>
      );
    }

    return (
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ATS Analysis Report</DialogTitle>
          <DialogDescription>
            Detailed breakdown of your resume's score: {analysis.score || 'N/A'}/100
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Analysis Feedback</h4>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {analysis.feedback || 'No feedback available'}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard - ProResume Designs</title>
        <meta name="description" content="Your personal dashboard with purchase history and profile information." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {profile?.name || user?.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            
            {/* Resume Analysis Section */}
            {profile?.ats_score && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-2xl text-white"
              >
                <h2 className="text-2xl font-bold mb-4">Latest Resume Analysis</h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-12 h-12 mr-4 text-white" />
                    <div>
                      <p className="text-blue-100">Your ATS Score</p>
                      <p className="text-4xl font-bold">{profile.ats_score}</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary">
                        View Full Report <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </DialogTrigger>
                    {profile.analysis_results && <AnalysisReportDialog analysis={profile.analysis_results} />}
                  </Dialog>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => navigate('/resume-services')}
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>Browse Services</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => navigate('/questionnaire')}
                >
                  <FileText className="w-6 h-6" />
                  <span>Update Profile</span>
                </Button>
                <Button 
                  className="h-20 flex-col space-y-2" 
                  variant="outline"
                  onClick={() => navigate('/contact')}
                >
                  <Mail className="w-6 h-6" />
                  <span>Contact Support</span>
                </Button>
              </div>
            </motion.div>

            {/* Purchase History */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
                <Button variant="outline" size="sm" onClick={fetchPurchaseHistory} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                  Refresh
                </Button>
              </div>
              
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <PurchaseCard key={purchase.id} purchase={purchase} />
                  ))}
                </div>
              ) : (
                <div className="text-center bg-white p-12 rounded-xl border border-gray-200">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800">No purchases yet</h3>
                  <p className="text-gray-500 mt-2">
                    Browse our resume services to get started with professional resume improvement.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/resume-services')}>
                    Browse Services
                  </Button>
                </div>
              )}
            </motion.div>

            {/* Profile Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard 
                  icon={<User className="w-5 h-5" />} 
                  label="Full Name" 
                  value={profile?.name} 
                />
                <InfoCard 
                  icon={<Mail className="w-5 h-5" />} 
                  label="Email Address" 
                  value={profile?.email} 
                />
                <InfoCard 
                  icon={<Phone className="w-5 h-5" />} 
                  label="Phone Number" 
                  value={profile?.phone} 
                />
                <InfoCard 
                  icon={<Briefcase className="w-5 h-5" />} 
                  label="Target Industry" 
                  value={profile?.industry} 
                />
                <InfoCard 
                  icon={<FileText className="w-5 h-5" />} 
                  label="Job Title" 
                  value={profile?.job_title} 
                />
                {profile?.resume_url && (
                  <InfoCard 
                    icon={<Download className="w-5 h-5" />} 
                    label="Resume File" 
                    value="Available" 
                    action={
                      <Button size="sm" variant="outline" asChild>
                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                          View
                        </a>
                      </Button>
                    }
                  />
                )}
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </>
  );
};

export default UserDashboardPage;