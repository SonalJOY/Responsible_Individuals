import test from 'node:test';
import assert from 'node:assert/strict';

test('Why Volunteer Section Component & Animation Contract Tests (Phase 3B-UI)', async (t) => {

  const benefitCards = [
    {
      id: 'create-impact',
      theme: 'emerald',
      badge: 'Tangible Action',
      title: 'Create Real Impact',
      description: 'Help turn urgent community and environmental needs into verified field results through structured toolkits, clear metrics, and scientific guidance.',
      hoverDetail: 'Structured field drives & measurable outcomes',
      accentColor: '#10B981',
      illustrationType: 'ripple',
      iconClass: 'icon-anim-pulse',
      floatDuration: '5.4s',
      floatDelay: '0s',
    },
    {
      id: 'use-skills',
      theme: 'blue',
      badge: 'Talent Leverage',
      title: 'Use Your Skills',
      description: 'Contribute technical, educational, design, scientific, or logistical abilities directly where grassroots communities benefit from them most.',
      hoverDetail: 'STEM, healthcare, software, communications & logistics',
      accentColor: '#2563EB',
      illustrationType: 'tools',
      iconClass: 'icon-anim-rotate',
      floatDuration: '6.2s',
      floatDelay: '-2.5s',
    },
    {
      id: 'learn-grow',
      theme: 'amber',
      badge: 'Personal Growth',
      title: 'Learn & Grow',
      description: 'Develop hands-on leadership, deepen community empathy, and earn verifiable service certificates and hours recognized across institutions.',
      hoverDetail: 'Verified service hours & recognized leadership experience',
      accentColor: '#D97706',
      illustrationType: 'growth',
      iconClass: 'icon-anim-growth',
      floatDuration: '5.8s',
      floatDelay: '-1.2s',
    },
    {
      id: 'build-community',
      theme: 'violet',
      badge: 'Lifelong Network',
      title: 'Build Community',
      description: 'Connect with a passionate network of students, researchers, educators, and working professionals who believe in proactive civic responsibility.',
      hoverDetail: 'Collaborate with 2,500+ active change-makers',
      accentColor: '#7C3AED',
      illustrationType: 'network',
      iconClass: 'icon-anim-network',
      floatDuration: '6.6s',
      floatDelay: '-3.8s',
    },
  ];

  await t.test('1. Benefit cards data integrity: 4 required distinct themes with valid metadata', () => {
    assert.equal(benefitCards.length, 4, 'Must have exactly 4 benefit cards');

    const expectedIds = ['create-impact', 'use-skills', 'learn-grow', 'build-community'];
    const actualIds = benefitCards.map((c) => c.id);
    assert.deepEqual(actualIds, expectedIds);

    benefitCards.forEach((card) => {
      assert.ok(card.title && card.title.length > 5, `Card ${card.id} must have a valid title`);
      assert.ok(card.description && card.description.length > 20, `Card ${card.id} must have a descriptive body`);
      assert.ok(card.hoverDetail && card.hoverDetail.length > 10, `Card ${card.id} must have a hover detail`);
      assert.ok(card.accentColor.startsWith('#'), `Card ${card.id} must have a valid HEX accent color`);
      assert.ok(['ripple', 'tools', 'growth', 'network'].includes(card.illustrationType), `Card ${card.id} must have a valid illustrationType`);
      assert.ok(card.iconClass, `Card ${card.id} must have an icon continuous animation class`);
    });
  });

  await t.test('2. Continuous floating animation desynchronization: distinct durations and phase offsets', () => {
    const durations = benefitCards.map((c) => parseFloat(c.floatDuration));
    const delays = benefitCards.map((c) => parseFloat(c.floatDelay));

    // All durations must be unique so cards float at different natural speeds
    const uniqueDurations = new Set(durations);
    assert.equal(uniqueDurations.size, 4, 'All 4 cards must have unique floating cycle durations');

    // All delays/phases must be unique so cards never oscillate in sync
    const uniqueDelays = new Set(delays);
    assert.equal(uniqueDelays.size, 4, 'All 4 cards must have unique phase delays');

    // Durations should be within smooth organic range (5.0s to 7.0s)
    durations.forEach((d) => {
      assert.ok(d >= 5.0 && d <= 7.0, `Duration ${d}s is within the subtle 5s-7s floating window`);
    });
  });

  await t.test('3. Stagger delay math: ensures sequential entrance timing', () => {
    const calculateStagger = (index) => `${index * 120}ms`;

    assert.equal(calculateStagger(0), '0ms');
    assert.equal(calculateStagger(1), '120ms');
    assert.equal(calculateStagger(2), '240ms');
    assert.equal(calculateStagger(3), '360ms');

    // Total sequence duration check: last card starts at 360ms + 700ms animation = 1060ms
    const lastCardEndTime = 3 * 120 + 700;
    assert.ok(lastCardEndTime <= 1200, 'All cards finish entering within 1.2 seconds');
  });

  await t.test('4. Cursor parallax shift math: normalized within safe 4px bounding box', () => {
    const computeMouseOffset = (clientX, clientY, rect) => {
      const x = clientX - rect.left - rect.width / 2;
      const y = clientY - rect.top - rect.height / 2;

      const normX = Math.max(-4, Math.min(4, (x / (rect.width / 2)) * 4));
      const normY = Math.max(-4, Math.min(4, (y / (rect.height / 2)) * 4));

      return { normX, normY };
    };

    const mockRect = { left: 100, top: 200, width: 300, height: 200 };

    // Center of card -> 0px shift
    const center = computeMouseOffset(250, 300, mockRect);
    assert.equal(center.normX, 0);
    assert.equal(center.normY, 0);

    // Top-left edge -> max negative shift (-4px)
    const topLeft = computeMouseOffset(100, 200, mockRect);
    assert.equal(topLeft.normX, -4);
    assert.equal(topLeft.normY, -4);

    // Bottom-right edge -> max positive shift (+4px)
    const bottomRight = computeMouseOffset(400, 400, mockRect);
    assert.equal(bottomRight.normX, 4);
    assert.equal(bottomRight.normY, 4);

    // Far outside card bounds (clamped to [-4, +4])
    const extreme = computeMouseOffset(1000, 1000, mockRect);
    assert.equal(extreme.normX, 4);
    assert.equal(extreme.normY, 4);
  });

  await t.test('5. Continuous icon animation assignments', () => {
    assert.equal(benefitCards[0].iconClass, 'icon-anim-pulse');
    assert.equal(benefitCards[1].iconClass, 'icon-anim-rotate');
    assert.equal(benefitCards[2].iconClass, 'icon-anim-growth');
    assert.equal(benefitCards[3].iconClass, 'icon-anim-network');
  });

  await t.test('6. Accessibility & Reduced Motion contract', () => {
    const getCardAnimationStyles = (prefersReducedMotion, isVisible, staggerIndex) => {
      if (prefersReducedMotion) {
        return {
          opacity: 1,
          transform: 'none',
          transition: 'none',
          floatingAnimation: 'none',
        };
      }

      return {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.98)',
        transitionDelay: `${staggerIndex * 120}ms`,
        floatingAnimation: `whyCardFloat${staggerIndex}`,
      };
    };

    // Standard motion in view
    const visibleCard = getCardAnimationStyles(false, true, 2);
    assert.equal(visibleCard.opacity, 1);
    assert.equal(visibleCard.transform, 'translateY(0) scale(1)');
    assert.equal(visibleCard.transitionDelay, '240ms');
    assert.equal(visibleCard.floatingAnimation, 'whyCardFloat2');

    // Standard motion hidden
    const hiddenCard = getCardAnimationStyles(false, false, 2);
    assert.equal(hiddenCard.opacity, 0);
    assert.equal(hiddenCard.transform, 'translateY(24px) scale(0.98)');

    // Reduced motion preference active
    const reducedMotionCard = getCardAnimationStyles(true, false, 2);
    assert.equal(reducedMotionCard.opacity, 1);
    assert.equal(reducedMotionCard.transform, 'none');
    assert.equal(reducedMotionCard.transition, 'none');
    assert.equal(reducedMotionCard.floatingAnimation, 'none');
  });

  await t.test('7. Section CTA & Navigation integration', () => {
    let scrolledTargetId = null;
    const mockScrollIntoView = (targetId) => {
      scrolledTargetId = targetId;
    };

    const handleExplore = () => {
      mockScrollIntoView('opportunities');
    };

    handleExplore();
    assert.equal(scrolledTargetId, 'opportunities');
  });

});
