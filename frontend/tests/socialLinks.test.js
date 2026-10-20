import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SOCIAL_LINKS } from '../src/data/socialLinks.js';

describe('Floating Social Media Links & Configuration Tests', () => {
  it('1. Contains exact official destinations for all configured platforms', () => {
    assert.equal(
      SOCIAL_LINKS.instagram.url,
      'https://www.instagram.com/responsibleindividuals?utm_source=qr&xtok=ZnE3NWVrMXJreHo3',
      'Instagram URL must match the exact official destination with query tokens'
    );

    assert.equal(
      SOCIAL_LINKS.facebook.url,
      'https://www.facebook.com/share/19mZRbgNiV/',
      'Facebook URL must match the exact official destination'
    );

    assert.equal(
      SOCIAL_LINKS.linkedin.url,
      'https://www.linkedin.com/in/responsible-individuals-2600b8344?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      'LinkedIn URL must match the exact official destination with member tracking params'
    );

    assert.equal(
      SOCIAL_LINKS.twitter.url,
      'https://x.com/responsible_ind',
      'Twitter / X URL must match the preserved official handle'
    );

    assert.equal(
      SOCIAL_LINKS.youtube.url,
      'https://youtube.com/@responsibleindividuals',
      'YouTube URL must match the preserved official channel'
    );
  });

  it('2. WhatsApp phone number, protocol, and prefilled message format', () => {
    const wa = SOCIAL_LINKS.whatsapp;
    assert.equal(wa.phoneNumber, '+91 99000 16979', 'Formatted display phone must be +91 99000 16979');
    assert.equal(wa.rawPhone, '919900016979', 'Raw phone must be 919900016979 without spaces or plus');

    // Ensure URL starts with https://wa.me/919900016979
    assert.ok(wa.url.startsWith('https://wa.me/919900016979'), 'WhatsApp URL must use standard wa.me format');

    // Parse URL and verify query parameter encoding
    const parsedUrl = new URL(wa.url);
    assert.equal(parsedUrl.hostname, 'wa.me');
    assert.equal(parsedUrl.pathname, '/919900016979');
    assert.equal(
      parsedUrl.searchParams.get('text'),
      'Hello Responsible Individuals, I would like to know more about your initiatives.',
      'Prefilled greeting text must be properly decoded and phrased professionally'
    );
  });

  it('3. Accessibility and metadata integrity for all links', () => {
    const requiredKeys = ['instagram', 'facebook', 'linkedin', 'whatsapp', 'twitter', 'youtube'];

    for (const key of requiredKeys) {
      const item = SOCIAL_LINKS[key];
      assert.ok(item, `SOCIAL_LINKS must define entry for ${key}`);
      assert.ok(item.name && item.name.trim().length > 0, `${key} must have a non-empty name`);
      assert.ok(item.ariaLabel && item.ariaLabel.trim().length > 0, `${key} must have a non-empty ariaLabel`);
      assert.ok(item.color && item.color.startsWith('#'), `${key} must define a valid hex brand color`);
      assert.ok(item.url.startsWith('https://'), `${key} URL must use secure HTTPS protocol`);
    }
  });

  it('4. Valid URL syntax verification', () => {
    for (const [key, item] of Object.entries(SOCIAL_LINKS)) {
      assert.doesNotThrow(() => {
        const u = new URL(item.url);
        assert.ok(u.protocol === 'https:');
      }, `URL for ${key} should parse as a valid URL`);
    }
  });
});
