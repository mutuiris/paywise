from django.contrib import admin

from apps.approvals.models import Approval


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = (
        "payment_request",
        "approver",
        "tier",
        "decision",
        "created_at",
    )
    list_filter = ("tier", "decision", "created_at")
    search_fields = (
        "payment_request__invoice_number",
        "approver__username",
        "reason",
    )
    readonly_fields = ("created_at", "updated_at")
