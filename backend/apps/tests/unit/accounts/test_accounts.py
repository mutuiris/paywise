"""Unit and integration tests for authentication and accounts endpoints."""

from __future__ import annotations

import json

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
