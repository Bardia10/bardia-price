# SSO Implementation Test Guide

## Overview
The Basalam SSO integration has been successfully implemented with both login and signup flows.

## What's Been Implemented

### 1. **Core SSO Service** (`src/services/ssoService.ts`)
- `getOAuthStartUrl()` - Initiates OAuth flow with Basalam
- `exchangeCodeForToken()` - Exchanges authorization code for JWT token
- `setPassword()` - Sets password for new SSO users

### 2. **New Pages**
- **SignupPage** (`/signup`) - Traditional signup + SSO signup option
- **SetPassword** (`/set-password`) - Password setup for SSO users
- **AuthCallback** (`/auth/callback`) - Handles OAuth responses

### 3. **Updated Pages**
- **LoginPage** (`/login`) - Added "ورود با باسلام" SSO button
- **App.tsx** - Added all new routes and navigation logic

### 4. **SSO Flow States**
- `tempToken` - Temporary token from OAuth for password setup
- `ssoFlow` - Tracks whether user is in 'login' or 'signup' flow

## Testing the Implementation

### **SSO Signup Flow**
1. Visit: `http://localhost:5173/signup`
2. Click "ثبت‌نام با باسلام" button
3. → Redirects to Basalam OAuth (basalam.com)
4. → User authorizes app on Basalam
5. → Redirects back to `/auth/callback?code=...`
6. → System exchanges code for temp token
7. → Redirects to `/set-password`
8. → User sets password
9. → Account created, redirects to `/login` with credentials

### **SSO Login Flow**
1. Visit: `http://localhost:5173/login`
2. Click "ورود با باسلام" button
3. → Redirects to Basalam OAuth
4. → User authorizes app
5. → Redirects back to `/auth/callback?code=...`
6. → System exchanges code for JWT token
7. → Auto-login, redirects to dashboard

### **Traditional Flows**
- Regular signup/login forms still work as before
- Navigation between login/signup pages works

## Backend API Endpoints Used

All endpoints are at: `https://n8nstudent.dotavvab.com/webhook/pricer`

1. **GET** `/auth/start` - Get OAuth authorization URL
2. **POST** `/auth/exchange-token` - Exchange code for token
   ```json
   { "code": "oauth_authorization_code" }
   ```
3. **POST** `/password` - Set password for SSO user
   ```json
   { "tempToken": "temp_jwt", "password": "user_password" }
   ```

## OAuth Configuration
- **Client ID**: 1383
- **Redirect URI**: `http://myapp.test:5173/auth/callback`
- **Scope**: Full access as configured

## Custom Domain Support
- Development server accessible at: `http://myapp.test:5173`
- Configured in `vite.config.ts` with `allowedHosts`

## Error Handling
- All API calls have proper error handling
- User-friendly Persian error messages
- Fallback navigation if flows fail
- Temp token validation and cleanup

## State Management
- SSO state persisted in localStorage/sessionStorage
- Context updates for real-time UI changes
- Proper cleanup after successful flows

## Security Features
- JWT tokens for authentication
- Temp tokens for secure password setup
- Authorization code flow (more secure than implicit)
- Proper token validation and cleanup

---

**Ready to test!** 🚀

The complete SSO implementation is now functional and ready for testing with both signup and login flows.