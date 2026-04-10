# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack football club website for Hillyfielders Gorkha FC. Django REST API backend + React/Vite frontend. Deployed on Railway with Cloudinary for media storage.

## Development Commands

### Backend
```bash
# Install and migrate
pip install -r requirements.txt
python manage.py migrate

# Run dev server (port 8000)
python manage.py runserver

# Run all tests
python manage.py test

# Run tests for a single app
python manage.py test players
python manage.py test players.tests.PlayerModelTests  # single class
```

### Frontend
```bash
cd frontend
npm install

# Dev server (port 5173, proxies /api → localhost:8000)
npm run dev

# Production build
npm run build
```

Both servers must run simultaneously for development. The Vite proxy handles `/api` requests in dev; in production Django serves the built frontend via WhiteNoise.

## Architecture

### Django Apps

| App | Purpose |
|-----|---------|
| `players` | Teams, players, staff — core data model |
| `fixtures` | Match schedule and results |
| `news` | Articles with markdown content |
| `gallery` | Photos with auto WebP conversion + blur-up thumbnails |
| `club` | Singleton club profile (`pk=1` enforced) |
| `sponsors` | Tiered sponsors (Platinum/Gold/Silver) |
| `accounts` | User auth (Django built-in User + SimpleJWT) |
| `core` | Settings, URL routing, contact form, admin dashboard, sitemaps |

**URL structure:**
- `/api/` — Public REST API (read-only, no auth)
- `/api/admin/` — Admin CRUD API (requires `IsAdminUser`)
- `/api/auth/login/` and `/api/auth/refresh/` — JWT auth
- `/sitemap.xml` — SEO sitemap

### Frontend Structure

```
frontend/src/
├── pages/          # Public route components (lazy-loaded, code-split)
├── admin/          # Admin panel (separate lazy chunk — only loaded at /admin)
│   ├── pages/      # CRUD pages for each model
│   ├── context/    # AuthContext (JWT state, localStorage)
│   └── components/ # Modal, DataTable, ImageUpload, ConfirmDialog
├── components/     # Shared public components (Navbar, Footer, SEO, Lightbox)
├── services/       # api.js — all axios calls centralized here
└── hooks/          # Custom hooks
```

**Routing:** React Router v6. Public layout (`/`) vs admin layout (`/admin`). All pages are lazy-imported for code splitting.

**State management:** `@tanstack/react-query` for server state (5 min stale, 10 min cache, no retry on 4xx). `AuthContext` for JWT token + user state.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite`. Custom colors: `gfc-900` (dark background), `gfc-lime` (accent). Oswald font for headings.

### Auth Flow

1. POST `/api/auth/login/` → receives `access` + `refresh` JWT tokens
2. Tokens stored in localStorage as `gfc_admin_access` / `gfc_admin_refresh`
3. `AuthContext` decodes payload client-side via `atob()` to read username and `is_staff`
4. All admin API requests attach `Authorization: Bearer <token>` header
5. Backend validates with `JWTAuthentication` + `IsAdminUser` permission

### Key Non-Obvious Decisions

- **Photo processing:** `gallery/models.py` auto-converts uploads to WebP and generates a 20px thumbnail for CSS blur-up effect on load.
- **Singleton pattern:** `ClubProfile` enforces `pk=1` in `save()` — there is always exactly one club profile.
- **Team slugs:** Must be prefixed with gender (`mens-`, `womens-`) for URL consistency. See `memory/project_team_slugs.md` for all 8 team slugs.
- **Media storage:** Uses local disk in dev (`DEBUG=True`) and Cloudinary in production. Controlled by `DEFAULT_FILE_STORAGE` in `settings.py`.
- **API pagination:** All list endpoints return `{ count, next, previous, results }`. The `api.js` service extracts `.data` (axios) and callers handle `.results` themselves.

### Environment Variables

Copy `.env.example` to `.env`. Required for full functionality:
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DATABASE_URL` — omit for SQLite in dev
- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `CONTACT_EMAIL` — Gmail SMTP for contact form
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — omit to use local disk in dev
- `CORS_ALLOWED_ORIGINS` — comma-separated list (e.g. `http://localhost:5173`)
