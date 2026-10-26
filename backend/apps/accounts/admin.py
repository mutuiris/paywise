from typing import Any, ClassVar

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
    fieldsets: ClassVar[Any] = tuple(UserAdmin.fieldsets or ()) + (
        (
            "Role & Permissions",
            {
                "fields": ("role",),
            },
        ),
    )
    add_fieldsets: Any = tuple(UserAdmin.add_fieldsets or ()) + (
        (
            "Role & Permissions",
            {
                "fields": ("role",),
            },
        ),
    )
