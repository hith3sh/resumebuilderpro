import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, User, Mail, Phone, Briefcase, FileText, StickyNote, LogOut, Award, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

const ProfilePage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Error logging out", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/');
    }
  };

  const InfoCard = ({ icon, label, value }) => (
    <div className="bg-gray-100 p-4 rounded-lg flex items-start space-x-4">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-pr-blue-600">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-semibold text-gray-800">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const AnalysisReportDialog = ({ analysis }) => (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>ATS Analysis Report</DialogTitle>
        <DialogDescription>
          Detailed breakdown of your resume's score.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4">
        {Object.entries(analysis).map(([key, value]) => (
          <div key={key}>
            <h4 className="font-semibold capitalize text-gray-800">{key.replace('_', ' ')}: Score {value.score}/20</h4>
            <p className="text-sm text-gray-600">{value.details.join(' ')}</p>
          </div>
        ))}
      </div>
    </DialogContent>
  );

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-pr-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Profile - ProResume Designs</title>
        <meta name="description" content="View your profile and submitted information." />
      </Helmet>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
        
        {profile ? (
          <div className="space-y-8">
            {profile.ats_score && (
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4">Resume Analysis</h3>
                <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Award className="w-10 h-10 mr-4 text-pr-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Your latest ATS Score</p>
                      <p className="text-3xl font-bold text-gray-800">{profile.ats_score}</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                       <Button variant="ghost">View Report <ChevronRight className="w-4 h-4 ml-1" /></Button>
                    </DialogTrigger>
                    {profile.analysis_results && <AnalysisReportDialog analysis={profile.analysis_results} />}
                  </Dialog>
                </div>
              </div>
            )}
            
            <div className="bg-white p-8 rounded-2xl shadow-lg space-y-6">
              <h3 className="text-2xl font-bold mb-4">Personal Information</h3>
              <InfoCard icon={<User size={24} />} label="Name" value={profile.name} />
              <InfoCard icon={<Mail size={24} />} label="Email" value={profile.email} />
              <InfoCard icon={<Phone size={24} />} label="Phone Number" value={profile.phone} />
              <InfoCard icon={<Briefcase size={24} />} label="Target Industry" value={profile.industry} />
              <InfoCard icon={<FileText size={24} />} label="Specific Job Title" value={profile.job_title} />
              <InfoCard icon={<StickyNote size={24} />} label="Notes" value={profile.notes} />
              {profile.resume_url && (
                <div className="bg-gray-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-2">Uploaded Resume</p>
                  <a 
                    href={profile.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-pr-blue-600 hover:underline"
                  >
                    View Your Resume
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800">No Information Found</h2>
            <p className="text-gray-500 mt-2">Complete your first resume analysis or purchase a service to see your information here.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;