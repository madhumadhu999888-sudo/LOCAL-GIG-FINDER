# LocalGigFinder

A full-stack local gig marketplace connecting **workers** with nearby **businesses**. Post gigs, apply, chat after acceptance, complete work, and rate workers.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Socket.io client
- **Backend:** Node.js, Express, Socket.io
- **Database:** MongoDB (Mongoose)

## Features

- Worker & business registration with GPS location
- Geo-based gig search (within 10 km)
- Apply, accept/reject applications
- Real-time chat and notifications
- Business ratings on gig completion
- Admin console (stats, users, gigs, moderation)
- Profile editing for workers and businesses

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- MongoDB running locally or MongoDB Atlas

### Setup

```bash
# Install dependencies
npm run install:all

# Copy environment template and configure
cp backend/.env.example backend/.env
# Edit backend/.env — set MONGO_URI and JWT_SECRET

# Create admin user (one time)
npm run seed:admin --prefix backend

# Start API + frontend together
npm run dev
```

- **Frontend:** http://localhost:5173
- **API health:** http://localhost:5011/api/health

## Production Deployment (Single Server)

Build the frontend and serve everything from Express:

```bash
npm run install:all
npm run build
```

Set in `backend/.env`:

```env
NODE_ENV=production
SERVE_FRONTEND=true
BIND_HOST=0.0.0.0
PORT=5011
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-domain.com
```

Start:

```bash
npm run start:prod
```

Visit `http://your-server:5011` — API and SPA are served together.

## Production Deployment (Split Hosting)

If frontend (Vercel/Netlify) and API are separate:

1. Deploy backend with `BIND_HOST=0.0.0.0` and set `CLIENT_URL` to your frontend URL.
2. Build frontend with `VITE_API_URL=https://your-api.example.com` in `frontend/.env`.
3. Deploy `frontend/dist` to static hosting.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `CLIENT_URL` | No | Frontend origin for CORS (default: localhost:5173) |
| `PORT` | No | API port (default: 5011) |
| `BIND_HOST` | No | Host bind (use `0.0.0.0` in cloud) |
| `EMAIL_USER` / `EMAIL_PASS` | No | Gmail SMTP for password reset emails |
| `VITE_API_URL` | No | Frontend API base URL (production split deploy) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend + Vite dev server |
| `npm run build` | Build frontend to `frontend/dist` |
| `npm run start:prod` | Run production server (API + static frontend) |
| `npm run seed:admin --prefix backend` | Create admin account |

## User Roles

| Role | Dashboard |
|------|-----------|
| Worker | `/worker` — find gigs, apply, chat |
| Business | `/business` — post gigs, manage applicants |
| Admin | `/admin` — platform overview |

## License

Private project.
