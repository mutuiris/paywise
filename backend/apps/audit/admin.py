from django.contrib import admin

from apps.audit.models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = (
        "action",
        "entity_type",
        "entity_id",
        "actor",
        "actor_email",
        "created_at",
    )
    list_filter = ("action", "entity_type", "created_at")
    search_fields = (
        "action",
        "entity_type",
        "entity_id",
        "actor__username",
        "actor_email",
        "description",
    )
    readonly_fields = (
        "id",
        "actor",
        "actor_email",
        "action",
        "entity_type",
        "entity_id",
        "description",
        "metadata",
        "is_active",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request) -> bool:
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        return False
