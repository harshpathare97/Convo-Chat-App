# Convo - Chat App

A real-time chat application built with modern web technologies.

## Features

- Real-time messaging
- User authentication (including OAuth)
- Private conversations
- Online status indicators
- Message history

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Real-time**: Socket.io

## Installation

### Prerequisites 🔧

- Node.js (16+)
- pnpm
- MongoDB (local or hosted)
- A browser

---

### Frontend (client) — Install & Run ✅

1. Open a terminal and navigate to the project root (or `src` if your setup uses a separate folder for the client).
2. Install dependencies and start dev server:

```bash
# from project root (client uses root package.json)
pnpm install
pnpm dev

The frontend runs on Vite (default port 5173). Set VITE_API_BASE_URL in .env if your backend uses a different address.
```

### Backend (server) — Install & Run ✅

1. Navigate to the `server` directory:

```bash
cd server
pnpm install
pnpm start
```

The backend runs on Express (default port 3001). Configure MongoDB connection in `.env`.

## Usage
1. Sign in with an google account
2. Start messaging
3. View chat history
