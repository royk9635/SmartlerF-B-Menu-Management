#!/bin/bash
# Debug startup script

echo "🔍 Starting debug session on port 3002..."
echo ""

# Start backend on port 3002
cd "$(dirname "$0")/backend"
echo "🚀 Starting backend on port 3002..."
PORT=3002 node server.js

