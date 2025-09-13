-- Check if the original_price_cents column exists and has data
SELECT 
    name,
    price_cents,
    original_price_cents,
    (price_cents::float / 100) as current_price_usd,
    (original_price_cents::float / 100) as original_price_usd,
    ((original_price_cents - price_cents)::float / 100) as savings_usd
FROM products 
WHERE active = true
ORDER BY sort_order;
