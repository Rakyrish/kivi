from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import QuoteRequest, Lead
from .serializers import QuoteRequestSerializer, LeadSerializer


class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def perform_create(self, serializer):
        # Auto-detect device type from User-Agent if not passed
        user_agent = self.request.META.get('HTTP_USER_AGENT', '').lower()
        device_type = 'unknown'
        if 'mobile' in user_agent:
            device_type = 'mobile'
        elif 'tablet' in user_agent or 'ipad' in user_agent:
            device_type = 'tablet'
        elif any(x in user_agent for x in ['windows', 'macintosh', 'linux', 'cros']):
            device_type = 'desktop'

        # Fetch IP-based country code from headers if available (e.g., from Cloudflare or Nginx)
        country = self.request.META.get('HTTP_CF_IPCOUNTRY', '') or self.request.META.get('HTTP_X_COUNTRY', '')
        
        # Save QuoteRequest with detected/injected fields
        extra_fields = {}
        if not serializer.validated_data.get('device_type') or serializer.validated_data.get('device_type') == 'unknown':
            extra_fields['device_type'] = device_type
        if not serializer.validated_data.get('country') and country:
            extra_fields['country'] = country
        if not serializer.validated_data.get('referrer'):
            extra_fields['referrer'] = self.request.META.get('HTTP_REFERER', '')[:500]

        serializer.save(**extra_fields)


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
