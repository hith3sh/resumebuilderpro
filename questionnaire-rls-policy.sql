-- Allow guests to lookup profiles by email for questionnaire purposes
-- This policy allows anyone to read profiles table to find their profile by email
-- for completing the questionnaire after payment

-- Add a policy to allow reading profiles by email for questionnaire purposes
CREATE POLICY "Allow questionnaire profile lookup by email" ON public.profiles
    FOR SELECT USING (true);

-- Storage policies for guest questionnaire uploads
-- Allow guests to upload resumes to any folder in the resumes bucket
CREATE POLICY "Allow questionnaire resume uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- Allow guests to view resumes they uploaded
CREATE POLICY "Allow questionnaire resume viewing" ON storage.objects
    FOR SELECT USING (bucket_id = 'resumes');

-- Note: These policies allow broad access for questionnaire functionality.
-- In production, you might want to create more restrictive policies.