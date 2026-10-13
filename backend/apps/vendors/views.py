"""HTTP JSON API views for vendor and project management."""

from __future__ import annotations

import json
import uuid
from typing import Any

from django.core.exceptions import PermissionDenied, ValidationError
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.vendors import services
from apps.vendors.models import Project, Vendor
from apps.vendors.permissions import (
    can_manage_projects,
    can_manage_vendors,
    can_view_projects,
    can_view_vendors,
)


def _parse_json_body(request: HttpRequest) -> dict[str, Any]:
    """Parse and validate JSON payload from HTTP request body."""
    if not request.body:
        return {}
    try:
        data = json.loads(request.body.decode("utf-8"))
        if not isinstance(data, dict):
            raise ValidationError("JSON body must be an object.")
        return data
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise ValidationError(f"Invalid JSON payload: {exc}") from exc


def vendor_to_dict(vendor: Vendor) -> dict[str, Any]:
    """Serialize a Vendor model instance into a JSON-compatible dictionary."""
    return {
        "id": str(vendor.id),
        "name": vendor.name,
        "service_category": vendor.service_category,
        "email": vendor.email,
        "phone_number": vendor.phone_number,
        "payment_details": vendor.payment_details,
        "description": vendor.description,
        "is_active": vendor.is_active,
        "created_at": vendor.created_at.isoformat() if vendor.created_at else None,
        "updated_at": vendor.updated_at.isoformat() if vendor.updated_at else None,
        "created_by": str(vendor.created_by) if vendor.created_by else None,
        "updated_by": str(vendor.updated_by) if vendor.updated_by else None,
    }


def project_to_dict(project: Project) -> dict[str, Any]:
    """Serialize a Project model instance into a JSON-compatible dictionary."""
    return {
        "id": str(project.id),
        "name": project.name,
        "code": project.code,
        "department": project.department,
        "description": project.description,
        "is_active": project.is_active,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
        "created_by": str(project.created_by) if project.created_by else None,
        "updated_by": str(project.updated_by) if project.updated_by else None,
    }


