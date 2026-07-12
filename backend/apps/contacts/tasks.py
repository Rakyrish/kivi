from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

from .models import ContactSubmission


@shared_task(name="apps.contacts.tasks.send_inquiry_notification_task")
def send_inquiry_notification_task(contact_submission_id):
    try:
        inquiry = ContactSubmission.objects.get(id=contact_submission_id)
    except ContactSubmission.DoesNotExist:
        return f"ContactSubmission {contact_submission_id} not found."

    admin_email = getattr(settings, 'COMPANY_EMAIL', 'info@kivichemicals.com')
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'info@kivichemicals.com')

    admin_subject = f"New Website Inquiry [{inquiry.reference_number}]: {inquiry.subject}"
    admin_body = f"""NEW WEBSITE INQUIRY

Name: {inquiry.name}
Company: {inquiry.company_name or 'Not provided'}
Email: {inquiry.email}
Phone: {inquiry.phone or 'Not provided'}
Country: {inquiry.country or 'Not provided'}
Inquiry Type: {inquiry.get_inquiry_type_display()}
Product: {inquiry.product_interest or 'Not specified'}
Quantity: {inquiry.quantity or 'Not specified'}

Message:
{inquiry.message}
---------
Reference: {inquiry.reference_number}
Attachment: {inquiry.attachment_url or 'None'}
Submitted: {inquiry.created_at:%Y-%m-%d %H:%M:%S}
"""

    try:
        send_mail(
            subject=admin_subject,
            message=admin_body,
            from_email=from_email,
            recipient_list=[admin_email],
            fail_silently=False,
        )

        if inquiry.email:
            customer_subject = "Thank You for Contacting Kivi Chemicals"
            customer_body = f"""Dear {inquiry.name},

Thank you for contacting Kivi Chemicals.

We have received your inquiry and one of our specialists will review it shortly.

Inquiry Reference:
#{inquiry.reference_number}

Our team typically responds within 24 hours during business days.

For urgent assistance, please contact us directly.

Best Regards,
Kivi Chemicals Team
{admin_email}
"""
            send_mail(
                subject=customer_subject,
                message=customer_body,
                from_email=from_email,
                recipient_list=[inquiry.email],
                fail_silently=True,
            )
        return f"Notifications sent for inquiry {contact_submission_id}"
    except Exception as e:
        return f"Error sending inquiry notifications: {str(e)}"
