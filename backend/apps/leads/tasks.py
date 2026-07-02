from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import QuoteRequest


@shared_task(name="apps.leads.tasks.send_quote_notification_task")
def send_quote_notification_task(quote_request_id):
    try:
        quote = QuoteRequest.objects.get(id=quote_request_id)
    except QuoteRequest.DoesNotExist:
        return f"QuoteRequest {quote_request_id} not found."

    subject = f"New Chemical Quote Request: {quote.product_name or 'General Enquiry'}"
    
    # Render detailed body for admin notification
    body = f"""
New quote request has been received on Kivi Industrial Chemicals Ltd.

--- REQUESTER DETAILS ---
Name: {quote.name}
Email: {quote.email}
Phone: {quote.phone or 'Not provided'}
Company: {quote.company or 'Not provided'}
Country: {quote.country or 'Not provided'}

--- PRODUCT DETAILS ---
Product: {quote.product_name}
Chemical Formula: {quote.chemical_formula or 'N/A'}
Product Slug: {quote.product_slug or 'N/A'}
Quantity: {quote.quantity or 'Not specified'}

--- ADDITIONAL MESSAGE ---
{quote.message or 'No message provided.'}

--- TECHNICAL DETAILS ---
Source Page: {quote.source_page or 'N/A'}
Referrer: {quote.referrer or 'N/A'}
Device: {quote.device_type}
UTM Source/Medium: {quote.utm_source or 'N/A'} / {quote.utm_medium or 'N/A'}
Request Time: {quote.created_at:%Y-%m-%d %H:%M:%S}
"""

    admin_email = getattr(settings, 'COMPANY_EMAIL', 'info@kivichemicals.com')
    from_email = getattr(settings, 'FROM_EMAIL', 'Kivi Industrial Chemicals <info@kivichemicals.com>')

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=from_email,
            recipient_list=[admin_email],
            fail_silently=False,
        )
        # Also send a brief confirmation to the requester if they provided an email
        if quote.email:
            requester_subject = f"Thank you for contacting Kivi Industrial Chemicals: {quote.product_name}"
            requester_body = f"""
Dear {quote.name},

Thank you for your interest in Kivi Industrial Chemicals Limited. We have received your request for a quote on:
- Product: {quote.product_name}
- Quantity: {quote.quantity or 'Not specified'}

Our technical sales team is reviewing your requirements and will contact you shortly with a detailed specification sheet and pricing.

If you have any urgent updates, you can contact us at {admin_email}.

Best regards,
Kivi Industrial Chemicals Sales Desk
Nairobi, Kenya
"""
            send_mail(
                subject=requester_subject,
                message=requester_body,
                from_email=from_email,
                recipient_list=[quote.email],
                fail_silently=True,
            )
        return f"Successfully sent notifications for quote {quote_request_id}"
    except Exception as e:
        return f"Error sending quote notifications: {str(e)}"
