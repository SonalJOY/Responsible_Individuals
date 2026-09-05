from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'entity_type', 'entity_id', 'user', 'created_at', 'ip_address')
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('entity_type', 'entity_id', 'description', 'user__email')
    readonly_fields = ('id', 'user', 'action', 'entity_type', 'entity_id', 'description', 'ip_address', 'metadata', 'created_at', 'updated_at')
