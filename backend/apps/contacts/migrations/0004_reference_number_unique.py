from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0003_backfill_reference_numbers'),
    ]

    operations = [
        migrations.AlterField(
            model_name='contactsubmission',
            name='reference_number',
            field=models.CharField(blank=True, db_index=True, max_length=32, unique=True),
        ),
    ]
