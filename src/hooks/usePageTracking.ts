import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mixpanel } from '../lib/mixpanel';

/**
 * Hook to automatically track page views in React Router
 */
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page view whenever the route changes
    Mixpanel.trackPageView(location.pathname, {
      search: location.search,
      hash: location.hash,
    });
  }, [location]);
};
