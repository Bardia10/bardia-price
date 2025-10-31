# Mixpanel Analytics Integration Guide

## Overview
Mixpanel has been successfully integrated into your application to track user behavior, feature usage, and page navigation.

## What's Already Tracking

### Automatic Tracking (Autocapture)
Mixpanel is configured with **autocapture** enabled, which automatically tracks:
- ✅ All button clicks
- ✅ Form submissions
- ✅ Link clicks
- ✅ Page views (via custom hook)
- ✅ User sessions (100% recording enabled)

### Custom Events Already Implemented
1. **Page View** - Tracks every route change with pathname, search, and hash
2. **User Login** - Tracks when a user successfully logs in
3. **User Logout** - Tracks when a user logs out

## How to Add Custom Event Tracking

### Import Mixpanel
```typescript
import { Mixpanel } from '../lib/mixpanel';
```

### Track a Custom Event
```typescript
// Simple event
Mixpanel.track('Button Clicked');

// Event with properties
Mixpanel.track('Product Added to Cart', {
  productId: '12345',
  productName: 'Sample Product',
  price: 99.99,
  category: 'Electronics'
});
```

### Common Use Cases

#### 1. Track Product Views
```typescript
// In your ProductDetail.tsx
Mixpanel.track('Product Viewed', {
  productId: product.id,
  productName: product.title,
  price: product.price,
});
```

#### 2. Track Search
```typescript
// In your search component
Mixpanel.track('Search Performed', {
  searchTerm: searchQuery,
  resultsCount: results.length,
});
```

#### 3. Track Feature Usage
```typescript
// When user uses a specific feature
Mixpanel.track('Filter Applied', {
  filterType: 'price',
  minPrice: 0,
  maxPrice: 1000,
});
```

#### 4. Track Errors
```typescript
try {
  // your code
} catch (error) {
  Mixpanel.track('Error Occurred', {
    errorMessage: error.message,
    errorType: 'API_ERROR',
    page: window.location.pathname,
  });
}
```

## User Properties

### Set User Properties
```typescript
// After successful login, set additional user info
Mixpanel.setUserProperties({
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium',
  signupDate: new Date().toISOString(),
});
```

## Best Practices

1. **Be Descriptive**: Use clear event names like "Product Added to Cart" instead of "click"
2. **Include Context**: Add relevant properties to understand the context
3. **Track User Actions**: Track what users do, not just pageviews
4. **Avoid PII**: Don't track sensitive personal information without proper consent

## Viewing Your Data

1. Go to [Mixpanel Dashboard](https://eu.mixpanel.com/)
2. Select your project
3. Navigate to "Events" to see all tracked events
4. Use "Insights" to create reports and funnels
5. Check "Session Replay" to watch user sessions

## Example: Complete Product Tracking

```typescript
// In ProductDetail.tsx
import { Mixpanel } from '../lib/mixpanel';

const ProductDetail = () => {
  useEffect(() => {
    // Track product view
    Mixpanel.track('Product Viewed', {
      productId: product.id,
      productName: product.title,
      price: product.price,
      category: product.category,
    });
  }, [product]);

  const handleAddToCart = () => {
    Mixpanel.track('Add to Cart Clicked', {
      productId: product.id,
      price: product.price,
    });
    // ... your add to cart logic
  };

  const handleBuyNow = () => {
    Mixpanel.track('Buy Now Clicked', {
      productId: product.id,
      price: product.price,
    });
    // ... your buy now logic
  };

  return (
    // ... your component
  );
};
```

## Configuration

The Mixpanel configuration is in `src/lib/mixpanel.ts`:
- **Project Token**: bc1f155f890f3f74aeb802b99c4b497b
- **API Host**: https://api-eu.mixpanel.com (EU region)
- **Autocapture**: Enabled
- **Session Recording**: 100% of sessions
- **Debug Mode**: Enabled in development only

## Troubleshooting

### Check if Events are Being Sent
1. Open browser DevTools (F12)
2. Go to Console tab
3. You should see Mixpanel debug logs (only in development mode)
4. Check Network tab for requests to `api-eu.mixpanel.com`

### Events Not Showing in Dashboard
- Wait 2-3 minutes for data to appear
- Check browser console for errors
- Verify your project token is correct
- Ensure ad blockers are disabled (they may block analytics)

## Next Steps

Consider tracking these key events for your e-commerce app:
1. Product searches
2. Filter applications
3. Product comparisons
4. Competitor views
5. Price changes
6. Add to favorites
7. Share product
8. Contact form submissions
