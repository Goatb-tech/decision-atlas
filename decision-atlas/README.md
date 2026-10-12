# Decision Atlas

Decision Atlas is a local-first scenario lab for comparing major life or project directions, saving decision checkpoints, and revisiting the path your thinking took over time.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router
- Framer Motion
- Express
- SQLite via `better-sqlite3`
- `bcryptjs` auth

## Run locally

```bash
npm install
npm run dev
```

The Vite app runs on `http://localhost:5173` and proxies API calls to the Express server on `http://localhost:3001`.


## Session security

Protected API routes require a server-verified, expiring HttpOnly session cookie. User IDs supplied by the browser must match the session owner. Logout revokes the session. The API binds to localhost by default; set HOST explicitly for a secured deployment. Set APP_ORIGIN to the exact browser origin (default http://localhost:5173) and NODE_ENV=production for HTTPS deployments and Secure cookies. Use a same-origin reverse proxy for the frontend and API. No credentials or private databases belong in Git.
