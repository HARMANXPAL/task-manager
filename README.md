# ✅ TaskFlow — Task Management Application

A production-ready Task Manager built with **Express + MongoDB** (backend) and **React + Vite** (frontend), deployed on **Render**.

**Live URL:** `https://taskflow-frontend.onrender.com`  
**API Base URL:** `https://taskflow-api.onrender.com/api`  
**GitHub:** `https://github.com/YOUR_USERNAME/task-manager`

---

## Architecture Overview

```
task-manager/
├── backend/                  # Express REST API
│   ├── server.js             # Entry point
│   └── src/
│       ├── app.js            # Express setup (CORS, helmet, rate-limiting)
│       ├── config/db.js      # MongoDB connection
│       ├── models/           # Mongoose schemas (User, Task)
│       ├── middleware/       # JWT auth, global error handler
│       ├── controllers/      # Business logic (auth, tasks)
│       ├── routes/           # Route definitions
│       └── utils/crypto.js   # AES-256-CBC encryption helper
│
└── frontend/                 # React + Vite SPA
    └── src/
        ├── App.jsx           # Router with protected/public routes
        ├── context/          # AuthContext (global user state)
        ├── services/api.js   # Axios instance + all API calls
        ├── components/       # Navbar, TaskCard, TaskModal, Pagination
        └── pages/            # Login, Register, Dashboard
```

### Key Security Decisions
| Concern | Solution |
|---|---|
| Password storage | bcrypt (12 rounds) |
| Session management | JWT in **HTTP-only** cookies (no JS access) |
| Payload encryption | AES-256-CBC on task descriptions |
| NoSQL injection | `express-mongo-sanitize` strips `$` operators |
| Rate limiting | 100 req/15 min globally, 20 req/15 min on auth endpoints |
| Security headers | `helmet` sets CSP, HSTS, X-Frame-Options, etc. |
| CORS | Allowlist of one origin only |
| Authorization | Every task query is scoped to `req.user._id` |

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- A free [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
# backend/.env
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/taskmanager
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))">
CLIENT_URL=http://localhost:5173
```

### 3. Start development servers

```bash
# Terminal 1 — backend
cd backend && npm run dev   # → http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev  # → http://localhost:5173
```

Vite proxies `/api/*` requests to the backend automatically.

---

## Deployment on Render

1. Push the repo to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New → Blueprint**.
3. Connect your repo — Render reads `render.yaml` and creates both services.
4. In each service's **Environment** tab, add the secret env vars:
   - **Backend:** `MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `CLIENT_URL` (frontend URL)
   - **Frontend:** `VITE_API_URL` (backend URL + `/api`)
5. Trigger a deploy. Done ✅

---

## API Reference

All task endpoints require an authenticated session (cookie set at login).

### Authentication

#### `POST /api/auth/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": { "id": "...", "name": "Jane Smith", "email": "jane@example.com" }
}
```

---

#### `POST /api/auth/login`
Log in and receive a session cookie.

**Request body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "user": { "id": "...", "name": "Jane Smith", "email": "jane@example.com" }
}
```
*Sets `Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=None`*

---

#### `GET /api/auth/me` 🔒
Get the currently authenticated user.

**Response `200`:**
```json
{ "success": true, "user": { "id": "...", "name": "Jane Smith", "email": "jane@example.com" } }
```

---

#### `POST /api/auth/logout` 🔒
Clear the session cookie.

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully." }
```

---

### Tasks (all require authentication 🔒)

#### `GET /api/tasks`
List tasks with pagination, filtering, and search.

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 9, max: 50) |
| `status` | string | Filter: `todo` \| `in-progress` \| `done` |
| `search` | string | Search by title (case-insensitive) |

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Write unit tests",
      "description": "Cover auth and task controllers",
      "status": "in-progress",
      "user": "65a1b2c3d4e5f6g7h8i9j0k0",
      "createdAt": "2024-01-10T10:00:00.000Z",
      "updatedAt": "2024-01-10T12:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 24,
    "page": 1,
    "limit": 9,
    "totalPages": 3
  }
}
```

---

#### `POST /api/tasks`
Create a new task.

**Request body:**
```json
{
  "title": "Write unit tests",
  "description": "Cover auth and task controllers",
  "status": "todo"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Task created.",
  "data": { "_id": "...", "title": "Write unit tests", "status": "todo", "..." }
}
```

---

#### `GET /api/tasks/:id`
Get a single task by ID (must belong to the authenticated user).

**Response `200`:**
```json
{ "success": true, "data": { "_id": "...", "title": "...", "..." } }
```

**Response `404`:**
```json
{ "success": false, "message": "Task not found." }
```

---

#### `PUT /api/tasks/:id`
Update a task (partial update supported).

**Request body (any combination):**
```json
{
  "title": "Write unit tests — done",
  "status": "done"
}
```

**Response `200`:**
```json
{ "success": true, "message": "Task updated.", "data": { "..." } }
```

---

#### `DELETE /api/tasks/:id`
Delete a task.

**Response `200`:**
```json
{ "success": true, "message": "Task deleted." }
```

---

### Error Response Format

All error responses follow this shape:

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Not authenticated / token invalid or expired |
| `403` | Forbidden |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
