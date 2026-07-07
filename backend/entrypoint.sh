#!/bin/sh

set -e

echo "==> Waiting for database..."
# Simple wait loop — the healthcheck in docker-compose handles ordering,
# but we add a small retry here for safety in local dev.
until python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()
from django.db import connection
connection.ensure_connection()
print('DB ready.')
" 2>/dev/null; do
  echo "Waiting for DB to be ready..."
  sleep 2
done

echo "==> Running migrations..."
python manage.py migrate --noinput

echo "==> Seeding database default categories and products..."
python manage.py seed_data

echo "==> Seeding celery-beat periodic task schedule..."
python manage.py seed_schedules

echo "==> Collecting static files..."
python manage.py collectstatic --noinput

echo "==> Starting Gunicorn..."
exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers ${GUNICORN_WORKERS:-3} \
  --timeout ${GUNICORN_TIMEOUT:-120} \
  --access-logfile - \
  --error-logfile -
