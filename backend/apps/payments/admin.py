from django.contrib import admin

from apps.payments.models import PaymentAttempt, PaymentRequest


@admin.register(PaymentRequest)
class PaymentRequestAdmin(admin.ModelAdmin):
    list_display = (
        "invoice_number",
        "vendor",
        "amount",
        "currency",
        "status",
        "requester",
        "created_at",
    )
    list_filter = ("status", "payment_method", "created_at")
    search_fields = (
        "invoice_number",
        "vendor__name",
        "description",
        "requester__username",
    )
    readonly_fields = ("created_at", "updated_at")


@admin.register(PaymentAttempt)
class PaymentAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "idempotency_key",
        "payment_request",
        "amount",
        "status",
        "provider_reference",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "idempotency_key",
        "provider_reference",
        "payment_request__invoice_number",
    )
    readonly_fields = ("created_at", "updated_at")
