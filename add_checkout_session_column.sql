-- Add stripe_checkout_session_id column to orders table
-- This column will store the Stripe Checkout Session ID for the embedded checkout approach

ALTER TABLE orders 
ADD COLUMN stripe_checkout_session_id TEXT;

-- Create an index for better performance when querying by checkout session ID
CREATE INDEX IF NOT EXISTS idx_orders_stripe_checkout_session_id 
ON orders (stripe_checkout_session_id);

-- Add a comment to document what this column is for
COMMENT ON COLUMN orders.stripe_checkout_session_id 
IS 'Stripe Checkout Session ID for embedded checkout payments';