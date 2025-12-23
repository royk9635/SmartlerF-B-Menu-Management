# Token Refresh and Auto-Refresh Functionality Documentation

## Overview

This document describes the token expiration fix and auto-refresh system implementation. The system ensures continuous authentication for portal users and extended validity for staff tokens, with automatic refresh mechanisms to prevent session interruptions.

## Core Functionality

### 1. Token Refresh Endpoint

**Endpoint:** `POST /api/auth/refresh`

**Purpose:** Refreshes expired or expiring Supabase Auth access tokens using refresh tokens.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "property_id": "string"
    },
    "token": "string",
    "refreshToken": "string"
  }
}
```

**Functionality:**
- Accepts a refresh token in the request body
- Validates the refresh token using Supabase Auth's `refreshSession()` method
- Retrieves updated user information from the users table
- Returns new access token and refresh token pair
- Handles expired refresh tokens by returning 401 error
- Handles missing users by returning 404 error

**Error Handling:**
- 400: Missing refresh token
- 401: Invalid or expired refresh token
- 404: User not found in database
- 500: Internal server error

### 2. Login Endpoint Enhancement

**Endpoint:** `POST /api/auth/login`

**Enhancement:** Now returns both access token and refresh token in the response.

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "string",
      "property_id": "string"
    },
    "token": "string",
    "refreshToken": "string"
  }
}
```

**Functionality:**
- Performs standard Supabase Auth login
- Retrieves user details from users table
- Returns access token (expires in ~1 hour)
- Returns refresh token (long-lived, typically 30 days)
- Both tokens are required for token refresh functionality

### 3. Staff Token Expiration Extension

**Endpoint:** `POST /api/staff/verify-pin`

**Change:** JWT token expiration extended from 24 hours to 365 days (1 year).

**Token Payload:**
```json
{
  "staffId": "string",
  "restaurantId": "string",
  "type": "staff"
}
```

**Functionality:**
- Generates JWT token with 365-day expiration
- Token remains valid for one year from generation
- No refresh mechanism needed due to long expiration
- Token stored in tablet app for persistent authentication

### 4. Refresh Token Storage

**Location:** Browser localStorage

**Storage Keys:**
- `auth_token`: Access token (Supabase Auth token or JWT)
- `refresh_token`: Refresh token (Supabase Auth refresh token)

**Methods:**
- `getAuthToken()`: Retrieves access token from localStorage
- `setAuthToken(token)`: Stores access token in localStorage
- `clearAuthToken()`: Removes access token from localStorage
- `getRefreshToken()`: Retrieves refresh token from localStorage
- `setRefreshToken(token)`: Stores refresh token in localStorage
- `clearRefreshToken()`: Removes refresh token from localStorage

**Functionality:**
- Tokens persist across browser sessions
- Tokens cleared on logout or authentication failure
- Both tokens required for refresh mechanism
- Storage operations are synchronous

### 5. Automatic Token Refresh on 401 Errors

**Location:** HTTP Client request interceptor

**Functionality:**
- Intercepts all HTTP responses with 401 status code
- Checks if refresh token exists in localStorage
- Attempts to refresh access token using refresh token
- Retries original request with new access token if refresh succeeds
- Clears both tokens if refresh fails
- Prevents infinite retry loops by limiting retry attempts

**Flow:**
1. Request made with current access token
2. Server responds with 401 (token expired)
3. Client checks for refresh token
4. If refresh token exists, calls `/api/auth/refresh`
5. If refresh succeeds, updates tokens in localStorage
6. Retries original request with new access token
7. If refresh fails, clears tokens and throws error

**Retry Logic:**
- Maximum one retry per request
- Retry flag prevents infinite loops
- Original request parameters preserved
- Request body preserved for POST/PUT/PATCH requests

### 6. Proactive Token Refresh Service

**File:** `services/tokenRefreshService.ts`

**Purpose:** Refreshes tokens before they expire to prevent 401 errors.

**Functionality:**
- Checks token expiration every 5 minutes
- Decodes JWT tokens to extract expiration timestamp
- Calculates time until expiration
- Refreshes token if expiration is within 5 minutes
- Handles non-JWT tokens (Supabase tokens) by refreshing proactively
- Prevents concurrent refresh attempts

**Token Expiration Detection:**
- Decodes JWT token payload (base64)
- Extracts `exp` claim (expiration timestamp)
- Converts to milliseconds
- Compares with current time
- If expiration within 5 minutes, triggers refresh

**Refresh Process:**
1. Check if refresh token exists
2. Call `/api/auth/refresh` endpoint
3. Update access token and refresh token in localStorage
4. Log success or failure
5. Prevent concurrent refresh attempts

**Service Lifecycle:**
- Starts when user logs in
- Stops when user logs out
- Checks every 5 minutes while active
- Immediate check on start
- Cleans up on component unmount

