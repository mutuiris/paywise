"""Authentication and identity JSON API views.

Provides login, logout and current-user endpoints using Django's
session-based authentication. CSRF protection is enforced for
state-changing operations when using session cookies.
"""

from __future__ import annotations

import json
from typing import Any

from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods


def _user_to_dict(user: Any) -> dict[str, Any]:
    """Serialise safe user fields — never expose password or hash."""
    return {
        "id": str(user.id),
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
        "is_active": user.is_active,
    }


@require_http_methods(["POST"])
def login_view(request: HttpRequest) -> JsonResponse:
    """Authenticate a user with username and password.

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
