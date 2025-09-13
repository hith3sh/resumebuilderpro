-- Pending Analysis Table for ATS Lead Generation
CREATE TABLE IF NOT EXISTS public.pending_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    ats_score INTEGER NOT NULL,
    analysis_results JSONB NOT NULL,
    status TEXT DEFAULT 'pending_confirmation' CHECK (status IN ('pending_confirmation', 'confirmed', 'expired')),
    confirmation_token TEXT UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_pending_analysis_email ON public.pending_analysis(email);
CREATE INDEX IF NOT EXISTS idx_pending_analysis_token ON public.pending_analysis(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_pending_analysis_status ON public.pending_analysis(status);

-- RLS Policy
ALTER TABLE public.pending_analysis ENABLE ROW LEVEL SECURITY;

-- Allow public access for confirmation
CREATE POLICY "Allow public access for confirmation" ON public.pending_analysis
    FOR ALL USING (true);

-- Function to clean up expired records
CREATE OR REPLACE FUNCTION cleanup_expired_analysis()
RETURNS void AS $$
BEGIN
    DELETE FROM public.pending_analysis 
    WHERE expires_at < NOW() AND status = 'pending_confirmation';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pending_analysis_updated_at
    BEFORE UPDATE ON public.pending_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
