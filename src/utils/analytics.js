// Simple analytics tracking utility
import { supabase } from '@/lib/customSupabaseClient';

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.pageViews = 0;
    this.lastPageView = Date.now();
    
    // Track page views automatically
    if (typeof window !== 'undefined') {
      this.trackPageView();
      this.setupBeforeUnload();
    }
  }

  generateSessionId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  async trackPageView(customPath = null) {
    if (typeof window === 'undefined') return;
    
    const path = customPath || window.location.pathname;
    this.pageViews++;
    this.lastPageView = Date.now();

    try {
      await supabase.from('site_analytics').insert({
        session_id: this.sessionId,
        page_path: path,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  async trackEvent(eventName, eventData = {}) {
    try {
      await supabase.from('site_analytics').insert({
        session_id: this.sessionId,
        page_path: `event:${eventName}`,
        user_agent: JSON.stringify(eventData),
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.warn('Event tracking failed:', error);
    }
  }

  calculateSessionDuration() {
    return Math.round((Date.now() - this.startTime) / 1000); // in seconds
  }

  setupBeforeUnload() {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeunload', () => {
      this.updateSessionStats();
    });

    // Also update stats periodically
    setInterval(() => {
      this.updateSessionStats();
    }, 30000); // every 30 seconds
  }

  async updateSessionStats() {
    const sessionDuration = this.calculateSessionDuration();
    const currentDate = new Date().toISOString().split('T')[0];
    
    try {
      // Check if today's stats exist
      const { data: existing, error: fetchError } = await supabase
        .from('visitor_stats')
        .select('*')
        .eq('date', currentDate)
        .single();

      const isNewSession = this.pageViews === 1;
      const isBounce = this.pageViews === 1 && sessionDuration < 30;

      if (existing) {
        // Update existing stats
        await supabase
          .from('visitor_stats')
          .update({
            unique_visitors: existing.unique_visitors + (isNewSession ? 1 : 0),
            page_views: existing.page_views + 1,
            new_sessions: existing.new_sessions + (isNewSession ? 1 : 0),
            avg_session_duration: Math.round(
              (existing.avg_session_duration * existing.new_sessions + sessionDuration) / 
              (existing.new_sessions + (isNewSession ? 1 : 0))
            ),
            bounce_rate: Math.round(
              ((existing.bounce_rate / 100) * existing.new_sessions + (isBounce ? 1 : 0)) / 
              (existing.new_sessions + (isNewSession ? 1 : 0)) * 100
            )
          })
          .eq('date', currentDate);
      } else if (isNewSession) {
        // Create new stats for today
        await supabase
          .from('visitor_stats')
          .insert({
            date: currentDate,
            unique_visitors: 1,
            page_views: this.pageViews,
            new_sessions: 1,
            avg_session_duration: sessionDuration,
            bounce_rate: isBounce ? 100 : 0
          });
      }
    } catch (error) {
      console.warn('Session stats update failed:', error);
    }
  }

  // Track specific resume builder events
  async trackResumeUpload() {
    await this.trackEvent('resume_upload');
  }

  async trackResumeAnalysis(score) {
    await this.trackEvent('resume_analysis', { score });
  }

  async trackPurchaseIntent(productType) {
    await this.trackEvent('purchase_intent', { product: productType });
  }

  async trackPurchaseComplete(orderId, amount) {
    await this.trackEvent('purchase_complete', { orderId, amount });
  }
}

// Create singleton instance
const analytics = new Analytics();

export default analytics;