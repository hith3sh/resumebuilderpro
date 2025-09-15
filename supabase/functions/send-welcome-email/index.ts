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

    // Generate a magic link for the user to login easily
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/dashboard`
      }
    })

    if (linkError) {
      console.error('Error generating magic link:', linkError)
      // Continue without magic link
    }

    const magicLoginUrl = linkData?.properties?.action_link || `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/login`

    // Use Postmark like the magic-link function
    const postmarkApiKey = Deno.env.get("POSTMARK_SERVER_TOKEN") || Deno.env.get("POSTMARK_API_KEY")

    if (!postmarkApiKey) {
      console.log('=== WELCOME EMAIL (Console Mode - No Postmark Key) ===')
      console.log(`To: ${email}`)
      console.log(`Type: ${isNewAccount ? 'Welcome' : 'Order Confirmation'}`)
      console.log(`Order: ${orderId}`)
      console.log(`Total: ${orderTotal}`)
      if (temporaryPassword) console.log(`Temp Password: ${temporaryPassword}`)
      console.log(`Magic Link: ${magicLoginUrl}`)
      console.log('=====================================================')

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email logged to console (no Postmark key configured)',
          email,
          magicLink: magicLoginUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const subject = isNewAccount
      ? 'Welcome to ProResume Designs - Your Account is Ready!'
      : 'Order Confirmation - ProResume Designs'

    const htmlBody = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                ${isNewAccount ? 'Welcome to ProResume!' : 'Order Confirmed!'}
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px; font-weight: 400;">
                ${isNewAccount ? 'Your account has been created successfully' : 'Thank you for your purchase'}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
                Hello ${firstName ? `${firstName}` : 'there'},
              </p>

              <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px;">
                ${isNewAccount
                  ? 'Thank you for your purchase! We\'ve successfully processed your payment and created your ProResume Designs account.'
                  : 'Your order has been confirmed and added to your ProResume Designs account.'
                }
              </p>

              <!-- Order Details -->
              <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1d4ed8; font-size: 18px; font-weight: 600;">Order Details</h3>
                <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>Total:</strong> ${orderTotal}</p>
                <p style="margin: 5px 0; color: #374151; font-size: 14px;"><strong>Email:</strong> ${email}</p>
              </div>

              ${isNewAccount && temporaryPassword ? `
              <!-- Account Access -->
              <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 15px 0; color: #047857; font-size: 18px; font-weight: 600;">🔑 Account Access</h3>
                <p style="margin: 5px 0; color: #047857; font-size: 14px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0; color: #047857; font-size: 14px;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #1f2937;">${temporaryPassword}</code></p>
                <p style="margin: 15px 0 5px; color: #047857; font-size: 12px;">
                  <strong>⚠️ Security Tip:</strong> Please change your password after logging in.
                </p>
              </div>
              ` : ''}

              <!-- Magic Login Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLoginUrl}"
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.025em; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);">
                  🔐 Access Your Account
                </a>
              </div>

              <!-- Next Steps -->
              <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px 0; color: #1d4ed8; font-size: 18px; font-weight: 600;">📝 Next Steps</h3>
                <ol style="margin: 0; padding-left: 20px; color: #374151; font-size: 14px;">
                  <li style="margin-bottom: 8px;">Complete the questionnaire to provide details for your resume</li>
                  <li style="margin-bottom: 8px;">Our team will start working on your resume within 24 hours</li>
                  <li style="margin-bottom: 8px;">You'll receive updates and drafts via email</li>
                  <li style="margin-bottom: 8px;">Track progress in your dashboard</li>
                </ol>
              </div>

              <!-- Footer Message -->
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 16px;">Need help? We're here for you!</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  Contact us at <a href="mailto:support@proresumedesign.com" style="color: #3b82f6;">support@proresumedesign.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">&copy; ${new Date().getFullYear()} ProResume Designs. All rights reserved.</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">This email was sent to ${email}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Send email using Postmark (same as magic-link function)
    const emailRes = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': postmarkApiKey
      },
      body: JSON.stringify({
        "From": "support@proresumedesigns.com",
        "To": email,
        "Subject": subject,
        "HtmlBody": htmlBody,
        "MessageStream": "outbound"
      })
    })

    if (!emailRes.ok) {
      const errorBody = await emailRes.text()
      throw new Error(`Failed to send email: ${errorBody}`)
    }

    const result = await emailRes.json()
    console.log('Postmark email sent successfully:', result.MessageID)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.MessageID,
        email: email,
        isNewAccount: isNewAccount
      }),
      {
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