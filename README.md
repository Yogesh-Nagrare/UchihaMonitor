# 🔥 UchihaMonitor — Mini Postman

> A lightweight, self-hosted API testing client built for developers who want Postman's power without the bloat.

**🌐 Live Demo:** [https://uchiha-monitor.vercel.app/](https://uchiha-monitor.vercel.app)  
**⚙️ Backend API:** [https://uchihamonitor.onrender.com](https://uchihamonitor.onrender.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗂️ **Collections** | Organize requests into collections. Create, rename, delete, share |
| 📨 **Request Builder** | Full HTTP client — GET, POST, PUT, PATCH, DELETE |
| 🌍 **Environments** | Define `{{variables}}` and swap environments in one click |
| 📜 **History** | Every request is logged. Search, replay, delete entries |
| 🔗 **Share Collections** | Generate a public link — anyone can view without logging in |
| 📤 **Export / Import** | Export collections as JSON. Import Postman v2.1 or Mini Postman format |
| 🔀 **Smart Proxy** | External URLs auto-routed through backend proxy — zero CORS issues |
| 🎨 **Split Panel** | Draggable request/response split like real Postman |
| 🧠 **JSON Highlighting** | Syntax-colored response viewer with copy support |
| 🏷️ **Response Headers** | View all response headers in a dedicated tab |
| 📝 **Request Description** | Add notes and documentation to saved requests |
| 🔍 **Search** | Search requests and collections from the sidebar |
| 🔐 **Google OAuth** | Secure login via Google — no passwords needed |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite**
- **Redux Toolkit** + **RTK Query** — state management & API caching
- **Tailwind CSS v4** — utility-first styling with custom dark theme
- **React Router v6** — client-side routing

### Backend
- **Node.js** + **Express** — REST API server
- **MongoDB** + **Mongoose** — database & ODM
- **Redis** — JWT blacklisting (token invalidation on logout)
- **Passport.js** — Google OAuth 2.0 authentication
- **JWT** — stateless authentication via HTTP-only cookies

### Infrastructure
- **Vercel** — frontend hosting
- **Render** — backend hosting
- **MongoDB Atlas** — cloud database
- **Upstash / Redis Cloud** — managed Redis

---

## 📁 Project Structure

```
UchihaMonitor/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, Passport config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── .env
│   └── index.js
│
└── frontend/
    ├── src/
    │   ├── app/             # Redux store
    │   ├── components/      # Reusable UI components
    │   │   ├── collection/  # Collection modals
    │   │   ├── environment/ # Environment modal
    │   │   ├── layout/      # Sidebar, TopBar, MainPanel, HistoryPanel
    │   │   ├── request/     # RequestBuilder, RequestTabs, ResponseViewer
    │   │   └── ui/          # Toast, shared components
    │   ├── features/        # Redux slices
    │   │   ├── auth/        # authSlice
    │   │   ├── collection/  # collectionSlice
    │   │   ├── request/     # requestSlice (tabs)
    │   │   └── ui/          # uiSlice (toasts)
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # LandingPage, DashboardPage, LoginPage, etc.
    │   ├── services/        # RTK Query API slices
    │   └── utils/           # Helper functions
    ├── .env.development
    ├── .env.production
    └── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Redis instance (Upstash free tier works)
- Google Cloud Console project (for OAuth)

---

### 1. Clone the repo

```bash
git clone https://github.com/Yogesh-Nagrare/UchihaMonitor.git
cd UchihaMonitor
```
---

### 2. Backend setup

```bash

cd backend
npm install

```
Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=...
# Redis
REDIS_URL=

# JWT
JWT_KEY=...
SESSION_SECRET=...
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...

# Frontend URL (for CORS + redirects)
CLIENT_URL=http://localhost:5173
```

Start backend:

```bash
npm run dev
# Server running on http://localhost:3000
```

---

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.development`:

```env
VITE_API_URL=http://localhost:3000
```

Start frontend:

```bash
npm run dev
# App running on http://localhost:5173
```

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → **APIs & Services → Credentials**
3. Create **OAuth 2.0 Client ID** (Web application)
4. Add **Authorized JavaScript Origins:**
   ```
   http://localhost:5173
   https://uchiha-monitor.vercel.app
   ```
   ```
6. Copy `Client ID` and `Client Secret` → paste into your `.env`

---

## 🌍 Deployment

### Backend → Render

1. Push backend to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo, set:
   - **Build Command:** `npm install`
   - **Start Command:** `node index.js`
4. Add environment variables (same as `.env` but with production values):

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=...
REDIS_URL=...
JWT_KEY=...
SESSION_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=...
```

### Frontend → Vercel

1. Push frontend to GitHub
2. Go to [vercel.com](https://vercel.com) → **Import Project**
3. Set **Root Directory** to `frontend`
4. Add environment variable in Vercel dashboard:

```env
VITE_API_URL=https://uchihamonitor.onrender.com
```

5. Deploy ✅

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | OAuth callback |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout + blacklist token |

### Collections
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/collection` | Get all collections |
| POST | `/collection` | Create collection |
| PUT | `/collection/:id` | Update collection |
| DELETE | `/collection/:id` | Delete collection |
| PATCH | `/collection/:id/share` | Generate share link |
| PATCH | `/collection/:id/unshare` | Remove share link |
| GET | `/collection/shared/:token` | Get shared collection (public) |
| GET | `/collection/:id/export` | Export as JSON |
| POST | `/collection/import` | Import from JSON |

### Requests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/request/collection/:id` | Get requests in collection |
| POST | `/request` | Create request |
| PUT | `/request/:id` | Update request |
| DELETE | `/request/:id` | Delete request |

### Environments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/environment` | Get all environments |
| POST | `/environment` | Create environment |
| PUT | `/environment/:id` | Update environment |
| DELETE | `/environment/:id` | Delete environment |
| PATCH | `/environment/:id/activate` | Set active environment |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/history` | Get request history |
| POST | `/history` | Log a request |
| DELETE | `/history/:id` | Delete entry |
| DELETE | `/history` | Clear all history |

### Proxy
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/proxy` | Proxy external requests (CORS bypass) |

---

## 🔀 How the Proxy Works

External APIs block browser requests due to CORS. UchihaMonitor solves this automatically:

```
Browser → checks if URL is external
       ↓ YES (e.g. leetcode.com, github.com)
       → sends to /proxy on backend
       → backend fetches the URL server-side (no CORS)
       → returns response to browser ✅

       ↓ NO (localhost / 127.0.0.1)
       → direct fetch from browser ✅
```

**DIRECT** badge = localhost, goes straight through  
**PROXIED** badge = external URL, routed through backend

---

## 🧪 Testing GraphQL APIs

UchihaMonitor supports GraphQL out of the box. Example with LeetCode:

**Method:** `POST`  
**URL:** `https://leetcode.com/graphql`  
**Headers:**
```
Content-Type: application/json
Referer: https://leetcode.com
```
**Body (json):**
```json
{
  "query": "{ allQuestionsCount { difficulty count } }"
}
```

---

## 📤 Import / Export

### Export
Right-click any collection → **📤 Export** → downloads `.json` file

### Import (Mini Postman format)
```json
{
  "info": { "source": "minipostman", "name": "My Collection" },
  "collection": { "name": "My Collection" },
  "requests": [
    {
      "name": "Get Posts",
      "method": "GET",
      "url": "https://jsonplaceholder.typicode.com/posts",
      "headers": [],
      "params": [],
      "body": { "type": "none", "content": "" }
    }
  ]
}
```

### Import (Postman v2.1 format)
Export any collection from Postman as **Collection v2.1** and import directly ✅

---

## 🎨 Theme

Custom dark theme built with Tailwind v4 CSS variables:

| Variable | Color | Usage |
|----------|-------|-------|
| `bg` | `#0d0d0f` | App background |
| `surface` | `#141417` | Panels, cards |
| `surface2` | `#1c1c21` | Inputs, hover states |
| `border` | `#2a2a32` | All borders |
| `accent` | `#ff6b35` | Primary actions, highlights |
| `accent2` | `#ffb703` | Secondary accent |
| `green` | `#06d6a0` | GET method, success |
| `red` | `#ef476f` | DELETE method, errors |
| `blue` | `#118ab2` | Info, size indicators |
| `purple` | `#9b5de5` | PATCH method |
| `muted` | `#6b6b80` | Placeholder text |
| `text` | `#e8e8f0` | Primary text |

---

## 🐛 Known Issues

- **Render cold starts** — Free tier spins down after 15 min inactivity. First request may take ~30 seconds
- **Cookie cross-origin** — Requires `sameSite: none` + `secure: true` in production (already configured)
- **LeetCode GraphQL** — May return 403 without proper `Referer` + `Origin` headers

---

## 📄 License

MIT License — feel free to fork and build your own version.

---

## 🙏 Acknowledgements

- Inspired by [Postman](https://postman.com)
- Built as a full-stack learning project
- GraphQL test APIs: [countries.trevorblades.com](https://countries.trevorblades.com/graphql), [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com)

---

<div align="center">
  <strong>Built with ❤️ — UchihaMonitor</strong><br/>
  <a href="https://uchiha-monitor.vercel.app">Live App
  </a>
</div>