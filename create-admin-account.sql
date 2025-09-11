
-- Update the profiles table to mark user as admin
UPDATE public.profiles 
SET role = 'admin',
    updated_at = NOW()
WHERE email = 'admin@example.com';