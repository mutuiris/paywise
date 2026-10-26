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
        self.assertEqual(getattr(vendor, "history").count(), 1)

    def test_vendor_name_uniqueness(self) -> None:
        Vendor.objects.create(name="Prime Cement Supplies")
        with self.assertRaises((IntegrityError, ValidationError)):
            Vendor.objects.create(name="Prime Cement Supplies")

    def test_vendor_empty_name_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            Vendor.objects.create(name="   ")

    def test_vendor_payment_details_dict_validation(self) -> None:
        with self.assertRaises(ValidationError):
            Vendor.objects.create(
                name="Invalid Vendor",
                payment_details="not-a-dict",
            )


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
        self.assertEqual(getattr(project, "history").count(), 1)

    def test_project_name_uniqueness(self) -> None:
        Project.objects.create(name="Upperhill Towers")
        with self.assertRaises((IntegrityError, ValidationError)):
            Project.objects.create(name="Upperhill Towers")

    def test_project_empty_name_rejected(self) -> None:
        with self.assertRaises(ValidationError):
            Project.objects.create(name="")

    def test_project_code_normalization_empty_string_to_none(self) -> None:
        # Empty string codes normalize to None without unique constraint conflicts
        p1 = Project.objects.create(name="Project Alpha", code="")
        p2 = Project.objects.create(name="Project Beta", code="   ")
        p3 = Project.objects.create(name="Project Gamma", code=None)

        self.assertIsNone(p1.code)
        self.assertIsNone(p2.code)
        self.assertIsNone(p3.code)

    def test_project_code_uniqueness_when_provided(self) -> None:
        Project.objects.create(name="Project Delta", code="PRJ-DELTA")
        with self.assertRaises((IntegrityError, ValidationError)):
            Project.objects.create(name="Project Epsilon", code="PRJ-DELTA")
