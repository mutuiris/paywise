"""URL configuration for the audit trail domain endpoints."""

from django.urls import path

from apps.audit import views

app_name = "audit"

urlpatterns = [
    path("", views.audit_event_list_view, name="audit-list"),
    path(
        "entity/<str:entity_type>/<uuid:entity_id>/",
        views.entity_audit_trail_view,
        name="audit-entity-trail",
    ),
]
