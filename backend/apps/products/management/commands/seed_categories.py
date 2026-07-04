from django.core.management.base import BaseCommand
from apps.products.models import Category
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seeds the default categories for Kivi Chemicals'

    def handle(self, *args, **options):
        default_categories = [
            "Agricultural Chemicals",
            "Building and Architecture",
            "Ceramics",
            "Cleaning & Disinfection Chemicals",
            "Dyes Colors and Candles",
            "Farming Chemicals",
            "Food & Pharmaceutical Ingredients",
            "Food and Beverages",
            "Fragrances",
            "Industrial Binders & Alkyd Resins",
            "Industrial Chemicals",
            "Mining Chemicals"
        ]
        
        for name in default_categories:
            slug = slugify(name)
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'is_active': True,
                    'is_featured': False
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {name}"))
            else:
                self.stdout.write(f"Category already exists: {name}")
