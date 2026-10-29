<div align="center">

# ⚽ FIFA World Cup Sticker Album

### Your World Cup collection, organized. Trading made easier.

A web platform to track your 2026 World Cup stickers, find collectors to trade
with, and manage trade proposals — all in one place.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5%20%7C%206-3178c6?logo=typescript)
![Express](https://img.shields.io/badge/Express-5-404d59?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?logo=mongodb)
![pnpm](https://img.shields.io/badge/pnpm-workspaces-f69220?logo=pnpm)

</div>

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Getting Started](#-getting-started)
- [🔐 Environment Variables](#-environment-variables)
- [🧪 Testing and Quality](#-testing-and-quality)
- [🌐 API](#-api)
- [📦 Build and Run](#-build-and-run)
- [🛡️ Security Notes](#️-security-notes)

## ✨ Features

The app brings together the tools you need to complete your sticker album and
connect with other collectors:

- 📖 **Manage your album:** track the stickers you have collected and monitor
  your collection progress.
- 🔁 **Track duplicates:** add multiple copies of a sticker to your trading
  inventory and remove copies when needed.
- 🤝 **Find matches:** discover collectors who have stickers you are missing
  and see whether the interest is mutual.
- 🎁 **Propose trades or gifts:** offer stickers in exchange for others, or
  request a sticker without offering one.
- 📬 **Manage proposals:** review incoming and outgoing trades, accept or
  reject proposals, and cancel pending ones.
- 🔐 **Keep a personal account:** register and sign in to access your album and
  community features.

## 🧰 Tech Stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS 4 |
| Forms and validation | React Hook Form, Zod |
| HTTP client | Axios |
| Backend | Node.js, Express 5, TypeScript |
| Persistence | MongoDB and Mongoose |
| Authentication | JSON Web Tokens (JWT) and bcryptjs |
| Testing | Vitest, Supertest, React Testing Library |
| Monorepo | pnpm workspaces |

## 🏗️ Architecture

This repository is a monorepo: the frontend and backend are developed and run
as separate packages, with a single lockfile at the repository root.

```text
.
├── apps/
│   ├── frontend/                 # Next.js application
│   │   └── src/
│   │       ├── app/              # Home, login, register, album,
│   │       │                     # market, and trades pages
│   │       ├── components/       # Reusable UI components
│   │       ├── contexts/         # Authentication state
│   │       └── lib/              # HTTP client
│   └── backend/                  # Express REST API
│       └── src/
│           ├── app.ts            # Express configuration and routes
│           ├── server.ts         # MongoDB connection and HTTP startup
│           ├── config/           # Database configuration
│           ├── controllers/      # Endpoint logic
│           ├── middlewares/      # Authentication and validation
│           ├── models/           # Mongoose models
│           ├── routes/           # API routes
│           └── schemas/          # Zod validation schemas
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

### Request lifecycle

1. The frontend sends HTTP requests to the API using Axios.
2. Private routes require a valid `Bearer` token.
3. Validation middleware checks request data with Zod before controllers run.
4. Controllers apply album, market, and trading rules, then read or update
   MongoDB through Mongoose.
5. Account and album state is returned to the frontend as JSON.

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.9 or later**
- **pnpm 10** (the repository specifies `pnpm@10.34.3`)
- **MongoDB**, running locally or available through a remote instance

### 1. Install dependencies

Run this from the repository root:

```bash
pnpm install
```

### 2. Configure the backend

Create `apps/backend/.env` with your own values:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/fifa-world-cup-app
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000
```

`MONGO_URI` is required to start the backend. `PORT` is optional; the API
defaults to port `5000`.

### 3. Configure the frontend (optional)

By default, the client uses `http://localhost:5000/api`. To use another API
URL, create `apps/frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start the application

Open two terminals at the repository root.

**Terminal 1 — backend:**

```bash
pnpm --filter backend dev
```

The API will be available at `http://localhost:5000`; its health endpoint is
`http://localhost:5000/api/health`.

**Terminal 2 — frontend:**

```bash
pnpm --filter frontend dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

| Variable | Package | Required | Description |
| --- | --- | :---: | --- |
| `MONGO_URI` | Backend | Yes | MongoDB connection string. |
| `JWT_SECRET` | Backend | Recommended | Secret used to sign and verify JWTs. Keep it private and random. |
| `PORT` | Backend | No | API HTTP port. Defaults to `5000`. |
| `NEXT_PUBLIC_API_URL` | Frontend | No | API base URL. Defaults to `http://localhost:5000/api`. |

Never commit `.env` or `.env.local` files. Use your own values for development
and configure production variables through your hosting platform's secret
manager.

## 🧪 Testing and Quality

Backend tests use **Vitest** and **Supertest**. API tests mock the data models,
so they do not require a live MongoDB instance. Mongoose model contracts and
validation middleware are tested as well.

```bash
# Run backend tests
pnpm --filter backend test

# Run backend tests and generate a coverage report
pnpm --filter backend test:coverage

# Type-check backend test code
pnpm --filter backend typecheck:test

# Run frontend tests
pnpm --filter frontend test

# Run frontend tests in watch mode
pnpm --filter frontend test:watch
```

Backend coverage has minimum thresholds configured for statements, branches,
functions, and lines. The frontend also includes ESLint:

```bash
pnpm --filter frontend lint
```

## 🌐 API

All routes are served under `/api`. Album, market, and trade endpoints require
a valid JWT in the authorization header.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | Check that the API is responding. |
| `POST` | `/api/auth/register` | Public | Register an account. |
| `POST` | `/api/auth/login` | Public | Sign in and receive a JWT. |
| `GET` | `/api/album/me` | Authenticated | Get the current account's album. |
| `POST` | `/api/album/collect` | Authenticated | Add a sticker to the collection. |
| `POST` | `/api/album/duplicate` | Authenticated | Add a copy to duplicate inventory. |
| `DELETE` | `/api/album/duplicate` | Authenticated | Remove one copy from duplicate inventory. |
| `GET` | `/api/market/matches` | Authenticated | Find potential trade matches. |
| `GET` | `/api/market/feed` | Authenticated | Browse collectors with available duplicates. |
| `GET` | `/api/trades` | Authenticated | Get sent and received trade proposals. |
| `POST` | `/api/trades` | Authenticated | Create a trade or gift proposal. |
| `PATCH` | `/api/trades/:id` | Authenticated | Accept, reject, or cancel a proposal. |

Write routes validate request bodies with Zod. Authorization rules determine
who can respond to or cancel each trade proposal.

## 📦 Build and Run

### Backend

```bash
# Compile TypeScript
pnpm --filter backend build

# Start the compiled backend
pnpm --filter backend start
```

### Frontend

```bash
# Build the production application
pnpm --filter frontend build

# Serve the production build
pnpm --filter frontend start
```

Before deploying, configure environment variables for each service and make
sure the frontend points to the correct public API URL.

## 🛡️ Security Notes

- Set a strong, random, private `JWT_SECRET` in every deployed environment.
  Do not rely on the development fallback secret included in the code.
- Never publish MongoDB credentials, tokens, or environment files.
- Passwords are stored as bcryptjs hashes; they must never be stored or logged
  in plain text.
- Input is validated on the server. Frontend validation does not replace API
  validation.

---

<div align="center">

Made for collectors completing their albums, one sticker at a time. 🏆

</div>
