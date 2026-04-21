from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent
REACT_DIST_DIR = BASE_DIR / 'frontend' / 'dist'

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# All apps Django needs to know about
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'drf_spectacular',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    'django.contrib.sitemaps',

    # Our apps
    'players',
    'fixtures',
    'news',
    'accounts',
    'tickets',
    'sponsors',
    'gallery',
    'club',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # must be first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [REACT_DIST_DIR],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# ── Database ────────────────────────────────────────────────────────────────
# In production: set DATABASE_URL env var (e.g. postgres://user:pass@host/db)
# In development: falls back to SQLite
_database_url = os.getenv('DATABASE_URL')
if _database_url:
    import dj_database_url
    DATABASES = {'default': dj_database_url.parse(_database_url, conn_max_age=600)}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kathmandu'
USE_I18N = True
USE_TZ = True

# ── Static files ─────────────────────────────────────────────────────────────
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
WHITENOISE_MAX_AGE = 31536000  # 1 year — safe for hashed Vite filenames

if REACT_DIST_DIR.exists():
    STATICFILES_DIRS = [REACT_DIST_DIR]

# ── Media files ───────────────────────────────────────────────────────────────
# In production: use Cloudinary. In development: local disk.
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.getenv('CLOUDINARY_CLOUD_NAME'),
    'API_KEY':    os.getenv('CLOUDINARY_API_KEY'),
    'API_SECRET': os.getenv('CLOUDINARY_API_SECRET'),
}
if all([
    os.getenv('CLOUDINARY_CLOUD_NAME'),
    os.getenv('CLOUDINARY_API_KEY'),
    os.getenv('CLOUDINARY_API_SECRET'),
]):
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
    MEDIA_URL = '/media/cloudinary/'
else:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── CORS ─────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173,http://localhost:3000'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# ── Security headers (production only) ───────────────────────────────────────
if not DEBUG:
    SECURE_HSTS_SECONDS         = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_SSL_REDIRECT         = True
    SESSION_COOKIE_SECURE       = True
    CSRF_COOKIE_SECURE          = True
    SECURE_BROWSER_XSS_FILTER   = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS             = 'DENY'

# ── Django REST Framework ─────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.cookie_auth.CookieJWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.StandardPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'contact': '5/hour',
        'login':   '10/hour',
        'anon':    '200/day',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES':      ('Bearer',),
}

# ── Celery ───────────────────────────────────────────────────────────────────
_redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
if not os.getenv('REDIS_URL') and not DEBUG:
    import warnings
    warnings.warn(
        'REDIS_URL is not set. Celery tasks will run inline (blocking). '
        'Set REDIS_URL in production for proper async task handling.',
        stacklevel=2,
    )
CELERY_BROKER_URL        = _redis_url
CELERY_RESULT_BACKEND    = _redis_url
CELERY_ACCEPT_CONTENT    = ['json']
CELERY_TASK_SERIALIZER   = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE          = TIME_ZONE
# No REDIS_URL → run tasks inline (dev without Redis)
CELERY_TASK_ALWAYS_EAGER = not bool(os.getenv('REDIS_URL'))

# ── Email ─────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER     = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = (os.getenv('EMAIL_HOST_PASSWORD') or '').replace(' ', '')
CONTACT_EMAIL       = os.getenv('CONTACT_EMAIL')

# ── Auth cookies ──────────────────────────────────────────────────────────────
# httpOnly JWT cookies — set by accounts/cookie_views.py
AUTH_COOKIE_SECURE   = not DEBUG          # HTTPS-only in production
AUTH_COOKIE_SAMESITE = 'Strict'

# ── Sentry (optional — only active when SENTRY_DSN env var is set) ────────────
_sentry_dsn = os.getenv('SENTRY_DSN')
if _sentry_dsn:
    try:
        import sentry_sdk
        sentry_sdk.init(
            dsn=_sentry_dsn,
            traces_sample_rate=0.1,
            environment='production' if not DEBUG else 'development',
        )
    except ImportError:
        pass  # sentry-sdk not installed — silently skip

# ── drf-spectacular (OpenAPI / Swagger UI) ───────────────────────────────────
SPECTACULAR_SETTINGS = {
    'TITLE': 'Hillyfielders Gorkha FC API',
    'DESCRIPTION': (
        'REST API for the Hillyfielders Gorkha FC football club website.\n\n'
        '**Public endpoints** (`/api/`) require no authentication.\n\n'
        '**Admin endpoints** (`/api/admin/`) require JWT cookie authentication '
        'and role-based permissions. Login at `/api/auth/login/` first.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'TAGS': [
        {'name': 'auth', 'description': 'JWT cookie-based authentication'},
        {'name': 'players', 'description': 'Teams, players, and staff (public)'},
        {'name': 'fixtures', 'description': 'Match fixtures and results (public)'},
        {'name': 'news', 'description': 'News articles (public)'},
        {'name': 'gallery', 'description': 'Photo gallery (public)'},
        {'name': 'sponsors', 'description': 'Sponsors (public)'},
        {'name': 'club', 'description': 'Club profile (public)'},
        {'name': 'contact', 'description': 'Contact form (public)'},
        {'name': 'health', 'description': 'Health check'},
        {'name': 'admin-players', 'description': 'Admin: Players & Staff CRUD'},
        {'name': 'admin-fixtures', 'description': 'Admin: Fixtures & Competitions CRUD'},
        {'name': 'admin-news', 'description': 'Admin: Articles & Categories CRUD'},
        {'name': 'admin-gallery', 'description': 'Admin: Photos CRUD'},
        {'name': 'admin-sponsors', 'description': 'Admin: Sponsors CRUD'},
        {'name': 'admin-club', 'description': 'Admin: Club Profile management'},
        {'name': 'admin-enquiries', 'description': 'Admin: Enquiries inbox'},
        {'name': 'admin-users', 'description': 'Admin: User management (superadmin only)'},
        {'name': 'admin-dashboard', 'description': 'Admin: Dashboard stats'},
    ],
}

# ── Logging ───────────────────────────────────────────────────────────────────
_LOG_DIR = BASE_DIR / 'logs'
_LOG_DIR.mkdir(exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': _LOG_DIR / 'django.log',
            'maxBytes': 5 * 1024 * 1024,  # 5 MB per file
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'WARNING',
    },
    'loggers': {
        'core':     {'handlers': ['console', 'file'], 'level': 'INFO', 'propagate': False},
        'accounts': {'handlers': ['console', 'file'], 'level': 'INFO', 'propagate': False},
        'news':     {'handlers': ['console', 'file'], 'level': 'INFO', 'propagate': False},
    },
}
