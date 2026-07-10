from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, Category
from .tasks import generate_product_datasheet_task


@receiver(post_save, sender=Product)
def handle_product_save(sender, instance, created, **kwargs):
    # A save must never fail because Redis (cache or broker) is unreachable.
    try:
        cache.clear()
    except Exception:
        pass

    # Trigger background Celery task to generate PDF datasheet.
    try:
        generate_product_datasheet_task.delay(instance.id)
    except Exception:
        pass


@receiver(post_save, sender=Category)
def handle_category_save(sender, instance, created, **kwargs):
    try:
        cache.clear()
    except Exception:
        pass
