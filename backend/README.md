# Paywise Backend

[![CI](https://github.com/mutuiris/paywise/actions/workflows/ci.yml/badge.svg)](https://github.com/mutuiris/paywise/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/mutuiris/paywise/badge.svg?branch=develop)](https://coveralls.io/github/mutuiris/paywise?branch=develop)

Backend service for Paywise, built with Django and PostgreSQL.

## Stack

- Python 3.14
- Django 6.1.1
- PostgreSQL 18.6
- Psycopg 3.3
- uv
- Docker

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/mutuiris/paywise.git
cd paywise/backend
```

### 2. Create your environment file
```bash
cp env.example.sh env.sh
```

Update `env.sh` with your local values, especially:

```bash
DJANGO_SECRET_KEY
POSTGRES_PASSWORD
```


### 3. Install dependencies
```bash
uv sync
```

### 4. Load environment variables
```bash
source env.sh
```

Run this again whenever you open a new terminal.

### 5. Start PostgreSQL
```bash
docker compose up -d postgres
```

Check:
```bash
docker compose ps
```

### 6. Run migrations
```bash
uv run python manage.py migrate
```

### 7. Run Django
```bash
uv run python manage.py runserver
```

Backend:

```
http://127.0.0.1:8000/
```

The liveness/readiness endpoint is `GET /health/`. It returns `200` only when
the configured database accepts a basic query.

To run the containerized application locally, use the opt-in Compose profile:

```bash
docker compose --profile app up --build
```

The application container does not run migrations by default. Set
`RUN_MIGRATIONS=true` only in a controlled release job, not on every
application replica.

### API and authentication

The JSON API uses Django session authentication. Fetch `GET /api/accounts/csrf/`
before mutating requests and send the returned token in `X-CSRFToken`. Login,
logout, and the current identity are available at:

- `POST /api/accounts/login/`
- `POST /api/accounts/logout/`
- `GET /api/accounts/me/`

Payment request creation uses `POST /api/payments/`; submit with
`POST /api/payments/<id>/submit/`. Approval decisions use
`POST /api/approvals/<id>/decide/` with `tier`, `decision`, and a required
nonblank `reason` for rejections (or the `approve/` and `reject/` shortcuts). Processing requires a unique
`Idempotency-Key` header at `POST /api/payments/<id>/process/`; ambiguous
attempts are listed at `GET /api/payments/attempts/?status=AMBIGUOUS` and
reconciled at `POST /api/payments/attempts/<id>/reconcile/`. FAILED requests can
be processed again with a new key.

Payments go through `MockPaymentProvider`. The amount's cents pick the outcome:
`.99` fails, `.88` is ambiguous (then reconcile), anything else succeeds.

Administrators manage users at `GET/POST /api/accounts/users/` and
`PATCH /api/accounts/users/<id>/` (`role`, `department`, `is_active`). Login
accepts a username or a unique email.

Employees can create and view their own requests. Managers, finance officers,
and administrators can view organization requests; finance officers and
administrators process payments. Managers and administrators manage projects,
while finance officers and administrators manage vendors. Invalid or stale
state transitions return `400`; authentication failures return `401`,
authorization failures `403`, missing resources `404`, and idempotency or
uniqueness conflicts `409`.

### Demo data

```bash
uv run python manage.py seed_demo            # grace, faith, carol, david, alice / password123
uv run python manage.py seed_demo --password '<something-strong>'
```

To show one-click buttons for these on the sign-in page, set
`NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS=true` in `frontend/.env.local`. Leave it unset in
production.

`createsuperuser` accounts are always given the Administrator role.

### Deploying

Backend environment:

- `DJANGO_SETTINGS_MODULE=config.settings.production`
- `DJANGO_SECRET_KEY`, `POSTGRES_*`
- `DJANGO_ALLOWED_HOSTS` — the backend's own hostname
- `DJANGO_CSRF_TRUSTED_ORIGINS` — the frontend origin, e.g. `https://paywise.vercel.app`
- Run `python manage.py migrate` once per release (or `RUN_MIGRATIONS=true` in a release job)

Frontend (Vercel): set `PAYWISE_API_ORIGIN` to the backend URL. Next.js proxies
`/api/*` to it, so the browser stays same-origin and no CORS setup is needed.

The Django admin (`/admin/`) has no static file serving under gunicorn, so its
pages render unstyled; the app itself does not need it.

### Optional observability

`SENTRY_DSN` enables Sentry in production with personal data disabled.
`OTEL_EXPORTER_OTLP_ENDPOINT` and `OTEL_SERVICE_NAME` are reserved for an
OTLP-compatible tracing deployment; they are optional and are not required for
tests. `DJANGO_LOG_LEVEL` and `PAYWISE_LOG_LEVEL` control console log levels.
Logs and audit metadata must not contain credentials, cookies, tokens, or raw
payment destination details.

### Useful Commands
```bash
uv sync
uv run python manage.py check
uv run python manage.py migrate
uv run python manage.py makemigrations
docker compose up -d postgres
docker compose down
```

### Notes
PostgreSQL runs through Docker.