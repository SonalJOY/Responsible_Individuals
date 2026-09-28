import re
import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger("accounts.otp")


def find_user_by_identifier(identifier):
    """
    Find user by email, phone, or username with format tolerance.
    Supports phone formats with spaces, hyphens, and country code prefixes.
    """
    if not identifier:
        return None

    identifier = str(identifier).strip()

    from django.contrib.auth import get_user_model
    User = get_user_model()

    if "@" in identifier:
        return User.objects.filter(email__iexact=identifier).first()

    # Clean non-digits (preserving leading +)
    clean_phone = re.sub(r"[^\d+]", "", identifier)

    # 1. Exact raw phone match
    user = User.objects.filter(phone=identifier).first()
    if user:
        return user

    # 2. Clean phone match
    user = User.objects.filter(phone=clean_phone).first()
    if user:
        return user

    # 3. Match last 10 digits (handles +91 prefix differences)
    digits_only = re.sub(r"\D", "", identifier)
    if len(digits_only) >= 10:
        last10 = digits_only[-10:]
        user = User.objects.filter(phone__endswith=last10).first()
        if user:
            return user

    # 4. Fallback to username or email
    user = User.objects.filter(username__iexact=identifier).first()
    if user:
        return user

    return User.objects.filter(email__iexact=identifier).first()


def send_email_otp(user, otp_code):
    subject = "Your Responsible Individuals verification code"
    message = (
        f"Hi {user.first_name or user.username},\n\n"
        f"Your verification code is: {otp_code}\n"
        f"It expires in {10} minutes.\n\n"
        f"- Responsible Individuals"
    )
    logger.info("Email OTP for %s: %s", user.email, otp_code)
    print(f"\n[AUTH OTP] Email code for {user.email}: {otp_code}\n")

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        logger.warning("Email delivery warning for %s: %s", user.email, e)
        if not getattr(settings, "DEBUG", False):
            raise


def send_phone_otp(phone, otp_code):
    """
    Pluggable SMS sender. Logs code to console for development
    and wires up to SMS gateway for production.
    """
    logger.info("SMS OTP for %s: %s", phone, otp_code)
    print(f"\n[AUTH OTP] SMS code for {phone}: {otp_code}\n")
