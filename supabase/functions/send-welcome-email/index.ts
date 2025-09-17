import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()

    // Validate required parameters
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Sending welcome email to: ${email}`)

    // Use Supabase's "Change Email Address" template by triggering updateUser
    try {
      console.log('Triggering Change Email template via updateUser')

      // Find the user first
      const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      const targetUser = users.find(user => user.email === email)

      if (!targetUser) {
        throw new Error(`User with email ${email} not found`)
      }

      // Trigger the "Change Email Address" template by setting email to same value
      // This will send the built-in Supabase email template
      const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        {
          email: email // Setting to same email triggers the template
        }
      )

      if (updateError) {
        console.error('Error triggering Change Email template:', updateError)
        throw updateError
      }

      console.log('Successfully triggered Change Email template')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent using Supabase Change Email template',
          email: email,
          method: 'supabase_change_email_template'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Failed to trigger Change Email template:', error)
      // Continue to fallback method
    }

    // If we get here, the Supabase template trigger failed
    console.error('Failed to send email using Supabase Change Email template')

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to trigger Supabase Change Email template',
        email: email
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error sending welcome email:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to send welcome email',
        details: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})