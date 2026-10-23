from __future__ import annotations

from django.urls import URLPattern, path

from apps.vendors import views

app_name = "vendors"

urlpatterns: list[URLPattern] = [
    path("", views.vendor_list_create_view, name="vendor-list-create"),
    path(
        "<uuid:vendor_id>/",
        views.vendor_detail_update_view,
        name="vendor-detail-update",
    ),
    path(
        "<uuid:vendor_id>/toggle-active/",
        views.vendor_toggle_active_view,
        name="vendor-toggle-active",
    ),
    path("projects/", views.project_list_create_view, name="project-list-create"),
    path(
        "projects/<uuid:project_id>/",
        views.project_detail_update_view,
        name="project-detail-update",
    ),
    path(
        "projects/<uuid:project_id>/toggle-active/",
        views.project_toggle_active_view,
        name="project-toggle-active",
    ),
]
