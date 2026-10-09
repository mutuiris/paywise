from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import UserAccount


@admin.register(UserAccount)
class UserAccountAdmin(UserAdmin):
    list_display = (
        "username",
        "email",
        "role",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("role", "is_active", "is_staff")
    search_fields = ("username", "email", "first_name", "last_name")
    fieldsets = UserAdmin.fieldsets + (
        (
            "Role & Permissions",
            {
                "fields": ("role",),
            },
        ),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Role & Permissions",
            {
                "fields": ("role",),
            },
        ),
    )
