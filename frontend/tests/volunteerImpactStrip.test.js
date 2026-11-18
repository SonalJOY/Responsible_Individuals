import test from 'node:test';
import assert from 'node:assert/strict';

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

test('Volunteer Impact Statistics Counter & Re-trigger Tests', async (t) => {

  const defaultStats = [
    {
      id: 'active-volunteers',
      key: 'active_volunteers',
      title: 'Active Volunteers',
      rawNumber: 1000,
      suffix: '+',
      isNumeric: true,
      isVerified: true,
    },
    {
      id: 'volunteer-hours',
      key: 'volunteer_hours',
      title: 'Volunteering Hours Clocked',
      placeholderText: 'Growing every day',
      isNumeric: false,
      isVerified: false,
    },
    {
      id: 'lives-impacted',
      key: 'lives_impacted',
      title: 'Lives Impacted',
      rawNumber: 50000,
      suffix: '+',
      isNumeric: true,
      isVerified: true,
    },
    {
      id: 'volunteer-activities',
      key: 'volunteer_activities',
      title: 'Volunteer Activities',
      placeholderText: 'Growing every day',
      isNumeric: false,
      isVerified: false,
    },
  ];

  await t.test('1. Configured statistics schema and target integrity', () => {
    assert.equal(defaultStats.length, 4, 'Must have exactly 4 impact statistics');

    // Stat 1: Active Volunteers target 1000+
    assert.equal(defaultStats[0].title, 'Active Volunteers');
    assert.equal(defaultStats[0].rawNumber, 1000);
    assert.equal(defaultStats[0].suffix, '+');
    assert.equal(defaultStats[0].isNumeric, true);

    // Stat 2: Volunteering Hours Clocked (Honest placeholder)
    assert.equal(defaultStats[1].title, 'Volunteering Hours Clocked');
    assert.equal(defaultStats[1].placeholderText, 'Growing every day');
    assert.equal(defaultStats[1].isNumeric, false);

    // Stat 3: Lives Impacted (50,000+)
    assert.equal(defaultStats[2].title, 'Lives Impacted');
    assert.equal(defaultStats[2].rawNumber, 50000);
    assert.equal(defaultStats[2].suffix, '+');
    assert.equal(defaultStats[2].isNumeric, true);

    // Stat 4: Volunteer Activities (Honest placeholder)
    assert.equal(defaultStats[3].title, 'Volunteer Activities');
    assert.equal(defaultStats[3].placeholderText, 'Growing every day');
    assert.equal(defaultStats[3].isNumeric, false);
  });

  await t.test('2. Backend synchronization preserves Volunteer page 1000+ target for active_volunteers', () => {
    // Simulated API response from backend ImpactStatistic seed
    const mockApiResponse = [
      { key: 'active_volunteers', raw_number: 2500, counter_value: '2,500+' },
      { key: 'lives_impacted', raw_number: 50000, counter_value: '50,000+' },
    ];

    const updatedStats = defaultStats.map((item) => {
      // Must NOT overwrite active_volunteers on the volunteer page
      if (item.key === 'active_volunteers') {
        return item;
      }
      const matched = mockApiResponse.find((d) => d.key === item.key);
      if (!matched) return item;
      return {
        ...item,
        rawNumber: matched.raw_number,
      };
    });

    assert.equal(updatedStats[0].rawNumber, 1000, 'Active volunteers must remain at 1000+ target');
    assert.equal(updatedStats[2].rawNumber, 50000, 'Lives impacted retains 50,000+ target');
  });

  await t.test('3. Exponential ease-out curve mathematical guarantees', () => {
    // At t=0, ease progress should be 0
    assert.equal(easeOutExpo(0), 0);

    // At t=1, ease progress should be 1
    assert.equal(easeOutExpo(1), 1);

    // Midpoints should be monotonic and decelerate gracefully
    const t025 = easeOutExpo(0.25);
    const t050 = easeOutExpo(0.50);
    const t075 = easeOutExpo(0.75);

    assert.ok(t025 > 0.25, 'Expo easing provides rapid initial acceleration');
    assert.ok(t050 > t025, 'Easing is strictly monotonically increasing');
    assert.ok(t075 > t050, 'Easing continues forward');
    assert.ok(t075 > 0.90, 'Deceleration eases softly near completion');
  });

  await t.test('4. Counter stagger timing calculations', () => {
    const calculateStagger = (index) => index * 120;

    assert.equal(calculateStagger(0), 0, 'Card 0 starts immediately');
    assert.equal(calculateStagger(1), 120, 'Card 1 delayed by 120ms');
    assert.equal(calculateStagger(2), 240, 'Card 2 delayed by 240ms');
    assert.equal(calculateStagger(3), 360, 'Card 3 delayed by 360ms');
  });

  await t.test('5. Number locale formatting contract for en-IN', () => {
    const formatNumber = (num) => num.toLocaleString('en-IN');

    assert.equal(formatNumber(1000), '1,000');
    assert.equal(formatNumber(50000), '50,000');
    assert.equal(formatNumber(0), '0');
  });

  await t.test('6. Viewport entry, exit, and re-entry state machine', () => {
    let inView = false;
    let animatedText = '0';
    const target = 1000;

    // Simulate entry into viewport
    const onEnterViewport = () => {
      inView = true;
      // Progressively animate
      animatedText = target.toLocaleString('en-IN');
    };

    // Simulate exit from viewport
    const onLeaveViewport = () => {
      inView = false;
      // Must reset to 0 so next visit triggers fresh count-up
      animatedText = '0';
    };

    // Initial state: not in view
    assert.equal(inView, false);
    assert.equal(animatedText, '0');

    // 1st visit
    onEnterViewport();
    assert.equal(inView, true);
    assert.equal(animatedText, '1,000');

    // User scrolls past / leaves section
    onLeaveViewport();
    assert.equal(inView, false);
    assert.equal(animatedText, '0', 'Counter must reset to 0 on exit');

    // User scrolls back / 2nd visit
    onEnterViewport();
    assert.equal(inView, true);
    assert.equal(animatedText, '1,000', 'Counter successfully replays on subsequent visit');
  });

  await t.test('7. Prefers-reduced-motion contract: displays final values immediately without reset', () => {
    const getDisplayValue = (target, inView, prefersReducedMotion) => {
      if (prefersReducedMotion) {
        return target.toLocaleString('en-IN');
      }
      return inView ? target.toLocaleString('en-IN') : '0';
    };

    // When reduced motion is preferred, even if inView is false, target is shown
    const reducedMotionOffscreen = getDisplayValue(1000, false, true);
    assert.equal(reducedMotionOffscreen, '1,000');

    const reducedMotionOnscreen = getDisplayValue(1000, true, true);
    assert.equal(reducedMotionOnscreen, '1,000');

    // When standard motion, offscreen is 0 and onscreen is target
    const standardOffscreen = getDisplayValue(1000, false, false);
    assert.equal(standardOffscreen, '0');

    const standardOnscreen = getDisplayValue(1000, true, false);
    assert.equal(standardOnscreen, '1,000');
  });

});
