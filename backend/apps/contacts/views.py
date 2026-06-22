from django.core.mail import send_mail
from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer


class ContactSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSubmissionSerializer

    def get_queryset(self):
        return ContactSubmission.objects.all()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        instance = serializer.save()

        # Send email notification
        subject = f"New Inquiry: {instance.subject}"
        message_body = f"""
You have received a new inquiry from the Kivi Chemicals website contact form.

Details:
------------------------------------------
Name: {instance.name}
Email: {instance.email}
Phone: {instance.phone or 'N/A'}
Company: {instance.company_name or 'N/A'}
Subject: {instance.subject}
Date: {instance.created_at}

Message:
{instance.message}
------------------------------------------
        """
        
        recipient = getattr(settings, 'COMPANY_EMAIL', 'info@kivichemicals.com')
        from_email = getattr(settings, 'FROM_EMAIL', 'info@kivichemicals.com')

        try:
            send_mail(
                subject=subject,
                message=message_body,
                from_email=from_email,
                recipient_list=[recipient],
                fail_silently=False,
            )
        except Exception as e:
            # Prevent email errors from blocking the API response
            pass
