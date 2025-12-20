// Vercel serverless function - catch-all handler for all /api/* routes
// This file handles ALL API routes and routes them to Express app

const { app } = require('../backend/server');

// Export Express app directly - Vercel will handle routing
// The app already has all routes defined with /api prefix
module.exports = app;
