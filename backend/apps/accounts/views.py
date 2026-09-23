from django.contrib.auth import get_user_model
from django.db import transaction

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserProfile, Interest
from .serializers import (
    UserSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    LoginOTPSerializer,
)
from .permissions import IsAdminUserOrStaff


def auth_payload(user):
    """
    Generate JWT tokens and user information
    after successful authentication.
    """

    refresh = RefreshToken.for_user(user)

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }


class CustomTokenObtainPairView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK,
        )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        identifier = user.email
        if user.email.endswith("@phone.local") and user.phone:
            identifier = user.phone

        return Response(
            {
                "message": (
                    "Registration successful. "
                    "Please verify your OTP."
                ),
                "identifier": identifier,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "Account verified successfully.",
                **auth_payload(user),
            },
            status=status.HTTP_200_OK,
        )


class ResendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            {
                "message": (
                    "A new verification code has "
                    "been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    """
    Step 1 of login.

    User provides email/phone + password.
    If correct, a login OTP is generated and
    sent to the registered email.

    JWT tokens are NOT created at this stage.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        identifier = (
            serializer.validated_data["identifier"]
            .strip()
        )

        password = serializer.validated_data[
            "password"
        ]

        from .utils import find_user_by_identifier, send_email_otp, send_phone_otp

        candidate = find_user_by_identifier(identifier)

        if not candidate:
            return Response(
                {
                    "detail": "Invalid credentials."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check password
        if not candidate.check_password(
            password
        ):
            return Response(
                {
                    "detail": "Invalid credentials."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Check account status
        if not candidate.is_active:
            return Response(
                {
                    "detail": (
                        "Account not verified. "
                        "Please verify your account first."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Import here to avoid unnecessary imports
        # at application startup.
        from .models import OTP

        # Invalidate old unused login OTPs
        candidate.otps.filter(
            purpose="login",
            is_used=False
        ).update(
            is_used=True
        )

        # Generate new login OTP
        otp = OTP.objects.create(
            user=candidate,
            purpose="login",
        )

        has_real_email = bool(candidate.email and not candidate.email.endswith("@phone.local"))

        # Send OTP to email
        if has_real_email:
            send_email_otp(
                candidate,
                otp.code
            )

        # Send OTP to phone
        if candidate.phone:
            send_phone_otp(
                candidate.phone,
                otp.code
            )

        # Identifier for login OTP verification
        if "@" in identifier or not candidate.phone:
            ret_identifier = candidate.email
            msg = "Login verification code sent to your registered email."
        else:
            ret_identifier = candidate.phone
            msg = "Login verification code sent to your registered phone number."

        return Response(
            {
                "message": msg,
                "identifier": ret_identifier,
            },
            status=status.HTTP_200_OK,
        )


class LoginOTPVerifyView(APIView):
    """
    Step 2 of login.

    User enters the OTP received by email.
    Only after successful OTP verification
    are JWT tokens generated.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "Login successful.",
                **auth_payload(user),
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = (
            UserProfile.objects.get_or_create(
                user=request.user
            )
        )

        serializer = UserProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        profile, created = (
            UserProfile.objects.get_or_create(
                user=request.user
            )
        )

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        profile, created = (
            UserProfile.objects.get_or_create(
                user=request.user
            )
        )

        serializer = UserProfileSerializer(
            profile,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class InterestListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        interests = Interest.objects.all().order_by(
            "name"
        )

        data = [
            {
                "id": interest.id,
                "name": interest.name,
                "slug": interest.slug,
            }
            for interest in interests
        ]

        return Response(
            data,
            status=status.HTTP_200_OK,
        )


class UserListAdminView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminUserOrStaff,
    ]

    def get(self, request):
        users = User.objects.all().order_by(
            "-created_at"
        )

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )