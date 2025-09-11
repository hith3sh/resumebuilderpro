import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Download, UserCircle, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';

const DashboardPage = () => {
    const { toast } = useToast();
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (error) throw error;
                    setProfile(data);
                } catch (error) {
                    toast({
                        variant: 'destructive',
                        title: 'Failed to load profile',
                        description: error.message,
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProfile();
    }, [user, toast]);
    
    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };
    
    const handleDownloadResume = () => {
        if (profile?.resume_url) {
            window.open(profile.resume_url, '_blank');
        } else {
            toast({
                title: 'No resume found',
                description: 'A resume was not uploaded with your questionnaire.',
            });
        }
    };
    
    if(loading) {
        return (
             <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-16 w-16 text-pr-blue-600 animate-spin" />
            </div>
        )
    }

    return (
        <>
            <Helmet>
                <title>My Dashboard - ProResume Designs</title>
                <meta name="description" content="Manage your orders, download your resume, and update your profile." />
            </Helmet>
            <div className="pt-32 pb-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-left mb-12"
                    >
                        <h1 className="text-5xl font-bold mb-2">My Dashboard</h1>
                        <p className="text-xl text-gray-600">Welcome back, {profile?.name || 'Customer'}!</p>
                    </motion.div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <motion.div 
                            className="lg:col-span-2"
                             initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold mb-6">Your Information</h2>
                                {profile ? (
                                    <div className="space-y-4 text-gray-700">
                                        <p><strong>Name:</strong> {profile.name}</p>
                                        <p><strong>Email:</strong> {profile.email}</p>
                                        <p><strong>Phone:</strong> {profile.phone}</p>
                                        <p><strong>Target Industry:</strong> {profile.industry}</p>
                                        <p><strong>Target Job Title:</strong> {profile.job_title || 'Not provided'}</p>
                                        <p><strong>Notes:</strong> {profile.notes || 'Not provided'}</p>
                                        {profile.resume_url && (
                                            <Button size="sm" variant="outline" onClick={handleDownloadResume}>
                                                <Download className="w-4 h-4 mr-2" />
                                                Download Submitted Resume
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No profile data found</h3>
                                        <p className="mt-1 text-sm text-gray-500">Complete the questionnaire after a purchase to see your data here.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                             initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                        >
                            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold mb-6">Account</h2>
                                <div className="space-y-3">
                                    <Button variant="ghost" className="w-full justify-start text-lg" onClick={() => toast({ title: 'This feature is coming soon!'})}>
                                        <UserCircle className="w-5 h-5 mr-3" /> Edit Profile
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start text-lg text-red-500 hover:text-red-600" onClick={handleLogout}>
                                        <LogOut className="w-5 h-5 mr-3" /> Logout
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;