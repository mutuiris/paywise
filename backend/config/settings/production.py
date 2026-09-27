"""Production settings for Paywise."""

import os

from .base import *  # noqa: F403

DEBUG = False

# Production requires an explicit, non-default SECRET_KEY from the environment
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# Production security headers and cookie flags
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
