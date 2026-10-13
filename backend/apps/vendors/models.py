"""Domain models for vendors and organisational projects/departments."""

from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import OwnerAbstract


class Vendor(OwnerAbstract):
    """External supplier or service provider receiving payment."""

    name = models.CharField(max_length=255, unique=True)
    service_category = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    payment_details = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "vendors_vendor"
        ordering = ("name",)

    def clean(self) -> None:
        """Validate vendor fields and normalize text representations."""
        super().clean()
        if self.name is not None:
            self.name = self.name.strip()
        if not self.name:
            raise ValidationError({"name": "Vendor name cannot be empty."})

        if self.service_category:
            self.service_category = self.service_category.strip()

        if self.email:
            self.email = self.email.strip().lower()

        if self.phone_number:
            self.phone_number = self.phone_number.strip()

        if self.payment_details is not None and not isinstance(
            self.payment_details, dict
        ):
            raise ValidationError(
                {"payment_details": "Payment details must be a valid JSON dictionary."}
            )

    def __str__(self) -> str:
        return self.name


class Project(OwnerAbstract):
    """Organisational department or construction project destination."""

    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "vendors_project"
        ordering = ("name",)

    def clean(self) -> None:
        """Normalize empty codes to None and sanitize string fields."""
        super().clean()
        if self.name is not None:
            self.name = self.name.strip()
        if not self.name:
            raise ValidationError({"name": "Project name cannot be empty."})

        # Empty strings collide under PostgreSQL unique constraints; NULL values do not
        if self.code is not None:
            stripped_code = self.code.strip()
            self.code = stripped_code if stripped_code else None

        if self.department:
            self.department = self.department.strip()

    def save(self, *args, **kwargs) -> None:
        """Ensure empty project code strings are persisted as NULL."""
        if self.code is not None and not self.code.strip():
            self.code = None
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name
