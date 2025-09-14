import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from "./cors.ts";
Deno.serve(async (req)=>{
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
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    // Generate a magic link for the user
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') || 'http://localhost:3000'}/profile`
      }
    });
    if (error) {
      throw error;
    }
    const loginURL = data.properties.action_link;
    const postmarkApiKey = Deno.env.get("POSTMARK_SERVER_TOKEN") || Deno.env.get("POSTMARK_API_KEY");
    if (!postmarkApiKey) {
      throw new Error("Email provider API key is not configured.");
    }
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
        "Subject": "Your Secure Login Link for ProResume Designs",
        "HtmlBody": `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Secure Login Link - ProResume Designs</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
              <img src="https://horizons-cdn.hostinger.com/b5cc3c7a-6a81-4cf7-b6ba-b5b728631238/1575594ce0d9f6d8f9b38680907405e4.png" alt="ProResume Designs" style="height: 60px; width: auto; margin-bottom: 16px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Welcome Back!</h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 16px; font-weight: 400;">Your secure login link is ready</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 24px; font-weight: 600;">Secure Login Request</h2>
                <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.6;">You requested a secure link to access your ProResume Designs account. Click the button below to sign in instantly and securely.</p>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${loginURL}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 600; letter-spacing: 0.025em; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4); transition: all 0.2s ease;">
                  🔐 Access My Account
                </a>
              </div>
              
              <!-- Security Notice -->
              <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="margin-right: 12px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 4px 0; color: #92400e; font-size: 14px; font-weight: 600;">Security Notice</h3>
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">This link will expire in 24 hours for your security. If you didn't request this login link, you can safely ignore this email.</p>
                  </div>
                </div>
              </div>
              
              <!-- Features Preview -->
              <div style="margin: 32px 0;">
                <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600; text-align: center;">What's waiting for you:</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
                  <div style="flex: 1; min-width: 150px; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); border-radius: 8px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 18px;">📄</span>
                    </div>
                    <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">Resume Services</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 8px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 18px;">⚡</span>
                    </div>
                    <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">Fast Processing</p>
                  </div>
                  <div style="flex: 1; min-width: 150px; text-align: center; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
                      <span style="color: white; font-size: 18px;">🎯</span>
                    </div>
                    <p style="margin: 0; color: #374151; font-size: 14px; font-weight: 500;">Expert Design</p>
                  </div>
                </div>
              </div>
              
              <!-- Footer Message -->
              <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 16px;">Need help? We're here for you!</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,<br><strong style="color: #1f2937;">The ProResume Designs Team</strong></p>
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
        `,
        "MessageStream": "outbound"
      })
    });
    if (!emailRes.ok) {
      const errorBody = await emailRes.text();
      throw new Error(`Failed to send email: ${errorBody}`);
    }
    return new Response(JSON.stringify({
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
