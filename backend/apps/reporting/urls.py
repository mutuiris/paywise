"""Reporting URL configuration."""

from django.urls import URLPattern, path

from apps.reporting import views

app_name = "reporting"

urlpatterns: list[URLPattern] = [
    path("", views.activity_summary_view, name="summary"),
    path("summary/", views.activity_summary_view, name="activity-summary"),
    path("failed/", views.failed_payments_view, name="failed-payments"),
    path(
        "by-project/",
        views.projects_breakdown_view,
        name="projects-breakdown",
    ),
    path("projects/", views.projects_breakdown_view, name="projects"),
]
