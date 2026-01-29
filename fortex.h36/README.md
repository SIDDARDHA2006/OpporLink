# Ascendify — Community (Subpage + Full Stack)

This workspace includes a **Community subpage** (`community.html`) powered by a small **Node.js + Express + SQLite** backend API.

## Run locally (recommended: Python, zero installs)

You already have Python on Windows (`py`), so you can run the full-stack app without installing Node:

1. Start the server:

```bash
py server.py
```

2. Open the community subpage:

- `http://localhost:5174/community.html`

## Run locally (Node.js option)

If you install Node.js later, you can also run the Node server:

```bash
npm install
npm run dev
```

## What’s included

- **Frontend (subpage)**: `community.html`, `community.js`, `styles.css`
- **Backend API**: `server.js`, `db.js`
- **Database**: `community.db` (auto-created on first run)

## API routes

- `GET /api/posts`
- `POST /api/posts`
- `POST /api/posts/:id/upvote`
- `DELETE /api/posts/:id`
- `GET /api/projects`
- `POST /api/projects`
- `DELETE /api/projects/:id`
- `GET /api/roles`
- `POST /api/roles`
- `DELETE /api/roles/:id`

