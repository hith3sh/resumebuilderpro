import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Award, FileText, User, Mail } from 'lucide-react';

const ConfirmAnalysisPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    if (token) {
      confirmAnalysis();
    }
  }, [token]);

  const confirmAnalysis = async () => {
    try {
      setLoading(true);

      // Call edge function to handle the entire confirmation process
      const { data, error } = await supabase.functions.invoke('confirm-analysis', {
        body: { token }
      });

      if (error) {
        throw new Error(error.message || 'Confirmation failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Invalid or expired confirmation link');
      }

      // The function returns the analysis data and whether account was created
      setAnalysisData(data.analysisData);
      setAccountCreated(data.accountCreated);

      toast({
        title: data.accountCreated ? "Account Created!" : "Welcome Back!",
        description: data.accountCreated
          ? "Your account has been created and your analysis is ready to view."
          : "You've been signed in. Your analysis is ready to view.",
      });

    } catch (error) {
      console.error('Confirmation error:', error);
      setError(error.message);
      toast({
        title: "Confirmation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const ScoreCircle = ({ score }) => (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke={score > 75 ? "#22c55e" : score > 50 ? "#f59e0b" : "#ef4444"}
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{score}</span>
        <span className="text-xs text-gray-500">ATS Score</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-pr-blue-600" />
          <h2 className="text-xl font-semibold mb-2">Confirming Your Analysis...</h2>
          <p className="text-gray-600">Setting up your account and preparing your results</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Confirmation Error - ProResume Designs</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center"
          >
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmation Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => navigate('/login')}
              className="w-full mb-3"
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Resume Analysis Results - ProResume Designs</title>
        <meta name="description" content="Your resume analysis results are ready to view." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pr-blue-600 to-pr-blue-700 px-8 py-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Resume Analysis</h1>
                  <p className="text-pr-blue-100">
                    {accountCreated ? "Account created successfully!" : "Welcome back!"}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-300" />
              </div>
            </div>

            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Score Section */}
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-4">Your ATS Score</h2>
                  {analysisData && <ScoreCircle score={analysisData.ats_score} />}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>
                      {analysisData?.ats_score > 75
                        ? "Excellent! Your resume is well-optimized for ATS systems."
                        : analysisData?.ats_score > 50
                        ? "Good! There's room for improvement to boost your score."
                        : "Needs work. Let's optimize your resume for better results."
                      }
                    </span>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Analysis Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{analysisData?.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{analysisData?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">Resume analyzed on {new Date(analysisData?.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Results */}
              {analysisData?.analysis_results && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
                  <div className="prose max-w-none text-gray-700">
                    {typeof analysisData.analysis_results === 'string'
                      ? analysisData.analysis_results
                      : JSON.stringify(analysisData.analysis_results, null, 2)
                    }
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  View Full Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/resume-services')}
                  className="flex-1"
                >
                  Improve My Resume
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ConfirmAnalysisPage;