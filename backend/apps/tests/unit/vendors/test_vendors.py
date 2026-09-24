from django.apps import apps
from django.test import SimpleTestCase

from apps.vendors.apps import VendorsConfig


class VendorsConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(VendorsConfig.name, "apps.vendors")
        self.assertEqual(VendorsConfig.verbose_name, "Vendors")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("vendors")
        self.assertEqual(app_config.name, "apps.vendors")
        self.assertEqual(app_config.verbose_name, "Vendors")
