"""
Registers the platform's periodic tasks in celery-beat (DatabaseScheduler).

Idempotent — safe to run on every deploy:
    python manage.py seed_schedules
"""
import json
from django.conf import settings
from django.core.management.base import BaseCommand
from django_celery_beat.models import CrontabSchedule, PeriodicTask


SCHEDULES = [
    {
        'name': 'Daily Lighthouse audit — mobile (PageSpeed Insights)',
        'task': 'apps.analytics.tasks.run_pagespeed_audit',
        'kwargs': {'strategy': 'mobile'},
        'crontab': {'minute': '0', 'hour': '3', 'day_of_week': '*'},
    },
    {
        'name': 'Daily Lighthouse audit — desktop (PageSpeed Insights)',
        'task': 'apps.analytics.tasks.run_pagespeed_audit',
        'kwargs': {'strategy': 'desktop'},
        'crontab': {'minute': '15', 'hour': '3', 'day_of_week': '*'},
    },
    {
        'name': 'Automated AI blog generation (Monday)',
        'task': 'apps.blog.tasks.automated_weekly_blog_generation',
        'kwargs': {},
        'crontab': {'minute': '0', 'hour': '8', 'day_of_week': '1'},
    },
    {
        'name': 'Automated AI blog generation (Thursday)',
        'task': 'apps.blog.tasks.automated_weekly_blog_generation',
        'kwargs': {},
        'crontab': {'minute': '0', 'hour': '8', 'day_of_week': '4'},
    },
]


class Command(BaseCommand):
    help = 'Create or update the celery-beat periodic task schedule.'

    def handle(self, *args, **options):
        for entry in SCHEDULES:
            crontab, _ = CrontabSchedule.objects.get_or_create(
                minute=entry['crontab']['minute'],
                hour=entry['crontab']['hour'],
                day_of_week=entry['crontab']['day_of_week'],
                day_of_month='*',
                month_of_year='*',
                timezone=settings.TIME_ZONE,
            )
            task, created = PeriodicTask.objects.update_or_create(
                name=entry['name'],
                defaults={
                    'task': entry['task'],
                    'crontab': crontab,
                    'kwargs': json.dumps(entry['kwargs']),
                    'enabled': True,
                },
            )
            verb = 'Created' if created else 'Updated'
            self.stdout.write(self.style.SUCCESS(f"{verb}: {task.name}"))

        self.stdout.write(self.style.SUCCESS('Periodic task schedule is up to date.'))
