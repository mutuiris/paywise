"""URL configuration for Paywise backend.

Exposes admin, operational health, and domain module API routes.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/vendors/", include("apps.vendors.urls")),
    path("api/payments/", include("apps.payments.urls")),
    path("api/approvals/", include("apps.approvals.urls")),
    path("api/audit/", include("apps.audit.urls")),
    path("api/reporting/", include("apps.reporting.urls")),
]
