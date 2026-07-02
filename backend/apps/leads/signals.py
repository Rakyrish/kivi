from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import QuoteRequest
from .tasks import send_quote_notification_task


@receiver(post_save, sender=QuoteRequest)
def handle_quote_request_save(sender, instance, created, **kwargs):
    if created:
        # Trigger celery background task to send emails & notify admin
        send_quote_notification_task.delay(instance.id)
