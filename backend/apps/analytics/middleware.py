import traceback
from django.utils.deprecation import MiddlewareMixin
from django.db.models import F
from apps.analytics.models import SystemError

class ErrorLoggingMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        if response.status_code == 404:
            # We filter out typical static/media asset missing errors to avoid log noise,
            # or log only paths of interest.
            path = request.path
            # Ignore standard static/media/favicon paths to focus on website routes
            if not any(path.startswith(prefix) for prefix in ['/static/', '/media/', '/favicon.ico']):
                error_message = f"Page not found: {path}"
                err, created = SystemError.objects.get_or_create(
                    error_type='404',
                    source=path,
                    status='unresolved',
                    defaults={
                        'message': error_message,
                        'count': 1
                    }
                )
                if not created:
                    SystemError.objects.filter(pk=err.pk).update(count=F('count') + 1)
        return response

    def process_exception(self, request, exception):
        path = request.path
        tb_str = traceback.format_exc()
        message = str(exception) or type(exception).__name__
        
        err, created = SystemError.objects.get_or_create(
            error_type='500',
            source=path,
            status='unresolved',
            defaults={
                'message': message,
                'stack_trace': tb_str,
                'count': 1
            }
        )
        if not created:
            SystemError.objects.filter(pk=err.pk).update(count=F('count') + 1, message=message, stack_trace=tb_str)
            
        return None
