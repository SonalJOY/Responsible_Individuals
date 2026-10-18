/**
 * Volunteer Registration & Application Validation Utilities (Phase 3B-Validation Hardening)
 */

// Phone: exactly 10 digits starting with 6, 7, 8, or 9
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// Standard email: non-whitespace, single @, valid local, domain & TLD >= 2 chars, max 254 chars
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Common obvious weak password patterns
const COMMON_WEAK_PATTERNS = [
  'password123',
  'admin123',
  'welcome123',
  'qwerty123',
  '12345678',
  '123456789',
  '123456789012',
  'letmein123',
  'iloveyou123',
];

/**
 * Validates a 10-digit Indian mobile number
 * @param {string} phone
 * @returns {string|null} Error message or null if valid
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return 'Enter a valid 10-digit Indian mobile number.';
  }

  const trimmed = phone.trim();

  // Explicit checks for helpful user feedback
  if (trimmed.startsWith('+91') || trimmed.startsWith('+')) {
    return 'Enter a 10-digit number without +91 or country code.';
  }

  if (/\s/.test(trimmed) || /[-().]/.test(trimmed)) {
    return 'Enter digits only without spaces or hyphens.';
  }

  if (/[a-zA-Z]/.test(trimmed)) {
    return 'Phone number cannot contain letters.';
  }

  if (trimmed.length !== 10) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }

  if (!/^[6-9]/.test(trimmed)) {
    return 'Phone number must start with 6, 7, 8, or 9.';
  }

  if (!PHONE_REGEX.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }

  return null;
}

/**
 * Validates standard web email address
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Enter a valid email address.';
  }

  const trimmed = email.trim();

  if (trimmed.length === 0) {
    return 'Email address is required.';
  }

  if (trimmed.length > 254) {
    return 'Email address cannot exceed 254 characters.';
  }

  if (/\s/.test(email)) {
    return 'Email address cannot contain spaces.';
  }

  // Count '@' occurrences
  const atMatches = email.match(/@/g);
  if (!atMatches || atMatches.length !== 1) {
    return 'Enter a valid email address.';
  }

  const [localPart, domainPart] = email.split('@');

  if (!localPart || !domainPart) {
    return 'Enter a valid email address.';
  }

  if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
    return 'Enter a valid email address.';
  }

  if (!domainPart.includes('.') || domainPart.startsWith('.') || domainPart.endsWith('.')) {
    return 'Enter a valid email address.';
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Enter a valid email address.';
  }

  return null;
}

/**
 * Checks individual password requirements for live UI checklist
 * @param {string} password
 * @returns {Object} Checklist status map
 */
export function checkPasswordRequirements(password = '') {
  const pwd = String(password || '');
  return {
    length: pwd.length >= 12 && pwd.length <= 128,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd),
    noSpaces: pwd.length > 0 && !/\s/.test(pwd),
  };
}

/**
 * Evaluates password strength & detects weak patterns
 * @param {string} password
 * @returns {Object} { score: 0-4, label: 'Weak'|'Fair'|'Strong'|'Very Strong', color: string, isCommon: boolean }
 */
export function evaluatePasswordStrength(password = '') {
  const pwd = String(password || '');
  if (!pwd) {
    return { score: 0, label: 'Weak', color: '#EF4444', percent: 0, isCommon: false };
  }

  const reqs = checkPasswordRequirements(pwd);
  const lowerPwd = pwd.toLowerCase();

  // Check for common weak patterns
  const isCommon = COMMON_WEAK_PATTERNS.some((pattern) => lowerPwd.includes(pattern));

  // Check for obvious sequential patterns (e.g., '123456', 'abcdef')
  const isSequential = /(?:012345|123456|234567|345678|456789|567890|abcdef|bcdefg|cdefgh|defghi)/i.test(pwd);

  // Check for character repetitions (e.g., 'aaaa', '1111')
  const isRepeating = /(.)\1{3,}/.test(pwd);

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (reqs.length) score += 1;
  if (reqs.uppercase && reqs.lowercase) score += 1;
  if (reqs.number) score += 1;
  if (reqs.special) score += 1;
  if (reqs.noSpaces && pwd.length >= 16) score += 1;

  if (isCommon || isSequential || isRepeating) {
    score = Math.min(score, 1);
  }

  if (score <= 1 || isCommon) {
    return { score: 1, label: 'Weak', color: '#EF4444', percent: 25, isCommon };
  }

  const allCorePassed = reqs.length && reqs.uppercase && reqs.lowercase && reqs.number && reqs.special && reqs.noSpaces;

  if (allCorePassed) {
    if (pwd.length >= 16) {
      return { score: 4, label: 'Very Strong', color: '#059669', percent: 100, isCommon: false };
    }
    return { score: 3, label: 'Strong', color: '#10B981', percent: 75, isCommon: false };
  }

  return { score: 2, label: 'Fair', color: '#F59E0B', percent: 50, isCommon: false };
}

/**
 * Validates Create Password field against strict security rules
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return 'Password is required.';
  }

  if (password.length < 12) {
    return 'Password must be at least 12 characters long.';
  }

  if (password.length > 128) {
    return 'Password cannot exceed 128 characters.';
  }

  if (/\s/.test(password)) {
    return 'Password cannot contain spaces.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter (a-z).';
  }

  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number (0-9).';
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&* etc.).';
  }

  const { isCommon } = evaluatePasswordStrength(password);
  if (isCommon) {
    return 'Password contains a common, easily guessable pattern. Choose a stronger password.';
  }

  return null;
}

/**
 * Validates that confirm password matches create password
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null} Error message or null if valid
 */
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

/**
 * Validates Motivation / Statement of Purpose
 * @param {string} statement
 * @returns {string|null}
 */
export function validateStatementOfPurpose(statement) {
  if (!statement || statement.trim().length < 10) {
    return 'Please provide a statement of purpose explaining your motivation (min 10 characters).';
  }
  return null;
}
