"""HTTP JSON API views for account authentication."""

from __future__ import annotations

import json
from typing import Any

from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from apps.accounts.models import UserAccount, UserRole


def _parse_json_body(request: HttpRequest) -> dict[str, Any]:
    if not request.body:
        return {}
    try:
        data = json.loads(request.body.decode("utf-8"))
        if not isinstance(data, dict):
            return {}
        return data
    except json.JSONDecodeError, UnicodeDecodeError:
        return {}


def user_to_dict(user: UserAccount) -> dict[str, Any]:
    """Serialize a UserAccount instance into a JSON dictionary for the frontend."""
    role_map = {
        UserRole.EMPLOYEE: "EMPLOYEE",
        UserRole.MANAGER: "MANAGER",
        UserRole.FINANCE_OFFICER: "FINANCE",
        UserRole.ADMINISTRATOR: "ADMIN",
    }
    frontend_role = role_map.get(user.role, "EMPLOYEE")
    name = f"{user.first_name} {user.last_name}".strip() or user.username
    return {
        "id": str(user.id),
        "username": user.username,
        "name": name,
        "email": user.email,
        "role": frontend_role,
        "backendRole": user.role,
        "isActive": user.is_active,
    }


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request: HttpRequest) -> JsonResponse:
    """Authenticate user with username or email and establish a session."""
    data = _parse_json_body(request)
    username = data.get("username") or data.get("email") or ""
    password = data.get("password") or ""

    if not username or not password:
        return JsonResponse(
            {"detail": "Both username/email and password are required."},
            status=400,
        )

    # Try authenticating directly with the given username
    user = authenticate(request, username=username, password=password)

    # If that fails and it looks like an email address, lookup username by email
    if not user and "@" in username:
        try:
            account = UserAccount.objects.filter(email__iexact=username).first()
            if account:
                user = authenticate(
                    request, username=account.username, password=password
                )
        except Exception:
            user = None

    if user is None:
        return JsonResponse(
            {
                "detail": (
                    "Invalid credentials. Please verify your "
                    "username/email and password."
                )
            },
            status=401,
        )

    if not user.is_active:
        return JsonResponse(
            {"detail": "This account is inactive. Please contact an administrator."},
            status=403,
        )

    login(request, user)
    return JsonResponse({"user": user_to_dict(user)}, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request: HttpRequest) -> JsonResponse:
    """Terminate the active user session."""
    logout(request)
    return JsonResponse({"ok": True}, status=200)


@require_http_methods(["GET"])
def me_view(request: HttpRequest) -> JsonResponse:
    """Return the profile of the currently authenticated user."""
    if not request.user.is_authenticated:
        return JsonResponse(
            {"detail": "Authentication credentials were not provided."},
            status=401,
        )
    return JsonResponse(user_to_dict(request.user), status=200)
