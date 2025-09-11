import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { DollarSign, TrendingUp, CreditCard, Users } from 'lucide-react';

const RevenueChart = ({ dateRange = 30 }) => {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    dailyRevenue: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueData();
  }, [dateRange]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      
      // Fetch revenue trend
      const { data: revenuetrend, error: trendError } = await supabase
        .rpc('get_revenue_trend', { days_back: dateRange });

      if (trendError) throw trendError;

      // Calculate totals and growth
      const totalRevenue = (revenuetrend || []).reduce((sum, day) => sum + Number(day.daily_revenue || 0), 0);
      const totalOrders = (revenuetrend || []).reduce((sum, day) => sum + Number(day.daily_orders || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth (compare first half vs second half of period)
      const halfPoint = Math.floor(dateRange / 2);
      const firstHalf = (revenuetrend || []).slice(0, halfPoint).reduce((sum, day) => sum + Number(day.daily_revenue || 0), 0);
      const secondHalf = (revenuetrend || []).slice(halfPoint).reduce((sum, day) => sum + Number(day.daily_revenue || 0), 0);
      const revenueGrowth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100) : 0;

      // Fetch top products
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('product_name, amount')
        .eq('status', 'completed')
        .gte('created_at', new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString());

      const productStats = (orders || []).reduce((acc, order) => {
        if (!acc[order.product_name]) {
          acc[order.product_name] = { count: 0, revenue: 0 };
        }
        acc[order.product_name].count += 1;
        acc[order.product_name].revenue += Number(order.amount);
        return acc;
      }, {});

      const topProducts = Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      setRevenueData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        revenueGrowth,
        dailyRevenue: revenuetrend || [],
        topProducts
      });

    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueData.dailyRevenue.map(d => Number(d.daily_revenue)));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Revenue Analytics</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">
                ${revenueData.totalRevenue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{revenueData.totalOrders}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                ${revenueData.avgOrderValue.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Avg Order Value</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className={`text-2xl font-bold ${revenueData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueData.revenueGrowth >= 0 ? '+' : ''}{revenueData.revenueGrowth.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Growth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      {revenueData.dailyRevenue.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Daily Revenue Trend</h4>
          <div className="h-40 flex items-end space-x-1 bg-gray-50 p-4 rounded-lg">
            {revenueData.dailyRevenue.slice(-14).map((day, index) => (
              <div className="flex-1 flex flex-col items-center" key={index}>
                <div
                  className="bg-green-500 rounded-t w-full min-h-[4px]"
                  style={{
                    height: `${Math.max((Number(day.daily_revenue) / maxRevenue) * 100, 3)}%`
                  }}
                  title={`${day.date}: $${Number(day.daily_revenue).toFixed(2)}`}
                />
                <span className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-3">Top Performing Products</h4>
        <div className="space-y-2">
          {revenueData.topProducts.map((product, index) => (
            <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium text-gray-700">{product.name}</p>
                <p className="text-xs text-gray-500">{product.count} orders</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-green-600">${product.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  ${(product.revenue / product.count).toFixed(2)} avg
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-md font-medium text-gray-700 mb-3">Revenue Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-blue-50 rounded">
            <p className="font-semibold text-blue-600">Daily Average</p>
            <p className="text-lg font-bold text-blue-800">
              ${(revenueData.totalRevenue / dateRange).toFixed(2)}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <p className="font-semibold text-purple-600">Orders per Day</p>
            <p className="text-lg font-bold text-purple-800">
              {(revenueData.totalOrders / dateRange).toFixed(1)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <p className="font-semibold text-green-600">Revenue per Order</p>
            <p className="text-lg font-bold text-green-800">
              ${revenueData.avgOrderValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;