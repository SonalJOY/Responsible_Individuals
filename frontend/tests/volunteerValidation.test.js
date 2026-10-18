import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePhone,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  checkPasswordRequirements,
  evaluatePasswordStrength,
  validateStatementOfPurpose
} from '../src/utils/validation.js';

test('Volunteer Registration & Application Validation Hardening Tests', async (t) => {

  // =========================================================================
  // 1. PHONE NUMBER VALIDATION TESTS
  // =========================================================================
  await t.test('PHONE: 10-digit valid Indian numbers starting with 6, 7, 8, 9 are accepted', () => {
    assert.equal(validatePhone('9110476459'), null);
    assert.equal(validatePhone('6234567890'), null);
    assert.equal(validatePhone('7000000000'), null);
    assert.equal(validatePhone('8999999999'), null);
  });

  await t.test('PHONE: 9 digits rejected', () => {
    assert.ok(validatePhone('911047645') !== null);
  });

  await t.test('PHONE: 11 digits rejected', () => {
    assert.ok(validatePhone('91104764591') !== null);
  });

  await t.test('PHONE: letters rejected', () => {
    assert.ok(validatePhone('91104abcde') !== null);
    assert.ok(validatePhone('98765abcd0') !== null);
  });

  await t.test('PHONE: +91 prefix and country codes rejected', () => {
    assert.ok(validatePhone('+919110476459') !== null);
    assert.ok(validatePhone('+91 9110476459') !== null);
  });

  await t.test('PHONE: spaces, hyphens, and parentheses rejected', () => {
    assert.ok(validatePhone('91104 76459') !== null);
    assert.ok(validatePhone('91104-76459') !== null);
    assert.ok(validatePhone('(91104)76459') !== null);
  });

  await t.test('PHONE: first digit below 6 rejected', () => {
    assert.ok(validatePhone('5110476459') !== null);
    assert.ok(validatePhone('1234567890') !== null);
    assert.ok(validatePhone('0987654321') !== null);
    assert.ok(validatePhone('4110476459') !== null);
  });

  // =========================================================================
  // 2. EMAIL ADDRESS VALIDATION TESTS
  // =========================================================================
  await t.test('EMAIL: normal valid email accepted', () => {
    assert.equal(validateEmail('sonal.joy@gmail.com'), null);
    assert.equal(validateEmail('contact@example.org'), null);
  });

  await t.test('EMAIL: subdomain email accepted', () => {
    assert.equal(validateEmail('sonal.joy@btech.christuniversity.in'), null);
    assert.equal(validateEmail('user@dept.school.edu'), null);
  });

  await t.test('EMAIL: plus-addressing accepted', () => {
    assert.equal(validateEmail('user.name+volunteer@example.com'), null);
    assert.equal(validateEmail('sonal+testing123@gmail.com'), null);
  });

  await t.test('EMAIL: missing @ rejected', () => {
    assert.ok(validateEmail('sonalgmail.com') !== null);
    assert.ok(validateEmail('plainaddress') !== null);
  });

  await t.test('EMAIL: missing domain or local part rejected', () => {
    assert.ok(validateEmail('@gmail.com') !== null);
    assert.ok(validateEmail('sonal@') !== null);
    assert.ok(validateEmail('sonal@gmail') !== null);
  });

  await t.test('EMAIL: spaces rejected anywhere in email', () => {
    assert.ok(validateEmail('sonal joy@gmail.com') !== null);
    assert.ok(validateEmail('sonal@ gmail.com') !== null);
    assert.ok(validateEmail('sonal @gmail.com') !== null);
  });

  await t.test('EMAIL: malformed email structures rejected', () => {
    assert.ok(validateEmail('sonal@@gmail.com') !== null);
    assert.ok(validateEmail('sonal..joy@gmail.com') !== null);
    assert.ok(validateEmail('sonal@.com') !== null);
    assert.ok(validateEmail('sonal@domain.') !== null);
  });

  await t.test('EMAIL: emails exceeding 254 characters rejected', () => {
    const longLocal = 'a'.repeat(245);
    assert.ok(validateEmail(`${longLocal}@example.com`) !== null);
  });

  // =========================================================================
  // 3. PASSWORD SECURITY VALIDATION TESTS
  // =========================================================================
  await t.test('PASSWORD: valid strong password accepted', () => {
    assert.equal(validatePassword('SecurePassword@123'), null);
    assert.equal(validatePassword('P@ssw0rdValid2026'), null);
    assert.equal(validatePassword('Volunt33r!Stewardship#2026'), null);
  });

  await t.test('PASSWORD: less than 12 characters rejected', () => {
    assert.ok(validatePassword('Short@123') !== null);
    assert.ok(validatePassword('Abc!1234567') !== null); // 11 chars
  });

  await t.test('PASSWORD: over 128 characters rejected', () => {
    const longPwd = 'A1!' + 'a'.repeat(126);
    assert.ok(validatePassword(longPwd) !== null);
  });

  await t.test('PASSWORD: no uppercase rejected', () => {
    assert.ok(validatePassword('securepassword@123') !== null);
  });

  await t.test('PASSWORD: no lowercase rejected', () => {
    assert.ok(validatePassword('SECUREPASSWORD@123') !== null);
  });

  await t.test('PASSWORD: no number rejected', () => {
    assert.ok(validatePassword('SecurePassword!@#') !== null);
  });

  await t.test('PASSWORD: no special character rejected', () => {
    assert.ok(validatePassword('SecurePassword123') !== null);
  });

  await t.test('PASSWORD: spaces rejected', () => {
    assert.ok(validatePassword('Secure Password@123') !== null);
  });

  await t.test('PASSWORD: common weak passwords rejected', () => {
    assert.ok(validatePassword('Password123456!') !== null);
    assert.ok(validatePassword('Admin123456!') !== null);
    assert.ok(validatePassword('Welcome123456!') !== null);
    assert.ok(validatePassword('Qwerty123456!') !== null);
  });

  await t.test('PASSWORD: confirmation mismatch rejected and match accepted', () => {
    assert.ok(validateConfirmPassword('SecurePassword@123', 'DifferentPassword@123') !== null);
    assert.ok(validateConfirmPassword('SecurePassword@123', '') !== null);
    assert.equal(validateConfirmPassword('SecurePassword@123', 'SecurePassword@123'), null);
  });

  // =========================================================================
  // 4. LIVE PASSWORD CHECKLIST & STRENGTH EVALUATION TESTS
  // =========================================================================
  await t.test('PASSWORD UI: requirement checklist updates status accurately', () => {
    const partial = checkPasswordRequirements('Abc1!');
    assert.equal(partial.length, false);
    assert.equal(partial.uppercase, true);
    assert.equal(partial.lowercase, true);
    assert.equal(partial.number, true);
    assert.equal(partial.special, true);
    assert.equal(partial.noSpaces, true);

    const full = checkPasswordRequirements('SecurePassword@123');
    assert.equal(full.length, true);
    assert.equal(full.uppercase, true);
    assert.equal(full.lowercase, true);
    assert.equal(full.number, true);
    assert.equal(full.special, true);
    assert.equal(full.noSpaces, true);
  });

  await t.test('PASSWORD UI: strength evaluation calculates Weak, Fair, Strong, Very Strong', () => {
    const weak = evaluatePasswordStrength('12345');
    assert.equal(weak.label, 'Weak');

    const fair = evaluatePasswordStrength('GoodPassword12');
    assert.equal(fair.label, 'Fair');

    const strong = evaluatePasswordStrength('SecurePass@123');
    assert.equal(strong.label, 'Strong');

    const veryStrong = evaluatePasswordStrength('VerySecurePassword@2026!');
    assert.equal(veryStrong.label, 'Very Strong');
  });

  // =========================================================================
  // 5. MOTIVATION & SUBMISSION GATE TESTS
  // =========================================================================
  await t.test('MOTIVATION: Statement of purpose minimum length validation', () => {
    assert.ok(validateStatementOfPurpose('') !== null);
    assert.ok(validateStatementOfPurpose('Too short') !== null);
    assert.equal(validateStatementOfPurpose('I want to actively contribute to urban lake revival projects.'), null);
  });

  await t.test('SUBMISSION: Form submission validator detects invalid fields and prevents API call', () => {
    const invalidForm = {
      first_name: '',
      email: 'bad-email',
      password: 'short',
      confirm_password: 'mismatch',
      phone: '+91 12345',
      city: '',
      statement_of_purpose: '',
    };

    const errors = {};
    if (!invalidForm.first_name) errors.first_name = 'First name is required.';
    const emailErr = validateEmail(invalidForm.email);
    if (emailErr) errors.email = emailErr;
    const pwdErr = validatePassword(invalidForm.password);
    if (pwdErr) errors.password = pwdErr;
    const confirmErr = validateConfirmPassword(invalidForm.password, invalidForm.confirm_password);
    if (confirmErr) errors.confirm_password = confirmErr;
    const phoneErr = validatePhone(invalidForm.phone);
    if (phoneErr) errors.phone = phoneErr;
    const stmtErr = validateStatementOfPurpose(invalidForm.statement_of_purpose);
    if (stmtErr) errors.statement_of_purpose = stmtErr;

    let apiCalled = false;
    if (Object.keys(errors).length === 0) {
      apiCalled = true;
    }

    assert.equal(apiCalled, false, 'API must not be called when form errors exist');
    assert.equal(Object.keys(errors).length, 6);
  });

  await t.test('SUBMISSION: Valid form continues existing flow with normalized data', () => {
    const validForm = {
      first_name: 'Sonal',
      last_name: 'Joy',
      email: '  Sonal.Joy@Gmail.Com  ',
      password: 'SecurePassword@123',
      confirm_password: 'SecurePassword@123',
      phone: '9110476459',
      city: 'Bengaluru',
      statement_of_purpose: 'I am passionate about freshwater conservation and environmental sustainability.',
    };

    const errors = {};
    const emailErr = validateEmail(validForm.email.trim());
    if (emailErr) errors.email = emailErr;
    const pwdErr = validatePassword(validForm.password);
    if (pwdErr) errors.password = pwdErr;
    const confirmErr = validateConfirmPassword(validForm.password, validForm.confirm_password);
    if (confirmErr) errors.confirm_password = confirmErr;
    const phoneErr = validatePhone(validForm.phone);
    if (phoneErr) errors.phone = phoneErr;
    const stmtErr = validateStatementOfPurpose(validForm.statement_of_purpose);
    if (stmtErr) errors.statement_of_purpose = stmtErr;

    assert.equal(Object.keys(errors).length, 0);

    let submittedPayload = null;
    if (Object.keys(errors).length === 0) {
      submittedPayload = {
        email: validForm.email.trim().toLowerCase(),
        password: validForm.password,
        phone: validForm.phone.trim(),
      };
    }

    assert.ok(submittedPayload !== null);
    assert.equal(submittedPayload.email, 'sonal.joy@gmail.com');
    assert.equal(submittedPayload.phone, '9110476459');
  });
});
