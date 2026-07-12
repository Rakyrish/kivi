import uuid

from django.db import migrations
from django.utils import timezone


def backfill_reference_numbers(apps, schema_editor):
    ContactSubmission = apps.get_model('contacts', 'ContactSubmission')
    for submission in ContactSubmission.objects.filter(reference_number=''):
        for _ in range(5):
            candidate = f"KIVI-{timezone.now():%Y%m%d}-{uuid.uuid4().hex[:6].upper()}"
            if not ContactSubmission.objects.filter(reference_number=candidate).exists():
                submission.reference_number = candidate
                submission.save(update_fields=['reference_number'])
                break


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0002_add_inquiry_fields'),
    ]

    operations = [
        migrations.RunPython(backfill_reference_numbers, noop_reverse),
    ]