### 7. Portal Auto-Refresh

**Location:** App component

**Functionality:**
- Refreshes portal page every 60 seconds
- Only refreshes when user is authenticated
- Pauses refresh when browser tab is inactive
- Resumes refresh when tab becomes active
- Full page reload for complete data refresh

**Page Visibility Handling:**
- Listens to `visibilitychange` event
- Tracks page visibility state
- Skips refresh if page is hidden
- Resumes refresh when page becomes visible
- Prevents unnecessary refreshes in background tabs

**Refresh Mechanism:**
- Uses `window.location.reload()` for full refresh
- Ensures all data is fetched fresh from server
- Clears any stale component state
- Re-initializes all services and hooks

**Lifecycle:**
- Starts interval when user logs in
- Clears interval when user logs out
- Cleans up event listeners on unmount
- Prevents memory leaks

### 8. Token Refresh Service Integration

**Integration Points:**
- App component: Starts/stops service on login/logout
- HTTP Client: Uses service for proactive refresh
- Auth API: Stores refresh tokens on login

**Service Methods:**
- `start()`: Begins proactive token refresh checking
- `stop()`: Stops proactive token refresh checking
- `checkAndRefresh()`: Internal method that checks and refreshes if needed
- `refreshToken()`: Internal method that performs token refresh
- `shouldRefreshToken()`: Internal method that determines if refresh is needed

**Service State:**
- `refreshInterval`: NodeJS.Timeout reference for interval
- `isRefreshing`: Boolean flag to prevent concurrent refreshes
- `CHECK_INTERVAL`: 5 minutes (300,000 milliseconds)
- `REFRESH_BEFORE_EXPIRY`: 5 minutes before expiration

### 9. Authentication Flow

**Login Flow:**
1. User submits email and password
2. Backend validates with Supabase Auth
3. Backend retrieves user details from users table
4. Backend returns access token and refresh token
5. Frontend stores both tokens in localStorage
6. Frontend starts token refresh service
7. Frontend starts portal auto-refresh interval

**Token Refresh Flow:**
1. Token refresh service checks expiration every 5 minutes
2. If token expires within 5 minutes, refresh is triggered
3. Refresh token sent to `/api/auth/refresh` endpoint
4. Backend validates refresh token with Supabase
5. Backend returns new access token and refresh token
6. Frontend updates tokens in localStorage
7. Service continues checking with new expiration time

**401 Error Recovery Flow:**
1. HTTP request fails with 401 status
2. HTTP client intercepts 401 response
3. Checks for refresh token availability
4. Attempts token refresh
5. If successful, retries original request
6. If failed, clears tokens and throws error
7. User redirected to login page

**Logout Flow:**
1. User initiates logout
2. Backend logout endpoint called
3. Token refresh service stopped
4. Portal auto-refresh interval cleared
5. Access token cleared from localStorage
6. Refresh token cleared from localStorage
7. User data cleared from localStorage
8. User redirected to login page

### 10. Token Types and Expiration

**Portal User Tokens:**
- Access Token: Supabase Auth token, expires in ~1 hour
- Refresh Token: Supabase Auth refresh token, expires in ~30 days
- Storage: Browser localStorage
- Refresh: Automatic via refresh endpoint

**Staff Tokens:**
- Token Type: JWT token
- Expiration: 365 days (1 year)
- Storage: Tablet app storage (varies by platform)
- Refresh: Not required due to long expiration

**API Tokens:**
- Token Type: Custom token (smtlr_ or tb_ prefix)
- Expiration: Configurable (can be null for no expiration)
- Storage: Database (api_tokens table)
- Refresh: Not applicable (long-lived tokens)

### 11. Error Scenarios and Handling

**Expired Access Token:**
- Detected: 401 response from server
- Action: Automatic refresh attempt
- Fallback: Clear tokens, redirect to login

**Expired Refresh Token:**
- Detected: 401 response from refresh endpoint
- Action: Clear tokens, redirect to login
- User must login again

**Missing Refresh Token:**
- Detected: No refresh token in localStorage
- Action: Cannot refresh, clear access token
- User must login again

**Network Error During Refresh:**
- Detected: Fetch error or timeout
- Action: Log error, do not clear tokens
- Retry on next check interval

**Concurrent Refresh Attempts:**
- Detected: isRefreshing flag is true
- Action: Skip refresh, wait for current attempt
- Prevents multiple simultaneous refresh calls

### 12. Security Considerations

**Token Storage:**
- Tokens stored in localStorage (accessible to JavaScript)
- XSS attacks could potentially access tokens
- HTTPS required in production to protect tokens in transit

**Token Refresh:**
- Refresh tokens are long-lived and sensitive
- Should be rotated periodically (handled by Supabase)
- Refresh endpoint validates tokens server-side

