from .base import *

DEBUG = False

# Security settings for production behind SSL proxy
# nginx already terminates TLS and redirects HTTP -> HTTPS at the edge (see
# nginx/*.conf). Django must NOT also redirect: internal container-to-container
# calls (e.g. the Next.js server hitting http://backend:8000 directly for SSR)
# never pass through nginx and have no way to be "upgraded", so a redirect here
# just breaks them.
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# HTTP Strict Transport Security
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional security headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
