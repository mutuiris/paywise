"""Application services for vendor and project lifecycle management."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

from django.core.exceptions import ValidationError

from apps.vendors.models import Project, Vendor
from apps.vendors.permissions import (
    check_can_manage_projects,
    check_can_manage_vendors,
)

if TYPE_CHECKING:
    from apps.accounts.models import UserAccount


def create_vendor(
    *,
    name: str,
    service_category: str = "",
    email: str = "",
    phone_number: str = "",
    payment_details: dict[str, Any] | None = None,
    description: str = "",
    actor: UserAccount | None = None,
) -> Vendor:
    """Create a new vendor and enforce finance/admin management permissions."""
    if actor is not None:
        check_can_manage_vendors(actor)

    vendor = Vendor(
        name=name,
        service_category=service_category,
        email=email,
        phone_number=phone_number,
        payment_details=payment_details if payment_details is not None else {},
        description=description,
        created_by=getattr(actor, "id", None),
        updated_by=getattr(actor, "id", None),
    )
    vendor.save()
    return vendor


def update_vendor(
    vendor: Vendor,
    *,
    actor: UserAccount | None = None,
    **fields: Any,
) -> Vendor:
    """Update vendor fields and record the modifying actor."""
    if actor is not None:
        check_can_manage_vendors(actor)

    allowed_fields = {
        "name",
        "service_category",
        "email",
        "phone_number",
        "payment_details",
        "description",
    }
    for field, value in fields.items():
        if field in allowed_fields:
            setattr(vendor, field, value)

    if actor is not None:
        vendor.updated_by = actor.id

    vendor.save()
    return vendor


def deactivate_vendor(
    vendor: Vendor,
    *,
    actor: UserAccount | None = None,
) -> Vendor:
    """Deactivate a vendor, preventing new payment request references."""
    if actor is not None:
        check_can_manage_vendors(actor)

    vendor.is_active = False
    if actor is not None:
        vendor.updated_by = actor.id

    vendor.save()
    return vendor


def activate_vendor(
    vendor: Vendor,
    *,
    actor: UserAccount | None = None,
) -> Vendor:
    """Reactivate a previously deactivated vendor."""
    if actor is not None:
        check_can_manage_vendors(actor)

    vendor.is_active = True
    if actor is not None:
        vendor.updated_by = actor.id

    vendor.save()
    return vendor


def create_project(
    *,
    name: str,
    code: str | None = None,
    department: str = "",
    description: str = "",
    actor: UserAccount | None = None,
) -> Project:
    """Create a new project with normalized code and manager/admin gating."""
    if actor is not None:
        check_can_manage_projects(actor)

    normalized_code = code.strip() if code and code.strip() else None

    project = Project(
        name=name,
        code=normalized_code,
        department=department,
        description=description,
        created_by=getattr(actor, "id", None),
        updated_by=getattr(actor, "id", None),
    )
    project.save()
    return project


def update_project(
    project: Project,
    *,
    actor: UserAccount | None = None,
    **fields: Any,
) -> Project:
    """Update project fields and record the modifying actor."""
    if actor is not None:
        check_can_manage_projects(actor)

    allowed_fields = {"name", "code", "department", "description"}
    for field, value in fields.items():
        if field in allowed_fields:
            if field == "code" and isinstance(value, str):
                value = value.strip() or None
            setattr(project, field, value)

    if actor is not None:
        project.updated_by = actor.id

    project.save()
    return project


def deactivate_project(
    project: Project,
    *,
    actor: UserAccount | None = None,
) -> Project:
    """Deactivate a project, preventing new payment request references."""
    if actor is not None:
        check_can_manage_projects(actor)

    project.is_active = False
    if actor is not None:
        project.updated_by = actor.id

    project.save()
    return project


def activate_project(
    project: Project,
    *,
    actor: UserAccount | None = None,
) -> Project:
    """Reactivate a previously deactivated project."""
    if actor is not None:
        check_can_manage_projects(actor)

    project.is_active = True
    if actor is not None:
        project.updated_by = actor.id

    project.save()
    return project


def validate_vendor_for_payment(vendor: Vendor) -> None:
    """Verify that the referenced vendor is active for payment requests."""
    if not vendor.is_active:
        raise ValidationError("Cannot reference an inactive vendor for payment.")


def validate_project_for_payment(project: Project | None) -> None:
    """Verify that the referenced project is active if specified."""
    if project is not None and not project.is_active:
        raise ValidationError("Cannot reference an inactive project for payment.")
