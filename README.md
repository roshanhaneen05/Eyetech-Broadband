# Eyetech Cable TV & Broadband — 3-Tier Application

## Architecture

```
┌─────────────────────┐      HTTPS/JSON      ┌──────────────────────┐      SQL      ┌────────────────┐
│   PRESENTATION TIER  │  ───────────────►    │   APPLICATION TIER    │ ───────────►  │   DATA TIER     │
│  public/index.html   │                      │  server.js + routes.js│               │  db.js (SQLite) │
│  (HTML/CSS/JS,        │  ◄───────────────    │  Express REST API      │ ◄───────────  │  data/eyetech.db│
│   runs in the browser)│      JSON responses  │  validation, business  │   query results│                │
└─────────────────────┘                      │  logic                 │               └────────────────┘
                                              └──────────────────────┘
```

- **Presentation tier** — `public/index.html`. The site you already had, unchanged except the forms
  now call the API below instead of the Claude-artifact-only storage.
- **Application tier** — `server.js` (entrypoint) + `routes.js` (the REST endpoints and validation).
  This is a plain Express server — no framework lock-in.
- **Data tier** — `db.js`, a SQLite database file at `data/eyetech.db`. All SQL lives only in this file.

## API endpoints

| Method | Path                    | Purpose                          |
|--------|-------------------------|-----------------------------------|
| POST   | /api/complaints         | Submit "Report a Problem" (returns a ticket) |
| GET    | /api/complaints/:ticket | Look up a complaint's status      |
| POST   | /api/contact            | Contact form                      |
| POST   | /api/availability       | Check-availability form           |
| POST   | /api/quote              | Quick-quote modal                 |
| POST   | /api/reviews            | Submit a customer review          |
| GET    | /api/reviews            | Latest 6 reviews                  |
| GET    | /api/health             | Health check                      |

## Run it locally

```bash
npm install
npm start
```

Open http://localhost:3000 — the backend serves the frontend itself, so this is the whole app running
as one process.

## Deploying for free

### Easiest: one service, backend serves the frontend (recommended)
Use **Render.com** (free web service tier):
1. Push this folder to a new GitHub repo.
2. On render.com → New → Web Service → connect the repo.
3. Build command: `npm install`   Start command: `npm start`
4. Deploy. Render gives you a free `https://your-app.onrender.com` URL that serves both the site
   and the API — no CORS setup needed since it's all one origin.

Note: Render's free tier spins the service down after inactivity (it wakes up on the next request,
usually within ~30 seconds) and its filesystem isn't guaranteed to persist forever across redeploys.
For real production data, see "Persistent database" below.

### Alternative: split hosting (frontend on Netlify, backend on Render)
If you'd rather keep the fast static Netlify hosting you already set up for the frontend:
1. Deploy this `eyetech-backend` folder to Render as above → get its URL, e.g.
   `https://eyetech-backend.onrender.com`.
2. In `public/index.html` (the copy you deploy to Netlify), set before the closing `</head>` or at the
   top of the script:
   `<script>window.EYETECH_API_BASE = 'https://eyetech-backend.onrender.com/api';</script>`
3. On the backend, set the environment variable `FRONTEND_ORIGIN` to your Netlify URL (e.g.
   `https://eyetech-cabletv.netlify.app`) so CORS only allows your site.

### Persistent database (optional, for real production use)
SQLite is great for getting started, but on some free hosts the disk can reset on redeploy. If you
want data to survive redeploys for certain, swap `db.js` to use a free hosted Postgres database
instead — **Supabase** or **Neon** both have generous free tiers. Ask and I can wire that up; the
`routes.js` file wouldn't need to change at all, only `db.js`.

## Environment variables

| Variable          | Purpose                                              | Default        |
|--------------------|-------------------------------------------------------|-----------------|
| `PORT`             | Port the server listens on                            | `3000`          |
| `FRONTEND_ORIGIN`  | Comma-separated allowed origins for CORS               | allow all       |
