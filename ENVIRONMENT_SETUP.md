# Environment Setup Guide

This guide helps you configure your environment variables to connect the frontend to your backend API.

## Quick Setup

1. **Create a `.env` file** in the root directory of your project
2. **Copy the configuration below** and update the URLs to match your backend

```bash
# Backend API Configuration
VITE_USE_REAL_API=true
VITE_API_BASE_URL=https://your-backend-api-url.com/api
VITE_WS_URL=wss://your-backend-websocket-url.com

# Gemini API Key (if using AI features)
GEMINI_API_KEY=your-gemini-api-key-here
```

## Configuration Options

### 1. Using Mock Data (Development/Testing)
```bash
VITE_USE_REAL_API=false
```
This will use mock data instead of connecting to a real backend.

### 2. Local Development Backend
```bash
VITE_USE_REAL_API=true
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
```

### 3. Production Backend
```bash
VITE_USE_REAL_API=true
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_WS_URL=wss://ws.yourdomain.com
```

## Common Issues and Solutions

### ❌ "Failed to fetch" Error
**Cause:** The API URL is incorrect or the server is not running.

**Solutions:**
1. Verify your backend server is running
2. Check the `VITE_API_BASE_URL` is correct
3. Ensure there are no typos in the URL
4. Test the API endpoint directly in your browser

### ❌ WebSocket Connection Errors
**Cause:** WebSocket server is not available or URL is incorrect.

**Solutions:**
1. Verify your WebSocket server is running
2. Check the `VITE_WS_URL` is correct
3. Use `wss://` for HTTPS sites, `ws://` for HTTP
4. WebSocket features will be disabled if not configured

### ❌ CORS Errors
**Cause:** Your backend is not configured to allow requests from your frontend domain.

**Solutions:**
1. Configure CORS in your backend to allow your frontend domain
2. For development: Allow `http://localhost:3000` and `http://localhost:5173`
3. For production: Allow your actual domain

### ❌ Using Frontend URL as API URL
**Problem:** Setting `VITE_API_BASE_URL=https://yourapp.netlify.app/api`

**Solution:** Use your backend API URL, not your frontend URL:
```bash
# ❌ Wrong - This is a frontend URL
VITE_API_BASE_URL=https://yourapp.netlify.app/api

# ✅ Correct - This should be your backend API
VITE_API_BASE_URL=https://api.yourbackend.com/api
```

## Environment Variables Explained

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_USE_REAL_API` | Yes | Enable/disable real API connection | `true` or `false` |
| `VITE_API_BASE_URL` | When using real API | Your backend API base URL | `https://api.example.com/api` |
| `VITE_WS_URL` | Optional | WebSocket server URL for real-time features | `wss://ws.example.com` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for AI features | `your-api-key` |

## Testing Your Configuration

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12) and look for configuration status messages

3. **Check the API Status Indicator** in the bottom-right corner of the app

4. **Look for these success messages:**
   - ✅ Configuration appears valid
   - ✅ API: Real
   - ✅ WebSocket: connected

## Need Help?

If you're still having issues:

1. Check the browser console for detailed error messages
2. Verify your backend is running and accessible
3. Test your API endpoints directly with curl or Postman
4. Ensure your backend supports CORS for your frontend domain

## Example Backend Requirements

Your backend should provide these endpoints:
- `POST /api/auth/login` - Authentication
- `GET /api/properties` - Properties list
- `GET /api/restaurants` - Restaurants list
- And other endpoints as defined in the API documentation

Your WebSocket server should:
- Accept connections on the configured port
- Handle authentication if required
- Send real-time updates for orders and menu changes
