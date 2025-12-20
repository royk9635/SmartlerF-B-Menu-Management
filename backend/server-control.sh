#!/bin/bash

# Backend Server Control Script

case "$1" in
  start)
    echo "🚀 Starting backend server..."
    cd "$(dirname "$0")"
    npm start
    ;;
  stop)
    echo "🛑 Stopping backend server..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || echo "No server running on port 3001"
    pkill -f "node.*server.js" 2>/dev/null || echo "No server process found"
    echo "✅ Server stopped"
    ;;
  restart)
    echo "🔄 Restarting backend server..."
    $0 stop
    sleep 2
    $0 start
    ;;
  status)
    echo "📊 Checking server status..."
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
      echo "✅ Server is running on http://localhost:3001"
      curl -s http://localhost:3001/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/api/health
    else
      echo "❌ Server is not running"
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status}"
    echo ""
    echo "Commands:"
    echo "  start    - Start the backend server"
    echo "  stop     - Stop the backend server"
    echo "  restart  - Restart the backend server"
    echo "  status   - Check if server is running"
    exit 1
    ;;
esac

