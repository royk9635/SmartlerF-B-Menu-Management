# Smartler F&B Menu Management

## Overview

A full-stack Food & Beverage menu management portal for hotels and restaurants. The application allows management of properties, restaurants, menu categories, menu items, orders, and user access. It features a React frontend with a Node.js/Express backend that connects to Supabase for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS (loaded via CDN with custom configuration)
- **State Management**: React useState/useEffect hooks
- **Routing**: Single-page application with component-based page switching (no router library)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **Real-time**: Socket.io for WebSocket connections
- **Deployment**: Configured for Vercel serverless functions via `api/[...].js` catch-all handler

### Data Storage
- **Database**: Supabase (PostgreSQL)
- **Client Library**: @supabase/supabase-js
- **Portal Data Access**: Direct Supabase client calls via `services/supabaseService.ts`
- **Backend API**: Reserved for tablet/mobile app integration only

### Key Design Patterns
- **Supabase Service Layer**: All portal data operations go through `services/supabaseService.ts` which calls Supabase directly
- **Environment-based Configuration**: Uses Vite environment variables (`VITE_*`) for frontend, `process.env` for backend
- **Error Boundary**: React error boundary with localStorage health checks for crash recovery

### Authentication Flow
- JWT tokens stored in localStorage
- Middleware-based route protection on backend
- API token system for tablet/mobile app integration (format: `tb_*`)
- Default user fallback when authentication is disabled

## External Dependencies

### Database & Backend Services
- **Supabase**: PostgreSQL database with real-time subscriptions
  - URL: Configured via `SUPABASE_URL` environment variable
  - Keys: `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`

### Authentication
- **JWT**: jsonwebtoken for token generation/verification
- **bcryptjs**: Password hashing (12 salt rounds)

### AI Integration
- **Google Gemini**: Optional AI features via `GEMINI_API_KEY`

### Deployment Platforms
- **Vercel**: Primary deployment target with serverless functions
- **Railway**: Alternative deployment option (railway.json configured)

### Frontend Libraries
- **qrcode.react**: QR code generation for digital menus
- **xlsx**: Excel file import/export functionality (loaded via CDN)

### Required Environment Variables
```
# Backend (required for production)
JWT_SECRET=<32+ character secret>
SUPABASE_URL=<supabase project url>
SUPABASE_ANON_KEY=<supabase anon key>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
NODE_ENV=production

# Frontend
VITE_USE_REAL_API=true|false
VITE_API_BASE_URL=<backend api url>
VITE_SUPABASE_URL=<supabase project url>
VITE_SUPABASE_ANON_KEY=<supabase anon key>
GEMINI_API_KEY=<optional>
```