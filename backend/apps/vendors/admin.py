from django.contrib import admin

from apps.vendors.models import Project, Vendor


@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "service_category",
        "email",
        "phone_number",
        "is_active",
        "created_at",
    )
    list_filter = ("service_category", "is_active")
    search_fields = ("name", "email", "phone_number")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "code",
        "department",
        "is_active",
        "created_at",
    )
    list_filter = ("department", "is_active")
    search_fields = ("name", "code", "department")
