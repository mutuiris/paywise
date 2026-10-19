"""Accounts URL configuration."""

from django.urls import path
from apps.accounts import views

app_name = "accounts"

urlpatterns: list[path] = [
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me_view, name="me"),
]
