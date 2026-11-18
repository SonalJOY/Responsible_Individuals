import os
from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'responsibleindividuals.org,api.responsibleindividuals.org').split(',')

# PostgreSQL Configuration
DB_NAME = os.environ.get('POSTGRES_DB', 'responsible_individuals')
DB_USER = os.environ.get('POSTGRES_USER', 'postgres')
DB_PASSWORD = os.environ.get('POSTGRES_PASSWORD', '')
DB_HOST = os.environ.get('POSTGRES_HOST', 'localhost')
DB_PORT = os.environ.get('POSTGRES_PORT', '5432')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
    }
}

# Static file serving with WhiteNoise
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security Settings
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = os.environ.get('SECURE_SSL_REDIRECT', 'True') == 'True'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS
CORS_ALLOW_ALL_ORIGINS = False
cors_allowed_origins_raw = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'https://responsibleindividuals.org,https://www.responsibleindividuals.org'
)
CORS_ALLOWED_ORIGINS = [origin.strip() for origin in cors_allowed_origins_raw.split(',') if origin.strip()]
CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins
csrf_trusted_origins_raw = os.environ.get(
    'CSRF_TRUSTED_ORIGINS',
    os.environ.get('CORS_ALLOWED_ORIGINS', 'https://responsibleindividuals.org,https://www.responsibleindividuals.org')
)
CSRF_TRUSTED_ORIGINS = [
    origin if origin.startswith(('http://', 'https://')) else f'https://{origin}'
    for origin in (o.strip() for o in csrf_trusted_origins_raw.split(','))
    if origin
]
