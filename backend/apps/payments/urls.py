"""Payments URL configuration."""

from django.urls import URLPattern, path

from apps.payments import views

app_name = "payments"

urlpatterns: list[URLPattern] = [
    path("", views.payment_request_list_view, name="payment-request-list"),
    path("", views.payment_request_list_view, name="list-create"),
    path(
        "search/",
        views.payment_request_list_view,
        name="payment-request-search",
    ),
    path(
        "<uuid:pk>/",
        views.payment_request_detail_view,
        name="payment-request-detail",
    ),
    path(
        "<uuid:payment_id>/",
        views.payment_request_detail_view,
        name="detail-update",
    ),
    path(
        "<uuid:payment_id>/submit/",
        views.payment_request_submit_view,
        name="submit",
    ),
    path(
        "<uuid:payment_id>/process/",
        views.payment_request_process_view,
        name="process",
    ),
    path(
        "attempts/<uuid:attempt_id>/reconcile/",
        views.payment_attempt_reconcile_view,
        name="reconcile",
    ),
]
