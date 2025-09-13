-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create products table (simple version)
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    image_url TEXT,
    price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    type TEXT DEFAULT 'service',
    features JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create orders table (simple version)
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    stripe_payment_intent_id TEXT,
    total_amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'unpaid',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create order_items table
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,
    product_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Add foreign key constraints
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT order_items_order_id_fkey 
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id);

-- Step 6: Add indexes
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_sort_order ON products(sort_order);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Step 7: Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
CREATE POLICY "Anyone can view active products" ON products 
    FOR SELECT USING (active = true);

CREATE POLICY "Users can view their own orders" ON orders 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON orders 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update orders" ON orders 
    FOR UPDATE USING (true);

CREATE POLICY "Users can view their order items" ON order_items 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );

CREATE POLICY "Users can create order items for their orders" ON order_items 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    );

-- Step 9: Insert sample products
INSERT INTO products (name, subtitle, description, image_url, price_cents, type, features, sort_order) VALUES
('Basic Resume Review', 
 'Professional feedback on your resume', 
 'Get expert feedback on your resume structure, content, and formatting from our professional reviewers.',
 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500',
 4999,
 'service',
 '["Professional feedback", "Structure review", "Content optimization", "Formatting suggestions"]',
 1),

('Premium Resume Rewrite', 
 'Complete resume transformation', 
 'Complete rewrite of your resume by our expert writers. Transform your existing resume into a compelling, ATS-optimized document.',
 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500',
 9999,
 'service',
 '["Complete rewrite", "ATS optimization", "Expert writers", "Industry keywords"]',
 2),

('LinkedIn Profile Optimization', 
 'Optimize your LinkedIn presence', 
 'Transform your LinkedIn profile to attract recruiters and opportunities. Includes headline and summary optimization.',
 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500',
 7999,
 'service',
 '["Profile optimization", "Headline writing", "Summary rewrite", "Recruiter attraction"]',
 3),

('Cover Letter Writing', 
 'Personalized cover letters', 
 'Custom cover letter writing service that complements your resume perfectly. Tailored to your target industry.',
 'https://images.unsplash.com/photo-1586281380177-a5de249bc6eb?w=500',
 3999,
 'service',
 '["Custom writing", "Industry-tailored", "Perfect complement", "Professional format"]',
 4);

-- Step 10: Verify setup
SELECT 'Database setup completed successfully!' as message;
SELECT name, (price_cents::float / 100) as price_usd, currency FROM products ORDER BY sort_order;