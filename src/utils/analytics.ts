import { createClient } from "@/utils/supabase/client";

export type AnalyticsEventType = 
  | 'book_click' 
  | 'package_select' 
  | 'portfolio_view' 
  | 'pricing_view' 
  | 'booking_started' 
  | 'booking_completed'
  | 'vault_view'
  | 'photo_download'
  | 'team_booking_started'
  | 'team_booking_completed';

export const trackEvent = async (type: AnalyticsEventType, metadata: any = {}) => {
  const supabase = createClient();
  try {
    await supabase.from('analytics_events').insert([{
      event_type: type,
      metadata: {
        ...metadata,
        path: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      }
    }]);
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};
