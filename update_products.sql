-- Clear existing products and insert the 3 correct service bundles
DELETE FROM products;

-- Insert the 3 service bundles that match the UI
INSERT INTO products (name, subtitle, description, image_url, price_cents, type, features, sort_order) VALUES

-- Basic Resume ($49.99)
('Basic Resume', 
 'Professional ATS-friendly resume', 
 'Get a professionally written, ATS-friendly resume to land more interviews.',
 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500',
 4999,
 'service',
 '["Optimized Resume (ATS-friendly)", "Boosted recruiter visibility", "Increased interview opportunities"]',
 1),

-- Resume + Cover Letter ($99.99) - Most Popular
('Resume + Cover Letter',
 'Powerful duo for strong impression',
 'A powerful duo to make a strong impression on recruiters.',
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500',
 9999,
 'service',
 '["Optimized Resume (ATS-friendly)", "Targeted Cover Letter", "Boosted recruiter visibility", "Increased interview opportunities"]',
 2),

-- Full Branding Package ($149.99)
('Full Branding Package',
 'Complete job search domination',
 'The complete package to dominate your job search.',
 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500',
 14999,
 'service',
 '["Optimized Resume (ATS-friendly)", "Targeted Cover Letter", "Optimized LinkedIn Profile", "Alignment across all assets", "Boosted recruiter visibility", "Increased interview opportunities"]',
 3);

-- Verify the new products
SELECT name, (price_cents::float / 100) as price_usd, currency, features FROM products ORDER BY sort_order;