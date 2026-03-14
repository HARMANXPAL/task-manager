# ✅ TaskFlow — Task Management Application

A production-ready Task Manager built with **Express + MongoDB** (backend) and **React + Vite** (frontend), deployed on **Render** as a single unified service.

**Live URL:** `https://taskflow-a75o.onrender.com`
**GitHub:** `https://github.com/HARMANXPAL/task-manager`

---

## About This Project

Built as a full-stack technical assessment. I chose **Express + MongoDB** over Next.js because I wanted full control over the API layer, middleware configuration, and security implementation.

### Key Architecture Decisions

- **HTTP-only cookies over localStorage** — localStorage is accessible via JavaScript, making it vulnerable to XSS attacks. HTTP-only cookies can't be read by JS at all, only sent automatically by the browser on each request.
- **AES-256-CBC encryption on task descriptions** — descriptions can contain sensitive information. Each encryption generates a random 16-byte IV stored alongside the ciphertext (`iv:encrypted`), so identical inputs produce different ciphertext every time.
- **Compound MongoDB indexes on `(user, status)` and `(user, createdAt)`** — the most common query filters by user AND status together. A compound index satisfies both conditions in one scan instead of two separate ones.
- **Single Render service** — Express serves both the REST API (`/api/*`) and the compiled React build (static files), so there's one URL, one service, zero manual intervention required.
- **bcrypt with 12 salt rounds** — 12 rounds takes ~300ms per hash, making brute force attacks computationally expensive while staying fast enough for real users.

---

## Architecture Overview

```
task-manager/
├── backend/                        # Express REST API
│   ├── server.js                   # Entry point — connects DB, starts cron, serves frontend
│   └── src/
│       ├── app.js                  # Express setup (CORS, helmet, rate-limiting, sanitization)
│       ├── config/
│       │   ├── db.js               # MongoDB connection
│       │   └── cron.js             # Daily email reminder cron job (node-cron)
│       ├── models/
│       │   ├── User.js             # User schema — bcrypt hash on pre('save') hook
│       │   ├── Task.js             # Task schema — compound indexes for fast queries
│       │   └── Activity.js         # Activity log schema — tracks all task changes
│       ├── middleware/
│       │   ├── auth.js             # JWT verification from HTTP-only cookie
│       │   └── errorHandler.js     # Centralized error handler (Mongoose, JWT, app errors)
│       ├── controllers/
│       │   ├── authController.js   # register, login, logout, getMe
│       │   └── taskController.js   # CRUD + stats + activity log + CSV export
│       ├── routes/
│       │   ├── authRoutes.js       # /api/auth/*
│       │   └── taskRoutes.js       # /api/tasks/*
│       └── utils/
│           ├── crypto.js           # AES-256-CBC encrypt/decrypt helper
│           └── mailer.js           # NodeMailer HTML email sender
│
└── frontend/                       # React + Vite SPA
    └── src/
        ├── App.jsx                 # Router with protected/public route guards
        ├── context/
        │   ├── AuthContext.jsx     # Global user state — persists via /auth/me on load
        │   └── ThemeContext.jsx    # Dark mode — persists via localStorage
        ├── services/api.js         # Axios instance + all API call functions
        ├── components/
        │   ├── Navbar.jsx          # Top bar with dark mode toggle + logout
        │   ├── TaskCard.jsx        # Task card with priority stripe, due date, confetti
        │   ├── TaskModal.jsx       # Create/edit modal with all fields
        │   ├── StatsBar.jsx        # Dashboard stats (total, done %, overdue, priority)
        │   ├── ActivityLog.jsx     # Recent activity panel (last 20 actions)
        │   ├── SkeletonCard.jsx    # Animated shimmer placeholder cards
        │   ├── Pagination.jsx      # Page navigation
        │   ├── ProtectedRoute.jsx  # Redirects unauthenticated users to /login
        │   └── PublicRoute.jsx     # Redirects authenticated users to /dashboard
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            └── Dashboard.jsx       # Main view — grid/kanban toggle, filters, search
```

### Security Implementation

| Concern | Solution |
|---|---|
| Password storage | bcrypt (12 salt rounds) — ~300ms per hash, brute-force resistant |
| Session management | JWT in **HTTP-only** cookies — inaccessible to JavaScript |
| Cookie flags | `HttpOnly`, `Secure` (prod), `SameSite=None` (prod) / `Lax` (dev) |
| Payload encryption | AES-256-CBC on task descriptions with random IV per encryption |
| NoSQL injection | `express-mongo-sanitize` strips `$` operators from all inputs |
| Rate limiting | 100 req/15 min globally, 20 req/15 min on auth endpoints |
| Security headers | `helmet` sets CSP, HSTS, X-Frame-Options, X-Content-Type |
| CORS | Strict origin allowlist — only the frontend URL is permitted |
| Authorization | Every task query scoped to `req.user._id` — users can never access others' tasks |
| Input size limit | Express body parser capped at 10kb to prevent payload attacks |

---

## Features

