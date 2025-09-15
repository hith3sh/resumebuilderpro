import { useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

// Generate a session ID for the user's session
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Track page view
const trackPageView = async (pagePath) => {
  try {
    const sessionId = getSessionId();

    // Get basic browser info
    const userAgent = navigator.userAgent;
    const referrer = document.referrer || null;

    // Insert page view into analytics table
    const { error } = await supabase
      .from('site_analytics')
      .insert({
        session_id: sessionId,
        page_path: pagePath,
        user_agent: userAgent,
        referrer: referrer,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Analytics tracking error:', error);
    }
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

// Custom hook for page tracking
export const usePageTracking = (pageName = null) => {
  useEffect(() => {
    // Get current page path
    const pagePath = pageName || window.location.pathname;

    // Track the page view
    trackPageView(pagePath);

    // Optional: Track page view on route changes
    const handleRouteChange = () => {
      trackPageView(window.location.pathname);
    };

    // Listen for route changes (for SPA navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [pageName]);
};

// Function to aggregate daily stats (should be called by a daily cron job or admin action)
export const aggregateDailyStats = async (date = new Date()) => {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = `${dateStr}T00:00:00.000Z`;
    const endOfDay = `${dateStr}T23:59:59.999Z`;

    // Get analytics for the day
    const { data: dailyAnalytics, error } = await supabase
      .from('site_analytics')
      .select('session_id, created_at')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) throw error;

    if (!dailyAnalytics || dailyAnalytics.length === 0) {
      return;
    }

    // Calculate metrics
    const uniqueVisitors = new Set(dailyAnalytics.map(entry => entry.session_id)).size;
    const pageViews = dailyAnalytics.length;
    const newSessions = uniqueVisitors; // Simplified: assume all sessions are new for daily aggregation

    // Check if stats already exist for this date
    const { data: existingStats } = await supabase
      .from('visitor_stats')
      .select('id')
      .eq('date', dateStr)
      .single();

    if (existingStats) {
      // Update existing stats
      await supabase
        .from('visitor_stats')
        .update({
          unique_visitors: uniqueVisitors,
          page_views: pageViews,
          new_sessions: newSessions,
          updated_at: new Date().toISOString()
        })
        .eq('date', dateStr);
    } else {
      // Insert new stats
      await supabase
        .from('visitor_stats')
        .insert({
          date: dateStr,
          unique_visitors: uniqueVisitors,
          page_views: pageViews,
          new_sessions: newSessions,
          bounce_rate: 0, // Could be calculated with more sophisticated tracking
          avg_session_duration: 0 // Would need session timing implementation
        });
    }

    console.log(`Daily stats aggregated for ${dateStr}: ${uniqueVisitors} visitors, ${pageViews} page views`);
  } catch (error) {
    console.error('Error aggregating daily stats:', error);
  }
};