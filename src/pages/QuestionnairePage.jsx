import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2, User, Phone, Mail, Briefcase, FileText, StickyNote, Upload, CheckCircle } from 'lucide-react';

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, session } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    industry: '',
    jobTitle: '',
    notes: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkoutData = location.state?.checkoutData;
    if (checkoutData) {
      setFormData(prev => ({
        ...prev,
        name: checkoutData.name || '',
        email: checkoutData.email || '',
        phone: checkoutData.phone || '',
      }));
    } else if (user) {
        setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [location.state, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a resume smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
        toast({
            title: "Resume Required",
            description: "Please upload your old resume to continue.",
            variant: "destructive",
        });
        return;
    }
    // Allow both logged-in users and guests to submit the form
    // For guests, we'll find/update their profile by email

    setIsSubmitting(true);
    
    try {
        let resumeUrl = null;
        let userId = null;

        // If user is logged in, use their ID; otherwise find user by email
        if (user) {
            userId = user.id;
        } else {
            // For guests, find the user profile by email
            const { data: existingProfiles, error: lookupError } = await supabase
                .from('profiles')
                .select('id, email')
                .eq('email', formData.email)
                .limit(1);

            console.log('Profile lookup result:', { existingProfiles, lookupError, searchEmail: formData.email });

            if (lookupError) {
                console.error('Profile lookup error:', lookupError);
                toast({
                    title: "Database Error",
                    description: "Unable to verify your account. Please try again.",
                    variant: "destructive",
                });
                return;
            }

            if (existingProfiles && existingProfiles.length > 0) {
                userId = existingProfiles[0].id;
                console.log('Found existing profile with ID:', userId);
            } else {
                console.log('No profile found for email:', formData.email);
                toast({
                    title: "Account Not Found",
                    description: "Please use the email address associated with your order, or check if you're logged in.",
                    variant: "destructive",
                });
                return;
            }
        }

        // Upload resume file
        const filePath = `${userId}/${Date.now()}_${resumeFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(filePath, resumeFile, {
                upsert: true,
                contentType: resumeFile.type,
            });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
        resumeUrl = urlData.publicUrl;

        // Update profile data (for both logged-in users and guests)
        const profileData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            industry: formData.industry,
            job_title: formData.jobTitle,
            notes: formData.notes,
            resume_url: resumeUrl,
            updated_at: new Date().toISOString()
        };

        console.log('Updating profile for userId:', userId, 'with data:', profileData);

        // Use update instead of upsert to avoid conflicts
        const { error: profileError } = await supabase
            .from('profiles')
            .update(profileData)
            .eq('id', userId);

        if (profileError) {
            console.error('Profile update error:', profileError);
            throw profileError;
        }

        console.log('Profile updated successfully');

        toast({
            title: "Success!",
            description: "Your information has been submitted. We'll be in touch shortly.",
            className: "bg-green-500 text-white",
        });
        navigate('/success');

    } catch (error) {
        toast({
            title: "Submission Failed",
            description: error.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <>
      <Helmet>
        <title>Post-Purchase Questionnaire - ProResume Designs</title>
        <meta name="description" content="Please provide us with more details to get started on your professional resume." />
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-pr-blue-600">Almost There!</h1>
            <p className="text-gray-600 mt-2 text-lg">Help us tailor your new resume.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="flex items-center mb-2 text-gray-700">
                  <User className="mr-2" />
                  Full Name <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input id="name" name="name" onChange={handleChange} value={formData.name} required placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center mb-2 text-gray-700">
                  <Phone className="mr-2" />
                  Phone Number <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input id="phone" name="phone" onChange={handleChange} value={formData.phone} required type="tel" placeholder="(123) 456-7890" />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="flex items-center mb-2 text-gray-700">
                <Mail className="mr-2" />
                Email Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input id="email" name="email" onChange={handleChange} value={formData.email} required type="email" placeholder="you@example.com" />
            </div>
            <div>
              <Label htmlFor="industry" className="flex items-center mb-2 text-gray-700">
                <Briefcase className="mr-2" />
                Target Industry <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input id="industry" name="industry" onChange={handleChange} value={formData.industry} required placeholder="e.g., Technology, Healthcare, Finance" />
            </div>
            <div>
              <Label htmlFor="jobTitle" className="flex items-center mb-2 text-gray-700">
                <FileText className="mr-2" />
                Specific Job Title
              </Label>
              <Input id="jobTitle" name="jobTitle" onChange={handleChange} value={formData.jobTitle} placeholder="e.g., Senior Software Engineer" />
            </div>
            
            <div>
                <Label htmlFor="notes" className="flex items-center mb-2 text-gray-700">
                    <StickyNote className="mr-2" />
                    Additional Notes
                </Label>
                <Textarea id="notes" name="notes" placeholder="Anything else we should know? (e.g., career goals, specific companies)" value={formData.notes} onChange={handleChange} rows={4} />
            </div>

            <div>
              <Label htmlFor="resume-upload" className="flex items-center mb-2 text-gray-700">
                <Upload className="mr-2" />
                Upload Old Resume <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="mt-2 flex justify-center items-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {fileName ? (
                    <div className="text-green-600 flex items-center">
                      <CheckCircle className="mr-2" />
                      <span>{fileName}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pr-blue-600 hover:text-pr-blue-500 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="resume-upload" name="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" required/>
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full text-lg py-3 mt-4" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit Information'
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default QuestionnairePage;