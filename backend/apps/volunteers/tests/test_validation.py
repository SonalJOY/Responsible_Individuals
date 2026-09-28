from django.test import TestCase
from rest_framework.exceptions import ValidationError

from apps.volunteers.validators import (
    validate_indian_phone,
    validate_email_address,
    validate_strong_password,
)
from apps.volunteers.serializers import VolunteerRegistrationSerializer


class BackendValidationHardeningTests(TestCase):
    """
    Validation Hardening Unit Tests (Phase 3B - Backend)
    """

    # -------------------------------------------------------------------------
    # PHONE NUMBER VALIDATION TESTS
    # -------------------------------------------------------------------------
    def test_phone_valid_10_digits(self):
        self.assertEqual(validate_indian_phone('9110476459'), '9110476459')
        self.assertEqual(validate_indian_phone('6234567890'), '6234567890')
        self.assertEqual(validate_indian_phone('7000000000'), '7000000000')
        self.assertEqual(validate_indian_phone('8999999999'), '8999999999')

    def test_phone_rejected_less_than_10_digits(self):
        with self.assertRaises(ValidationError):
            validate_indian_phone('911047645')  # 9 digits

    def test_phone_rejected_more_than_10_digits(self):
        with self.assertRaises(ValidationError):
            validate_indian_phone('91104764591')  # 11 digits

    def test_phone_rejected_non_digits_and_letters(self):
        with self.assertRaises(ValidationError):
            validate_indian_phone('91104abcde')
        with self.assertRaises(ValidationError):
            validate_indian_phone('91104-76459')
        with self.assertRaises(ValidationError):
            validate_indian_phone('91104 76459')
        with self.assertRaises(ValidationError):
            validate_indian_phone('(91104)76459')

    def test_phone_rejected_country_code_prefix(self):
        with self.assertRaises(ValidationError):
            validate_indian_phone('+919110476459')
        with self.assertRaises(ValidationError):
            validate_indian_phone('+91 9110476459')

    def test_phone_rejected_first_digit_below_6(self):
        with self.assertRaises(ValidationError):
            validate_indian_phone('5110476459')  # starts with 5
        with self.assertRaises(ValidationError):
            validate_indian_phone('1234567890')  # starts with 1
        with self.assertRaises(ValidationError):
            validate_indian_phone('0987654321')  # starts with 0

    # -------------------------------------------------------------------------
    # EMAIL ADDRESS VALIDATION TESTS
    # -------------------------------------------------------------------------
    def test_email_valid_formats(self):
        self.assertEqual(validate_email_address('sonal.joy@gmail.com'), 'sonal.joy@gmail.com')
        self.assertEqual(validate_email_address('sonal.joy@btech.christuniversity.in'), 'sonal.joy@btech.christuniversity.in')
        self.assertEqual(validate_email_address('user.name+volunteer@example.com'), 'user.name+volunteer@example.com')
        self.assertEqual(validate_email_address('  Sonal.Joy@Gmail.Com  '), 'sonal.joy@gmail.com')  # normalizes to lowercase

    def test_email_rejected_missing_at(self):
        with self.assertRaises(ValidationError):
            validate_email_address('sonalgmail.com')

    def test_email_rejected_multiple_at(self):
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@@gmail.com')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@joy@gmail.com')

    def test_email_rejected_missing_domain_or_local(self):
        with self.assertRaises(ValidationError):
            validate_email_address('@gmail.com')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@gmail')

    def test_email_rejected_spaces(self):
        with self.assertRaises(ValidationError):
            validate_email_address('sonal joy@gmail.com')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@ g mail.com')

    def test_email_rejected_consecutive_or_boundary_dots(self):
        with self.assertRaises(ValidationError):
            validate_email_address('sonal..joy@gmail.com')
        with self.assertRaises(ValidationError):
            validate_email_address('.sonal@gmail.com')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@.com')
        with self.assertRaises(ValidationError):
            validate_email_address('sonal@domain.')

    def test_email_rejected_exceeds_max_length(self):
        long_email = 'a' * 245 + '@example.com'  # > 254 chars
        with self.assertRaises(ValidationError):
            validate_email_address(long_email)

    # -------------------------------------------------------------------------
    # PASSWORD SECURITY VALIDATION TESTS
    # -------------------------------------------------------------------------
    def test_password_valid_strong(self):
        self.assertEqual(validate_strong_password('SecurePassword@123'), 'SecurePassword@123')
        self.assertEqual(validate_strong_password('Pr0t3ct!Community#2026'), 'Pr0t3ct!Community#2026')

    def test_password_rejected_under_12_chars(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('Short@123')  # 9 chars

    def test_password_rejected_over_128_chars(self):
        long_pwd = 'A1!' + 'a' * 126
        with self.assertRaises(ValidationError):
            validate_strong_password(long_pwd)

    def test_password_rejected_no_uppercase(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('securepassword@123')

    def test_password_rejected_no_lowercase(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('SECUREPASSWORD@123')

    def test_password_rejected_no_digits(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('SecurePassword!@#')

    def test_password_rejected_no_special_chars(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('SecurePassword123')

    def test_password_rejected_with_spaces(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('Secure Password@123')

    def test_password_rejected_common_weak_passwords(self):
        with self.assertRaises(ValidationError):
            validate_strong_password('Password123456!')
        with self.assertRaises(ValidationError):
            validate_strong_password('Admin123456!')
        with self.assertRaises(ValidationError):
            validate_strong_password('Welcome123456!')

    # -------------------------------------------------------------------------
    # SERIALIZER LEVEL INTEGRATION TESTS
    # -------------------------------------------------------------------------
    def test_serializer_full_validation_success(self):
        serializer = VolunteerRegistrationSerializer(data={
            'email': 'VALID.VOLUNTEER@EXAMPLE.COM',
            'password': 'StrongPassword@123',
            'confirm_password': 'StrongPassword@123',
            'first_name': 'Aarav',
            'last_name': 'Mehta',
            'phone': '9876543210',
            'city': 'Bengaluru',
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['email'], 'valid.volunteer@example.com')

    def test_serializer_confirm_password_mismatch_fails(self):
        serializer = VolunteerRegistrationSerializer(data={
            'email': 'valid@example.com',
            'password': 'StrongPassword@123',
            'confirm_password': 'MismatchedPassword@123',
            'first_name': 'Aarav',
            'phone': '9876543210',
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('confirm_password', serializer.errors)
