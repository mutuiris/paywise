"""Reporting URL configuration."""

from django.urls import path

from apps.reporting import views

app_name = "reporting"

urlpatterns = [
    path("summary/", views.activity_summary_view, name="activity-summary"),
    path("failed/", views.failed_payments_view, name="failed-payments"),
    path(
        "by-project/",
        views.projects_breakdown_view,
        name="projects-breakdown",
    ),
]
