"""Accounts URL configuration."""

from django.urls import URLPattern, path

from apps.accounts import views

app_name = "accounts"

urlpatterns: list[URLPattern] = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me_view, name="me"),
    path("csrf/", views.csrf_token_view, name="csrf-token"),
    path("users/", views.user_list_create_view, name="user-list-create"),
    path("users/<uuid:user_id>/", views.user_update_view, name="user-update"),
]
