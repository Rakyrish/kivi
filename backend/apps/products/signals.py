from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, Category
from .tasks import generate_product_datasheet_task, trigger_revalidation_task


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

    try:
        paths = [f'/products/{instance.slug}', '/products', '/']
        if instance.category_id:
            paths.append(f'/categories/{instance.category.slug}')
        trigger_revalidation_task.delay(paths)
    except Exception:
        pass


@receiver(post_delete, sender=Product)
def handle_product_delete(sender, instance, **kwargs):
    try:
        cache.clear()
    except Exception:
        pass

    try:
        paths = [f'/products/{instance.slug}', '/products', '/']
        if instance.category_id:
            paths.append(f'/categories/{instance.category.slug}')
        trigger_revalidation_task.delay(paths)
    except Exception:
        pass


@receiver(post_save, sender=Category)
def handle_category_save(sender, instance, created, **kwargs):
    try:
        cache.clear()
    except Exception:
        pass

    try:
        trigger_revalidation_task.delay([f'/categories/{instance.slug}', '/categories', '/'])
    except Exception:
        pass


@receiver(post_delete, sender=Category)
def handle_category_delete(sender, instance, **kwargs):
    try:
        cache.clear()
    except Exception:
        pass

    try:
        trigger_revalidation_task.delay([f'/categories/{instance.slug}', '/categories', '/'])
    except Exception:
        pass
