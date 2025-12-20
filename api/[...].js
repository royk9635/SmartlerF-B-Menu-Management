// Vercel serverless function - catch-all handler for all /api/* routes
// This file handles ALL API routes and routes them to Express app

import { app } from '../backend/server.js';

// Export Express app directly - Vercel will handle routing
// The app already has all routes defined with /api prefix
export default app;
