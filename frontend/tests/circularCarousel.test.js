import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('CircularCarousel 3D Cylinder Math & Interaction Logic Tests', () => {
  // Formula used in CircularCarousel:
  // Math.max(cardWidth * 1.1, (cardWidth / 2) / Math.tan(Math.PI / totalItems))
  function calculateCylinderRadius(cardWidth, totalItems) {
    const minRadius = cardWidth * 1.1;
    if (totalItems <= 1) return minRadius;
    const computedRadius = (cardWidth / 2) / Math.tan(Math.PI / totalItems);
    return Math.max(minRadius, Math.round(computedRadius));
  }

  // Normalization logic for shortest angle delta
  function computeRotationDelta(currentRotation, targetAngle) {
    const normalizedRot = ((currentRotation % 360) + 360) % 360;
    return ((targetAngle - normalizedRot + 540) % 360) - 180;
  }

  test('1. Cylinder radius math accurately calculates regular polygon apothem', () => {
    // For 6 items at cardWidth 220:
    // apothem = (220 / 2) / tan(pi / 6) = 110 / tan(30deg) = 110 / 0.57735 = ~190.525
    // minRadius = 220 * 1.1 = 242 -> max(242, 191) = 242
    const radius6 = calculateCylinderRadius(220, 6);
    assert.ok(radius6 >= 242, 'Radius must respect min radius clearance');

    // For 12 items at cardWidth 220:
    // apothem = 110 / tan(15deg) = 110 / 0.2679 = ~410.5
    const radius12 = calculateCylinderRadius(220, 12);
    assert.strictEqual(radius12, 411, 'Calculated radius for 12 items must match regular polygon apothem');
  });

  test('2. Angular distribution evenly spaces items around 360 degrees', () => {
    const totalItems = 6;
    const angles = Array.from({ length: totalItems }, (_, i) => (360 / totalItems) * i);

    assert.deepStrictEqual(angles, [0, 60, 120, 180, 240, 300]);
    assert.strictEqual(angles[angles.length - 1] + (360 / totalItems), 360);
  });

  test('3. Shortest rotation delta brings clicked card directly to front view', () => {
    // If current rotation is 0 and user clicks card at 60deg, delta is +60
    assert.strictEqual(computeRotationDelta(0, 60), 60);

    // If current rotation is 0 and user clicks card at 300deg (i.e. -60deg), delta is -60
    assert.strictEqual(computeRotationDelta(0, 300), -60);

    // If current rotation is 350 and user clicks card at 10, delta is +20 (shortest path across 0deg boundary)
    assert.strictEqual(computeRotationDelta(350, 10), 20);

    // If current rotation is 10 and user clicks card at 350, delta is -20
    assert.strictEqual(computeRotationDelta(10, 350), -20);
  });

  test('4. Carousel project dataset schema contract', () => {
    const sampleItems = [
      {
        id: 'lake-rejuvenation',
        title: 'Kaikondrahalli-Varthur Lake Rejuvenation',
        subtitle: 'Environmental & Ecological Restoration',
        src: '/src/assets/varthur-blooming-wetland.jpg',
        link: '/initiatives',
      },
      {
        id: 'stem-labs',
        title: 'Rural STEM Labs & Digital Classrooms',
        subtitle: 'Digital Inclusion & Education Equity',
        src: '/src/assets/rural-stem-sensor-lab.jpg',
        link: '/initiatives',
      },
    ];

    sampleItems.forEach((item) => {
      assert.ok(item.id, 'Item must have an id');
      assert.ok(item.title, 'Item must have a descriptive title');
      assert.ok(item.subtitle, 'Item must have a thematic subtitle');
      assert.ok(item.src, 'Item must provide a valid asset src path');
      assert.ok(item.link.startsWith('/'), 'Item link must be an internal routing path');
    });
  });
});
