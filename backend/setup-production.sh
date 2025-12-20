#!/bin/bash

# Production Setup Script for F&B Menu Management API
# This script helps you configure the backend for production deployment

echo "🚀 F&B Menu Management API - Production Setup"
echo "=============================================="
echo ""

# Check if .env file exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Generate secure JWT secret
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(openssl rand -base64 32)

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# Backend Server Configuration
# Generated on $(date)

# Server Configuration
PORT=3001
NODE_ENV=production

# Security - REQUIRED IN PRODUCTION
# Generated secure secret (save this!)
JWT_SECRET=$JWT_SECRET

# Frontend URLs (for CORS)
# Update these with your actual production URLs
FRONTEND_URL=https://your-frontend-domain.com
TABLET_APP_URL=https://your-tablet-app-domain.com

# Additional Allowed Origins (comma-separated, optional)
# ALLOWED_ORIGINS=https://app1.example.com,https://app2.example.com

# Logging
LOG_LEVEL=info
EOF

echo "✅ .env file created!"
echo ""
echo "⚠️  IMPORTANT: Update the following in .env:"
echo "   1. FRONTEND_URL - Your frontend portal URL"
echo "   2. TABLET_APP_URL - Your tablet app URL (if different)"
echo "   3. JWT_SECRET - Already generated (save it securely!)"
echo ""
echo "📋 Generated JWT_SECRET:"
echo "   $JWT_SECRET"
echo ""
echo "🔒 Save this JWT_SECRET securely - you'll need it to run the server!"
echo ""
echo "Next steps:"
echo "1. Edit .env and update FRONTEND_URL and TABLET_APP_URL"
echo "2. Install dependencies: npm install --production"
echo "3. Start server: NODE_ENV=production node server.js"
echo "   Or with PM2: pm2 start server.js --name f-b-api"

