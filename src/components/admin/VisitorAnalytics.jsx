import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Eye, Users, Clock, TrendingUp } from 'lucide-react';

const VisitorAnalytics = ({ dateRange = 30 }) => {
  const [analytics, setAnalytics] = useState({
    totalVisitors: 0,
    uniqueSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    topPages: [],
    visitorTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch visitor stats
      const { data: visitorStats, error: visitorError } = await supabase
        .from('visitor_stats')
        .select('*')
        .gte('date', new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (visitorError) throw visitorError;

      // Calculate totals
      const totals = (visitorStats || []).reduce((acc, day) => ({
        totalVisitors: acc.totalVisitors + (day.unique_visitors || 0),
        pageViews: acc.pageViews + (day.page_views || 0),
        newSessions: acc.newSessions + (day.new_sessions || 0),
        totalDuration: acc.totalDuration + (day.avg_session_duration || 0)
      }), { totalVisitors: 0, pageViews: 0, newSessions: 0, totalDuration: 0 });

      // Fetch top pages from site_analytics
      const { data: pageData, error: pageError } = await supabase
        .from('site_analytics')
        .select('page_path, count(*)')
        .gte('created_at', new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      const topPages = pageData ? 
        Object.entries(pageData.reduce((acc, entry) => {
          acc[entry.page_path] = (acc[entry.page_path] || 0) + 1;
          return acc;
        }, {}))
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([path, views]) => ({ path, views })) : [];

      setAnalytics({
        totalVisitors: totals.totalVisitors,
        uniqueSessions: totals.newSessions,
        avgSessionDuration: totals.totalDuration / (visitorStats?.length || 1),
        bounceRate: visitorStats?.[0]?.bounce_rate || 0,
        topPages,
        visitorTrend: visitorStats || []
      });

    } catch (error) {
      console.error('Error fetching visitor analytics:', error);
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Visitor Analytics</h3>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{analytics.totalVisitors.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Visitors</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-green-600">{analytics.uniqueSessions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">New Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(analytics.avgSessionDuration / 60)}m
              </p>
              <p className="text-sm text-gray-600">Avg Session</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{analytics.bounceRate}%</p>
              <p className="text-sm text-gray-600">Bounce Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Top Pages</h4>
        <div className="space-y-2">
          {analytics.topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
              <span className="text-sm font-medium text-gray-700">{page.path}</span>
              <span className="text-sm text-gray-500">{page.views} views</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visitor Trend */}
      {analytics.visitorTrend.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 mb-3">Visitor Trend</h4>
          <div className="h-32 flex items-end space-x-1">
            {analytics.visitorTrend.slice(-14).map((day, index) => (
              <div
                key={index}
                className="bg-blue-200 rounded-t flex-1 min-w-0"
                style={{
                  height: `${Math.max((day.unique_visitors / Math.max(...analytics.visitorTrend.map(d => d.unique_visitors))) * 100, 5)}%`
                }}
                title={`${day.date}: ${day.unique_visitors} visitors`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorAnalytics;