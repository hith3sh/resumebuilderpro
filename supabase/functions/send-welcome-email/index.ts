import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
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
      temporaryPassword,
      loginUrl
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

    // Get email service configuration from environment
    const emailService = Deno.env.get('EMAIL_SERVICE') || 'console' // Default to console for development

    console.log(`Sending welcome email to: ${email}`)

    let emailContent;
    let subject;

    if (isNewAccount) {
      // Welcome email for new account
      subject = 'Welcome to ProResume Designs - Your Account is Ready!'

      emailContent = {
        to: email,
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ProResume Designs</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to ProResume Designs!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Your account has been created successfully</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
                Hello ${firstName ? `${firstName}` : 'there'},
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for your purchase! We've successfully processed your payment and created your ProResume Designs account.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">Order Confirmation</h3>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0;"><strong>Total:</strong> ${orderTotal}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            </div>

            <!-- Account Access -->
            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #047857; margin: 0 0 15px; font-size: 18px;">🔑 Your Account Access</h3>
                <p style="margin: 10px 0;">Your account has been created with the following details:</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                ${temporaryPassword ? `<p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${temporaryPassword}</code></p>` : ''}
                <p style="margin: 15px 0 5px; font-size: 14px; color: #047857;">
                    <strong>⚠️ Security Tip:</strong> Please log in and change your password immediately for security.
                </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1d4ed8; margin: 0 0 15px; font-size: 18px;">📝 Next Steps</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Complete the questionnaire to provide details for your resume</li>
                    <li style="margin-bottom: 10px;">Our team will start working on your resume within 24 hours</li>
                    <li style="margin-bottom: 10px;">You'll receive updates and drafts via email</li>
                    <li style="margin-bottom: 10px;">Login to your account to track progress</li>
                </ol>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl || 'https://your-domain.com/login'}"
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Login to Your Account
                </a>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-domain.com/questionnaire"
                   style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-left: 10px;">
                    Start Questionnaire
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                Need help? Contact us at <a href="mailto:support@proresumedesign.com" style="color: #3b82f6;">support@proresumedesign.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2024 ProResume Designs. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `Welcome to ProResume Designs!

Hello ${firstName || 'there'},

Thank you for your purchase! We've successfully processed your payment and created your ProResume Designs account.

Order Details:
- Order ID: ${orderId}
- Total: ${orderTotal}
- Email: ${email}

Account Access:
- Email: ${email}
${temporaryPassword ? `- Temporary Password: ${temporaryPassword}` : ''}

Next Steps:
1. Complete the questionnaire to provide details for your resume
2. Our team will start working on your resume within 24 hours
3. You'll receive updates and drafts via email
4. Login to your account to track progress

Login: ${loginUrl || 'https://your-domain.com/login'}
Start Questionnaire: https://your-domain.com/questionnaire

Need help? Contact us at support@proresumedesign.com`
      }
    } else {
      // Order confirmation for existing account
      subject = 'Order Confirmation - ProResume Designs'

      emailContent = {
        to: email,
        subject: subject,
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Order Confirmed!</h1>
            <p style="margin: 10px 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
                Hello ${firstName ? `${firstName}` : 'there'},
            </p>

            <p style="font-size: 16px; margin-bottom: 20px;">
                Your order has been confirmed and added to your ProResume Designs account.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px; font-size: 18px;">Order Details</h3>
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0;"><strong>Total:</strong> ${orderTotal}</p>
                <p style="margin: 5px 0;"><strong>Account:</strong> ${email}</p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1d4ed8; margin: 0 0 15px; font-size: 18px;">📝 Next Steps</h3>
                <ol style="margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">Complete the questionnaire if you haven't already</li>
                    <li style="margin-bottom: 10px;">Our team will start working on your resume within 24 hours</li>
                    <li style="margin-bottom: 10px;">Track progress in your dashboard</li>
                </ol>
            </div>

            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-domain.com/dashboard"
                   style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    View Dashboard
                </a>
                <a href="https://your-domain.com/questionnaire"
                   style="display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-left: 10px;">
                    Complete Questionnaire
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">
                Need help? Contact us at <a href="mailto:support@proresumedesign.com" style="color: #3b82f6;">support@proresumedesign.com</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © 2024 ProResume Designs. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
        `,
        text: `Order Confirmed - ProResume Designs

Hello ${firstName || 'there'},

Your order has been confirmed and added to your ProResume Designs account.

Order Details:
- Order ID: ${orderId}
- Total: ${orderTotal}
- Account: ${email}

Next Steps:
1. Complete the questionnaire if you haven't already
2. Our team will start working on your resume within 24 hours
3. Track progress in your dashboard

Dashboard: https://your-domain.com/dashboard
Questionnaire: https://your-domain.com/questionnaire

Need help? Contact us at support@proresumedesign.com`
      }
    }

    // Send email based on configured service
    let result;

    if (emailService === 'resend') {
      // Use Resend service
      const resendApiKey = Deno.env.get('RESEND_API_KEY')

      if (!resendApiKey) {
        console.error('RESEND_API_KEY not configured')
        return new Response(
          JSON.stringify({ error: 'Email service not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ProResume Designs <noreply@proresumedesign.com>',
          to: [email],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Resend API error:', errorText)
        throw new Error(`Email sending failed: ${response.status}`)
      }

      result = await response.json()
      console.log('Email sent via Resend:', result.id)

    } else if (emailService === 'smtp') {
      // Use SMTP service (you can implement this)
      console.log('SMTP email sending not implemented yet')
      result = { service: 'smtp', status: 'not_implemented' }

    } else {
      // Console/development mode
      console.log('=== WELCOME EMAIL (Console Mode) ===')
      console.log(`To: ${email}`)
      console.log(`Subject: ${subject}`)
      console.log(`Content: ${emailContent.text}`)
      console.log('=====================================')

      result = {
        service: 'console',
        status: 'logged',
        email: email,
        subject: subject
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email sent successfully',
        result
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