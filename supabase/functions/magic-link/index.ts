import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required.");
    }

    // Use the Service Role Key to act as an admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing magic link request for: ${email}`)

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    if (existingUser) {
      console.log(`User exists, sending magic link to: ${email}`)
      
      // User exists, send magic link using signInWithOtp
      const { data, error } = await supabaseAdmin.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/profile`,
          data: {
            email_type: 'magic_link_existing_user',
            user_email: email
          }
        }
      });

      if (error) {
        throw new Error(`Failed to send magic link to existing user: ${error.message}`)
      }

      console.log('Magic link sent to existing user via Supabase built-in service')
      
    } else {
      console.log(`User doesn't exist, creating account and sending magic link to: ${email}`)
      
      // User doesn't exist, create account first
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          created_via: 'magic_link_signup'
        }
      });

      if (createError) {
        throw new Error(`Failed to create user account: ${createError.message}`)
      }

      console.log(`Created new user account: ${email}`)

      // Create user profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email: email,
          role: 'user'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Don't fail the whole process, profile will be created by auth context if needed
      } else {
        console.log('Profile created successfully')
      }

      // Now send magic link to the new user
      const { data, error } = await supabaseAdmin.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/profile`,
          data: {
            email_type: 'magic_link_new_user',
            user_email: email,
            is_new_account: true
          }
        }
      });

      if (error) {
        throw new Error(`Failed to send magic link to new user: ${error.message}`)
      }

      console.log('Magic link sent to new user via Supabase built-in service')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link sent successfully',
        email: email,
        isNewUser: !existingUser
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in magic-link function:', error)
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
});
