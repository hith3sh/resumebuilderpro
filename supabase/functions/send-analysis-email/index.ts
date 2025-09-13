import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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

    const emailContent = createEmailContent(name, atsScore, confirmationUrl)

    // In a real implementation, you'd integrate with an email service like:
    // - Supabase Auth (for transactional emails)
    // - SendGrid, Mailgun, AWS SES, etc.
    // - Resend (modern email API)

    // For now, we'll simulate sending the email
    console.log('Sending email to:', email)
    console.log('Email content:', emailContent)

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))

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