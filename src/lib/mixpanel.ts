import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
mixpanel.init('bc1f155f890f3f74aeb802b99c4b497b', {
  autocapture: true,
  record_sessions_percent: 100,
  api_host: 'https://api-eu.mixpanel.com',
  debug: import.meta.env.DEV, // Enable debug mode in development
});

// Helper functions for tracking events
export const Mixpanel = {
  // Identify a user
  identify: (userId: string) => {
    mixpanel.identify(userId);
  },

  // Set user properties
  setUserProperties: (properties: Record<string, any>) => {
    mixpanel.people.set(properties);
  },

  // Track a custom event
  track: (eventName: string, properties?: Record<string, any>) => {
    mixpanel.track(eventName, properties);
  },

  // Track page views
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    mixpanel.track('Page View', {
      page: pageName,
      ...properties,
    });
  },

  // Reset user (useful for logout)
  reset: () => {
    mixpanel.reset();
  },
};

export default Mixpanel;
