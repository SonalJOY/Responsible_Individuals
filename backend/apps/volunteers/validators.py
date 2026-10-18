import re
from rest_framework.exceptions import ValidationError
from django.core.validators import EmailValidator

PHONE_PATTERN = re.compile(r'^[6-9]\d{9}$')
SPECIAL_CHARS_PATTERN = re.compile(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?~`]')

COMMON_WEAK_PASSWORDS = {
    'password123456!',
    'admin123456!',
    'welcome123456!',
    'qwerty123456!',
    '123456789012!',
    'volunteer123456!',
    'responsible123!',
}

SEQUENTIAL_PATTERN = re.compile(r'(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|defg)', re.IGNORECASE)
REPEATING_PATTERN = re.compile(r'(.)\1{3,}')


def validate_indian_phone(phone):
    """
    Validates that a phone number is a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.
    """
    if not phone:
        raise ValidationError('Phone number is required.')

    cleaned = str(phone).strip()

    if cleaned.startswith('+91') or cleaned.startswith('+'):
        raise ValidationError('Enter a 10-digit number without +91 or country code.')

    if any(c in cleaned for c in ' -().'):
        raise ValidationError('Enter digits only without spaces or hyphens.')

    if not cleaned.isdigit():
        raise ValidationError('Phone number cannot contain letters or symbols.')

    if len(cleaned) != 10:
        raise ValidationError('Enter a valid 10-digit Indian mobile number.')

    if not PHONE_PATTERN.match(cleaned):
        raise ValidationError('Enter a valid 10-digit Indian mobile number.')

    return cleaned


def validate_email_address(email):
    """
    Validates standard email address format, length constraints, and absence of spaces.
    Returns normalized lowercase email.
    """
    if not email:
        raise ValidationError('Email address is required.')

    raw = str(email).strip()

    if len(raw) > 254:
        raise ValidationError('Email address cannot exceed 254 characters.')

    if ' ' in raw or '\t' in raw or '\n' in raw:
        raise ValidationError('Email address cannot contain spaces.')

    if raw.count('@') != 1:
        raise ValidationError('Enter a valid email address.')

    local_part, domain_part = raw.split('@')

    if not local_part or not domain_part:
        raise ValidationError('Enter a valid email address.')

    if local_part.startswith('.') or local_part.endsWith('.') if hasattr(local_part, 'endsWith') else (local_part.startswith('.') or local_part.endswith('.')):
        raise ValidationError('Enter a valid email address.')

    if '..' in local_part or '..' in domain_part:
        raise ValidationError('Enter a valid email address.')

    if not '.' in domain_part or domain_part.startswith('.') or domain_part.endswith('.'):
        raise ValidationError('Enter a valid email address.')

    validator = EmailValidator(message='Enter a valid email address.')
    validator(raw)

    return raw.lower()


def validate_strong_password(password):
    """
    Validates that a password adheres to security hardening standards:
    - Min 12 chars, Max 128 chars
    - At least 1 uppercase (A-Z)
    - At least 1 lowercase (a-z)
    - At least 1 digit (0-9)
    - At least 1 special character
    - No spaces
    - Not in common weak patterns list
    """
    if not password:
        raise ValidationError('Password is required.')

    pwd = str(password)

    if len(pwd) < 12:
        raise ValidationError('Password must be at least 12 characters long.')

    if len(pwd) > 128:
        raise ValidationError('Password cannot exceed 128 characters.')

    if any(c.isspace() for c in pwd):
        raise ValidationError('Password cannot contain spaces.')

    if not any(c.isupper() for c in pwd):
        raise ValidationError('Password must contain at least one uppercase letter (A-Z).')

    if not any(c.islower() for c in pwd):
        raise ValidationError('Password must contain at least one lowercase letter (a-z).')

    if not any(c.isdigit() for c in pwd):
        raise ValidationError('Password must contain at least one number (0-9).')

    if not SPECIAL_CHARS_PATTERN.search(pwd):
        raise ValidationError('Password must contain at least one special character (!@#$%^&* etc.).')

    lower_pwd = pwd.lower()
    if lower_pwd in COMMON_WEAK_PASSWORDS or any(p in lower_pwd for p in ['password123', 'admin123', 'welcome123']):
        raise ValidationError('Password contains a common, easily guessable pattern. Choose a stronger password.')

    return pwd
