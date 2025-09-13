# Stripe Payment Integration Setup Guide

This guide will help you set up the complete Stripe payment integration for the ProResume Designs application.

## Prerequisites

- Stripe account (https://stripe.com)
- Supabase project with database access
- Node.js and npm installed

## Step 1: Stripe Account Setup

1. **Create/Login to Stripe Account**
   - Go to https://stripe.com and create an account or log in
   - Complete your account verification if required

2. **Get API Keys**
   - Go to Stripe Dashboard > Developers > API keys
   - Copy your **Publishable key** (starts with `pk_`)
   - Copy your **Secret key** (starts with `sk_`)

3. **Set Up Webhooks** (Required for payment confirmations)
   - Go to Stripe Dashboard > Developers > Webhooks
   - Click "Add endpoint"
   - Set endpoint URL to: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `payment_intent.canceled`
   - Copy the webhook secret (starts with `whsec_`)

## Step 2: Environment Variables

Update your `.env` file with the following variables:

```env
# Stripe Configuration (REQUIRED)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# For Supabase Edge Functions (add to Supabase dashboard)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Step 3: Supabase Database Setup

1. **Run Database Migrations**
   ```bash
   # If using Supabase CLI
   supabase db reset
   
   # Or manually run the SQL from:
   # supabase/migrations/001_create_products_and_orders.sql
   ```

2. **Insert Sample Products** (Optional)
   The migration includes sample products. You can modify or add more products using the Supabase dashboard or the admin interface.

## Step 4: Supabase Edge Functions

1. **Deploy Edge Functions**
   ```bash
   # Deploy the payment intent function
   supabase functions deploy create-payment-intent
   
   # Deploy the webhook handler
   supabase functions deploy stripe-webhook
   ```

2. **Set Environment Variables in Supabase**
   - Go to your Supabase project dashboard
   - Navigate to Settings > Edge Functions
   - Add the following secrets:
     - `STRIPE_SECRET_KEY`: Your Stripe secret key
     - `STRIPE_WEBHOOK_SECRET`: Your webhook secret

## Step 5: Test the Integration

1. **Use Test Mode**
   - Make sure you're using test API keys (they start with `pk_test_` and `sk_test_`)
   - Use Stripe test card numbers for testing

2. **Test Cards**
   ```
   Successful payment: 4242 4242 4242 4242
   Declined payment:   4000 0000 0000 0002
   ```

3. **Test Flow**
   - Browse products on `/resume-services`
   - Click on a service to view details
   - Complete the checkout flow
   - Verify order appears in user dashboard
   - Check Stripe dashboard for payment records

## Step 6: Production Deployment

1. **Switch to Live Keys**
   - Replace test keys with live keys in production
   - Update webhook endpoint to production URL
   - Test with real payment methods

2. **Security Checklist**
   - Ensure all API keys are in environment variables
   - Never commit secrets to version control
   - Enable Stripe's radar for fraud protection
   - Set up proper error monitoring

## Troubleshooting

### Common Issues

1. **Payment Intent Creation Fails**
   - Check if Supabase Edge Function is deployed
   - Verify STRIPE_SECRET_KEY is set correctly
   - Check browser network tab for error details

2. **Webhooks Not Working**
   - Verify webhook URL is correct
   - Check if STRIPE_WEBHOOK_SECRET matches Stripe dashboard
   - Look at Edge Function logs in Supabase

3. **Orders Not Updating**
   - Check if webhook events are being received
   - Verify database permissions and RLS policies
   - Check Supabase logs for errors

### Debug Commands

```bash
# Check if Edge Functions are deployed
supabase functions list

# View Edge Function logs
supabase functions logs --function-name create-payment-intent

# Test webhook locally (requires Stripe CLI)
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
```

## Support

For issues specific to this integration:
1. Check Supabase Edge Function logs
2. Check Stripe Dashboard > Events for webhook delivery
3. Review browser console for client-side errors

For Stripe-specific questions, refer to:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

## File Structure

The integration includes these key files:

```
src/
├── api/
│   ├── StripeApi.js          # Stripe payment functions
│   └── ProductsApi.js        # Product management
├── components/
│   └── StripeCheckoutForm.jsx # Embedded checkout form
├── pages/
│   ├── StripeCheckoutPage.jsx # Checkout page
│   ├── UserDashboardPage.jsx  # Order history
│   └── SuccessPage.jsx       # Payment confirmation
supabase/
├── functions/
│   ├── create-payment-intent/
│   └── stripe-webhook/
└── migrations/
    └── 001_create_products_and_orders.sql
```