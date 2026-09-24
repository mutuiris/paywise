from django.apps import apps
from django.test import SimpleTestCase

from apps.reporting.apps import ReportingConfig


class ReportingConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(ReportingConfig.name, "apps.reporting")
        self.assertEqual(ReportingConfig.verbose_name, "Reporting")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("reporting")
        self.assertEqual(app_config.name, "apps.reporting")
        self.assertEqual(app_config.verbose_name, "Reporting")
