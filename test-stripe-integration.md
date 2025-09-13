# Stripe Integration Testing Guide

## Quick Test Setup (No Real Payments!)

### Step 1: Environment Setup
```env
# Add to your .env file (these are SAFE test keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here
```

### Step 2: Test Database Setup
Run this SQL in Supabase SQL editor to create test products:

```sql
-- Insert test products (if not already created by migration)
INSERT INTO products (name, subtitle, description, price_cents, currency, features, sort_order) VALUES
('Test Resume Review', 'Test service - no real payment', 'This is a test product for development', 2999, 'USD', '["Test feature 1", "Test feature 2"]', 1),
('Test Premium Service', 'Another test service', 'Premium test product for development', 7999, 'USD', '["Premium feature 1", "Premium feature 2", "Premium feature 3"]', 2);
```

### Step 3: Test Flow

#### A. User Registration Test
1. Go to `/login`
2. Sign up with a test email (like `test@example.com`)
3. Verify you can access `/dashboard`

#### B. Product Browsing Test  
1. Visit `/resume-services`
2. Verify products load from database
3. Click on a service to view details
4. Check that pricing displays correctly

#### C. Checkout Flow Test
1. From product page, click "Purchase Service"
2. Should redirect to `/stripe-checkout`
3. Verify order summary shows correct items and total

#### D. Payment Form Test
1. In the Stripe form, use test card: `4242 4242 4242 4242`
2. Enter expiry: `12/25`, CVC: `123`
3. Click "Complete Payment"
4. Should redirect to `/success` page with confirmation

#### E. Order Tracking Test
1. Go to user `/dashboard` 
2. Verify the test order appears in purchase history
3. Check order status and payment status

### Step 4: Error Testing

#### Test Declined Card
1. Use card number: `4000 0000 0000 0002`
2. Should show error message
3. Order should not be created

#### Test Network Issues
1. Disconnect internet briefly during checkout
2. Verify proper error handling
3. Check that partial orders don't get created

### Step 5: Webhook Testing (Advanced)

#### Using Stripe CLI (Optional)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Test webhook locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test webhook
stripe trigger payment_intent.succeeded
```

#### Manual Webhook Test
1. In Stripe Dashboard > Webhooks
2. Click on your webhook endpoint
3. Click "Send test webhook"
4. Select `payment_intent.succeeded`
5. Check if order status updates in database

## Expected Results

### ✅ Successful Test Flow
1. **Product Loading**: Services display with correct prices
2. **User Authentication**: Login/signup works
3. **Checkout Process**: Form loads with Stripe elements
4. **Payment Processing**: Test card processes successfully
5. **Order Creation**: Order appears in user dashboard
6. **Webhook Processing**: Order status updates automatically

### ❌ Common Test Issues

#### "Invalid API Key"
- Check that your publishable key starts with `pk_test_`
- Verify environment variable is loaded correctly

#### "Payment Failed"
- Make sure you're using valid test card numbers
- Check browser console for detailed error messages

#### "Order Not Created"
- Verify Supabase Edge Function is deployed
- Check Supabase function logs for errors

#### "Dashboard Empty"
- Check if user has proper authentication
- Verify database permissions (RLS policies)

## Test Card Scenarios

```javascript
// Card testing scenarios
const testScenarios = [
  {
    name: "Successful Payment",
    card: "4242 4242 4242 4242",
    expected: "Payment succeeds, order created"
  },
  {
    name: "Declined Card", 
    card: "4000 0000 0000 0002",
    expected: "Payment fails, no order created"
  },
  {
    name: "Requires Authentication",
    card: "4000 0025 0000 3155", 
    expected: "3D Secure popup appears"
  },
  {
    name: "Insufficient Funds",
    card: "4000 0000 0000 9995",
    expected: "Specific decline reason shown"
  }
];
```

## Monitoring Tools

### Stripe Dashboard
- View all test payments at dashboard.stripe.com
- Check Events tab for webhook deliveries
- Review Logs for API call details

### Supabase Dashboard  
- Monitor Edge Function logs
- Check database for order records
- Review authentication logs

### Browser DevTools
- Network tab for API calls
- Console for JavaScript errors
- Application tab for localStorage/session data

## Production Checklist

Before going live, test with live keys:

- [ ] Replace test keys with live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real card (small amount)
- [ ] Verify webhook delivery to production
- [ ] Check order creation in production database
- [ ] Test email confirmations (if implemented)

Remember: Test mode is completely separate from live mode - no real money is ever processed with test keys!