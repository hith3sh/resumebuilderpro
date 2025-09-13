-- Admin Dashboard Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables and functions

-- 1. Create analytics tracking table
CREATE TABLE IF NOT EXISTS public.site_analytics (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    page_path TEXT NOT NULL,
    user_agent TEXT,
    referrer TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create orders/purchases table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- 'basic', 'premium', 'enterprise'
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    payment_method TEXT,
    stripe_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create revenue tracking table
CREATE TABLE IF NOT EXISTS public.revenue_stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create visitor tracking table  
CREATE TABLE IF NOT EXISTS public.visitor_stats (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    unique_visitors INTEGER DEFAULT 0,
    page_views INTEGER DEFAULT 0,
    new_sessions INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable RLS on new tables
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies (admin-only access)
DROP POLICY IF EXISTS "Admin only access to analytics" ON public.site_analytics;
CREATE POLICY "Admin only access to analytics" ON public.site_analytics
    FOR ALL USING (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admin only access to orders" ON public.orders;
CREATE POLICY "Admin only access to orders" ON public.orders
    FOR ALL USING (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admin only access to revenue stats" ON public.revenue_stats;
CREATE POLICY "Admin only access to revenue stats" ON public.revenue_stats
    FOR ALL USING (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

DROP POLICY IF EXISTS "Admin only access to visitor stats" ON public.visitor_stats;
CREATE POLICY "Admin only access to visitor stats" ON public.visitor_stats
    FOR ALL USING (
        (auth.jwt() ->> 'user_metadata')::json ->> 'role' = 'admin'
        OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 7. Create dashboard summary view with RLS
CREATE OR REPLACE VIEW public.admin_dashboard_summary AS
SELECT 
    -- User Statistics
    (SELECT COUNT(*) FROM public.profiles) as total_users,
    (SELECT COUNT(*) FROM public.profiles WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM public.profiles WHERE role = 'admin') as admin_users,
    
    -- Resume Statistics
    (SELECT COUNT(*) FROM public.profiles WHERE ats_score IS NOT NULL) as resumes_analyzed,
    (SELECT ROUND(AVG(ats_score), 1) FROM public.profiles WHERE ats_score IS NOT NULL) as avg_ats_score,
    (SELECT COUNT(*) FROM public.profiles WHERE resume_url IS NOT NULL) as resumes_uploaded,
    
    -- Order Statistics
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders) as total_orders,
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders WHERE status = 'completed') as completed_orders,
    (SELECT COALESCE(SUM(total_amount::decimal / 100), 0) FROM public.orders WHERE status = 'completed') as total_revenue,
    (SELECT COALESCE(COUNT(*), 0) FROM public.orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as orders_30d,
    (SELECT COALESCE(SUM(total_amount::decimal / 100), 0) FROM public.orders WHERE status = 'completed' AND created_at >= CURRENT_DATE - INTERVAL '30 days') as revenue_30d,
    
    -- Visitor Statistics (if tracking implemented)
    (SELECT COALESCE(SUM(unique_visitors), 0) FROM public.visitor_stats WHERE date >= CURRENT_DATE - INTERVAL '30 days') as visitors_30d,
    (SELECT COALESCE(SUM(page_views), 0) FROM public.visitor_stats WHERE date >= CURRENT_DATE - INTERVAL '30 days') as pageviews_30d;

-- Set view to use security invoker (executes with caller's permissions)
ALTER VIEW public.admin_dashboard_summary SET (security_invoker = on);

-- 8. Create function to get recent orders with user email
DROP FUNCTION IF EXISTS public.get_recent_orders(INTEGER);
CREATE OR REPLACE FUNCTION public.get_recent_orders(days_limit INTEGER DEFAULT 30)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    user_email TEXT,
    user_name TEXT,
    stripe_payment_intent_id TEXT,
    total_amount INTEGER,
    currency TEXT,
    status TEXT,
    payment_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.user_id,
        COALESCE(p.email, 'Guest') as user_email,
        COALESCE(p.name, 'N/A') as user_name,
        o.stripe_payment_intent_id,
        o.total_amount,
        o.currency,
        o.status,
        o.payment_status,
        o.created_at
    FROM public.orders o
    LEFT JOIN public.profiles p ON o.user_id = p.id
    WHERE o.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_limit
    ORDER BY o.created_at DESC
    LIMIT 100;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to get revenue trends
DROP FUNCTION IF EXISTS public.get_revenue_trend(INTEGER);
CREATE OR REPLACE FUNCTION public.get_revenue_trend(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    daily_revenue DECIMAL,
    daily_orders INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.created_at::DATE as date,
        COALESCE(SUM(o.total_amount::decimal / 100), 0) as daily_revenue,
        COUNT(*)::INTEGER as daily_orders
    FROM public.orders o
    WHERE o.status = 'completed'
    AND o.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY o.created_at::DATE
    ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to get user growth
DROP FUNCTION IF EXISTS public.get_user_growth(INTEGER);
CREATE OR REPLACE FUNCTION public.get_user_growth(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
    date DATE,
    new_users INTEGER,
    cumulative_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH daily_signups AS (
        SELECT 
            created_at::DATE as signup_date,
            COUNT(*)::INTEGER as daily_new_users
        FROM public.profiles
        WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
        GROUP BY created_at::DATE
    ),
    date_series AS (
        SELECT generate_series(
            CURRENT_DATE - INTERVAL '1 day' * days_back,
            CURRENT_DATE,
            '1 day'::interval
        )::DATE as date
    )
    SELECT 
        ds.date,
        COALESCE(daily_signups.daily_new_users, 0) as new_users,
        (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE created_at::DATE <= ds.date) as cumulative_users
    FROM date_series ds
    LEFT JOIN daily_signups ON ds.date = daily_signups.signup_date
    ORDER BY ds.date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Grant permissions
GRANT SELECT ON public.admin_dashboard_summary TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recent_orders(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_revenue_trend(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_growth(INTEGER) TO authenticated;

-- 12. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_site_analytics_created_at ON public.site_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_site_analytics_session_id ON public.site_analytics(session_id);