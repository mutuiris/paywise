from django.core.exceptions import PermissionDenied, ValidationError
from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole
from apps.vendors import services
from apps.vendors.models import Project, Vendor


class VendorServicesTestCase(TestCase):
    def setUp(self) -> None:
        self.employee = UserAccount.objects.create_user(
            username="emp_svc", role=UserRole.EMPLOYEE
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_svc", role=UserRole.FINANCE_OFFICER
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_svc", role=UserRole.MANAGER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_svc", role=UserRole.ADMINISTRATOR
        )

    def test_create_vendor_service_success(self) -> None:
        vendor = services.create_vendor(
            name="Apex Engineering Ltd.",
            service_category="Civil works",
            email="contact@apex.co.ke",
            phone_number="+254711223344",
            payment_details={"paybill": "654321", "account": "APEX01"},
            description="Structural engineering partner",
            actor=self.finance,
        )
        self.assertEqual(vendor.name, "Apex Engineering Ltd.")
        self.assertEqual(vendor.created_by, self.finance.id)
        self.assertEqual(vendor.updated_by, self.finance.id)
        self.assertTrue(vendor.is_active)

    def test_create_vendor_permission_denied_for_employee(self) -> None:
        with self.assertRaises(PermissionDenied):
            services.create_vendor(
                name="Unauthorized Vendor",
                actor=self.employee,
            )

    def test_update_vendor_service(self) -> None:
        vendor = services.create_vendor(
            name="Initial Vendor Ltd.",
            actor=self.finance,
        )
        updated = services.update_vendor(
            vendor,
            actor=self.admin,
            name="Renamed Vendor Ltd.",
            service_category="Electrical",
        )
        self.assertEqual(updated.name, "Renamed Vendor Ltd.")
        self.assertEqual(updated.service_category, "Electrical")
        self.assertEqual(updated.updated_by, self.admin.id)

    def test_deactivate_and_activate_vendor_service(self) -> None:
        vendor = services.create_vendor(
            name="Active Vendor Ltd.",
            actor=self.finance,
        )
        self.assertTrue(vendor.is_active)

        services.deactivate_vendor(vendor, actor=self.finance)
        vendor.refresh_from_db()
        self.assertFalse(vendor.is_active)

        services.activate_vendor(vendor, actor=self.finance)
        vendor.refresh_from_db()
        self.assertTrue(vendor.is_active)

    def test_create_project_service_with_code_normalization(self) -> None:
        project = services.create_project(
            name="Coast Highway Expansion",
            code="   ",
            department="Infrastructure",
            description="Highway widening",
            actor=self.manager,
        )
        self.assertEqual(project.name, "Coast Highway Expansion")
        self.assertIsNone(project.code)
        self.assertEqual(project.created_by, self.manager.id)
        self.assertTrue(project.is_active)

    def test_create_project_permission_denied_for_employee(self) -> None:
        with self.assertRaises(PermissionDenied):
            services.create_project(
                name="Unauthorized Project",
                actor=self.employee,
            )

    def test_update_project_service(self) -> None:
        project = services.create_project(
            name="Airport Terminal 2",
            code="PRJ-TRM-02",
            actor=self.manager,
        )
        updated = services.update_project(
            project,
            actor=self.admin,
            code="  PRJ-TRM-02B  ",
            department="Aviation Works",
        )
        self.assertEqual(updated.code, "PRJ-TRM-02B")
        self.assertEqual(updated.department, "Aviation Works")
        self.assertEqual(updated.updated_by, self.admin.id)

    def test_deactivate_and_activate_project_service(self) -> None:
        project = services.create_project(
            name="Rift Valley Dam",
            actor=self.manager,
        )
        self.assertTrue(project.is_active)

        services.deactivate_project(project, actor=self.manager)
        project.refresh_from_db()
        self.assertFalse(project.is_active)

        services.activate_project(project, actor=self.manager)
        project.refresh_from_db()
        self.assertTrue(project.is_active)

    def test_validate_vendor_for_payment(self) -> None:
        active_vendor = Vendor.objects.create(name="Valid Vendor")
        services.validate_vendor_for_payment(active_vendor)

        inactive_vendor = Vendor.objects.create(name="Inactive Vendor", is_active=False)
        with self.assertRaises(ValidationError):
            services.validate_vendor_for_payment(inactive_vendor)

    def test_validate_project_for_payment(self) -> None:
        # None project is allowed (optional field on payment request)
        services.validate_project_for_payment(None)

        active_project = Project.objects.create(name="Valid Project")
        services.validate_project_for_payment(active_project)

        inactive_project = Project.objects.create(
            name="Inactive Project", is_active=False
        )
        with self.assertRaises(ValidationError):
            services.validate_project_for_payment(inactive_project)
