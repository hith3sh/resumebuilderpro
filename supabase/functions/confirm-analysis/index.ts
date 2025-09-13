import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Validate token and get analysis data
    const { data: pendingAnalysis, error: fetchError } = await supabaseAdmin
      .from('pending_analysis')
      .select('*')
      .eq('confirmation_token', token)
      .eq('status', 'pending_confirmation')
      .single()

    if (fetchError || !pendingAnalysis) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid or expired confirmation link'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token has expired
    const expiresAt = new Date(pendingAnalysis.expires_at)
    if (expiresAt < new Date()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Confirmation link has expired'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser.users.some((u: any) => u.email === pendingAnalysis.email)
    let userId = null
    let accountCreated = false

    if (!userExists) {
      // Create new user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: pendingAnalysis.email,
        email_confirm: true,
        user_metadata: {
          name: pendingAnalysis.name
        }
      })

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`)
      }

      userId = newUser.user.id
      accountCreated = true

      // Update the user's profile with analysis data
      await supabaseAdmin
        .from('profiles')
        .update({
          name: pendingAnalysis.name,
          ats_score: pendingAnalysis.ats_score,
          analysis_results: pendingAnalysis.analysis_results,
          resume_url: pendingAnalysis.resume_url
        })
        .eq('id', userId)

    } else {
      // Get existing user ID
      const existingUserData = existingUser.users.find((u: any) => u.email === pendingAnalysis.email)
      userId = existingUserData.id

      // Update existing user's profile with new analysis
      await supabaseAdmin
        .from('profiles')
        .update({
          ats_score: pendingAnalysis.ats_score,
          analysis_results: pendingAnalysis.analysis_results,
          resume_url: pendingAnalysis.resume_url
        })
        .eq('id', userId)
    }

    // Move analysis from pending to confirmed
    const { error: insertError } = await supabaseAdmin
      .from('analysis_results')
      .insert({
        user_id: userId,
        name: pendingAnalysis.name,
        email: pendingAnalysis.email,
        resume_url: pendingAnalysis.resume_url,
        ats_score: pendingAnalysis.ats_score,
        analysis_results: pendingAnalysis.analysis_results,
        created_at: pendingAnalysis.created_at,
        confirmed_at: new Date().toISOString()
      })

    if (insertError) {
      throw new Error(`Failed to save analysis: ${insertError.message}`)
    }

    // Delete from pending table
    await supabaseAdmin
      .from('pending_analysis')
      .delete()
      .eq('id', pendingAnalysis.id)

    // Generate magic link for the user to sign in
    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: pendingAnalysis.email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/dashboard`
      }
    })

    if (magicLinkError) {
      console.error('Magic link generation error:', magicLinkError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        accountCreated,
        analysisData: pendingAnalysis,
        magicLink: magicLinkData?.properties?.action_link,
        message: accountCreated
          ? 'Account created successfully and analysis confirmed'
          : 'Analysis confirmed and linked to existing account'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Confirmation error:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})