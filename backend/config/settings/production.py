"""Production settings for Paywise."""

import os

import sentry_sdk

from .base import *  # noqa: F403

DEBUG = False

# Production requires an explicit, non-default SECRET_KEY from the environment
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]

# Render injects the service's public hostname.
if render_host := os.environ.get("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(render_host)  # noqa: F405

# Production security headers and cookie flags
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

if os.environ.get("SENTRY_DSN"):
    sentry_sdk.init(dsn=os.environ["SENTRY_DSN"], send_default_pii=False)

SILENCED_SYSTEM_CHECKS = ["mail.E001"]
