from django.apps import apps
from django.test import SimpleTestCase

from apps.payments.apps import PaymentsConfig


class PaymentsConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(PaymentsConfig.name, "apps.payments")
        self.assertEqual(PaymentsConfig.verbose_name, "Payments")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("payments")
        self.assertEqual(app_config.name, "apps.payments")
        self.assertEqual(app_config.verbose_name, "Payments")
