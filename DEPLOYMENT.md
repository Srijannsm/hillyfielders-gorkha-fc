# Deployment Guide — Hillyfielders Gorkha FC

This guide covers deploying the application to Railway, which hosts both the Django backend and the built React frontend as a single service.

---

## Prerequisites

- [Railway](https://railway.app) account
- GitHub repository connected to Railway
- [Cloudinary](https://cloudinary.com) account (free tier) for media storage
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) for contact form emails

---

## Architecture on Railway

```
Railway project
├── Web service (Django + WhiteNoise)  ← serves API + built React frontend
├── PostgreSQL addon                   ← managed database
└── Redis addon (optional)             ← rate limiting cache
```

The Django `collectstatic` + `npm run build` steps run at deploy time. WhiteNoise serves the built React files from `frontend/dist/`.

---

## Step-by-Step Railway Setup

### 1. Create a Railway project

1. Log in to Railway and click **New Project → Deploy from GitHub repo**
2. Select the `hillyfielders-gorkha-fc` repository
3. Railway will auto-detect the `Procfile` or `railway.json` and configure the build

### 2. Add a PostgreSQL database

1. In your Railway project, click **+ New → Database → PostgreSQL**
2. Railway automatically injects `DATABASE_URL` into your service environment

### 3. Add a Redis instance (optional, for rate limiting)

1. Click **+ New → Database → Redis**
2. Railway automatically injects `REDIS_URL` into your service environment
3. Without Redis, the app falls back to in-memory cache (works but resets on restart)

### 4. Configure environment variables

In your Railway service → **Variables**, set the following:

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes | Django secret key — generate with `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DEBUG` | Yes | Set to `False` in production |
| `ALLOWED_HOSTS` | Yes | Your Railway domain, e.g. `myapp.up.railway.app` |
| `CORS_ALLOWED_ORIGINS` | Yes | Same as your frontend URL, e.g. `https://myapp.up.railway.app` |
| `DATABASE_URL` | Auto | Injected by Railway PostgreSQL addon |
| `EMAIL_HOST_USER` | Yes | Gmail address for contact form notifications |
| `EMAIL_HOST_PASSWORD` | Yes | Gmail App Password (not your real password) |
| `CONTACT_EMAIL` | Yes | Email address that receives contact form submissions |
| `CLOUDINARY_CLOUD_NAME` | Yes | From your Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | From your Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | From your Cloudinary dashboard |
| `REDIS_URL` | Optional | Injected by Railway Redis addon if added |
| `VITE_MAIL_PROVIDER` | Optional | `gmail`, `outlook`, or `default` (defaults to `gmail`) |

### 5. Build configuration

Railway uses the `Procfile` at the project root. Ensure it contains:

```
web: python manage.py migrate --no-input && python manage.py collectstatic --no-input && gunicorn core.wsgi --bind 0.0.0.0:$PORT
```

The `npm run build` for the frontend is triggered by the `nixpacks.toml` or `railway.json` build phase. Check the root `railway.json` if present.

### 6. Custom domain and SSL

1. In Railway: **Settings → Networking → Custom Domain**
2. Add your domain (e.g. `gorkhafc.com`)
3. Create a CNAME record in your DNS provider pointing to the Railway-provided hostname
4. Railway provisions an SSL certificate automatically via Let's Encrypt

---

## Post-Deployment Verification Checklist

- [ ] `GET https://your-domain.com/api/health/` returns `{"status": "ok", "database": "ok"}`
- [ ] `GET https://your-domain.com/api/docs/` shows Swagger UI with all endpoints
- [ ] Home page loads at `https://your-domain.com/`
- [ ] Admin login works at `https://your-domain.com/admin/login`
- [ ] Contact form submission sends an email
- [ ] Photo upload in admin converts to WebP and stores on Cloudinary
- [ ] `GET https://your-domain.com/sitemap.xml` returns a valid XML sitemap

---

## Rollback Procedure

Railway keeps deployment history. To roll back:

1. Go to your Railway service → **Deployments**
2. Find the last known-good deployment
3. Click the three-dot menu → **Rollback**

For database migrations, Railway does not auto-rollback. If a migration caused data loss:
1. Restore a PostgreSQL backup from Railway's database → **Backups** tab
2. Redeploy the previous code version

---

## Common Deployment Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `django.db.OperationalError: FATAL: database does not exist` | `DATABASE_URL` not set or wrong | Check Railway PostgreSQL addon is linked |
| `CSRF verification failed` | `ALLOWED_HOSTS` or `CORS_ALLOWED_ORIGINS` missing your domain | Add your Railway domain to both variables |
| `Media files returning 404` | Cloudinary credentials not set | Add all three `CLOUDINARY_*` variables |
| `500 error on contact form` | Email credentials wrong | Check Gmail App Password is set correctly |
| `Static files 404` | `collectstatic` didn't run | Verify `Procfile` includes `collectstatic --no-input` |
| `ModuleNotFoundError` | Missing package in `requirements.txt` | Add the package and redeploy |

---

## Health Check

Railway uses the health check endpoint to verify the service is up:

```
GET /api/health/
```

Response when healthy:
```json
{"status": "ok", "database": "ok", "timestamp": "2025-01-01T12:00:00+00:00"}
```

Configure Railway to use this path: **Service → Settings → Health Check Path → `/api/health/`**
