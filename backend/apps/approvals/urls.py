"""URL configuration for the approvals domain API endpoints."""

from django.urls import path

from apps.approvals import views

app_name = "approvals"

urlpatterns = [
    path("queue/", views.approval_queue_view, name="approval-queue"),
    path(
        "<uuid:payment_request_id>/",
        views.payment_approval_detail_view,
        name="approval-detail",
    ),
    path(
        "<uuid:payment_request_id>/decide/",
        views.record_approval_decision_view,
        name="approval-decide",
    ),
    path(
        "<uuid:payment_request_id>/approve/",
        views.approve_payment_request_view,
        name="approval-approve",
    ),
    path(
        "<uuid:payment_request_id>/reject/",
        views.reject_payment_request_view,
        name="approval-reject",
    ),
    path(
        "<uuid:payment_request_id>/update-amount/",
        views.update_payment_request_amount_view,
        name="approval-update-amount",
    ),
]
