# Cross-Domain Authentication Fix

This update resolves authentication issues when accessing the staging API from localhost development environment.

## Problem
When accessing `https://api.staging.learning.edubot.it.com` from `localhost:5173`, browsers block cross-domain cookies, causing 401 authentication errors.

## Solution
Added token fallback mechanism that works alongside cookie-based authentication:

### 1. Token Storage
- Tokens are stored in `localStorage` as fallback
- Automatically extracted from login response
- Used when cookies fail due to cross-domain restrictions

### 2. API Client Updates
- Added Authorization header fallback for all requests
- Automatic token extraction from login responses
- Token cleanup on 401 errors

### 3. Authentication Flow
- **Primary**: Cookie-based authentication (normal production flow)
- **Fallback**: Bearer token in Authorization header (cross-domain development)

## Files Updated

### Frontend
- `src/shared/api/client.js` - Added token management and fallback logic
- `src/context/AuthContext.jsx` - Enhanced logout to clear stored tokens
- `src/pages/Login.jsx` - Added token extraction and debug logging
- `src/shared/utils/auth.js` - New utility for cross-domain detection

### Backend
- `src/auth/auth-cookie.ts` - Updated cookie configuration for cross-domain
- `src/auth/auth.controller.ts` - Added token to login response
- `src/main.ts` - Enhanced CORS configuration

## Environment Setup

### Backend
Set this environment variable in staging:
```bash
ALLOW_LOCALHOST=true
```

### Frontend
No additional configuration needed. The system automatically detects cross-domain scenarios.

## Debug Information

Open browser console during login to see debug information:
```javascript
// Check auth status
localStorage.getItem('auth_token')  // Should show token after login
document.cookie.includes('edubot_access_token')  // May be false in cross-domain
```

## Usage

### Normal Production (Same Domain)
- Uses cookies only
- No localStorage tokens
- Normal security flow

### Cross-Domain Development (localhost → staging)
- Uses token fallback automatically
- Tokens stored in localStorage
- Authorization header added to all requests

## Security Notes

- Tokens are only used in development/cross-domain scenarios
- Production still uses secure cookie-only authentication
- Tokens are cleared on logout and 401 errors
- Same JWT token expiration applies

## Testing

1. Deploy backend changes to staging with `ALLOW_LOCALHOST=true`
2. Update frontend code
3. Try logging in from localhost to staging API
4. Check browser console for debug information
5. Verify API calls work with token fallback

The system should now work seamlessly across domains! 🚀
