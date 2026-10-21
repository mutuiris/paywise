"""Payments URL configuration."""

from django.urls import path

from apps.payments import views

app_name = "payments"

urlpatterns = [
    path("", views.payment_request_list_view, name="payment-request-list"),
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
]
