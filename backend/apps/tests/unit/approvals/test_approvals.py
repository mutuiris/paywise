from django.apps import apps
from django.test import SimpleTestCase

from apps.approvals.apps import ApprovalsConfig


class ApprovalsConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(ApprovalsConfig.name, "apps.approvals")
        self.assertEqual(ApprovalsConfig.verbose_name, "Approvals")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("approvals")
        self.assertEqual(app_config.name, "apps.approvals")
        self.assertEqual(app_config.verbose_name, "Approvals")