@csrf_exempt
@require_http_methods(["GET", "POST"])
def vendor_list_create_view(request: HttpRequest) -> JsonResponse:
    """List active vendors (GET) or create a new vendor (POST).

    Methods:
        GET: Returns a list of vendors.
            Query Parameters:
                include_inactive (bool): If true, includes inactive vendors.
                search (str): Substring search filter on vendor name.
                category (str): Exact category match filter.
            Permissions:
                Active authenticated users of any role.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden.

        POST: Creates a new vendor.
            Payload:
                name (str, required): Unique vendor name.
                service_category (str, optional): Category description.
                email (str, optional): Normalized contact email.
                phone_number (str, optional): Contact telephone.
                payment_details (dict, optional): Bank/M-Pesa details.
                description (str, optional): Additional vendor notes.
            Permissions:
                Finance Officers and Administrators.
            Status Codes:
                201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden.
    """
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        if not can_view_vendors(request.user):
            return JsonResponse({"error": "Permission denied."}, status=403)

        queryset = Vendor.objects.all()
        include_inactive = request.GET.get("include_inactive", "").lower() in (
            "true",
            "1",
        )
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        search = request.GET.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)

        category = request.GET.get("category", "").strip()
        if category:
            queryset = queryset.filter(service_category__iexact=category)

        data = [vendor_to_dict(v) for v in queryset]
        return JsonResponse({"vendors": data}, status=200)

    # POST - Create vendor
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_vendors(request.user):
        return JsonResponse(
            {"error": "Only Finance Officers and Administrators can manage vendors."},
            status=403,
        )

    try:
        payload = _parse_json_body(request)
        name = payload.get("name", "")
        vendor = services.create_vendor(
            name=name,
            service_category=payload.get("service_category", ""),
            email=payload.get("email", ""),
            phone_number=payload.get("phone_number", ""),
            payment_details=payload.get("payment_details"),
            description=payload.get("description", ""),
            actor=request.user,
        )
        return JsonResponse({"vendor": vendor_to_dict(vendor)}, status=201)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        return JsonResponse({"error": message}, status=400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH"])
def vendor_detail_update_view(
    request: HttpRequest, vendor_id: uuid.UUID
) -> JsonResponse:
    """Retrieve (GET) or update (PUT/PATCH) an individual vendor by UUID.

    Methods:
        GET: Retrieves vendor details.
            Permissions:
                Active authenticated users of any role.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found.

        PUT / PATCH: Updates editable vendor fields.
            Payload:
                Subset of {name, service_category, email, phone_number,
                payment_details, description}.
            Permissions:
                Finance Officers and Administrators.
            Status Codes:
                200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden,
                404 Not Found.
    """
    vendor = Vendor.objects.filter(id=vendor_id).first()
    if vendor is None:
        return JsonResponse({"error": "Vendor not found."}, status=404)

    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        if not can_view_vendors(request.user):
            return JsonResponse({"error": "Permission denied."}, status=403)
        return JsonResponse({"vendor": vendor_to_dict(vendor)}, status=200)

    # PUT or PATCH
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_vendors(request.user):
        return JsonResponse(
            {"error": "Only Finance Officers and Administrators can manage vendors."},
            status=403,
        )

    try:
        payload = _parse_json_body(request)
        vendor = services.update_vendor(vendor, actor=request.user, **payload)
        return JsonResponse({"vendor": vendor_to_dict(vendor)}, status=200)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        return JsonResponse({"error": message}, status=400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["POST"])
def vendor_toggle_active_view(
    request: HttpRequest, vendor_id: uuid.UUID
) -> JsonResponse:
    """Activate or deactivate a vendor by UUID.

    Methods:
        POST: Toggles or explicitly sets active status.
            Payload:
                is_active (bool, optional): Desired target active state.
            Permissions:
                Finance Officers and Administrators.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_vendors(request.user):
        return JsonResponse(
            {"error": "Only Finance Officers and Administrators can manage vendors."},
            status=403,
        )

    vendor = Vendor.objects.filter(id=vendor_id).first()
    if vendor is None:
        return JsonResponse({"error": "Vendor not found."}, status=404)

    try:
        payload = _parse_json_body(request)
        desired_state = payload.get("is_active")
        if desired_state is False or (desired_state is None and vendor.is_active):
            vendor = services.deactivate_vendor(vendor, actor=request.user)
        else:
            vendor = services.activate_vendor(vendor, actor=request.user)
        return JsonResponse({"vendor": vendor_to_dict(vendor)}, status=200)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def project_list_create_view(request: HttpRequest) -> JsonResponse:
    """List active projects (GET) or create a new project (POST).

    Methods:
        GET: Returns a list of projects.
            Query Parameters:
                include_inactive (bool): If true, includes inactive projects.
                search (str): Substring search filter on project name.
                department (str): Exact department match filter.
            Permissions:
                Active authenticated users of any role.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden.

        POST: Creates a new project.
            Payload:
                name (str, required): Unique project name.
                code (str, optional): Normalized unique code or None.
                department (str, optional): Department designation.
                description (str, optional): Additional project notes.
            Permissions:
                Managers and Administrators.
            Status Codes:
                201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden.
    """
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        if not can_view_projects(request.user):
            return JsonResponse({"error": "Permission denied."}, status=403)

        queryset = Project.objects.all()
        include_inactive = request.GET.get("include_inactive", "").lower() in (
            "true",
            "1",
        )
        if not include_inactive:
            queryset = queryset.filter(is_active=True)

        search = request.GET.get("search", "").strip()
        if search:
            queryset = queryset.filter(name__icontains=search)

        department = request.GET.get("department", "").strip()
        if department:
            queryset = queryset.filter(department__iexact=department)

        data = [project_to_dict(p) for p in queryset]
        return JsonResponse({"projects": data}, status=200)

    # POST - Create project
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_projects(request.user):
        return JsonResponse(
            {"error": "Only Managers and Administrators can manage projects."},
            status=403,
        )

    try:
        payload = _parse_json_body(request)
        name = payload.get("name", "")
        project = services.create_project(
            name=name,
            code=payload.get("code"),
            department=payload.get("department", ""),
            description=payload.get("description", ""),
            actor=request.user,
        )
        return JsonResponse({"project": project_to_dict(project)}, status=201)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        return JsonResponse({"error": message}, status=400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["GET", "PUT", "PATCH"])
def project_detail_update_view(
    request: HttpRequest, project_id: uuid.UUID
) -> JsonResponse:
    """Retrieve (GET) or update (PUT/PATCH) an individual project by UUID.

    Methods:
        GET: Retrieves project details.
            Permissions:
                Active authenticated users of any role.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found.

        PUT / PATCH: Updates editable project fields.
            Payload:
                Subset of {name, code, department, description}.
            Permissions:
                Managers and Administrators.
            Status Codes:
                200 OK, 400 Bad Request, 401 Unauthorized, 403 Forbidden,
                404 Not Found.
    """
    project = Project.objects.filter(id=project_id).first()
    if project is None:
        return JsonResponse({"error": "Project not found."}, status=404)

    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Authentication required."}, status=401)
        if not can_view_projects(request.user):
            return JsonResponse({"error": "Permission denied."}, status=403)
        return JsonResponse({"project": project_to_dict(project)}, status=200)

    # PUT or PATCH
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_projects(request.user):
        return JsonResponse(
            {"error": "Only Managers and Administrators can manage projects."},
            status=403,
        )

    try:
        payload = _parse_json_body(request)
        project = services.update_project(project, actor=request.user, **payload)
        return JsonResponse({"project": project_to_dict(project)}, status=200)
    except ValidationError as exc:
        message = (
            exc.message_dict
            if hasattr(exc, "message_dict")
            else exc.messages
            if hasattr(exc, "messages")
            else str(exc)
        )
        return JsonResponse({"error": message}, status=400)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)


@csrf_exempt
@require_http_methods(["POST"])
def project_toggle_active_view(
    request: HttpRequest, project_id: uuid.UUID
) -> JsonResponse:
    """Activate or deactivate a project by UUID.

    Methods:
        POST: Toggles or explicitly sets active status.
            Payload:
                is_active (bool, optional): Desired target active state.
            Permissions:
                Managers and Administrators.
            Status Codes:
                200 OK, 401 Unauthorized, 403 Forbidden, 404 Not Found.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not can_manage_projects(request.user):
        return JsonResponse(
            {"error": "Only Managers and Administrators can manage projects."},
            status=403,
        )

    project = Project.objects.filter(id=project_id).first()
    if project is None:
        return JsonResponse({"error": "Project not found."}, status=404)

    try:
        payload = _parse_json_body(request)
        desired_state = payload.get("is_active")
        if desired_state is False or (desired_state is None and project.is_active):
            project = services.deactivate_project(project, actor=request.user)
        else:
            project = services.activate_project(project, actor=request.user)
        return JsonResponse({"project": project_to_dict(project)}, status=200)
    except PermissionDenied as exc:
        return JsonResponse({"error": str(exc)}, status=403)
