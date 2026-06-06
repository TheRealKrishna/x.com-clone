# X / Twitter Clone

A full-stack X (Twitter) clone built with the MERN stack — **M**ongoDB, **E**xpress, **R**eact (Vite), and **N**ode.js — with real-time messaging and notifications over Socket.IO.

This project was rebuilt and modernized from an earlier prototype: the client was migrated from Create React App to Vite, the backend was restructured and hardened, every known bug was fixed, and the remaining features (replies, reposts, bookmarks, search, notifications, real-time chat) were completed.

## Features

- **Auth** — sign up / log in with email or phone + password; optional Google OAuth. JWT sessions.
- **Posts** — compose with text (280 chars), images, emoji; hashtag and @mention parsing.
- **Engagement** — like, reply (threaded), repost, bookmark, view counts.
- **Threads** — dedicated post pages showing ancestors → post → replies.
- **Profiles** — editable profile (name, bio, location, website, avatar, banner, DOB) with Posts / Replies / Media / Likes tabs.
- **Follow** — follow / unfollow, followers & following lists, "who to follow" suggestions.
- **Explore & Search** — search users, posts, and #hashtags; trending hashtags.
- **Notifications** — likes, follows, replies, reposts, mentions — delivered in real time with an unread badge.
- **Direct Messages** — real-time 1:1 chat with unread counts, last-message previews, read receipts, and typing indicators.
- **Bookmarks** — save posts to a dedicated page.
- Responsive layout for desktop and mobile.

## Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | React 18, Vite 7, React Router 6, React Hook Form + Yup, Bootstrap 5, Socket.IO client |
| Backend  | Node.js, Express 4, Mongoose 8, Socket.IO, JWT, bcryptjs, Helmet, express-rate-limit |
| Database | MongoDB (in-memory fallback for zero-config local dev) |

## Project Structure

```
x.com/
├── client/                 React + Vite frontend
│   ├── src/
│   │   ├── api/            Central API layer (config, http client, endpoints)
│   │   ├── hooks/          useRealtime (shared Socket.IO connection)
│   │   ├── utils/          upload, toast, format, country helpers
│   │   ├── Components/     Reusable UI (PostCard, Loader, Spinner)
│   │   ├── Layout/         Auth modals & steps
│   │   ├── Pages/          Landing, Logout, and the home app shell
│   │   └── css/            CSS modules
│   └── .env.example
└── server/                 Express backend
    ├── config/            Env loading & config
    ├── api/               Route definitions
    ├── controller/        Route handlers
    ├── database/          Connection + Mongoose models
    ├── middleware/        Auth (getUser)
    ├── realtime/          Socket.IO setup + emit helpers
    ├── utils/             Helpers, notifications, username generation
    └── .env.example
```

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 22)
- npm

No database installation is required for local development — the server spins up an in-memory MongoDB automatically when `MONGO_URI` is not set.

### 1. Backend

```bash
cd server
npm install
cp .env.example .env.local   # optional — defaults work out of the box
npm run dev                  # starts on http://localhost:5000
```

On first run with no `MONGO_URI`, an in-memory MongoDB is downloaded and started (data resets on restart). To persist data, set `MONGO_URI` in `server/.env.local` to a local MongoDB or Atlas connection string.

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env.local   # optional — defaults point at localhost:5000
npm run dev                  # starts on http://localhost:5173
```

Open **http://localhost:5173** and create an account.

### Optional integrations

All of these are optional — the app runs fully without them:

- **Google login** — set `VITE_GOOGLE_CLIENT_ID` (client) to enable the Google buttons.
- **Image uploads** — set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` (client) to upload to Cloudinary; otherwise images are embedded as data URLs (fine for local testing).

## Environment Variables

### Server (`server/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | no | API port (default 5000) |
| `MONGO_URI` | prod only | MongoDB connection string; in-memory DB if empty (dev) |
| `JWT_SECRET` | prod only | Secret for signing JWTs; dev fallback if empty |
| `FRONTEND_URL` | no | Comma-separated allowed CORS origins |
| `NODE_ENV` | no | `development` (default) or `production` |

### Client (`client/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | no | Backend base URL (default `http://localhost:5000`) |
| `VITE_WS_URL` | no | Socket.IO URL (defaults to API URL) |
| `VITE_GOOGLE_CLIENT_ID` | no | Enables Google login |
| `VITE_CLOUDINARY_CLOUD_NAME` | no | Cloudinary cloud name for uploads |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | no | Cloudinary unsigned upload preset |

## API Overview

All endpoints are `POST` and (except auth) require an `authtoken` header.

| Group | Endpoints |
|-------|-----------|
| `/auth` | `signupwithemail`, `signupwithphone`, `login`, `loginvalidate`, `loginwithgoogle`, `getuserinfo`, `getuserinfowithid`, `getuserinfowithusername`, `editprofile`, `emailvalidate`, `phonevalidate` |
| `/post` | `getposts`, `getuserposts`, `getpost`, `addpost`, `addreply`, `addlike`, `removelike`, `togglerepost`, `togglebookmark`, `getbookmarks`, `addview`, `deletepost` |
| `/follow` | `addfollower`, `removefollower`, `getfollowers`, `getfollowing`, `getsuggestions` |
| `/chat` | `getcontacts`, `getmessages`, `addcontact`, `sendmessage` |
| `/explore` | `search`, `trends` |
| `/notification` | `get`, `unreadcount`, `markallread` |

Real-time events (Socket.IO): `join`, `newMessage`, `notification`, `typing`, `messagesRead`.

## Production Build

```bash
# Frontend
cd client && npm run build      # outputs to client/build

# Backend
cd server && NODE_ENV=production MONGO_URI=... JWT_SECRET=... npm start
```

In production, `MONGO_URI` and `JWT_SECRET` are required and the in-memory / dev-secret fallbacks are disabled.

## License

MIT
