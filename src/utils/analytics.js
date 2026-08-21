/**
 * Google Analytics 4 (GA4) Tracker for ScholarHub AI
 * Handles real-time page views, SPA virtual route tracking, and custom events.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-N1DMCFW806';

/**
 * Tracks a page view in Google Analytics
 */
export const trackPageView = (path, title) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    const pagePath = path || window.location.pathname + window.location.search;
    const pageTitle = title || document.title;
    const pageLocation = window.location.href;

    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
    });

    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: pageLocation,
      send_to: GA_MEASUREMENT_ID
    });
  }
};

/**
 * Tracks a custom event in Google Analytics
 */
export const trackEvent = (action, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      ...params,
      send_to: GA_MEASUREMENT_ID
    });
  }
};

/**
 * React Router component to capture every SPA client-side route change
 */
export function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
}
