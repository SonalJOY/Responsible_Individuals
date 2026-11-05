import base64
import hashlib
import hmac
import os
import secrets
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

ENV_KEY_NAME = 'INVITATION_ENCRYPTION_KEY'


def get_invitation_encryption_key() -> bytes:
    """
    Retrieves the dedicated encryption key for invitation tokens.
    Prioritizes os.environ, then settings.
    In testing or debug environments, provides a safe derived fallback if not set.
    In strict production environments without debug/testing, raises ImproperlyConfigured.
    """
    key_str = os.environ.get(ENV_KEY_NAME) or getattr(settings, ENV_KEY_NAME, None)
    if key_str:
        key_bytes = key_str.strip().encode('utf-8')
        return hashlib.sha256(key_bytes).digest()

    import sys
    is_testing = 'test' in sys.argv or getattr(settings, 'TESTING', False) or 'pytest' in sys.modules
    is_dev = getattr(settings, 'DEBUG', False) or 'development' in os.environ.get('DJANGO_SETTINGS_MODULE', '')

    if is_testing or is_dev:
        # Deterministic, safe fallback derived from SECRET_KEY for local development and testing
        return hashlib.sha256(b"invitation-delivery-encryption-key-fallback:" + settings.SECRET_KEY.encode('utf-8')).digest()

    raise ImproperlyConfigured(
        f"{ENV_KEY_NAME} is not set in environment. A dedicated encryption key is required for production invitation delivery."
    )


def _derive_keys(master_key: bytes):
    k_enc = hmac.new(master_key, b"invitation_enc_v1", hashlib.sha256).digest()
    k_mac = hmac.new(master_key, b"invitation_mac_v1", hashlib.sha256).digest()
    return k_enc, k_mac


def encrypt_invitation_token(raw_token: str) -> str:
    """
    Encrypts a raw invitation token using an authenticated stream cipher (HMAC-SHA256 CTR + HMAC-SHA256 MAC).
    Returns URL-safe Base64 encoded string: [16-byte nonce][32-byte tag][ciphertext].
    """
    if not raw_token or not isinstance(raw_token, str):
        raise ValueError("Raw invitation token must be a non-empty string.")

    master_key = get_invitation_encryption_key()
    k_enc, k_mac = _derive_keys(master_key)
    nonce = secrets.token_bytes(16)
    plaintext_bytes = raw_token.encode('utf-8')

    keystream = bytearray()
    counter = 0
    while len(keystream) < len(plaintext_bytes):
        keystream.extend(hmac.new(k_enc, nonce + counter.to_bytes(4, 'big'), hashlib.sha256).digest())
        counter += 1

    ciphertext = bytes(p ^ k for p, k in zip(plaintext_bytes, keystream[:len(plaintext_bytes)]))
    tag = hmac.new(k_mac, nonce + ciphertext, hashlib.sha256).digest()
    return base64.urlsafe_b64encode(nonce + tag + ciphertext).decode('ascii')


def decrypt_invitation_token(ciphertext_str: str) -> str:
    """
    Decrypts an encrypted invitation token and verifies its authentication tag.
    Raises ValueError on tampering or invalid key.
    """
    if not ciphertext_str or not isinstance(ciphertext_str, str):
        raise ValueError("Ciphertext must be a non-empty string.")

    master_key = get_invitation_encryption_key()
    k_enc, k_mac = _derive_keys(master_key)

    try:
        raw = base64.urlsafe_b64decode(ciphertext_str.strip().encode('ascii'))
    except Exception as e:
        raise ValueError(f"Malformed ciphertext encoding: {str(e)}")

    if len(raw) < 48:
        raise ValueError("Ciphertext length is invalid.")

    nonce = raw[:16]
    tag = raw[16:48]
    ciphertext = raw[48:]

    expected_tag = hmac.new(k_mac, nonce + ciphertext, hashlib.sha256).digest()
    if not hmac.compare_digest(tag, expected_tag):
        raise ValueError("Authentication tag mismatch: ciphertext has been tampered with or key is invalid.")

    keystream = bytearray()
    counter = 0
    while len(keystream) < len(ciphertext):
        keystream.extend(hmac.new(k_enc, nonce + counter.to_bytes(4, 'big'), hashlib.sha256).digest())
        counter += 1

    plaintext = bytes(c ^ k for c, k in zip(ciphertext, keystream[:len(ciphertext)]))
    return plaintext.decode('utf-8')

