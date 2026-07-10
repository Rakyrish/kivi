from django.utils import timezone
from .models import AIGenerationLog


def log_ai_action(action_type, target_name, status_str, tokens_used=0, error_message="", triggered_by="admin"):
    """Audit every AI generation call for the dashboard AI metrics section."""
    try:
        AIGenerationLog.objects.create(
            action_type=action_type,
            target_name=target_name,
            status=status_str,
            tokens_used=tokens_used,
            error_message=error_message,
            triggered_by=triggered_by,
            completed_at=timezone.now()
        )
    except Exception:
        pass
