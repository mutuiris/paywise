"""Approvals URL configuration."""

from django.urls import URLPattern, path

from apps.approvals import views

app_name = "approvals"

urlpatterns: list[URLPattern] = [
    path(
        "<uuid:payment_request_id>/",
        views.approval_decisions_view,
        name="decisions",
    ),
]
