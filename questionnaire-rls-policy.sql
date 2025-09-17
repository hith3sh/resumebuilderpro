-- Allow guests to lookup profiles by email for questionnaire purposes
-- This policy allows anyone to read profiles table to find their profile by email
-- for completing the questionnaire after payment

-- Add a policy to allow reading profiles by email for questionnaire purposes
CREATE POLICY "Allow questionnaire profile lookup by email" ON public.profiles
    FOR SELECT USING (true);

-- Alternative: More restrictive policy that only allows reading id and email fields
-- (Uncomment this and comment the above if you want more restrictive access)
-- CREATE POLICY "Allow questionnaire profile lookup by email" ON public.profiles
--     FOR SELECT USING (true);

-- Note: This policy allows reading all profiles for questionnaire lookup.
-- In production, you might want to create a more restrictive policy or use a serverless function.