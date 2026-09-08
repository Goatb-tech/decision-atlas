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
