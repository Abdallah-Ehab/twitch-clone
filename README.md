# StreamHub - Twitch Clone

A full-stack live streaming platform built with Angular, Node.js, Express, MongoDB, and Socket.io.

## Features

### Core Features
- **User Authentication** - Register, login, JWT-based authentication with refresh tokens
- **Live Streaming** - RTMP server for broadcasting, HLS for playback via node-media-server
- **Real-time Chat** - Socket.io powered live chat with mod badges, VIP status, and subscriber flags
- **Channel Management** - Customizable profiles with avatar, banner, and bio
- **Channel Discovery** - Search channels by username or bio, filter by category, sort by viewers/recent/alphabetical
- **Following System** - Follow/unfollow channels

### Technical Features
- **Pagination** - Efficient offset-based pagination for channel listings
- **Real-time Updates** - Live viewer counts, message streaming
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Category Filtering** - Filter streams by game/category
- **Emoji Support** - Quick emoji picker and shortcode rendering in chat

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- node-media-server (RTMP/HLS)
- JWT + bcrypt

### Frontend
- Angular 17+ (standalone components, signals)
- Tailwind CSS + shadcn/ui
- Socket.io-client
- HLS.js (video playback)

## Prerequisites

- Node.js 18+
- MongoDB 6+
- npm or yarn

## Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/twitch-clone
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
RTMP_URL=rtmp://localhost:1935
HLS_URL=http://localhost:8000
CLIENT_URL=http://localhost:4200
```

### 3. Start MongoDB

```bash
mongod
```

### 4. Seed Database

```bash
cd backend
npm run seed
```

This creates 36 test accounts. All passwords are `password123`.
Example login: `ninja@example.com` / `password123`

### 5. Start Backend

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

### 6. Start Frontend

```bash
cd frontend/twitch-clone
npm install
npm start
```

Frontend runs on `http://localhost:4200`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Channels
- `GET /api/channels` - List channels (supports `page`, `limit`, `search`, `category`, `sortBy`, `liveOnly`)
- `GET /api/channels/categories` - Get all unique categories
- `GET /api/channels/:username` - Get channel by username
- `GET /api/channels/me` - Get current user's channel
- `PUT /api/channels/:id` - Update channel (auth required)

### Follows
- `POST /api/follows/:channelId` - Follow a channel
- `DELETE /api/follows/:channelId` - Unfollow a channel

### WebSocket Events

**Client to Server:**
- `join_channel` - Join a channel room
- `send_message` - Send a chat message

**Server to Client:**
- `message_history` - Previous messages on join
- `new_message` - New chat message
- `viewer_count` - Updated viewer count

## Test Accounts

| Username | Email | Live Status |
|----------|-------|-------------|
| ninja | ninja@example.com | Yes |
| pokimane | pokimane@example.com | Yes |
| shroud | shroud@example.com | Yes |
| xqc | xqc@example.com | Yes |
| s1mple | s1mple@example.com | Yes |

All test accounts use password: `password123`

## Project Structure

```
twitch_clone/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── scripts/        # Database seeding
│   │   └── index.ts        # Entry point
│   └── package.json
├── frontend/
│   └── twitch-clone/
│       └── src/
│           ├── app/
│           │   ├── components/  # Reusable UI components
│           │   ├── pages/       # Route pages
│           │   └── services/    # API services
│           └── environments/
│           └── index.html
└── README.md
```

## License

MIT
