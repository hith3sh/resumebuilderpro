-- Analysis Results Table for Confirmed ATS Analysis
CREATE TABLE IF NOT EXISTS public.analysis_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    ats_score INTEGER NOT NULL,
    analysis_results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON public.analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_email ON public.analysis_results(email);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON public.analysis_results(created_at);

-- RLS Policies
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;

-- Users can view their own analysis results
CREATE POLICY "Users can view own analysis results" ON public.analysis_results
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own analysis results (for system operations)
CREATE POLICY "Users can insert own analysis results" ON public.analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all analysis results
CREATE POLICY "Admins can view all analysis results" ON public.analysis_results
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create trigger to update updated_at
CREATE TRIGGER update_analysis_results_updated_at
    BEFORE UPDATE ON public.analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.analysis_results TO anon, authenticated;