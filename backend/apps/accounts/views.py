"""Authentication and identity JSON API views.

Provides login, logout and current-user endpoints using Django's
session-based authentication. CSRF protection is enforced for
state-changing operations when using session cookies.
"""

from __future__ import annotations

import json
import logging
from typing import Any

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods

from apps.accounts.models import UserAccount, UserRole

logger = logging.getLogger("paywise.accounts")


def _user_to_dict(user: Any) -> dict[str, Any]:
    """Serialise safe user fields — never expose password or hash."""
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "department": user.department,
        "is_active": user.is_active,
        "date_joined": user.date_joined.isoformat(),
    }


@require_http_methods(["POST"])
def login_view(request: HttpRequest) -> JsonResponse:
    """Authenticate a user with username (or unique email) and password.

    POST /api/accounts/login/
    Body: {"username": "...", "password": "..."}

    On success, sets the session cookie and returns user details.
    Requires the CSRF token to be provided via the X-CSRFToken header
    or as a cookie (Django's standard CSRF flow).

    Status Codes:
        200 OK — authenticated successfully.
        400 Bad Request — missing or malformed payload.
        401 Unauthorized — invalid credentials or inactive user.
    """
    try:
        body = json.loads(request.body.decode("utf-8"))
        if not isinstance(body, dict):
            return JsonResponse(
                {"error": "Request body must be a JSON object."}, status=400
            )
    except json.JSONDecodeError, UnicodeDecodeError:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    username = body.get("username", "").strip()
    password = body.get("password", "")

    if not username or not password:
        return JsonResponse(
            {"error": "Both username and password are required."}, status=400
        )

    if "@" in username:
        # The sign-in form accepts a work email; resolve it only when unambiguous.
        matches = list(
            UserAccount.objects.filter(email__iexact=username).values_list(
                "username", flat=True
            )[:2]
        )
        if len(matches) == 1:
            username = matches[0]

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({"error": "Invalid credentials."}, status=401)

    if not user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    login(request, user)
    return JsonResponse({"user": _user_to_dict(user)}, status=200)


@require_http_methods(["POST"])
def logout_view(request: HttpRequest) -> JsonResponse:
    """Log out the current user and flush the session.

    POST /api/accounts/logout/

    Status Codes:
        200 OK — logged out (even if not currently authenticated).
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated."}, status=401)
    logout(request)
    return JsonResponse({"detail": "Logged out successfully."}, status=200)


@require_http_methods(["GET"])
def me_view(request: HttpRequest) -> JsonResponse:
    """Return the currently authenticated user's details.

    GET /api/accounts/me/

    Status Codes:
        200 OK — returns user details.
        401 Unauthorized — not authenticated.
    """
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required."}, status=401)

    if not request.user.is_active:
        return JsonResponse({"error": "Account is inactive."}, status=401)

    return JsonResponse({"user": _user_to_dict(request.user)}, status=200)


@require_http_methods(["GET"])
def csrf_token_view(request: HttpRequest) -> JsonResponse:
    """Return a CSRF token for SPA clients.

    GET /api/accounts/csrf/

    The token is also set as a cookie by Django's CSRF middleware.
    SPA clients should call this endpoint on initial load and include
    the token in the X-CSRFToken header for subsequent POST/PUT/PATCH
    requests.

    Status Codes:
        200 OK — returns the CSRF token.
    """
    token = get_token(request)
    return JsonResponse({"csrfToken": token}, status=200)


def _admin_or_error(request: HttpRequest) -> JsonResponse | None:
    user = request.user
    if not user.is_authenticated or not user.is_active:
        return JsonResponse({"error": "Authentication required."}, status=401)
    if not (user.is_superuser or user.role == UserRole.ADMINISTRATOR):
        return JsonResponse(
            {"error": "Only Administrators can manage users."}, status=403
        )
    return None


def _json_body(request: HttpRequest) -> dict[str, Any] | None:
    try:
        body = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError, UnicodeDecodeError:
        return None
    return body if isinstance(body, dict) else None


@require_http_methods(["GET", "POST"])
def user_list_create_view(request: HttpRequest) -> JsonResponse:
    """List all users (GET) or create one (POST). Administrators only.

    POST body: {"email", "password", "role", "first_name"?, "last_name"?,
    "department"?}. The email doubles as the username.
    """
    if error := _admin_or_error(request):
        return error

    if request.method == "GET":
        users = [_user_to_dict(u) for u in UserAccount.objects.all()]
        return JsonResponse({"results": users, "count": len(users)}, status=200)

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    email = str(body.get("email", "")).strip().lower()
    password = str(body.get("password", ""))
    role = body.get("role", UserRole.EMPLOYEE)
    if not email or "@" not in email:
        return JsonResponse(
            {"error": {"email": ["A valid email is required."]}}, status=400
        )
    if role not in UserRole.values:
        return JsonResponse({"error": {"role": ["Unknown role."]}}, status=400)
    if UserAccount.objects.filter(username__iexact=email).exists() or (
        UserAccount.objects.filter(email__iexact=email).exists()
    ):
        return JsonResponse(
            {"error": {"email": ["A user with this email already exists."]}},
            status=409,
        )

    user = UserAccount(
        username=email,
        email=email,
        first_name=str(body.get("first_name", "")).strip()[:150],
        last_name=str(body.get("last_name", "")).strip()[:150],
        department=str(body.get("department", "")).strip()[:100],
        role=role,
    )
    try:
        validate_password(password, user)
    except ValidationError as exc:
        return JsonResponse({"error": {"password": exc.messages}}, status=400)
    user.set_password(password)
    user.save()
    logger.info("User %s created with role %s by %s", user.id, role, request.user.id)
    return JsonResponse({"user": _user_to_dict(user)}, status=201)


@require_http_methods(["PATCH"])
def user_update_view(request: HttpRequest, user_id: Any) -> JsonResponse:
    """Change a user's role, department, or active flag. Administrators only."""
    if error := _admin_or_error(request):
        return error

    body = _json_body(request)
    if body is None:
        return JsonResponse({"error": "Invalid JSON payload."}, status=400)

    user = UserAccount.objects.filter(id=user_id).first()
    if user is None:
        return JsonResponse({"error": "User not found."}, status=404)

    if "role" in body:
        if body["role"] not in UserRole.values:
            return JsonResponse({"error": {"role": ["Unknown role."]}}, status=400)
        user.role = body["role"]
    if "department" in body:
        user.department = str(body["department"]).strip()[:100]
    if "is_active" in body:
        user.is_active = bool(body["is_active"])

    # Guard against an administrator locking themselves out.
    if user.id == request.user.id and (
        not user.is_active or user.role != UserRole.ADMINISTRATOR
    ):
        return JsonResponse(
            {"error": "You cannot deactivate or demote your own account."},
            status=400,
        )

    user.save()
    logger.info("User %s updated by %s: %s", user.id, request.user.id, sorted(body))
    return JsonResponse({"user": _user_to_dict(user)}, status=200)
