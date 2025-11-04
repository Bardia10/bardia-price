import * as Sentry from "@sentry/react";

// Initialize Sentry
Sentry.init({
  dsn: "https://79bc481dc5c1650ff6dd70b44dee4821@o4510306318745600.ingest.us.sentry.io/4510306332442624",
  
  // Performance Monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  
  // Performance Monitoring - capture 100% of transactions in production
  tracesSampleRate: 1.0,
  
  // Session Replay - capture 10% of sessions, 100% of error sessions
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment
  environment: import.meta.env.MODE, // 'development' or 'production'
  
  // Disable debug mode to reduce console noise
  debug: false,
  
  // Only enable in production (not in development)
  enabled: import.meta.env.PROD,
});

export default Sentry;
