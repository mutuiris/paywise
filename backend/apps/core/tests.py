from django.test import TestCase


class CoreTestCase(TestCase):
    def test_core_is_working(self) -> None:
        self.assertEqual(1 + 1, 2)