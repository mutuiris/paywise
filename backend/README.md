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