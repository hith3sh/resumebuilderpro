# Supabase Email Template Strategy

## 📧 Template Allocation Strategy

| **Supabase Template** | **Use Case** | **Edge Function** | **Auth Method** | **Variables Available** |
|----------------------|--------------|-------------------|-----------------|------------------------|
| **Confirm Signup** | Resume Analysis Results | `send-analysis-email` | `signUp()` | `{{ .Data.ats_score }}`, `{{ .Data.name }}` |
| **Magic Link** | Regular User Login | `send-magic-link` | `signInWithOtp()` | Standard login variables |
| **Invite User** | Welcome/Onboarding | `send-welcome-invitation` | `admin.inviteUserByEmail()` | `{{ .Data.first_name }}`, `{{ .Data.service_name }}` |
| **Reset Password** | Payment Confirmations | `send-payment-confirmation` | `resetPasswordForEmail()` | `{{ .Data.order_id }}`, `{{ .Data.order_total }}` |
| **Change Email** | Account Updates | TBD | `updateUser()` | Profile update variables |
| **Reauthentication** | Premium Actions | TBD | Reauthentication flow | High-value action variables |

## 🎨 Template Customization Guide

### 1. **Confirm Signup Template** (Resume Analysis)

**Subject:** `Your Resume ATS Score: {{ .Data.ats_score }}/100 - View Full Analysis`

**Key Variables:**
- `{{ .Data.name }}` - User's name
- `{{ .Data.ats_score }}` - ATS score (0-100)
- `{{ .Data.email_type }}` - Always 'resume_analysis'
- `{{ .ConfirmationURL }}` - Link to confirm and view analysis

**HTML Template:**
```html
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
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Hi {{ .Data.name }}, your ATS optimization report is complete</p>
    </div>

    <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: #f8fafc; border-radius: 50%; width: 120px; height: 120px; margin: 0 auto 20px auto; display: flex; align-items: center; justify-content: center; position: relative;">
          <svg width="80" height="80" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e6e6" stroke-width="3"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#22c55e" stroke-width="3" stroke-dasharray="{{ .Data.ats_score }}, 100" transform="rotate(-90 18 18)"/>
          </svg>
          <div style="position: absolute; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #1f2937;">{{ .Data.ats_score }}</div>
            <div style="font-size: 12px; color: #6b7280;">ATS Score</div>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; margin-bottom: 20px;">
          📋 View Full Analysis & Create Account
        </a>
      </div>
    </div>
  </body>
</html>
```

### 2. **Magic Link Template** (Regular Login)

**Subject:** `Sign in to ProResume Designs`

**Key Variables:**
- `{{ .Email }}` - User's email
- `{{ .ConfirmationURL }}` - Magic link for login

### 3. **Invite User Template** (Welcome Emails)

**Subject:** `Welcome to ProResume Designs, {{ .Data.first_name }}!`

**Key Variables:**
- `{{ .Data.first_name }}` - User's first name
- `{{ .Data.service_name }}` - Service purchased
- `{{ .ConfirmationURL }}` - Welcome onboarding link

### 4. **Reset Password Template** (Payment Confirmations)

**Subject:** `Payment Confirmed - Order #{{ .Data.order_id }}`

**Key Variables:**
- `{{ .Data.order_id }}` - Order ID
- `{{ .Data.order_total }}` - Total amount
- `{{ .Data.customer_name }}` - Customer name
- `{{ .ConfirmationURL }}` - Link to order details

## 🚀 Deployment Commands

```bash
# Deploy all new email functions
supabase functions deploy send-analysis-email
supabase functions deploy send-magic-link  
supabase functions deploy send-welcome-invitation
supabase functions deploy send-payment-confirmation

# Or deploy all at once
supabase functions deploy
```

## 🔄 Migration Plan

1. **Update `send-analysis-email`** - ✅ Changed to use `signUp()` 
2. **Create dedicated functions** - ✅ Created specialized functions
3. **Configure templates in Supabase Dashboard** - ⏳ Next step
4. **Test each email type** - ⏳ After template configuration
5. **Update frontend calls** - ⏳ Use appropriate function for each scenario

## 📋 Template Configuration Checklist

- [ ] **Confirm Signup** → Resume analysis template
- [ ] **Magic Link** → Regular login template  
- [ ] **Invite User** → Welcome/onboarding template
- [ ] **Reset Password** → Payment confirmation template
- [ ] **Change Email** → Account update template
- [ ] **Reauthentication** → Premium action template

## 🎯 Benefits of This Strategy

✅ **Dedicated templates** for each email type  
✅ **No template conflicts** between different scenarios  
✅ **Custom variables** for each use case  
✅ **Proper auth flows** for each purpose  
✅ **Scalable architecture** for future email types  
✅ **Free Supabase email service** for all scenarios
