-- Complete Admin Setup with Policies
-- Run this after creating your admin account

-- 1. Enable the admin policy (uncomment from fix-rls-policies.sql)
CREATE POLICY "Admins can access all profiles" ON public.profiles
    FOR ALL USING (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 2. Create admin helper functions
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check both user_metadata and profiles table
    RETURN (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Grant admin access to storage (for viewing all resumes)
CREATE POLICY "Admins can access all resumes" ON storage.objects
    FOR ALL USING (
        bucket_id = 'resumes' AND public.is_admin_user()
    );

-- 4. Create a view for admin dashboard (optional)
CREATE OR REPLACE VIEW public.admin_user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN ats_score IS NOT NULL THEN 1 END) as users_with_analysis,
    COUNT(CASE WHEN resume_url IS NOT NULL THEN 1 END) as users_with_resumes,
    AVG(ats_score) as average_ats_score
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.admin_user_stats TO authenticated;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user() TO authenticated;
GRANT SELECT ON public.admin_user_stats TO authenticated;