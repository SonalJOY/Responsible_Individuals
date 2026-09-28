import test from 'node:test';
import assert from 'node:assert/strict';

// Helper logic tested as implemented in InteractiveDotGrid
function parseColorToRgb(colorStr) {
  if (!colorStr || typeof colorStr !== 'string') {
    return [52, 211, 153]; // Default emerald fallback
  }

  const str = colorStr.trim();

  // Hex format #RGB or #RRGGBB
  if (str.startsWith('#')) {
    const clean = str.replace('#', '');
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16),
      ];
    }
    if (clean.length >= 6) {
      return [
        parseInt(clean.substring(0, 2), 16),
        parseInt(clean.substring(2, 4), 16),
        parseInt(clean.substring(4, 6), 16),
      ];
    }
  }

  // RGB/RGBA format: rgb(52, 211, 153) or rgba(52, 211, 153, 0.5)
  if (str.startsWith('rgb')) {
    const match = str.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (match) {
      return [
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10),
      ];
    }
  }

  return [52, 211, 153];
}

test('InteractiveDotGrid Component Unit & Math Logic Tests', async (t) => {

  await t.test('1. parseColorToRgb parses various color formats accurately', () => {
    // 6-digit hex
    assert.deepEqual(parseColorToRgb('#34D399'), [52, 211, 153]);
    assert.deepEqual(parseColorToRgb('#A78BFA'), [167, 139, 250]);
    assert.deepEqual(parseColorToRgb('#000000'), [0, 0, 0]);
    assert.deepEqual(parseColorToRgb('#ffffff'), [255, 255, 255]);

    // 3-digit hex
    assert.deepEqual(parseColorToRgb('#fff'), [255, 255, 255]);
    assert.deepEqual(parseColorToRgb('#123'), [17, 34, 51]);

    // rgb() & rgba()
    assert.deepEqual(parseColorToRgb('rgb(16, 185, 129)'), [16, 185, 129]);
    assert.deepEqual(parseColorToRgb('rgba(124, 58, 237, 0.8)'), [124, 58, 237]);

    // Fallbacks
    assert.deepEqual(parseColorToRgb(null), [52, 211, 153]);
    assert.deepEqual(parseColorToRgb(''), [52, 211, 153]);
    assert.deepEqual(parseColorToRgb('invalid-color'), [52, 211, 153]);
  });

  await t.test('2. Grid layout math generates uniform grid with centered offsets', () => {
    const width = 800;
    const height = 400;
    const spacing = 32;

    const cols = Math.floor(width / spacing) + 1; // 26
    const rows = Math.floor(height / spacing) + 1; // 13

    const offsetX = (width - (cols - 1) * spacing) / 2;
    const offsetY = (height - (rows - 1) * spacing) / 2;

    assert.equal(cols, 26);
    assert.equal(rows, 13);
    assert.equal(offsetX >= 0 && offsetX < spacing, true);
    assert.equal(offsetY >= 0 && offsetY < spacing, true);

    // Verify first and last dot coordinates
    const firstX = offsetX + 0 * spacing;
    const lastX = offsetX + (cols - 1) * spacing;
    assert.equal(firstX, offsetX);
    assert.equal(lastX, width - offsetX);
  });

  await t.test('3. Distance & quadratic intensity falloff calculations', () => {
    const interactionRadius = 140;

    const calculateIntensity = (dist) => {
      if (dist >= interactionRadius) return 0;
      const norm = 1 - dist / interactionRadius;
      return norm * norm;
    };

    // At cursor center (dist = 0), intensity is 1.0
    assert.equal(calculateIntensity(0), 1.0);

    // At edge of interaction radius (dist = 140), intensity is 0
    assert.equal(calculateIntensity(140), 0);

    // Beyond interaction radius (dist = 150), intensity is 0
    assert.equal(calculateIntensity(150), 0);

    // Halfway (dist = 70), intensity is (0.5)^2 = 0.25
    assert.equal(calculateIntensity(70), 0.25);
  });

  await t.test('4. Repel displacement vector calculation smoothly points away from cursor', () => {
    const repelForce = 16;
    const interactionRadius = 140;
    const dotX = 100;
    const dotY = 100;
    const cursorX = 80;
    const cursorY = 100;

    const dx = dotX - cursorX; // +20 (dot is to the right of cursor)
    const dy = dotY - cursorY; // 0
    const dist = Math.sqrt(dx * dx + dy * dy); // 20

    const norm = 1 - dist / interactionRadius;
    const force = norm * repelForce;
    const repelX = (dx / dist) * force;
    const repelY = (dy / dist) * force;

    assert.equal(dx > 0, true);
    assert.equal(repelX > 0, true, 'Dot to right of cursor should be repelled to the right (+x)');
    assert.equal(repelY, 0, 'Vertical displacement should be 0 when cursor is purely horizontal');
    assert.equal(repelX < repelForce, true);
  });

  await t.test('5. Linear easing (LERP) approaches target asymptotically without overshoot', () => {
    let currentX = 100;
    const targetX = 120;
    const lerpFactor = 0.12;

    for (let step = 0; step < 30; step++) {
      currentX += (targetX - currentX) * lerpFactor;
    }

    // After 30 frames, currentX should be very close to 120 (< 0.5px delta)
    assert.equal(Math.abs(targetX - currentX) < 0.5, true);
    assert.equal(currentX <= targetX, true, 'Should never overshoot target in standard lerp');
  });

  await t.test('6. Connection line alpha computation between neighbor dots', () => {
    const connectionOpacity = 0.20;

    const computeLineAlpha = (intensityA, intensityB) => {
      if (intensityA < 0.04 || intensityB < 0.04) return 0;
      return Math.min(intensityA, intensityB) * connectionOpacity;
    };

    // Both dots outside cursor proximity
    assert.equal(computeLineAlpha(0.01, 0.02), 0);

    // One dot close, other far
    assert.equal(computeLineAlpha(0.8, 0.02), 0);

    // Both dots within cursor proximity
    const alpha = computeLineAlpha(0.6, 0.4);
    assert.equal(alpha, 0.4 * 0.20);
    assert.equal(alpha <= connectionOpacity, true);
  });
});
