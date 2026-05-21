# Forever Found

A full-stack wedding planning platform built for modern couples. Manage your events, guests, budget, vendors, and checklist — all in one place.

## Features

- **Dashboard** — aggregated overview of all planning modules in a single request
- **Events** — create and track all wedding-related events (ceremony, reception, sangeet, etc.)
- **Guest Management** — invite guests, track RSVPs, and monitor response rates
- **Budget** — set a total budget, allocate by category, and track expenses
- **Checklist** — task management with categories and completion tracking
- **Vendors** — manage vendor contacts, status, and details
- **Onboarding** — multi-step setup wizard capturing couple info, wedding style, date, venue, and guest/budget estimates
- **Settings** — profile, wedding details, notification preferences, and account management
- **Auth** — JWT-based registration and login with protected routes

## Tech Stack

**Frontend**
- Next.js 16 + React 19 (TypeScript)
- Redux Toolkit + React Redux (global state)
- Tailwind CSS v4
- next-themes (dark/light mode)
- Axios

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs (authentication)
- Helmet, CORS, express-rate-limit (security)
- express-validator (input validation)

## Project Structure

```
/
├── src/                  # Next.js frontend
│   ├── app/              # Pages (App Router)
│   ├── features/         # Feature components (budget, events, guests, etc.)
│   ├── components/       # Shared UI components and layout
│   ├── store/            # Redux store and slices
│   ├── api/              # Axios API layer
│   └── constants/        # App-wide constants
└── backend/
    └── src/
        ├── controllers/  # Route handlers
        ├── routes/       # Express routers
        ├── models/       # Mongoose schemas
        ├── middleware/   # Auth, validation, error handling
        └── helpers/      # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Frontend

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

```bash
npm run dev
```

Backend runs at [http://localhost:5000](http://localhost:5000).

## Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Run compiled output |
