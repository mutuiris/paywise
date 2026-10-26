#!/bin/bash

export DJANGO_SETTINGS_MODULE="config.settings.base"
export DJANGO_SECRET_KEY="secret-key-here"
export DJANGO_DEBUG="true"
export DJANGO_ALLOWED_HOSTS="localhost,127.0.0.1"

export POSTGRES_DB="paywise"
export POSTGRES_USER="paywise"
export POSTGRES_PASSWORD="local-password-here"
export POSTGRES_HOST="localhost"
export POSTGRES_PORT="5432"

# Optional observability configuration.
export SENTRY_DSN=""
export OTEL_EXPORTER_OTLP_ENDPOINT=""
export OTEL_SERVICE_NAME="paywise-backend"
export DJANGO_LOG_LEVEL="INFO"
export PAYWISE_LOG_LEVEL="INFO"