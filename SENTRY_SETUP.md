# Sentry Error Tracking - Setup Complete! 🎉

## ✅ What's Installed

Sentry is now fully integrated into your React application and will automatically track:

- **JavaScript Errors** - Any uncaught errors in your code
- **Console Errors** - Errors logged to console
- **Network Failures** - Failed API requests
- **Promise Rejections** - Unhandled promise errors
- **Component Errors** - React component errors via ErrorBoundary
- **Performance Issues** - Slow page loads, long tasks
- **Session Replay** - Video-like replay of user sessions when errors occur

## 🔧 Configuration

- **DSN**: Connected to your Sentry project
- **Environment**: Automatically detects development/production
- **Error Tracking**: ✅ Enabled (production only by default)
- **Performance Monitoring**: ✅ 100% of transactions
- **Session Replay**: ✅ 10% of normal sessions, 100% of error sessions
- **User Tracking**: ✅ Users identified on login

## 🧪 Test Sentry (Optional)

To verify Sentry is working, you can trigger a test error:

### Option 1: Add a test button temporarily
In any component, add:

```tsx
import * as Sentry from "@sentry/react";

<button onClick={() => {
  throw new Error("Test Sentry Error!");
}}>
  Test Sentry
</button>
```

### Option 2: Use browser console
Open DevTools console and run:
```javascript
throw new Error("Test Sentry Error from Console");
```

### Option 3: Manual capture
```typescript
import * as Sentry from "@sentry/react";

Sentry.captureException(new Error("Test Error"));
Sentry.captureMessage("Test Message", "info");
```

## 📊 View Your Errors

1. Go to: https://sentry.io/
2. Log in to your account
3. Select your project
4. Navigate to **Issues** to see all errors
5. Check **Performance** for performance monitoring
6. View **Replays** to watch session recordings

## 🎯 What Gets Tracked Automatically

### Errors
- Syntax errors
- Runtime errors
- Unhandled promise rejections
- Network request failures
- Component lifecycle errors

### User Context
When a user logs in, Sentry tracks:
- User ID (from auth token)
- Session information
- All errors are linked to specific users

### Additional Context
Each error includes:
- Full stack trace
- Browser information
- URL and route
- User actions before error
- Session replay (if error occurred)

## 🔒 Privacy & Production

Current settings:
- **Development**: Errors tracked but debug mode ON (console logs)
- **Production**: Full error tracking enabled
- **Session Replay**: Captures screen recordings when errors occur

To disable error tracking in development, the setting is in `src/lib/sentry.ts`:
```typescript
enabled: import.meta.env.PROD, // Only track in production
```

## 📝 Manual Error Tracking

You can manually track errors or messages:

```typescript
import * as Sentry from "@sentry/react";

// Capture an exception
try {
  // your code
} catch (error) {
  Sentry.captureException(error);
}

// Capture a message
Sentry.captureMessage('Something went wrong', 'warning');

// Add custom context
Sentry.setContext('custom', {
  productId: '12345',
  action: 'purchase',
});

// Add breadcrumbs (user actions leading to error)
Sentry.addBreadcrumb({
  category: 'user-action',
  message: 'User clicked buy button',
  level: 'info',
});
```

## 🚨 Error Fallback UI

When a critical error occurs, users will see a Persian error message:
- "متأسفانه خطایی رخ داد" (An error occurred)
- Option to reload the page
- Error is automatically reported to Sentry

## 🔄 Integration with Existing Tools

Sentry works alongside:
- ✅ **Mixpanel** - For user behavior analytics
- ✅ **Microsoft Clarity** - For heatmaps and session recordings
- Each tool has its own purpose and they complement each other

## 🎓 Best Practices

1. **Don't catch and hide errors** - Let Sentry catch them
2. **Add context** - Use `Sentry.setContext()` for debugging
3. **Set user info** - Already done on login
4. **Review regularly** - Check Sentry dashboard weekly
5. **Set up alerts** - Configure email/Slack notifications in Sentry

## 📧 Alerts (Recommended Setup)

In Sentry dashboard:
1. Go to **Settings** → **Alerts**
2. Create alert rule: "New issue created"
3. Get notified via email/Slack when errors occur
4. Set up spike detection for sudden error increases

## ✅ You're All Set!

Sentry is now monitoring your application in real-time. Any errors will be:
- Automatically captured
- Reported to your dashboard
- Linked to the user who experienced it
- Includes full context for debugging

Visit https://sentry.io/ to see your dashboard! 🎉
