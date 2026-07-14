from celery import shared_task
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .models import ContactSubmission, InquiryReply


def _email_context():
    site_url = (getattr(settings, 'PUBLIC_SITE_URL', '') or 'https://kivichemicals.com').rstrip('/')
    address_parts = [
        getattr(settings, 'COMPANY_STREET_ADDRESS', ''),
        getattr(settings, 'COMPANY_CITY', ''),
        getattr(settings, 'COMPANY_COUNTRY', ''),
    ]
    return {
        'site_url': site_url,
        'company_name': getattr(settings, 'COMPANY_NAME', 'Kivi Industrial Chemicals Limited'),
        'company_email': getattr(settings, 'COMPANY_EMAIL', 'info@kivichemicals.com'),
        'company_phone': getattr(settings, 'COMPANY_PHONE', ''),
        'company_address': ', '.join(p for p in address_parts if p),
    }


def _send_html_email(template_name, context, subject, recipient_list, fail_silently=False, reply_to=None):
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'info@kivichemicals.com')
    html_body = render_to_string(template_name, context)
    text_body = strip_tags(html_body)
    message = EmailMultiAlternatives(subject, text_body, from_email, recipient_list, reply_to=reply_to)
    message.attach_alternative(html_body, 'text/html')
    message.send(fail_silently=fail_silently)


@shared_task(name="apps.contacts.tasks.send_inquiry_notification_task")
def send_inquiry_notification_task(contact_submission_id):
    try:
        inquiry = ContactSubmission.objects.get(id=contact_submission_id)
    except ContactSubmission.DoesNotExist:
        return f"ContactSubmission {contact_submission_id} not found."

    context = _email_context()
    admin_email = context['company_email']

    try:
        _send_html_email(
            'emails/admin_notification.html',
            {**context, 'inquiry': inquiry},
            subject=f"New Website Inquiry [{inquiry.reference_number}]: {inquiry.subject}",
            recipient_list=[admin_email],
            fail_silently=False,
            reply_to=[f'"{inquiry.name}" <{inquiry.email}>'] if inquiry.email else None,
        )

        if inquiry.email:
            _send_html_email(
                'emails/customer_confirmation.html',
                {**context, 'inquiry': inquiry},
                subject=f"We've Received Your Inquiry — {inquiry.reference_number}",
                recipient_list=[inquiry.email],
                fail_silently=True,
            )
        return f"Notifications sent for inquiry {contact_submission_id}"
    except Exception as e:
        return f"Error sending inquiry notifications: {str(e)}"


@shared_task(name="apps.contacts.tasks.send_inquiry_reply_task")
def send_inquiry_reply_task(reply_id):
    try:
        reply = InquiryReply.objects.select_related('inquiry').get(id=reply_id)
    except InquiryReply.DoesNotExist:
        return f"InquiryReply {reply_id} not found."

    inquiry = reply.inquiry
    context = _email_context()

    try:
        _send_html_email(
            'emails/admin_reply.html',
            {**context, 'inquiry': inquiry, 'reply': reply},
            subject=f"Re: {inquiry.subject} [{inquiry.reference_number}]",
            recipient_list=[inquiry.email],
            fail_silently=False,
        )
        return f"Reply notification sent for inquiry {inquiry.id}"
    except Exception as e:
        return f"Error sending reply notification: {str(e)}"
