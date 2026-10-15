"""Audit URL configuration."""

from django.urls import path

from apps.audit import views

app_name = "audit"

urlpatterns = [
    path("", views.audit_event_list_view, name="audit-list"),
]
