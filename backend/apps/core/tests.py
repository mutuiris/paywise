from django.test import SimpleTestCase


class CoreTestCase(SimpleTestCase):
    def test_core_is_working(self) -> None:
        self.assertEqual(1 + 1, 2)
