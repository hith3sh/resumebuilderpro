import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, FileText, Mail, User, Loader2, Award, Sparkles, CheckCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const ResumeGrader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ name: '', email: user?.email || '' });
  const [resumeFile, setResumeFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const processFile = (file) => {
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "File too large", description: "Please upload a file smaller than 2MB.", variant: "destructive" });
        return;
      }
      setResumeFile(file);
      setFileName(file.name);
    }
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast({ title: "No Resume Uploaded", description: "Please upload your resume to get a score.", variant: "destructive" });
      return;
    }
    if (cooldown > 0) return;
    
    setIsSubmitting(true);
    setCooldown(5); // Reduced for testing

    try {
      const reader = new FileReader();
      reader.readAsText(resumeFile);
      reader.onload = async (event) => {
          const resumeText = event.target.result;
          
          // Analyze the resume
          const { data, error: functionError } = await supabase.functions.invoke('analyze-resume', {
              body: JSON.stringify({ resumeText }),
          });

          if (functionError) {
            console.error('Function error:', functionError);
            throw functionError;
          }
          
          // Upload resume file to storage
          const filePath = `pending_analysis/${Date.now()}_${resumeFile.name}`;
          const { error: uploadError } = await supabase.storage.from('resumes').upload(filePath, resumeFile);
          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);

          // Generate confirmation token
          const confirmationToken = crypto.randomUUID();
          
          // Save analysis data to pending_analysis table
          const analysisData = {
              name: formData.name,
              email: formData.email,
              resume_url: urlData.publicUrl,
              ats_score: data.score,
              analysis_results: data.analysis,
              status: 'pending_confirmation',
              confirmation_token: confirmationToken,
              created_at: new Date().toISOString()
          };

          const { data: insertedData, error: dbError } = await supabase
            .from('pending_analysis')
            .insert(analysisData)
            .select()
            .single();
            
          if (dbError) throw dbError;
          
          // Send confirmation email
          const { error: emailError } = await supabase.functions.invoke('send-analysis-email', {
              body: JSON.stringify({ 
                  email: formData.email,
                  name: formData.name,
                  analysisId: insertedData.id,
                  confirmationToken: confirmationToken,
                  siteUrl: 'http://localhost:5173' // For local testing

              }),
          });
          
          if (emailError) console.error('Email error:', emailError);
          
          // Show success message
          toast({ 
            title: "Analysis Complete!", 
            description: "Check your email for your detailed ATS analysis report and account setup instructions." 
          });
          
          // Reset form
          setFileName('');
          setResumeFile(null);
          setFormData({ name: '', email: user?.email || '' });
      };
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ 
        title: "Analysis Failed", 
        description: error.message || "Something went wrong. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ScoreCircle = ({ score }) => (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" strokeWidth="3" />
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
        <span className="text-5xl font-bold text-gray-800">{score}</span>
        <span className="text-sm text-gray-500">ATS Score</span>
      </div>
    </div>
  );

  const isButtonDisabled = isSubmitting || cooldown > 0;
  const buttonText = () => {
    if (isSubmitting) {
        return <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Analyzing...</>
    }
    if (cooldown > 0) {
        return `Wait ${cooldown}s`;
    }
    return "Get My Score";
  };


  return (
    <>
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <div className="text-left">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
                Get Your <span className="text-pr-blue-600">Free Resume Score</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Is your resume optimized to beat the bots? Modern companies use Applicant Tracking Systems (ATS) to filter candidates. Upload your resume now for an instant, free analysis and see how you stack up.
              </p>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center"><Search className="w-6 h-6 mr-3 text-pr-blue-500" /> Keyword & Formatting Analysis</li>
                <li className="flex items-center"><Award className="w-6 h-6 mr-3 text-pr-blue-500" /> Instant ATS Optimization Score</li>
                <li className="flex items-center"><Sparkles className="w-6 h-6 mr-3 text-pr-blue-500" /> Actionable Tips to Improve</li>
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={cn(
                "bg-white p-8 rounded-2xl shadow-2xl transition-all duration-300",
                isDragging && "ring-4 ring-pr-blue-400 ring-offset-2"
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <h3 className="text-2xl font-bold text-center mb-6">Analyze Your Resume in Seconds</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="flex items-center"><User className="w-4 h-4 mr-2" />Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleInputChange} required className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="email" className="flex items-center"><Mail className="w-4 h-4 mr-2" />Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="resume-upload" className="flex items-center"><FileText className="w-4 h-4 mr-2" />Your Resume</Label>
                  <div className="mt-2 flex items-center justify-center w-full">
                    <label 
                      htmlFor="resume-upload" 
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                        {fileName ? (
                          <div className="text-green-600 flex items-center font-semibold"><CheckCircle className="w-5 h-5 mr-2" /> {fileName}</div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PDF, DOCX, TXT (MAX. 2MB)</p>
                          </>
                        )}
                      </div>
                      <input id="resume-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full text-lg py-3" disabled={isButtonDisabled}>
                  {buttonText()}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Your Resume Analysis</DialogTitle>
            <DialogDescription className="text-center">Here's how your resume scores against Applicant Tracking Systems.</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            {analysisResult && <ScoreCircle score={analysisResult.score} />}
          </div>
          <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/resume-services')}>Improve My Score Now</Button>
              <Button className="w-full" variant="outline" onClick={() => { setIsModalOpen(false); navigate('/profile'); }}>View Full Report in My Account</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ResumeGrader;