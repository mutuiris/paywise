import uuid

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.test import TestCase

from apps.accounts.models import UserAccount
from apps.vendors.models import Project, Vendor


class VendorModelTestCase(TestCase):
    def setUp(self) -> None:
        self.user = UserAccount.objects.create_user(username="testuser")

    def test_create_vendor(self) -> None:
        vendor = Vendor.objects.create(
            name="Metro Hardware Ltd.",
            service_category="Construction materials",
            email="info@metrohardware.co.ke",
            phone_number="+254700000001",
            payment_details={"paybill": "123456", "account": "METRO"},
            description="Leading supplier of cement and timber",
            created_by=self.user.id,
        )
        self.assertIsInstance(vendor.id, uuid.UUID)
        self.assertTrue(vendor.is_active)
        self.assertEqual(vendor.creator, self.user)
        self.assertEqual(str(vendor), "Metro Hardware Ltd.")
        self.assertIsNotNone(vendor.created_at)
        self.assertIsNotNone(vendor.updated_at)
        self.assertEqual(vendor.history.count(), 1)

    def test_vendor_name_uniqueness(self) -> None:
        Vendor.objects.create(name="Prime Cement Supplies")
        with self.assertRaises((IntegrityError, ValidationError)):
            Vendor.objects.create(name="Prime Cement Supplies")


class ProjectModelTestCase(TestCase):
    def setUp(self) -> None:
        self.user = UserAccount.objects.create_user(username="testuser2")

    def test_create_project(self) -> None:
        project = Project.objects.create(
            name="Westlands Commercial Center",
            code="PRJ-WCC-01",
            department="Commercial Building",
            description="Phase 1 commercial site",
            created_by=self.user.id,
        )
        self.assertIsInstance(project.id, uuid.UUID)
        self.assertTrue(project.is_active)
        self.assertEqual(project.creator, self.user)
        self.assertEqual(str(project), "Westlands Commercial Center")
        self.assertEqual(project.history.count(), 1)

    def test_project_name_uniqueness(self) -> None:
        Project.objects.create(name="Upperhill Towers")
        with self.assertRaises((IntegrityError, ValidationError)):
            Project.objects.create(name="Upperhill Towers")
