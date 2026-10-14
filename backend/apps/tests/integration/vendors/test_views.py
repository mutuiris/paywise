import json
import uuid

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole
from apps.vendors.models import Project, Vendor


class VendorViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="emp_view", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_view", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_view", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_view", role=UserRole.ADMINISTRATOR
        )

        self.vendor = Vendor.objects.create(
            name="Kilifi Timber Supplies",
            service_category="Timber",
            email="sales@kilifitimber.co.ke",
            phone_number="+254700112233",
            payment_details={"paybill": "112233", "account": "KTS"},
            description="High grade structural timber",
        )
        self.inactive_vendor = Vendor.objects.create(
            name="Defunct Cement Co",
            is_active=False,
        )

    def test_vendor_list_requires_authentication(self) -> None:
        response = self.client.get(reverse("vendors:vendor-list-create"))
        self.assertEqual(response.status_code, 401)

    def test_vendor_list_authenticated_users(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(reverse("vendors:vendor-list-create"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("vendors", data)
        # Defaults to only active vendors
        names = [v["name"] for v in data["vendors"]]
        self.assertIn("Kilifi Timber Supplies", names)
        self.assertNotIn("Defunct Cement Co", names)

    def test_vendor_list_include_inactive_flag(self) -> None:
        self.client.force_login(self.finance)
        response = self.client.get(
            reverse("vendors:vendor-list-create"), {"include_inactive": "true"}
        )
        self.assertEqual(response.status_code, 200)
        names = [v["name"] for v in response.json()["vendors"]]
        self.assertIn("Kilifi Timber Supplies", names)
        self.assertIn("Defunct Cement Co", names)

    def test_vendor_list_search_and_category_filtering(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(
            reverse("vendors:vendor-list-create"), {"search": "Kilifi"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["vendors"]), 1)

        response2 = self.client.get(
            reverse("vendors:vendor-list-create"), {"category": "Nonexistent"}
        )
        self.assertEqual(response2.status_code, 200)
        self.assertEqual(len(response2.json()["vendors"]), 0)

    def test_vendor_create_forbidden_for_employee_and_manager(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.post(
            reverse("vendors:vendor-list-create"),
            data=json.dumps({"name": "New Vendor"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 403)

        self.client.force_login(self.manager)
        response2 = self.client.post(
            reverse("vendors:vendor-list-create"),
            data=json.dumps({"name": "New Vendor"}),
            content_type="application/json",
        )
        self.assertEqual(response2.status_code, 403)

    def test_vendor_create_success_for_finance_officer(self) -> None:
        self.client.force_login(self.finance)
        payload = {
            "name": "Nairobi Steel Works",
            "service_category": "Metals",
            "email": "orders@nairobibar.co.ke",
            "phone_number": "+254722334455",
            "payment_details": {"bank": "KCB", "account": "0123456789"},
            "description": "Reinforced steel bars",
        }
        response = self.client.post(
            reverse("vendors:vendor-list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["vendor"]["name"], "Nairobi Steel Works")
        self.assertTrue(data["vendor"]["is_active"])
        self.assertEqual(data["vendor"]["created_by"], str(self.finance.id))

    def test_vendor_create_validation_error(self) -> None:
        self.client.force_login(self.finance)
        # Empty name
        response = self.client.post(
            reverse("vendors:vendor-list-create"),
            data=json.dumps({"name": ""}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_vendor_detail_get(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(
            reverse(
                "vendors:vendor-detail-update", kwargs={"vendor_id": self.vendor.id}
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["vendor"]["name"], "Kilifi Timber Supplies")

    def test_vendor_detail_get_not_found(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(
            reverse("vendors:vendor-detail-update", kwargs={"vendor_id": uuid.uuid4()})
        )
        self.assertEqual(response.status_code, 404)

    def test_vendor_update_success_for_finance(self) -> None:
        self.client.force_login(self.finance)
        response = self.client.put(
            reverse(
                "vendors:vendor-detail-update", kwargs={"vendor_id": self.vendor.id}
            ),
            data=json.dumps(
                {"name": "Kilifi Timber Ltd.", "service_category": "Lumber"}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["vendor"]["name"], "Kilifi Timber Ltd.")
        self.assertEqual(response.json()["vendor"]["updated_by"], str(self.finance.id))

    def test_vendor_toggle_active_status(self) -> None:
        self.client.force_login(self.finance)
        url = reverse(
            "vendors:vendor-toggle-active", kwargs={"vendor_id": self.vendor.id}
        )

        # Deactivate
        resp1 = self.client.post(
            url,
            data=json.dumps({"is_active": False}),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 200)
        self.assertFalse(resp1.json()["vendor"]["is_active"])

        # Reactivate
        resp2 = self.client.post(
            url,
            data=json.dumps({"is_active": True}),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertTrue(resp2.json()["vendor"]["is_active"])


class ProjectViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.employee = UserAccount.objects.create_user(
            username="emp_proj", role=UserRole.EMPLOYEE
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_proj", role=UserRole.MANAGER
        )
        self.finance = UserAccount.objects.create_user(
            username="fin_proj", role=UserRole.FINANCE_OFFICER
        )
        self.admin = UserAccount.objects.create_user(
            username="adm_proj", role=UserRole.ADMINISTRATOR
        )

        self.project = Project.objects.create(
            name="Mombasa Port Pier 3",
            code="PRJ-MSA-03",
            department="Maritime Logistics",
            description="Deep water berth extension",
        )
        self.inactive_project = Project.objects.create(
            name="Cancelled Overpass",
            is_active=False,
        )

    def test_project_list_requires_authentication(self) -> None:
        response = self.client.get(reverse("vendors:project-list-create"))
        self.assertEqual(response.status_code, 401)

    def test_project_list_authenticated_users(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.get(reverse("vendors:project-list-create"))
        self.assertEqual(response.status_code, 200)
        names = [p["name"] for p in response.json()["projects"]]
        self.assertIn("Mombasa Port Pier 3", names)
        self.assertNotIn("Cancelled Overpass", names)

    def test_project_create_forbidden_for_employee_and_finance(self) -> None:
        self.client.force_login(self.employee)
        resp1 = self.client.post(
            reverse("vendors:project-list-create"),
            data=json.dumps({"name": "New Project"}),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 403)

        self.client.force_login(self.finance)
        resp2 = self.client.post(
            reverse("vendors:project-list-create"),
            data=json.dumps({"name": "New Project"}),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 403)

    def test_project_create_success_for_manager(self) -> None:
        self.client.force_login(self.manager)
        payload = {
            "name": "Kisumu Cold Storage Facility",
            "code": "PRJ-KSM-01",
            "department=": "Agricultural Logistics",
            "description": "Cold storage warehouse construction",
        }
        response = self.client.post(
            reverse("vendors:project-list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        data = response.json()
        self.assertEqual(data["project"]["name"], "Kisumu Cold Storage Facility")
        self.assertEqual(data["project"]["code"], "PRJ-KSM-01")
        self.assertEqual(data["project"]["created_by"], str(self.manager.id))

    def test_project_detail_get_and_update(self) -> None:
        self.client.force_login(self.employee)
        get_resp = self.client.get(
            reverse(
                "vendors:project-detail-update", kwargs={"project_id": self.project.id}
            )
        )
        self.assertEqual(get_resp.status_code, 200)
        self.assertEqual(get_resp.json()["project"]["name"], "Mombasa Port Pier 3")

        # Update by manager
        self.client.force_login(self.manager)
        update_resp = self.client.patch(
            reverse(
                "vendors:project-detail-update", kwargs={"project_id": self.project.id}
            ),
            data=json.dumps({"description": "Updated berth specifications"}),
            content_type="application/json",
        )
        self.assertEqual(update_resp.status_code, 200)
        self.assertEqual(
            update_resp.json()["project"]["description"],
            "Updated berth specifications",
        )

    def test_project_toggle_active_status(self) -> None:
        self.client.force_login(self.manager)
        url = reverse(
            "vendors:project-toggle-active", kwargs={"project_id": self.project.id}
        )

        # Deactivate
        resp1 = self.client.post(
            url,
            data=json.dumps({"is_active": False}),
            content_type="application/json",
        )
        self.assertEqual(resp1.status_code, 200)
        self.assertFalse(resp1.json()["project"]["is_active"])

        # Reactivate
        resp2 = self.client.post(
            url,
            data=json.dumps({"is_active": True}),
            content_type="application/json",
        )
        self.assertEqual(resp2.status_code, 200)
        self.assertTrue(resp2.json()["project"]["is_active"])
