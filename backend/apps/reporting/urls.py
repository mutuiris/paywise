"""Reporting URL configuration."""

from django.urls import URLPattern, path

from apps.reporting import views

app_name = "reporting"

urlpatterns: list[URLPattern] = [
    path("", views.summary_report_view, name="summary"),
    path("summary/", views.summary_report_view, name="summary-explicit"),
    path("projects/", views.project_breakdown_view, name="projects"),
]
