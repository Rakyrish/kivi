from rest_framework import viewsets, permissions
from .models import BlogPost
from .serializers import BlogPostSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        # Allow admin staff to see all, public sees only published
        if self.request.user and self.request.user.is_staff:
            return BlogPost.objects.all().order_by('-created_at')
        return BlogPost.objects.filter(is_published=True).order_by('-created_at')
