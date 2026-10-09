import uuid

from django.test import TestCase

from apps.accounts.models import UserAccount, UserRole


class UserAccountModelTestCase(TestCase):
    def test_create_user_with_default_role(self) -> None:
        user = UserAccount.objects.create_user(
            username="alice",
            email="alice@imaraworks.co.ke",
            password="testpassword123",
        )
        self.assertIsInstance(user.id, uuid.UUID)
        self.assertEqual(user.role, UserRole.EMPLOYEE)
        self.assertTrue(user.is_employee)
        self.assertFalse(user.is_manager)
        self.assertFalse(user.is_finance_officer)
        self.assertFalse(user.is_administrator)
        self.assertTrue(user.is_active)
        self.assertIsNotNone(user.created_at)
        self.assertIsNotNone(user.updated_at)
        self.assertEqual(str(user), "alice (Employee)")

    def test_create_user_with_specific_roles(self) -> None:
        manager = UserAccount.objects.create_user(
            username="carol",
            role=UserRole.MANAGER,
        )
        self.assertTrue(manager.is_manager)

        finance = UserAccount.objects.create_user(
            username="faith",
            role=UserRole.FINANCE_OFFICER,
        )
        self.assertTrue(finance.is_finance_officer)

        admin = UserAccount.objects.create_superuser(
            username="grace",
            role=UserRole.ADMINISTRATOR,
            password="adminpassword123",
        )
        self.assertTrue(admin.is_administrator)
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_inactive_user(self) -> None:
        user = UserAccount.objects.create_user(
            username="brian",
            is_active=False,
        )
        self.assertFalse(user.is_active)
