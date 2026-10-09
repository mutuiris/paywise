from __future__ import annotations

from django.db import models

from apps.core.models import OwnerAbstract


class Vendor(OwnerAbstract):
    name = models.CharField(max_length=255, unique=True)
    service_category = models.CharField(max_length=100, blank=True)
    email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=50, blank=True)
    payment_details = models.JSONField(default=dict, blank=True)
    description = models.TextField(blank=True)

    class Meta:
        db_table = "vendors_vendor"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name


class Project(OwnerAbstract):
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True, blank=True, null=True)
    description = models.TextField(blank=True)
    department = models.CharField(max_length=100, blank=True)

    class Meta:
        db_table = "vendors_project"
        ordering = ("name",)

    def __str__(self) -> str:
        return self.name
