"""Idempotently create demo users, vendors, and a project for local testing."""

from __future__ import annotations

from typing import Any

from django.core.management.base import BaseCommand, CommandParser

from apps.accounts.models import UserAccount, UserRole
from apps.vendors.models import Project, Vendor

DEMO_USERS = [
    ("grace", "Grace", "Otieno", UserRole.ADMINISTRATOR, "Administration"),
    ("faith", "Faith", "Njeri", UserRole.FINANCE_OFFICER, "Finance"),
    ("carol", "Carol", "Wanjiku", UserRole.MANAGER, "Operations"),
    ("david", "David", "Mutua", UserRole.MANAGER, "Construction"),
    ("alice", "Alice", "Mwangi", UserRole.EMPLOYEE, "Construction"),
]


class Command(BaseCommand):
    help = "Create demo users (shared password), vendors, and a project."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--password", default="password123")

    def handle(self, *args: Any, **options: Any) -> None:
        for username, first, last, role, department in DEMO_USERS:
            user, _ = UserAccount.objects.get_or_create(
                username=username,
                defaults={
                    "first_name": first,
                    "last_name": last,
                    "email": f"{first}.{last}@imaraworks.co.ke".lower(),
                    "role": role,
                    "department": department,
                },
            )
            user.set_password(options["password"])
            user.save()

        Vendor.objects.get_or_create(
            name="Bamburi Cement",
            defaults={"service_category": "Materials", "phone_number": "+254700000001"},
        )
        Vendor.objects.get_or_create(
            name="Nairobi Hardware",
            defaults={"service_category": "Hardware", "phone_number": "+254700000002"},
        )
        Project.objects.get_or_create(
            name="Thika Road Housing",
            defaults={"code": "TRH-01", "department": "Construction"},
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {len(DEMO_USERS)} demo users: "
                + ", ".join(u[0] for u in DEMO_USERS)
            )
        )
