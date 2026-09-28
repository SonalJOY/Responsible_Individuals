import re

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, UserProfile, Interest, OTP
from .utils import send_email_otp, send_phone_otp, find_user_by_identifier


PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")


# ============================================================
# INTEREST SERIALIZER
# ============================================================

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ("id", "name", "slug")
        read_only_fields = ("id", "slug")


# ============================================================
# USER PROFILE SERIALIZER
# ============================================================

class UserProfileSerializer(serializers.ModelSerializer):
    interests = InterestSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = (
            "organization",
            "designation",
            "address",
            "city",
            "state",
            "country",
            "postal_code",
            "bio",
            "linkedin_url",
            "preferences",
            "interests",
        )


# ============================================================
# USER SERIALIZER
# ============================================================

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)

    full_name = serializers.CharField(
        source="get_full_name",
        read_only=True
    )

    interests = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "role",
            "avatar",
            "is_verified",
            "is_staff",
            "is_admin_or_staff",
            "profile",
            "interests",
            "created_at",
        )

        read_only_fields = (
            "id",
            "created_at",
            "is_staff",
            "is_admin_or_staff",
        )

    def get_interests(self, obj):
        if hasattr(obj, "profile"):
            return list(
                obj.profile.interests.values_list(
                    "name",
                    flat=True
                )
            )

        return []


# ============================================================
# JWT LOGIN SERIALIZER
# ============================================================

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["email"] = user.email
        token["role"] = user.role
        token["name"] = user.get_full_name()
        token["is_admin"] = user.is_admin_or_staff

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data["user"] = UserSerializer(self.user).data

        return data


# ============================================================
# REGISTRATION SERIALIZER
# ============================================================

class RegisterSerializer(serializers.Serializer):

    name = serializers.CharField(
        max_length=150
    )

    email = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Email address"
    )

    phone = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=25,
        help_text="Phone number"
    )

    identifier = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Legacy identifier (email or phone)"
    )

    password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    interests = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )

    def validate(self, attrs):
        email = (attrs.get("email") or "").strip()
        phone = (attrs.get("phone") or "").strip()
        identifier = (attrs.get("identifier") or "").strip()

        # If email not provided directly, try identifier
        if not email and identifier and "@" in identifier:
            email = identifier

        # If phone not provided directly, try identifier
        if not phone and identifier and not ("@" in identifier):
            phone = identifier

        if not email and not phone:
            raise serializers.ValidationError(
                {"email": "Please provide an email address or phone number."}
            )

        if email:
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                raise serializers.ValidationError(
                    {"email": "Please enter a valid email address (e.g. name@example.com)."}
                )
            if User.objects.filter(email__iexact=email).exists():
                raise serializers.ValidationError(
                    {"email": "An account with this email already exists."}
                )

        if phone:
            val = phone.strip()
            if any(c.isalpha() for c in val):
                raise serializers.ValidationError(
                    {"phone": "Phone number cannot contain letters. Please enter a valid 10-digit number."}
                )
            if re.search(r"[^\d\s\-\(\)\+]", val):
                raise serializers.ValidationError(
                    {"phone": "Please enter a valid phone number containing digits only."}
                )

            digits = re.sub(r"\D", "", val)
            core_digits = digits
            if val.startswith("+91") and digits.startswith("91"):
                core_digits = digits[2:]
            elif len(digits) == 12 and digits.startswith("91"):
                core_digits = digits[2:]
            elif len(digits) == 11 and digits.startswith("0"):
                core_digits = digits[1:]

            if len(core_digits) > 10:
                raise serializers.ValidationError(
                    {"phone": "Phone number cannot exceed 10 digits. Please enter a valid 10-digit mobile number."}
                )
            if len(core_digits) < 10:
                raise serializers.ValidationError(
                    {"phone": "Phone number must be at least 10 digits. Please enter a valid mobile number."}
                )
            if core_digits.startswith("0"):
                raise serializers.ValidationError(
                    {"phone": "Please enter a valid 10-digit mobile number."}
                )

            clean_phone = f"+91{core_digits}" if (val.startswith("+91") or len(digits) == 10) else f"+{digits}"
            if User.objects.filter(phone=clean_phone).exists() or User.objects.filter(phone__endswith=core_digits).exists():
                raise serializers.ValidationError(
                    {"phone": "An account with this phone number already exists."}
                )
            attrs["phone"] = clean_phone

        attrs["email"] = email
        return attrs

    def create(self, validated_data):
        email = validated_data.get("email", "").strip()
        phone = validated_data.get("phone", "").strip() or None

        # Split full name into first and last name
        name_parts = (
            validated_data["name"]
            .strip()
            .split(" ", 1)
        )

        first_name = name_parts[0]
        last_name = (
            name_parts[1]
            if len(name_parts) > 1
            else ""
        )

        # ----------------------------------------------------
        # Account email and username setup
        # ----------------------------------------------------
        if email:
            user_email = email
            username = email
        else:
            user_email = f"{phone.replace('+', '')}@phone.local"
            username = f"user_{phone.replace('+', '')}"

        # ----------------------------------------------------
        # Create user
        # ----------------------------------------------------
        user = User.objects.create_user(
            email=user_email,
            password=validated_data["password"],
            username=username,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=User.Role.PUBLIC,
            is_active=False,
        )

        # ----------------------------------------------------
        # Create profile
        # ----------------------------------------------------
        profile = UserProfile.objects.create(
            user=user
        )

        # ----------------------------------------------------
        # Add selected interests
        # ----------------------------------------------------
        interest_ids = validated_data.get(
            "interests",
            []
        )

        if interest_ids:
            profile.interests.set(
                Interest.objects.filter(
                    id__in=interest_ids
                )
            )

        # ----------------------------------------------------
        # Create OTP
        # ----------------------------------------------------
        otp = OTP.objects.create(
            user=user,
            purpose="email" if email else "phone"
        )

        # ----------------------------------------------------
        # Send OTP
        # ----------------------------------------------------
        if email:
            send_email_otp(
                user,
                otp.code
            )

        if phone:
            send_phone_otp(
                phone,
                otp.code
            )

        return user


