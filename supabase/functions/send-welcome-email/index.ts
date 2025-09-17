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
    const {
      email,
      firstName,
      lastName,
      isNewAccount,
      orderId,
      orderTotal,
      temporaryPassword
    } = await req.json()

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

      console.log('User found:', { id: targetUser.id, email: targetUser.email })
      console.log('Template data to pass:', {
        is_new_account: isNewAccount,
        first_name: firstName || '',
        order_id: orderId || '',
        order_total: orderTotal || ''
      })

      // First, update user metadata with template data
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        user_metadata: {
          ...targetUser.user_metadata,
          is_new_account: isNewAccount,
          first_name: firstName || '',
          last_name: lastName || '',
          order_id: orderId || '',
          order_total: orderTotal || '',
          temporary_password: temporaryPassword || ''
        }
      })

      // Create a temporary email to force a real email change
      const tempEmail = `welcome_${Date.now()}@temp.proresumedesigns.com`
      console.log('Updating to temp email:', tempEmail)

      // Update to temp email first
      await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email: tempEmail,
        email_confirm: false // Don't require confirmation for temp email
      })

      // Small delay to ensure the update is processed
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Now update back to original email - this should trigger the Change Email template
      console.log('Updating back to original email:', email)
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
        email: email,
        email_confirm: true // This should trigger the email template
      })

      if (updateError) {
        console.error('Error triggering Change Email template:', updateError)
        throw updateError
      }

      console.log('Successfully triggered Change Email template')

      // Let's also try to verify the user's final state
      const { data: finalUser } = await supabaseAdmin.auth.admin.getUserById(targetUser.id)
      console.log('Final user state:', {
        id: finalUser?.user?.id,
        email: finalUser?.user?.email,
        metadata: finalUser?.user?.user_metadata
      })

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email sent using Supabase Change Email template',
          email: email,
          isNewAccount: isNewAccount,
          method: 'supabase_change_email_template',
          debug: {
            finalEmail: finalUser?.user?.email,
            hasMetadata: !!finalUser?.user?.user_metadata
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      console.error('Failed to trigger Change Email template:', error)

      // Try alternative: Password Reset template as fallback
      try {
        console.log('Trying password reset template as fallback')
        const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
          redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/questionnaire`
        })

        if (!resetError) {
          console.log('Successfully sent password reset email as fallback')
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Email sent using password reset template (fallback)',
              email: email,
              method: 'supabase_password_reset_fallback'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError)
      }
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