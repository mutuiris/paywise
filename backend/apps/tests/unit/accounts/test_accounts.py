"""Unit and integration tests for authentication and accounts endpoints."""

from __future__ import annotations

import json
from typing import Any

from django.test import Client, TestCase
from django.urls import reverse

from apps.accounts.models import UserAccount, UserRole


class AccountsAuthViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.password = "Secr3tPass!123"
        self.employee = UserAccount.objects.create_user(
            username="emp_john",
            email="john@imaraworks.co.ke",
            password=self.password,
            role=UserRole.EMPLOYEE,
        )
        self.manager = UserAccount.objects.create_user(
            username="mgr_sarah",
            email="sarah@imaraworks.co.ke",
            password=self.password,
            role=UserRole.MANAGER,
        )
        self.inactive_user = UserAccount.objects.create_user(
            username="inactive_bob",
            email="bob@imaraworks.co.ke",
            password=self.password,
            role=UserRole.EMPLOYEE,
            is_active=False,
        )

    def test_get_csrf_token(self) -> None:
        response = self.client.get(reverse("accounts:csrf-token"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("csrfToken", data)
        self.assertTrue(len(data["csrfToken"]) > 0)

    def test_login_success(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps({"username": "emp_john", "password": self.password}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("user", data)
        user_data = data["user"]
        self.assertEqual(user_data["username"], "emp_john")
        self.assertEqual(user_data["role"], UserRole.EMPLOYEE)
        self.assertTrue(user_data["is_active"])
        # Ensure password hash is NEVER leaked
        self.assertNotIn("password", user_data)
        self.assertNotIn("password_hash", user_data)

    def test_login_with_email(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps(
                {"username": "John@ImaraWorks.co.ke", "password": self.password}
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["username"], "emp_john")

    def test_login_invalid_password(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps({"username": "emp_john", "password": "WrongPassword"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Invalid credentials.")

    def test_login_nonexistent_user(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps({"username": "nobody", "password": self.password}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["error"], "Invalid credentials.")

    def test_login_inactive_user_fails(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps({"username": "inactive_bob", "password": self.password}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)

    def test_login_missing_fields(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data=json.dumps({"username": "emp_john"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_login_malformed_json(self) -> None:
        response = self.client.post(
            reverse("accounts:login"),
            data="not valid json",
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_me_authenticated(self) -> None:
        self.client.force_login(self.manager)
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["user"]["username"], "mgr_sarah")
        self.assertEqual(data["user"]["role"], UserRole.MANAGER)
        self.assertNotIn("password", data["user"])

    def test_me_unauthenticated(self) -> None:
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 401)

    def test_me_inactive_user_session_denied(self) -> None:
        self.client.force_login(self.inactive_user)
        response = self.client.get(reverse("accounts:me"))
        self.assertEqual(response.status_code, 401)

    def test_logout(self) -> None:
        self.client.force_login(self.employee)
        response = self.client.post(reverse("accounts:logout"))
        self.assertEqual(response.status_code, 200)

        # After logout, /me must return 401
        me_response = self.client.get(reverse("accounts:me"))
        self.assertEqual(me_response.status_code, 401)

    def test_logout_unauthenticated(self) -> None:
        response = self.client.post(reverse("accounts:logout"))
        self.assertEqual(response.status_code, 401)


class UserManagementViewsTestCase(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        self.admin = UserAccount.objects.create_user(
            username="admin_grace", password="x", role=UserRole.ADMINISTRATOR
        )
        self.employee = UserAccount.objects.create_user(
            username="emp_ann", password="x", role=UserRole.EMPLOYEE
        )

    def _post(self, payload: dict) -> Any:
        return self.client.post(
            reverse("accounts:user-list-create"),
            data=json.dumps(payload),
            content_type="application/json",
        )

    def _patch(self, user: UserAccount, payload: dict) -> Any:
        return self.client.patch(
            reverse("accounts:user-update", kwargs={"user_id": user.id}),
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_non_admin_forbidden(self) -> None:
        self.client.force_login(self.employee)
        self.assertEqual(
            self.client.get(reverse("accounts:user-list-create")).status_code, 403
        )

    def test_admin_creates_user_who_can_log_in(self) -> None:
        self.client.force_login(self.admin)
        payload = {
            "email": "New.Hire@imaraworks.co.ke",
            "password": "Strong-pass-2026",
            "role": UserRole.FINANCE_OFFICER,
            "first_name": "New",
            "department": "Finance",
        }
        resp = self._post(payload)
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()["user"]["department"], "Finance")
        self.assertEqual(self._post(payload).status_code, 409)
        self.assertEqual(
            self._post({**payload, "email": "b@x.co", "password": "123"}).status_code,
            400,
        )

        self.client.logout()
        login = self.client.post(
            reverse("accounts:login"),
            data=json.dumps(
                {
                    "username": "new.hire@imaraworks.co.ke",
                    "password": "Strong-pass-2026",
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(login.status_code, 200)

    def test_admin_updates_role_and_active_but_not_self(self) -> None:
        self.client.force_login(self.admin)
        resp = self._patch(
            self.employee, {"role": UserRole.MANAGER, "is_active": False}
        )
        self.assertEqual(resp.status_code, 200)
        self.employee.refresh_from_db()
        self.assertEqual(self.employee.role, UserRole.MANAGER)
        self.assertFalse(self.employee.is_active)
        self.assertEqual(self._patch(self.admin, {"is_active": False}).status_code, 400)
        self.assertEqual(self._patch(self.employee, {"role": "BOSS"}).status_code, 400)
