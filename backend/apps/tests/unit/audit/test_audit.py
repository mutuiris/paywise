from django.apps import apps
from django.test import SimpleTestCase

from apps.audit.apps import AuditConfig


class AuditConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(AuditConfig.name, "apps.audit")
        self.assertEqual(AuditConfig.verbose_name, "Audit")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("audit")
        self.assertEqual(app_config.name, "apps.audit")
        self.assertEqual(app_config.verbose_name, "Audit")
