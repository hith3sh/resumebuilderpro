# Enhanced Admin Dashboard Setup Guide

## Overview
This comprehensive admin dashboard provides critical business insights including:
- **Revenue Analytics**: Revenue tracking, order management, growth metrics
- **User Management**: Customer profiles, user analytics, growth trends  
- **Resume Analytics**: ATS scores, industry breakdown, performance insights
- **Visitor Analytics**: Page views, session tracking, traffic analysis

## Setup Instructions

### 1. Database Setup
Run the following SQL files in your Supabase SQL Editor in this order:

```bash
# 1. Fix RLS policies first
admin-dashboard-schema.sql

# 2. Create admin account
create-admin-account.sql  # Update with your admin email

# 3. Enable admin policies
admin-setup-complete.sql
```

### 2. Install Dependencies
The dashboard uses Radix UI Tabs component. Ensure you have:
```bash
npm install @radix-ui/react-tabs
```

### 3. File Structure Created
```
src/
├── pages/
│   └── EnhancedAdminDashboardPage.jsx    # Main dashboard
├── components/
│   └── admin/
│       ├── VisitorAnalytics.jsx         # Traffic & visitor metrics
│       ├── RevenueChart.jsx             # Revenue & order analytics  
│       └── ResumeAnalytics.jsx          # Resume performance metrics
├── utils/
│   └── analytics.js                     # Client-side tracking
└── App.jsx                              # Updated routing
```

### 4. Key Features

#### Revenue Analytics
- **Total Revenue & Growth**: Track revenue trends and growth rates
- **Order Management**: View all orders with status tracking
- **Product Performance**: Top-selling products and metrics
- **Daily Revenue Charts**: Visual revenue trends

#### User Management  
- **Customer Profiles**: Edit user information and roles
- **User Growth**: Track new user registrations
- **Industry Analysis**: See which industries use your service most
- **Role Management**: Promote users to admin

#### Resume Analytics
- **ATS Score Tracking**: Average scores and distributions
- **Industry Breakdown**: Performance by industry
- **Completion Rates**: Upload to analysis conversion
- **Performance Insights**: High performers vs needs improvement

#### Visitor Analytics
- **Traffic Tracking**: Page views, unique visitors, sessions
- **Top Pages**: Most visited pages
- **Session Metrics**: Duration and bounce rates
- **Visitor Trends**: Daily traffic patterns

### 5. Dashboard Features

#### Navigation & Controls
- **Tabbed Interface**: Overview, Orders, Users, Analytics tabs
- **Date Range Selector**: 7, 30, 90-day views
- **Real-time Refresh**: Manual refresh button
- **Responsive Design**: Works on all screen sizes

#### Summary Cards
- Total Revenue & 30-day revenue
- Total Orders & monthly orders  
- Total Users & new users
- Resume Analysis metrics
- Visitor statistics
- Conversion rates

### 6. Analytics Tracking

The dashboard includes automatic visitor tracking:

```javascript
import analytics from '@/utils/analytics';

// Automatic tracking
analytics.trackPageView();
analytics.trackResumeUpload();
analytics.trackPurchaseComplete(orderId, amount);
```

### 7. Database Tables Created

#### Core Tables
- `site_analytics`: Page views and visitor tracking
- `orders`: Purchase and revenue tracking
- `revenue_stats`: Daily revenue aggregation
- `visitor_stats`: Daily visitor aggregation

#### Views & Functions
- `admin_dashboard_summary`: Key metrics summary
- `get_recent_orders()`: Recent order data
- `get_revenue_trend()`: Revenue trend analysis
- `get_user_growth()`: User growth tracking

### 8. Security & Permissions

#### Row Level Security
- Admin-only access to all analytics tables
- User-specific access to profile data
- Service role access for admin operations

#### Admin Account Creation
1. Create regular account through app
2. Update user metadata or profiles table with admin role
3. Admin shield icon appears in header

### 9. Access the Dashboard

1. **Create Admin Account**: Follow admin setup instructions
2. **Login**: Use magic link authentication  
3. **Access**: Click admin shield icon in header or visit `/admin`
4. **Navigate**: Use tabs to explore different analytics sections

### 10. Customization Options

#### Adding New Metrics
1. Create new component in `src/components/admin/`
2. Add database functions in SQL
3. Import and use in `EnhancedAdminDashboardPage.jsx`

#### Modifying Date Ranges
Update the date range selector in the dashboard header:
```javascript
<option value={180}>Last 6 months</option>
<option value={365}>Last year</option>
```

### 11. Testing

#### Verify Setup
1. **Database**: Confirm all tables and functions created
2. **Admin Access**: Ensure admin user can access `/admin`
3. **Data Display**: Check that summary cards show data
4. **Permissions**: Verify regular users cannot access admin routes

#### Sample Data
To test with sample data, run:
```sql
-- Insert sample orders
INSERT INTO public.orders (customer_email, customer_name, product_name, product_type, amount, status) VALUES
('test1@example.com', 'John Doe', 'Premium Resume Package', 'premium', 149.99, 'completed'),
('test2@example.com', 'Jane Smith', 'Basic Resume Review', 'basic', 49.99, 'completed'),
('test3@example.com', 'Bob Johnson', 'Executive Package', 'enterprise', 299.99, 'completed');
```

### 12. Monitoring & Maintenance

#### Performance
- Database indexes created for optimal query performance
- Pagination implemented for large datasets
- Efficient aggregation queries

#### Updates
- Dashboard refreshes data automatically
- Manual refresh button for real-time updates
- Error handling for failed API calls

This dashboard provides comprehensive business intelligence for your resume builder platform, enabling data-driven decisions for growth and optimization.