### Core (per requirements)
- ✅ User registration & login
- ✅ JWT authentication in HTTP-only cookies
- ✅ bcrypt password hashing
- ✅ Full CRUD for tasks (Title, Description, Status, Created Date)
- ✅ User-scoped authorization
- ✅ Pagination, filter by status, search by title
- ✅ Protected frontend routes
- ✅ Structured error handling with proper HTTP status codes

### Extra Features
- 🎯 **Task priority** (High/Medium/Low) with color-coded stripes
- 📅 **Due dates** with overdue (red) and due-soon (yellow) highlighting
- 📊 **Stats dashboard** — completion %, overdue count, priority breakdown
- ⧉ **Kanban board** — drag & drop cards between status columns
- 📋 **Activity log** — tracks every create/update/delete with timestamps
- ⬇️ **CSV export** — download all tasks as a spreadsheet
- 📧 **Email reminders** — daily cron job emails tasks due in 24 hours
- 🌙 **Dark mode** — persists across sessions
- 💀 **Skeleton loading** — animated shimmer instead of spinner
- 🎉 **Confetti** — fires when a task is marked done

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- A free [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Clone & install

```bash
git clone https://github.com/HARMANXPAL/task-manager.git
cd task-manager

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

Create `backend/.env`:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=<exactly 32 characters>
CLIENT_URL=http://localhost:5173

# Optional — for email reminders
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_16_char_app_password
```

### 3. Start development servers

```bash
# Terminal 1 — backend (port 5001)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Vite proxies `/api/*` → `http://localhost:5001` automatically.

Open `http://localhost:5173`

---

## Deployment on Render

This app deploys as a **single web service** — Express builds and serves the React frontend.

1. Push repo to GitHub
2. Render → **New → Web Service** → connect repo
3. Settings:

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install && cd ../frontend && npm install && npm run build && cd ../backend` |
| Start Command | `npm start` |

4. Environment variables to add in Render dashboard:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | your secret key |
| `ENCRYPTION_KEY` | your 32-char key |
| `CLIENT_URL` | your Render service URL |

5. Deploy → one URL serves everything ✅

---

## API Reference

All task endpoints require authentication (JWT cookie set at login). 🔒

### Authentication

#### `POST /api/auth/register`
```json
// Request
{ "name": "Harman", "email": "harman@example.com", "password": "secret123" }

// Response 201
{ "success": true, "message": "Account created successfully.", "user": { "id": "...", "name": "Harman", "email": "harman@example.com" } }
```

#### `POST /api/auth/login`
```json
// Request
{ "email": "harman@example.com", "password": "secret123" }

// Response 200 — also sets HttpOnly cookie
{ "success": true, "message": "Logged in successfully.", "user": { "id": "...", "name": "Harman", "email": "harman@example.com" } }
```

#### `GET /api/auth/me` 🔒
```json
// Response 200
{ "success": true, "user": { "id": "...", "name": "Harman", "email": "harman@example.com" } }
```

#### `POST /api/auth/logout` 🔒
```json
// Response 200
{ "success": true, "message": "Logged out successfully." }
```

---

### Tasks 🔒

#### `GET /api/tasks`
| Query Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 9, max: 50) |
| `status` | string | `todo` / `in-progress` / `done` |
| `priority` | string | `low` / `medium` / `high` |
| `search` | string | Case-insensitive title search |

```json
// Response 200
{
  "success": true,
  "data": [{
    "_id": "65a1b2c3...",
    "title": "Write unit tests",
    "description": "Cover auth and task controllers",
    "status": "in-progress",
    "priority": "high",
    "dueDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-10T10:00:00.000Z"
  }],
  "pagination": { "total": 24, "page": 1, "limit": 9, "totalPages": 3 }
}
```

#### `POST /api/tasks`
```json
// Request
{ "title": "Write unit tests", "description": "...", "status": "todo", "priority": "high", "dueDate": "2024-01-15" }

// Response 201
{ "success": true, "message": "Task created.", "data": { "..." } }
```

#### `PUT /api/tasks/:id` — partial update supported
```json
// Request (any fields)
{ "status": "done", "priority": "low" }

// Response 200
{ "success": true, "message": "Task updated.", "data": { "..." } }
```

#### `DELETE /api/tasks/:id`
```json
// Response 200
{ "success": true, "message": "Task deleted." }
```

#### `GET /api/tasks/stats`
```json
// Response 200
{
  "success": true,
  "data": {
    "total": 12,
    "byStatus": { "todo": 4, "in-progress": 5, "done": 3 },
    "byPriority": { "low": 2, "medium": 7, "high": 3 },
    "overdue": 2
  }
}
```

#### `GET /api/tasks/activity`
```json
// Response 200
{
  "success": true,
  "data": [
    { "action": "status_changed", "taskTitle": "Write tests", "detail": "todo → done", "createdAt": "..." }
  ]
}
```

#### `GET /api/tasks/export`
Returns a `tasks.csv` file download with all tasks.

---

### Error Response Format

```json
{ "success": false, "message": "Human-readable error message" }
```

| Status | Meaning |
|---|---|
| `400` | Validation error / bad request |
| `401` | Not authenticated / token expired |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
