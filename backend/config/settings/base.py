import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load .env from the project root (one level above the backend directory)
_env_path = BASE_DIR.parent / '.env'
if _env_path.exists():
    load_dotenv(_env_path, override=False)
else:
    # Fallback: try the backend dir itself
    load_dotenv(BASE_DIR / '.env', override=False)

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-kivi-chemical-super-secret-key-12345')
DEBUG = os.environ.get('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'cloudinary_storage',
    'cloudinary',
    'apps.products',
    'apps.blog',
    'apps.seo',
    'apps.contacts',
    'apps.ai_generator',
    'apps.leads',
    'apps.analytics',
    'django_celery_beat',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.analytics.middleware.ErrorLoggingMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
        'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
    }
}

# Add default db credentials if using postgres
if os.environ.get('DB_ENGINE') == 'django.db.backends.postgresql':
    DATABASES['default'] = {
        'ENGINE': os.environ['DB_ENGINE'],
        'NAME': os.environ['DB_NAME'],
        'USER': os.environ['DB_USER'],
        'PASSWORD': os.environ['DB_PASSWORD'],
        'HOST': os.environ['DB_HOST'],
        'PORT': os.environ['DB_PORT'],
    }

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://redis:6379/0'),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = os.environ.get('SITE_TIME_ZONE', 'Africa/Nairobi')
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = []

MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '200/minute',
        'kivi_agent': '20/minute',
    },
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 24,
}

# CORS & CSRF
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')

# Cloudinary Storage Settings
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
        'API_KEY': CLOUDINARY_API_KEY,
        'API_SECRET': CLOUDINARY_API_SECRET,
    }
    DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

SECURE_PROXY_SSL_HEADER = tuple(
    os.environ.get('SECURE_PROXY_SSL_HEADER', 'HTTP_X_FORWARDED_PROTO,https').split(',')
)

# Company settings — all from env
COMPANY_NAME = os.environ.get('COMPANY_NAME', 'Kivi Industrial Chemicals Limited')
COMPANY_TAGLINE = os.environ.get('COMPANY_TAGLINE', '')
COMPANY_EMAIL = os.environ.get('COMPANY_EMAIL', '')
COMPANY_PHONE = os.environ.get('COMPANY_PHONE_NUMBER', '')
COMPANY_WHATSAPP = os.environ.get('COMPANY_WHATSAPP_NUMBER', '')

# OpenAI settings
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-4o-mini')

# Public site URL audited by PageSpeed Insights (the Next.js frontend)
PUBLIC_SITE_URL = os.environ.get('NEXT_PUBLIC_SITE_URL', '')

# Google PageSpeed Insights — key optional but strongly recommended (higher quota)
PAGESPEED_API_KEY = os.environ.get('PAGESPEED_API_KEY', '')

# Google Search Console — service account with webmasters.readonly scope,
# added as a user on the GSC property. GSC_SITE_URL e.g. 'sc-domain:kivichemicals.com'
GSC_SITE_URL = os.environ.get('GSC_SITE_URL', '')
GOOGLE_SERVICE_ACCOUNT_FILE = os.environ.get('GOOGLE_SERVICE_ACCOUNT_FILE', '')
GOOGLE_SERVICE_ACCOUNT_JSON = os.environ.get('GOOGLE_SERVICE_ACCOUNT_JSON', '')

# Email setup
EMAIL_BACKEND = os.environ.get('EMAIL_BACKEND', 'django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_USE_SSL = os.environ.get('EMAIL_USE_SSL', 'False') == 'True'
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
FROM_EMAIL = os.environ.get('FROM_EMAIL', 'info@kivichemicals.com')
DEFAULT_FROM_EMAIL = FROM_EMAIL

# Celery configurations
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/1')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://redis:6379/1')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
# No caller ever reads a task result (.get()/AsyncResult) — every task here is
# fire-and-forget. Without this, Celery's redis result backend opens a pubsub
# subscription on every .delay() call and, if the broker is unreachable, that
# subscribe retries for ~19s before giving up, blocking the request that
# triggered it (e.g. saving a Product from the admin).
CELERY_TASK_IGNORE_RESULT = True
# Bound the broker connection attempt itself so a down/unreachable broker
# fails in ~1s instead of hanging the request.
CELERY_BROKER_CONNECTION_TIMEOUT = 2
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True

# Configure Celery Beat Scheduler
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Internal (container-network) base URL for the Next.js frontend, used to call
# its on-demand ISR revalidation route when a product/category changes.
FRONTEND_INTERNAL_URL = os.environ.get('FRONTEND_INTERNAL_URL', 'http://frontend:3000')
# Shared secret for that same webhook — read from env (not DB) since it must
# match the identical REVALIDATE_SECRET the frontend container reads from the
# same .env file; a DB-editable copy could silently drift out of sync.
REVALIDATE_SECRET = os.environ.get('REVALIDATE_SECRET', '')

