# Hillyfielders Gorkha FC — Official Website

Official website for **Hillyfielders Gorkha FC**, a football club based in Gorkha, Gandaki Pradesh, Nepal. Built with a Django REST API backend and a React/Vite frontend, deployed on Railway.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Django 6 + Django REST Framework |
| Frontend | React 18 + Vite + Tailwind CSS v4 |
| Database | SQLite (dev) → PostgreSQL (production) |
| Media | Cloudinary (auto WebP conversion + blur-up thumbnails) |
| Auth | Cookie-based JWT (SimpleJWT, httpOnly cookies) |
| Deployment | Railway |

---

## Features

- **Men's & Women's teams** — squad pages, fixtures and results, team-specific filtering
- **Player profiles** — grouped by position with photos
- **Fixtures & Results** — managed from admin, grouped by month
- **News & Blog** — articles with cover images, categories and auto-generated slugs
- **Gallery** — photos with automatic WebP conversion and CSS blur-up loading
- **Sponsors** — tiered sponsor system (Platinum → Gold → Silver)
- **Contact page** — contact form with email notification
- **Role-based admin panel** — superadmin, media officer, team manager, secretary, coach
- **Interactive API docs** — Swagger UI at `/api/docs/`
- **Health check** — `/api/health/` for Railway monitoring

---

## Architecture

```
hillyfielders-gorkha-fc/
├── accounts/       # User auth, roles, JWT cookie views
├── players/        # Teams, players, staff
├── fixtures/       # Match schedule and results
├── news/           # Articles with markdown content
├── gallery/        # Photos (WebP auto-conversion, blur-up thumbnails)
├── club/           # Singleton club profile
├── sponsors/       # Tiered sponsors
├── core/           # Settings, URLs, contact form, admin dashboard, health check
├── frontend/
│   ├── src/
│   │   ├── pages/          # Public route components (lazy-loaded)
│   │   ├── admin/          # Admin panel (separate code-split chunk)
│   │   │   ├── pages/      # CRUD pages per model
│   │   │   ├── context/    # AuthContext (JWT state)
│   │   │   └── components/ # DataTable, ImageUpload, ConfirmDialog
│   │   ├── components/     # Navbar, Footer, LazyImage, SEO
│   │   └── services/       # Centralised axios calls
│   └── e2e/                # Playwright E2E tests
└── .github/workflows/      # CI pipeline
```

**URL structure:**
- `/` — Public React SPA
- `/api/` — Public REST API (read-only)
- `/api/admin/` — Admin CRUD API (requires auth + role)
- `/api/auth/` — JWT login / refresh / logout
- `/api/docs/` — Swagger UI (interactive API documentation)
- `/api/health/` — Health check for Railway
- `/admin/` — React admin panel SPA

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+

### Backend

```bash
git clone https://github.com/Srijannsm/hillyfielders-gorkha-fc.git
cd hillyfielders-gorkha-fc

cp .env.example .env          # defaults work for local dev

python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # http://127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

Both servers must run together in development. The Vite dev server proxies `/api` to Django on port 8000.

---

## Admin Roles

| Role | Access |
|------|--------|
| Super Admin | Full access to all resources and user management |
| Media Officer | News articles, gallery photos |
| Team Manager | Players, staff, fixtures |
| Secretary | Sponsors, enquiries, club profile |
| Coach | Players, gallery (read-heavy) |

---

## Testing

```bash
# Backend — all 140+ tests
python manage.py test --verbosity=2

# Frontend unit tests (Vitest + Testing Library)
cd frontend && npm run test:run

# E2E tests (Playwright, requires both servers)
cd frontend && npx playwright test
```

See [TESTING.md](TESTING.md) for full details on coverage, E2E setup, and CI.

---

## Deployment

Deployed on Railway. See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Step-by-step Railway setup
- Environment variables reference
- Custom domain + SSL
- Rollback procedure

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, branch naming, commit format, and PR process.

---

## Known Limitations

- Gallery WebP conversion happens synchronously on upload (no background queue in dev)
- Rate limiting uses in-memory cache in dev — resets on server restart
- E2E admin tests require a manually created test user (see TESTING.md)

---

## About the Club

**Hillyfielders Gorkha FC** is based in Gorkha, Nepal — home of the legendary Gurkha warriors. The club represents the pride, resilience and community spirit of the Gorkha district.

---

Built by **Srijan Pradhan** — [@Srijannsm](https://github.com/Srijannsm)

*From the hills, for the hills.*
