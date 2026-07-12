from rest_framework import filters, permissions, viewsets

from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer, ContactSubmissionStatusSerializer


class ContactSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSubmissionSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company_name', 'subject', 'message', 'reference_number']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        qs = ContactSubmission.objects.all()
        if self.action == 'list':
            status_param = self.request.query_params.get('status')
            if status_param:
                qs = qs.filter(status=status_param)
            inquiry_type = self.request.query_params.get('inquiry_type')
            if inquiry_type:
                qs = qs.filter(inquiry_type=inquiry_type)
        return qs

    def get_serializer_class(self):
        if self.action in ('update', 'partial_update'):
            return ContactSubmissionStatusSerializer
        return ContactSubmissionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
