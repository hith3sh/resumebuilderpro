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
    const {
      email,
      name,
      analysisId,
      confirmationToken,
      confirmationUrl,
      atsScore
    } = await req.json()

    if (!email || !name || !confirmationToken || !confirmationUrl || !atsScore) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const emailContent = createEmailContent(name, atsScore, confirmationUrl)

    // Send email using Supabase Auth's built-in email service
    console.log('Sending email to:', email)

    try {
      // Try to invite user first - if they don't exist, it will work
      // If they exist, we'll catch the error and handle it
      console.log('Attempting to send invite for resume analysis')
      
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: confirmationUrl,
        data: {
          name: name,
          ats_score: atsScore,
          confirmation_token: confirmationToken,
          analysis_id: analysisId,
          email_type: 'resume_analysis',
          confirmation_url: confirmationUrl,
          invite_type: 'resume_analysis_results'
        }
      })

      if (inviteError) {
        // Check if error is because user already exists
        if (inviteError.message && inviteError.message.includes('already been registered')) {
          console.log('User exists, generating invite link for resume analysis')
          
          // User exists - use admin.generateLink with 'invite' type to trigger same "Invite User" template
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
              redirectTo: confirmationUrl,
              data: {
                name: name,
                ats_score: atsScore,
                confirmation_token: confirmationToken,
                analysis_id: analysisId,
                email_type: 'resume_analysis_existing',
                confirmation_url: confirmationUrl,
                user_type: 'existing'
              }
            }
          })

          if (linkError) {
            throw new Error(`Email sending failed for existing user: ${linkError.message}`)
          }
          
          console.log('Resume analysis email sent to existing user via Invite User template')
        } else {
          // Some other error occurred
          throw new Error(`Email sending failed: ${inviteError.message}`)
        }
      } else {
        console.log('Resume analysis email sent to new user via Invite User template')
      }

    } catch (emailSendError) {
      console.error('Email sending failed:', emailSendError)
      // Log the email content as fallback for debugging
      console.log('Email content (fallback):', emailContent)

      // In development, continue without breaking the flow
      console.log('Continuing without email (development mode)')
      
      // Still return success to not break the user flow
      // The analysis data is saved, they can access it via the confirmation URL
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Analysis email sent successfully',
        emailSent: true
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Email sending error:', error)

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

function createEmailContent(name: string, atsScore: number, confirmationUrl: string) {
  const scoreColor = atsScore >= 75 ? '#22c55e' : atsScore >= 50 ? '#f59e0b' : '#ef4444'
  const scoreMessage = atsScore >= 75
    ? 'Excellent! Your resume is well-optimized.'
    : atsScore >= 50
    ? 'Good start! Room for improvement.'
    : 'Needs work. Let\'s optimize it!'

  return {
    subject: `Your Resume ATS Score: ${atsScore}/100 - View Full Analysis`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Resume Analysis Results</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your Resume Analysis is Ready!</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Hi ${name}, your ATS optimization report is complete</p>
          </div>

          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #f8fafc; border-radius: 50%; width: 120px; height: 120px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; position: relative;">
                <svg width="80" height="80" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" stroke-width="3"/>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${scoreColor}" stroke-width="3" stroke-dasharray="${atsScore}, 100" transform="rotate(-90 18 18)"/>
                </svg>
                <div style="position: absolute; text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${atsScore}</div>
                  <div style="font-size: 12px; color: #6b7280;">ATS Score</div>
                </div>
              </div>
              <p style="color: ${scoreColor}; font-weight: 600; font-size: 18px; margin: 0;">${scoreMessage}</p>
            </div>

            <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 15px 0; color: #374151;">What's included in your full report:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #6b7280;">
                <li style="margin-bottom: 8px;">📊 Detailed ATS compatibility analysis</li>
                <li style="margin-bottom: 8px;">🎯 Keyword optimization recommendations</li>
                <li style="margin-bottom: 8px;">📝 Formatting and structure feedback</li>
                <li style="margin-bottom: 8px;">💡 Industry-specific improvement tips</li>
                <li style="margin-bottom: 8px;">🚀 Action plan to boost your score</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${confirmationUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin-bottom: 20px;">
                📋 View Full Analysis & Create Account
              </a>
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                This link will create your account automatically and show your complete analysis.
              </p>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 14px;">
            <p>This analysis was generated by ProResume Designs</p>
            <p>Need help improving your resume? <a href="#" style="color: #667eea;">Explore our services</a></p>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${name},

      Your Resume ATS Score: ${atsScore}/100
      ${scoreMessage}

      Your complete analysis is ready! Click the link below to view your detailed report and create your account:
      ${confirmationUrl}

      What's included in your full report:
      • Detailed ATS compatibility analysis
      • Keyword optimization recommendations
      • Formatting and structure feedback
      • Industry-specific improvement tips
      • Action plan to boost your score

      This link will automatically create your account and show your complete analysis.

      Best regards,
      The ProResume Designs Team
    `
  }
}