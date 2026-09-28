from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    CurrentUserView,
    UserProfileUpdateView,
    UserListAdminView,
    VerifyOTPView,
    ResendOTPView,
    LoginView,
    LoginOTPVerifyView,
    InterestListView,
)


app_name = "accounts"


urlpatterns = [
    # Registration
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # Registration OTP
    path(
        "verify-otp/",
        VerifyOTPView.as_view(),
        name="verify_otp",
    ),

    path(
        "resend-otp/",
        ResendOTPView.as_view(),
        name="resend_otp",
    ),

    # Login
    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    # Login OTP
    path(
        "login/verify-otp/",
        LoginOTPVerifyView.as_view(),
        name="login_verify_otp",
    ),

    # JWT refresh
    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # Current user
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current_user",
    ),

    # Profile
    path(
        "profile/",
        UserProfileUpdateView.as_view(),
        name="user_profile",
    ),

    # Interests
    path(
        "interests/",
        InterestListView.as_view(),
        name="interests",
    ),

    # Admin users
    path(
        "admin/users/",
        UserListAdminView.as_view(),
        name="admin_user_list",
    ),
]