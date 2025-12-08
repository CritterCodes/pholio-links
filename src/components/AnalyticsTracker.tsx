'use client';

import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AnalyticsTrackerProps {
  username: string;
}

export function AnalyticsTracker({ username }: AnalyticsTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    // Get or create visitor ID
    let visitorId = localStorage.getItem('ph_visitor_id');
    if (!visitorId) {
      visitorId = uuidv4();
      localStorage.setItem('ph_visitor_id', visitorId);
    }

    // Track View
    const trackView = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'view',
            username,
            visitorId,
            referrer: document.referrer
          })
        });
      } catch (error) {
        console.error('Failed to track view', error);
      }
    };

    trackView();
    tracked.current = true;
  }, [username]);

  return null;
}

export const trackLinkClick = async (username: string, linkId: string) => {
  try {
    const visitorId = localStorage.getItem('ph_visitor_id');
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'click',
        username,
        linkId,
        visitorId,
        referrer: document.referrer
      })
    });
  } catch (error) {
    console.error('Failed to track click', error);
  }
};
