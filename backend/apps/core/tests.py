import uuid
from unittest.mock import Mock, patch

from django.db import models
from django.test import SimpleTestCase

from apps.core.models import (
    OwnerAbstract,
    OwnerlessAbstract,
    TimeStampable,
)


class ModelMixinTestModel(OwnerAbstract):
    """
    This is the core model used to test the shared model contract
    """

    name = models.CharField(max_length=100)

    class Meta:
        app_label = "core"


class TimeStampableTests(SimpleTestCase):
    def test_is_abstract(self) -> None:
        self.assertTrue(TimeStampable._meta.abstract)

    def test_timestamp_fields(self) -> None:
        created_at = TimeStampable._meta.get_field("created_at")
        updated_at = TimeStampable._meta.get_field("updated_at")

        self.assertIsInstance(created_at, models.DateTimeField)
        self.assertTrue(created_at.auto_now_add)

        self.assertIsInstance(updated_at, models.DateTimeField)
        self.assertTrue(updated_at.auto_now)


class OwnerlessAbstractTests(SimpleTestCase):
    def test_is_abstract(self) -> None:
        self.assertTrue(OwnerlessAbstract._meta.abstract)

    def test_uuid_identity(self) -> None:
        field = OwnerlessAbstract._meta.get_field("id")

        self.assertIsInstance(field, models.UUIDField)
        self.assertTrue(field.primary_key)
        self.assertFalse(field.editable)
        self.assertIs(field.default, uuid.uuid4)

    def test_is_active_defaults_to_true(self) -> None:
        field = OwnerlessAbstract._meta.get_field("is_active")

        self.assertIsInstance(field, models.BooleanField)
        self.assertTrue(field.default)

    def test_default_ordering(self) -> None:
        self.assertEqual(
            OwnerlessAbstract._meta.ordering,
            ("-updated_at", "-created_at"),
        )


class OwnerAbstractTests(SimpleTestCase):
    def test_is_abstract(self) -> None:
        self.assertTrue(OwnerAbstract._meta.abstract)

    def test_owner_fields(self) -> None:
        created_by = OwnerAbstract._meta.get_field("created_by")
        updated_by = OwnerAbstract._meta.get_field("updated_by")

        self.assertIsInstance(created_by, models.UUIDField)
        self.assertTrue(created_by.null)
        self.assertTrue(created_by.blank)
        self.assertFalse(created_by.editable)

        self.assertIsInstance(updated_by, models.UUIDField)
        self.assertTrue(updated_by.null)
        self.assertTrue(updated_by.blank)

    def test_history_is_inherited_by_concrete_models(self) -> None:
        history = ModelMixinTestModel.history

        self.assertTrue(hasattr(history, "all"))
        self.assertTrue(hasattr(history, "filter"))

    def test_creator_returns_none_without_creator(self) -> None:
        instance = ModelMixinTestModel()

        self.assertIsNone(instance.creator)

    def test_editor_returns_none_without_editor(self) -> None:
        instance = ModelMixinTestModel()

        self.assertIsNone(instance.editor)

    @staticmethod
    def test_save_calls_full_clean_before_parent_save() -> None:
        instance = ModelMixinTestModel()
        instance.full_clean = Mock()

        with patch.object(models.Model, "save") as parent_save:
            instance.save()

        instance.full_clean.assert_called_once_with()
        parent_save.assert_called_once_with()