**Token Expiration:**
- Short-lived access tokens limit exposure window
- Refresh tokens have longer expiration for convenience
- Staff tokens have very long expiration for tablet apps

**Error Handling:**
- Failed refresh attempts clear tokens
- Prevents use of invalid tokens
- Forces re-authentication on security issues

### 13. Performance Considerations

**Proactive Refresh:**
- Checks every 5 minutes (configurable)
- Only refreshes when needed (within 5 min of expiration)
- Non-blocking, asynchronous operations

**401 Error Recovery:**
- Automatic retry after refresh
- Single retry attempt per request
- Prevents infinite retry loops

**Portal Auto-Refresh:**
- 60-second interval (configurable)
- Pauses when tab is inactive
- Full page reload ensures fresh data

**Memory Management:**
- Intervals cleared on logout/unmount
- Event listeners removed on cleanup
- No memory leaks from long-running intervals

### 14. Configuration

**Token Refresh Service:**
- CHECK_INTERVAL: 5 minutes (300,000 ms)
- REFRESH_BEFORE_EXPIRY: 5 minutes (300,000 ms)

**Portal Auto-Refresh:**
- Refresh Interval: 60 seconds (60,000 ms)

**Staff Token:**
- Expiration: 365 days

**Backend Endpoints:**
- Refresh endpoint: `/api/auth/refresh`
- Login endpoint: `/api/auth/login`
- Staff verify endpoint: `/api/staff/verify-pin`

### 15. Dependencies

**Backend:**
- Supabase Auth client for token refresh
- JWT library for staff token generation
- Express.js for endpoint handling

**Frontend:**
- localStorage API for token storage
- Fetch API for HTTP requests
- Browser visibility API for page visibility detection

### 16. Testing Scenarios

**Token Refresh:**
- Refresh before expiration (proactive)
- Refresh on 401 error (reactive)
- Handle expired refresh token
- Handle missing refresh token
- Handle network errors during refresh

**Portal Auto-Refresh:**
- Refresh every 60 seconds when active
- Pause refresh when tab inactive
- Resume refresh when tab active
- Stop refresh on logout

**Staff Token:**
- Token valid for 365 days
- Token persists across app restarts
- Token works for all staff endpoints

**Error Recovery:**
- 401 error triggers refresh
- Failed refresh clears tokens
- User redirected to login
- No infinite retry loops

### 17. Limitations

**Token Storage:**
- localStorage can be cleared by user
- localStorage is domain-specific
- Not available in incognito mode (some browsers)

**Refresh Mechanism:**
- Requires network connectivity
- Depends on Supabase Auth service availability
- Refresh tokens can expire (30 days)

**Portal Auto-Refresh:**
- Full page reload may interrupt user actions
- 60-second interval may be too frequent for some use cases
- Cannot refresh while user is actively editing

**Staff Tokens:**
- Very long expiration (365 days) means compromised tokens remain valid longer
- No automatic revocation mechanism
- Must manually revoke if security breach occurs

### 18. Future Enhancements

**Potential Improvements:**
- Implement token rotation for refresh tokens
- Add token revocation mechanism
- Implement soft refresh (data-only) instead of full page reload
- Add configurable refresh intervals
- Implement token refresh queue for multiple concurrent requests
- Add token expiration warnings to users
- Implement token refresh retry with exponential backoff

**Monitoring:**
- Track token refresh success/failure rates
- Monitor token expiration patterns
- Track 401 error frequency
- Monitor refresh token usage

### 19. API Reference

**POST /api/auth/refresh**
- Purpose: Refresh expired access token
- Authentication: Requires refresh token in body
- Returns: New access token and refresh token
- Errors: 400, 401, 404, 500

**POST /api/auth/login**
- Purpose: Authenticate user and get tokens
- Authentication: Requires email and password
- Returns: User data, access token, refresh token
- Errors: 400, 401, 500

**POST /api/staff/verify-pin**
- Purpose: Verify staff PIN and get JWT token
- Authentication: Requires PIN and optional restaurantId
- Returns: Staff data and JWT token (365-day expiration)
- Errors: 400, 401, 403, 404, 500

### 20. Implementation Details

**HTTP Client Token Refresh:**
- Intercepts 401 responses
- Checks refresh token availability
- Calls refresh endpoint
- Updates tokens in localStorage
- Retries original request
- Handles refresh failures

**Token Refresh Service:**
- Singleton service instance
- Interval-based checking
- JWT expiration decoding
- Proactive refresh logic
- Concurrent refresh prevention
- Lifecycle management

**App Component Integration:**
- Starts token refresh service on login
- Stops token refresh service on logout
- Manages portal auto-refresh interval
- Handles page visibility changes
- Cleans up on unmount

**Storage Management:**
- Synchronous localStorage operations
- Token validation before use
- Token cleanup on errors
- Token persistence across sessions

