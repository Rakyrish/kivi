from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('description', models.TextField(blank=True)),
                ('seo_title', models.CharField(blank=True, max_length=60)),
                ('seo_description', models.CharField(blank=True, max_length=160)),
                ('image', models.URLField(blank=True)),
                ('order', models.IntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'verbose_name_plural': 'Categories',
                'ordering': ['order', 'name'],
            },
        ),
        migrations.CreateModel(
            name='SiteSetting',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(default='', max_length=200)),
                ('tagline', models.CharField(default='', max_length=300)),
                ('email', models.EmailField(blank=True, max_length=254)),
                ('phone', models.CharField(blank=True, max_length=20)),
                ('whatsapp', models.CharField(blank=True, max_length=20)),
                ('address', models.TextField(blank=True)),
                ('city', models.CharField(blank=True, max_length=100)),
                ('country', models.CharField(default='Kenya', max_length=100)),
                ('logo', models.URLField(blank=True)),
                ('favicon', models.URLField(blank=True)),
                ('default_seo_title', models.CharField(blank=True, max_length=60)),
                ('default_seo_description', models.CharField(blank=True, max_length=160)),
                ('default_keywords', models.CharField(blank=True, max_length=500)),
                ('linkedin_url', models.URLField(blank=True)),
                ('facebook_url', models.URLField(blank=True)),
                ('instagram_url', models.URLField(blank=True)),
                ('twitter_url', models.URLField(blank=True)),
            ],
            options={
                'verbose_name': 'Site Setting',
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('chemical_formula', models.CharField(blank=True, max_length=50)),
                ('cas_number', models.CharField(blank=True, max_length=20)),
                ('grade', models.CharField(blank=True, max_length=100)),
                ('un_number', models.CharField(blank=True, max_length=10)),
                ('short_description', models.CharField(max_length=300)),
                ('description', models.TextField()),
                ('applications', models.JSONField(default=list)),
                ('specifications', models.JSONField(default=dict)),
                ('safety_info', models.TextField(blank=True)),
                ('seo_title', models.CharField(blank=True, max_length=60)),
                ('seo_description', models.CharField(blank=True, max_length=160)),
                ('keywords', models.CharField(blank=True, max_length=300)),
                ('image', models.URLField(blank=True)),
                ('images', models.JSONField(default=list)),
                ('is_active', models.BooleanField(default=True)),
                ('is_featured', models.BooleanField(default=False)),
                ('in_stock', models.BooleanField(default=True)),
                ('ai_generated', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('category', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='products',
                    to='products.category',
                )),
            ],
            options={
                'ordering': ['-is_featured', '-created_at'],
            },
        ),
    ]
