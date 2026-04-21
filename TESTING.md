# Testing Guide — Hillyfielders Gorkha FC

---

## Test Strategy Overview

| Layer | Framework | What it validates |
|-------|-----------|-------------------|
| Backend unit + integration | Django `TestCase` | Models, serializers, API responses, permissions, auth |
| Frontend unit | Vitest + Testing Library | React components, AuthContext, API service wrappers |
| Frontend E2E | Playwright | Full browser flows — login, navigation, form validation |

The backend tests are integration tests: they use a real SQLite test database and real HTTP-style requests via Django's `APIClient`. They do not mock the ORM. Frontend unit tests mock `axios` and do not require a running server. E2E tests require both the Vite dev server and the Django backend.

---

## Running Backend Tests

```bash
# From the project root (not frontend/)

# Run all tests
python manage.py test

# Run with verbose output (shows each test name)
python manage.py test --verbosity=2

# Run a single app
python manage.py test players
python manage.py test accounts

# Run a single test class
python manage.py test accounts.tests.AuthenticationTests

# Run a single test method
python manage.py test accounts.tests.AuthenticationTests.test_login_valid_credentials
```

### Coverage Report

```bash
pip install coverage
coverage run manage.py test
coverage report
coverage html  # generates htmlcov/index.html
```

### Test Apps and Coverage Areas

| App | Test File | Areas Covered |
|-----|-----------|---------------|
| `accounts` | `accounts/tests.py` | Login, logout, token refresh, rate limiting, all role permissions, user CRUD, profile, enquiries |
| `players` | `players/tests.py` | Player/team CRUD, inactive team filtering, admin CRUD, validation |
| `fixtures` | `fixtures/tests.py` | Fixture CRUD, match results (win/draw/loss), admin access |
| `news` | `news/tests.py` | Article CRUD, slug auto-generation, collision handling, publish, admin access |
| `gallery` | `gallery/tests.py` | WebP conversion, thumbnail generation, public/admin API, role access |
| `sponsors` | `sponsors/tests.py` | Tier ordering, active/inactive filter, secretary CRUD, role access |
| `club` | `club/tests.py` | Singleton enforcement, public API, secretary admin access |
| `core` | `core/tests.py` | Health check, dashboard stats, contact form, throttle |

---

## Running Frontend Unit Tests

```bash
cd frontend

# Watch mode (re-runs on file save)
npm test

# Single run (for CI)
npm run test:run

# With coverage report
npm run test:coverage
```

### Test Files

| File | Components / Modules Tested |
|------|------------------------------|
| `src/test/components/DataTable.test.jsx` | DataTable headers, row data, empty state, callbacks |
| `src/test/components/ConfirmDialog.test.jsx` | ConfirmDialog visibility, messages, callbacks |
| `src/test/components/ImageUpload.test.jsx` | ImageUpload upload area, preview, file selection |
| `src/test/components/LazyImage.test.jsx` | LazyImage rendering, loading modes, fill layout, thumbnail |
| `src/test/admin/AuthContext.test.jsx` | AuthProvider state, login, logout, localStorage, canAccess |
| `src/test/services/adminApi.test.js` | adminApi service — all HTTP methods, axios config |

---

## Running E2E Tests

E2E tests require both servers to be running:

```bash
# Terminal 1 — Django backend
python manage.py runserver

# Terminal 2 — Vite dev server (or use the webServer config below)
cd frontend && npm run dev
```

Then in a third terminal:

```bash
cd frontend

# Run all E2E tests (headless)
npx playwright test

# Run with visible browser (headed mode)
npx playwright test --headed

# Run a specific spec file
npx playwright test e2e/auth.spec.js

# Run with UI mode (interactive test runner)
npx playwright test --ui
```

### E2E Test Files

| File | Coverage |
|------|----------|
| `e2e/auth.spec.js` | Login page loads, redirect when unauthenticated, invalid credentials error, HTML5 validation |
| `e2e/public.spec.js` | All public routes load, nav links present, contact form, 404 page |
| `e2e/admin-crud.spec.js` | Admin dashboard, players table, news table (requires `TEST_ADMIN_USER` env var) |

### Admin CRUD E2E Tests

The admin CRUD tests are skipped by default. To run them, set environment variables:

```bash
TEST_ADMIN_USER=youradmin TEST_ADMIN_PASS=yourpassword npx playwright test e2e/admin-crud.spec.js
```

The test user must exist in your database with superadmin privileges.

---

## CI Pipeline

Tests run on every push via GitHub Actions (`.github/workflows/ci.yml`):

- **Backend job**: `python manage.py test --verbosity=2`
- **Frontend job**: `npm run test:run`

E2E tests are not run in CI by default (they require a running backend). To enable them, add a service container for Django in the workflow and set `TEST_ADMIN_USER` as a GitHub Actions secret.

---

## Coverage Targets

| Area | Target |
|------|--------|
| Backend (all apps combined) | ≥ 80% |
| Frontend unit tests | ≥ 70% |

---

## Test Data

Backend tests use Django's test framework which:
- Creates a fresh SQLite database for each test run (wiped after)
- Each `TestCase` class wraps tests in a transaction that rolls back after each test
- Helper methods (`make_user`, `make_player`, etc.) live in each test file

No fixtures or factories are used — test data is created programmatically in `setUp()` methods.

### Throttle and Cache

Some tests clear Django's cache in `setUp`/`tearDown` to prevent rate-limit state from leaking between test classes:

```python
from django.core.cache import cache

def setUp(self):
    cache.clear()
```

This is required for any test that touches throttle-protected endpoints.
