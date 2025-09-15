import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      email, 
      firstName, 
      lastName, 
      serviceName,
      welcomeMessage,
      dashboardUrl 
    } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Use admin.inviteUserByEmail to trigger "Invite User" template for welcome emails
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: dashboardUrl || `${Deno.env.get('SITE_URL')}/welcome`,
      data: {
        email_type: 'welcome_invitation',
        first_name: firstName,
        last_name: lastName,
        service_name: serviceName,
        welcome_message: welcomeMessage,
        purpose: 'client_onboarding'
      }
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Welcome invitation sent successfully',
        inviteId: data.user?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
