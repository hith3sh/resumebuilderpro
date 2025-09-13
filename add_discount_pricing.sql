-- Add original_price_cents column to products table for discount pricing
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price_cents INTEGER;

-- Update existing products with original prices for discount display
UPDATE products SET original_price_cents = 19900 WHERE name = 'Basic Resume';  -- Original: $199, Current: $49.99
UPDATE products SET original_price_cents = 29900 WHERE name = 'Resume + Cover Letter';  -- Original: $299, Current: $99.99  
UPDATE products SET original_price_cents = 39900 WHERE name = 'Full Branding Package';  -- Original: $399, Current: $149.99

-- Verify the updates
SELECT 
    name, 
    (price_cents::float / 100) as current_price_usd,
    (original_price_cents::float / 100) as original_price_usd,
    ((original_price_cents - price_cents)::float / 100) as savings_usd,
    currency 
FROM products 
ORDER BY sort_order;
