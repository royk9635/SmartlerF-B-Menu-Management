// Vercel serverless function entry point
// This file allows Vercel to deploy the Express app as a serverless function

const { app } = require('../server');

// Export the Express app as a handler for Vercel
module.exports = app;

