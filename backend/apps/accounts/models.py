from __future__ import annotations

import uuid
from typing import Any

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.core.models import TimeStampable


class UserRole(models.TextChoices):
    EMPLOYEE = "EMPLOYEE", "Employee"
    MANAGER = "MANAGER", "Manager"
    FINANCE_OFFICER = "FINANCE_OFFICER", "Finance Officer"
    ADMINISTRATOR = "ADMINISTRATOR", "Administrator"


class UserAccount(AbstractUser, TimeStampable):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    role = models.CharField(
        max_length=30,
        choices=UserRole.choices,
        default=UserRole.EMPLOYEE,
    )
    department = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "accounts_useraccount"
        ordering = ("username",)

    def save(self, *args: Any, **kwargs: Any) -> None:
        # `createsuperuser` has no role prompt; a superuser is an administrator.
        if self.is_superuser:
            self.role = UserRole.ADMINISTRATOR
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        role_label = getattr(self, "get_role_display")()
        return f"{self.username} ({role_label})"

    @property
    def is_employee(self) -> bool:
        return self.role == UserRole.EMPLOYEE

    @property
    def is_manager(self) -> bool:
        return self.role == UserRole.MANAGER

    @property
    def is_finance_officer(self) -> bool:
        return self.role == UserRole.FINANCE_OFFICER

    @property
    def is_administrator(self) -> bool:
        return self.role == UserRole.ADMINISTRATOR
