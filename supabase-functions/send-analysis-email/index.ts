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
    const { email, name, analysisId, confirmationToken, siteUrl } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create confirmation URL (use provided siteUrl or fallback to localhost)
    const baseUrl = siteUrl || Deno.env.get('SITE_URL') || 'http://localhost:5173'
    const confirmationUrl = `${baseUrl}/setup-password?token=${confirmationToken}&email=${encodeURIComponent(email)}`

    // Email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your ATS Analysis is Ready!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .score-circle { width: 100px; height: 100px; border-radius: 50%; background: #667eea; color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 20px auto; }
          .features { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .feature { display: flex; align-items: center; margin: 10px 0; }
          .feature-icon { color: #667eea; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your ATS Analysis is Ready!</h1>
            <p>Hi ${name}, your resume has been analyzed and we have some exciting insights for you!</p>
          </div>
          
          <div class="content">
            <h2>What You'll Get:</h2>
            <div class="features">
              <div class="feature">
                <span class="feature-icon">📊</span>
                <span>Detailed ATS Score & Breakdown</span>
              </div>
              <div class="feature">
                <span class="feature-icon">💡</span>
                <span>Personalized Improvement Suggestions</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span>Industry-Specific Recommendations</span>
              </div>
              <div class="feature">
                <span class="feature-icon">📈</span>
                <span>Keyword Optimization Tips</span>
              </div>
            </div>
            
            <p>To view your complete analysis report and set up your account, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${confirmationUrl}" class="cta-button">View My ATS Analysis</a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 24 hours for security reasons. If you didn't request this analysis, please ignore this email.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              ProResume Designs - Professional Resume Services<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send email using Supabase Auth
    const { error } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: { 
        name: name,
        analysisId: analysisId,
        confirmationToken: confirmationToken
      },
      redirectTo: confirmationUrl
    })

    if (error) {
      console.error('Email sending error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
