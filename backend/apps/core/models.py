from __future__ import annotations

import uuid
from typing import Optional

from django.contrib.auth import get_user_model
from django.db import models
from django.utils.functional import cached_property
from simple_history.models import HistoricalRecords


class TimeStampable(models.Model):
    """
    This provides creation and update timestamps to inherited models
    """

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OwnerlessAbstract(TimeStampable):
    """
    The base model for models that do not require ownership
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True
        ordering = ("-updated_at", "-created_at")


class OwnerAbstract(OwnerlessAbstract):
    """
    The base model for models that track creator and editor information
    """

    created_by = models.UUIDField(
        null=True,
        blank=True,
        editable=False,
    )
    updated_by = models.UUIDField(
        null=True,
        blank=True,
    )

    history = HistoricalRecords(inherit=True)

    @cached_property
    def creator(self) -> Optional[models.Model]:
        """
        Return the user who created this object, when available
        """
        if not self.created_by:
            return None

        user_model = get_user_model()

        try:
            return user_model.objects.get(id=self.created_by)
        except user_model.DoesNotExist:
            return None

    @property
    def editor(self) -> Optional[models.Model]:
        """
        Return the user who last edited this object, when available
        """
        if not self.updated_by:
            return None

        user_model = get_user_model()

        try:
            return user_model.objects.get(id=self.updated_by)
        except user_model.DoesNotExist:
            return None

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        """
        Validate the model before saving it
        """
        self.full_clean()
        return super().save(*args, **kwargs)
