from django.apps import apps
from django.test import SimpleTestCase

from apps.accounts.apps import AccountsConfig


class AccountsConfigTestCase(SimpleTestCase):
    def test_app_config_attributes(self) -> None:
        self.assertEqual(AccountsConfig.name, "apps.accounts")
        self.assertEqual(AccountsConfig.verbose_name, "Accounts")

    def test_app_is_registered(self) -> None:
        app_config = apps.get_app_config("accounts")
        self.assertEqual(app_config.name, "apps.accounts")
        self.assertEqual(app_config.verbose_name, "Accounts")
