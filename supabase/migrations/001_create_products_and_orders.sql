-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT,
    image_url VARCHAR(500),
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    type VARCHAR(50) DEFAULT 'service',
    features JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Store product name at time of purchase
    price INTEGER NOT NULL CHECK (price >= 0), -- Store price at time of purchase
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products(sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products
INSERT INTO products (name, subtitle, description, image_url, price_cents, type, features, sort_order) VALUES
('Basic Resume Review', 'Professional feedback on your resume', 'Get expert feedback on your resume structure, content, and formatting. Our professional reviewers will provide detailed suggestions to improve your resume''s impact.', 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500', 4999, 'service', '["Professional feedback", "Detailed suggestions", "Structure review", "Content optimization"]', 1),
('Premium Resume Rewrite', 'Complete resume transformation', 'Complete rewrite of your resume by our expert writers. We''ll transform your existing resume into a compelling, ATS-optimized document that gets results.', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500', 9999, 'service', '["Complete rewrite", "ATS optimization", "Expert writers", "Industry-specific keywords"]', 2),
('LinkedIn Profile Optimization', 'Optimize your LinkedIn presence', 'Transform your LinkedIn profile to attract recruiters and opportunities. Includes headline optimization, summary rewrite, and experience section enhancement.', 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=500', 7999, 'service', '["Profile optimization", "Recruiter attraction", "Summary rewrite", "Experience enhancement"]', 3),
('Cover Letter Writing', 'Personalized cover letters', 'Custom cover letter writing service that complements your resume perfectly. Tailored to your industry and target positions.', 'https://images.unsplash.com/photo-1586281380177-a5de249bc6eb?w=500', 3999, 'service', '["Custom writing", "Industry-tailored", "Perfect complement", "Target position focus"]', 4);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (active = true);
CREATE POLICY "Only admins can insert products" ON products FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM auth.users 
        JOIN profiles ON auth.users.id = profiles.id 
        WHERE auth.users.id = auth.uid() AND profiles.role = 'admin'
    )
);
CREATE POLICY "Only admins can update products" ON products FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        JOIN profiles ON auth.users.id = profiles.id 
        WHERE auth.users.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Orders policies (users can view their own orders, admins can view all)
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        JOIN profiles ON auth.users.id = profiles.id 
        WHERE auth.users.id = auth.uid() AND profiles.role = 'admin'
    )
);
CREATE POLICY "Users can insert their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders can be updated by system" ON orders FOR UPDATE USING (true); -- Edge functions need to update

-- Order items policies (follow order permissions)
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);
CREATE POLICY "Admins can view all order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM auth.users 
        JOIN profiles ON auth.users.id = profiles.id 
        WHERE auth.users.id = auth.uid() AND profiles.role = 'admin'
    )
);
CREATE POLICY "Order items can be inserted with orders" ON order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
);