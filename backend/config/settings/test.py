import os

from .base import *  # noqa: F403

DEBUG = False

SECRET_KEY = (
    os.environ.get("DJANGO_SECRET_KEY")
    or "django-insecure-test-key-for-paywise-testing"
)

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.locmem.EmailBackend",
    },
}

if not os.environ.get("POSTGRES_DB"):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ":memory:",
            "OPTIONS": {
                "timeout": 30,
            },
        }
    }
