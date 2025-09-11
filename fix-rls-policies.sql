-- Fix Supabase RLS Policies - Remove Infinite Recursion
-- Run this SQL in your Supabase SQL Editor to fix the policy issues

-- 1. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Create simple, non-recursive policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role can do everything (for admin functions)
-- This avoids the recursion issue by using the service role for admin operations
CREATE POLICY "Service role full access" ON public.profiles
    FOR ALL USING (current_setting('request.jwt.claims', true)::json ->> 'role' = 'service_role');

-- Alternative: If you need admin users in the app, store admin status in auth.users metadata
-- CREATE POLICY "Admins can view all profiles" ON public.profiles
--     FOR ALL USING (
--         (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
--     );

-- 3. Create a function to check if user is admin (using auth.users metadata instead of profiles table)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Alternative admin policy using the function (uncomment if you want admin access)
-- CREATE POLICY "Admins can access all profiles" ON public.profiles
--     FOR ALL USING (public.is_admin());

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;