# ============================================================
# VERIFY OTP
# ============================================================

class VerifyOTPSerializer(serializers.Serializer):

    identifier = serializers.CharField()

    code = serializers.CharField(
        max_length=6,
        min_length=6
    )

    def validate(self, attrs):

        identifier = attrs["identifier"].strip()
        user = find_user_by_identifier(identifier)

        if not user:
            raise serializers.ValidationError(
                "No account found for this identifier."
            )

        # Find latest unused OTP
        otp = (
            user.otps
            .filter(
                is_used=False,
                code=attrs["code"]
            )
            .order_by("-created_at")
            .first()
        )

        if not otp:

            raise serializers.ValidationError(
                "Invalid verification code."
            )

        if otp.is_expired:

            raise serializers.ValidationError(
                "This code has expired. Request a new one."
            )

        attrs["user"] = user
        attrs["otp"] = otp

        return attrs

    def save(self):

        user = self.validated_data["user"]

        otp = self.validated_data["otp"]

        # Mark OTP as used
        otp.is_used = True

        otp.save(
            update_fields=["is_used"]
        )

        # Activate account
        user.is_active = True

        user.is_verified = True

        user.save(
            update_fields=[
                "is_active",
                "is_verified",
            ]
        )

        # Also mark profile verified
        if hasattr(user, "profile"):

            user.profile.save()

        return user


# ============================================================
# RESEND OTP
# ============================================================

class ResendOTPSerializer(serializers.Serializer):

    identifier = serializers.CharField()

    def validate_identifier(self, value):

        value = value.strip()
        user = find_user_by_identifier(value)

        if not user:
            raise serializers.ValidationError(
                "No account found for this identifier."
            )

        if user.is_active:
            raise serializers.ValidationError(
                "This account is already verified."
            )

        self.user = user
        self.is_email = "@" in value or (bool(user.email) and not user.email.endswith("@phone.local"))

        return value

    def save(self):

        otp = OTP.objects.create(
            user=self.user,
            purpose=(
                "email"
                if self.is_email
                else "phone"
            )
        )

        if self.is_email:

            send_email_otp(
                self.user,
                otp.code
            )

        else:

            send_phone_otp(
                self.validated_data["identifier"],
                otp.code
            )

        return otp


# ============================================================
# LOGIN SERIALIZER
# ============================================================

class LoginSerializer(serializers.Serializer):

    identifier = serializers.CharField()

    password = serializers.CharField(
        write_only=True
    )

    def validate_identifier(self, value):
        val = value.strip()
        if not val:
            raise serializers.ValidationError("Please enter your email address or phone number.")

        if "@" in val:
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", val):
                raise serializers.ValidationError("Please enter a valid email address.")
            return val

        if any(c.isalpha() for c in val):
            raise serializers.ValidationError("Please enter a valid email address or 10-digit phone number.")

        if re.search(r"[^\d\s\-\(\)\+]", val):
            raise serializers.ValidationError("Please enter a valid phone number containing digits only.")

        digits = re.sub(r"\D", "", val)
        core_digits = digits
        if val.startswith("+91") and digits.startswith("91"):
            core_digits = digits[2:]
        elif len(digits) == 12 and digits.startswith("91"):
            core_digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            core_digits = digits[1:]

        if len(core_digits) > 10:
            raise serializers.ValidationError("Phone number cannot exceed 10 digits. Please enter a valid 10-digit mobile number.")
        if len(core_digits) < 10:
            raise serializers.ValidationError("Phone number must be at least 10 digits. Please enter a valid mobile number.")
        if core_digits.startswith("0"):
            raise serializers.ValidationError("Please enter a valid 10-digit mobile number.")

        return val
# ============================================================
# LOGIN OTP SERIALIZER
# ============================================================

class LoginOTPSerializer(serializers.Serializer):

    identifier = serializers.CharField()

    code = serializers.CharField(
        max_length=6,
        min_length=6
    )

    def validate(self, attrs):

        identifier = attrs["identifier"].strip()
        user = find_user_by_identifier(identifier)

        if not user:
            raise serializers.ValidationError(
                "No account found for this identifier."
            )

        # Find latest unused LOGIN OTP

        otp = (
            user.otps
            .filter(
                purpose="login",
                is_used=False,
                code=attrs["code"]
            )
            .order_by("-created_at")
            .first()
        )

        if not otp:

            raise serializers.ValidationError(
                "Invalid login verification code."
            )

        if otp.is_expired:

            raise serializers.ValidationError(
                "This login code has expired. Please log in again."
            )

        attrs["user"] = user
        attrs["otp"] = otp

        return attrs

    def save(self):

        user = self.validated_data["user"]

        otp = self.validated_data["otp"]

        # Mark login OTP as used

        otp.is_used = True

        otp.save(
            update_fields=["is_used"]
        )

        return user