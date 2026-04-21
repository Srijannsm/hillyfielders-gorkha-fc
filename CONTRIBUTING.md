# Contributing Guide — Hillyfielders Gorkha FC

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### 1. Clone and configure

```bash
git clone https://github.com/Srijannsm/hillyfielders-gorkha-fc.git
cd hillyfielders-gorkha-fc
cp .env.example .env
# Edit .env — the defaults work for local dev (SQLite, no Cloudinary)
```

### 2. Backend setup

```bash
python -m venv venv
source venv/bin/activate      # Linux/macOS
venv\Scripts\activate         # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver    # starts at http://127.0.0.1:8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev   # starts at http://localhost:5173
```

Both servers must run simultaneously. The Vite dev server proxies `/api` requests to the Django backend on port 8000.

---

## Branch Naming

| Prefix | Use for |
|--------|---------|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `chore/` | Dependency updates, config, tooling |
| `docs/` | Documentation-only changes |
| `refactor/` | Code restructuring with no behavior change |

Example: `feature/player-stats-page`, `fix/contact-form-throttle`

---

## Commit Message Format

Follow conventional commits:

```
<type>: <short imperative summary>

Optional body explaining WHY, not what. Max 72 chars per line.
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`

Examples:
- `feat: add coach role access to gallery upload`
- `fix: slug auto-generation broken for articles without slug field`
- `test: add role permission tests for all admin endpoints`

---

## PR Process

1. Branch off `main`
2. Write tests for any new behavior
3. Run `python manage.py test` (backend) and `npm run test:run` (frontend) — both must pass
4. Open a PR against `main` with a clear description of what changed and why
5. Link any related issues

### PR Review Checklist

- [ ] Tests added or updated for changed behavior
- [ ] No new security issues (no raw SQL, no unvalidated user input, no secret in code)
- [ ] Django migrations included if models changed
- [ ] API schema annotations (`@extend_schema`) added for new views
- [ ] No commented-out code, no debug prints

---

## Code Style

### Python

- PEP 8, enforced by reading the code
- Snake case for variables and functions
- Class names in PascalCase
- Django views inherit from DRF's `APIView` or `ModelViewSet`
- Keep views thin — business logic in model methods or serializer `validate_*` / `create`
- No bare `except:` clauses

### JavaScript / React

- Functional components only (no class components)
- Hooks for state and side effects
- ESLint rules from `frontend/.eslintrc` (run `npm run lint`)
- No inline styles — use Tailwind utility classes
- Import order: React first, then third-party, then local

---

## Adding a New Django App

1. `python manage.py startapp myapp`
2. Add to `INSTALLED_APPS` in `core/settings.py`
3. Add URL patterns in `myapp/urls.py`, include in `core/urls.py`
4. Add `@extend_schema` decorators to all views so they appear in `/api/docs/`
5. Write tests in `myapp/tests.py`

### URL convention

- Public read-only API: `/api/myapp/` — permission `AllowAny`
- Admin CRUD API: `/api/admin/myapp/` — permission `IsAdminUser` + role check

---

## Adding a New Admin Panel Page

1. Create `frontend/src/admin/pages/MyPage.jsx`
2. Add a lazy import and route in `frontend/src/App.jsx`
3. Add a nav link in `frontend/src/admin/layout/AdminLayout.jsx`
4. Use `canAccess(user, 'role_name')` from `AuthContext` to gate access
5. Write unit tests in `frontend/src/test/admin/MyPage.test.jsx`

---

## Creating Database Migrations Safely

```bash
# After changing a model
python manage.py makemigrations myapp

# Review the generated migration file before applying
cat myapp/migrations/0002_*.py

# Apply
python manage.py migrate
```

For migrations that add `NOT NULL` columns to existing tables:
- Always provide a `default` in the migration or make the field nullable first
- For large tables in production, test on a copy before running on live data

Never edit a migration that has already been applied in production. Create a new migration instead.

---

## Running the Full Test Suite

```bash
# Backend
python manage.py test --verbosity=2

# Frontend unit
cd frontend && npm run test:run

# E2E (requires both servers running)
cd frontend && npx playwright test
```

See [TESTING.md](TESTING.md) for full details.
