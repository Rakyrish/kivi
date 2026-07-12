from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import ContactSubmission
from .tasks import send_inquiry_notification_task


@receiver(post_save, sender=ContactSubmission)
def handle_contact_submission_save(sender, instance, created, **kwargs):
    if created:
        send_inquiry_notification_task.delay(instance.id)
