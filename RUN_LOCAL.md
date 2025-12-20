# 🚀 Running Backend Server Locally

## Quick Start

### Method 1: Using npm (Recommended)

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Server will start on:** `http://localhost:3001`

4. **To stop:** Press `Ctrl+C` in the terminal

---

### Method 2: Using the Control Script

From the project root:

```bash
# Start server
./backend/server-control.sh start

# Stop server  
./backend/server-control.sh stop

# Restart server
./backend/server-control.sh restart

# Check status
./backend/server-control.sh status
```

---

## Server Information

- **API Base URL:** `http://localhost:3001/api`
- **WebSocket URL:** `ws://localhost:3001`
- **Health Check:** `http://localhost:3001/api/health`

---

## Verify Server is Running

Open a new terminal and run:

```bash
curl http://localhost:3001/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Backend is running",
  "timestamp": "..."
}
```

---

## Test Login Endpoint

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

---

## Troubleshooting

### Port Already in Use

If you see `EADDRINUSE: address already in use :::3001`:

```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use the control script
./backend/server-control.sh stop
```

### Server Not Starting

1. Make sure you're in the `backend` directory
2. Install dependencies: `npm install`
3. Check Node.js version: `node --version` (should be v14+)

---

## Development Mode (Auto-restart on changes)

If you have `nodemon` installed:

```bash
cd backend
npm run dev
```

This will automatically restart the server when you make code changes.

---

## Next Steps

Once the server is running:

1. ✅ Test the health endpoint
2. ✅ Test the login endpoint  
3. ✅ Connect your frontend to `http://localhost:3001/api`
4. ✅ Check the API documentation in `FRONTEND_API_REFERENCE.md`

---

**Happy Coding! 🎉**

