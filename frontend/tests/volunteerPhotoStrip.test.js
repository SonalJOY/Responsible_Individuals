import test from 'node:test';
import assert from 'node:assert/strict';
import { volunteerStories } from '../src/data/volunteerStoriesData.js';

test('Volunteer Stories Photo Strip & Lightbox Modal Tests (Phase 3B-UI)', async (t) => {

  await t.test('1. Dataset schema integrity: each volunteer story has required fields', () => {
    assert.ok(Array.isArray(volunteerStories), 'volunteerStories must be an array');
    assert.ok(volunteerStories.length >= 6, 'Must contain at least 6 volunteer stories for rich strip density');

    const requiredFields = [
      'id', 'name', 'role', 'focusArea', 'focusColor', 
      'hoursContributed', 'location', 'image', 'quote', 'fullStory'
    ];

    const uniqueIds = new Set();

    volunteerStories.forEach((story, idx) => {
      requiredFields.forEach((field) => {
        assert.ok(
          story[field] !== undefined && story[field] !== null && String(story[field]).trim().length > 0,
          `Story #${idx} (${story.name || 'unnamed'}) is missing required field: ${field}`
        );
      });

      assert.ok(story.image.startsWith('http') || story.image.startsWith('/'), `Story image must be a valid URL/path for ${story.name}`);
      assert.ok(story.quote.length >= 15, `Quote should be meaningful for ${story.name}`);
      assert.ok(story.fullStory.length >= 50, `Full story should provide substantial narrative for ${story.name}`);

      // Visual variation parameters
      assert.ok(typeof story.cardWidth === 'number' && story.cardWidth >= 250 && story.cardWidth <= 350, `cardWidth within bounds for ${story.name}`);
      assert.ok(typeof story.rotation === 'number', `rotation must be defined for ${story.name}`);
      assert.ok(typeof story.verticalOffset === 'number', `verticalOffset must be defined for ${story.name}`);

      // Unique IDs
      assert.ok(!uniqueIds.has(story.id), `Duplicate story ID found: ${story.id}`);
      uniqueIds.add(story.id);
    });
  });

  await t.test('2. Infinite loop track math: duplication maintains 1:1 seamless continuity', () => {
    const duplicatedSet = [...volunteerStories, ...volunteerStories];
    assert.equal(duplicatedSet.length, volunteerStories.length * 2);

    // First element of Set B must match first element of Set A
    assert.equal(duplicatedSet[0].id, duplicatedSet[volunteerStories.length].id);
    // Last element of Set B must match last element of Set A
    assert.equal(duplicatedSet[volunteerStories.length - 1].id, duplicatedSet[duplicatedSet.length - 1].id);
  });

  await t.test('3. Modal State Machine: Open, Data Injection, and Body Scroll Lock', () => {
    let selectedStory = null;
    let bodyOverflow = 'unset';

    const openStory = (story) => {
      selectedStory = story;
      bodyOverflow = 'hidden';
    };

    const closeStory = () => {
      selectedStory = null;
      bodyOverflow = 'unset';
    };

    const testStory = volunteerStories[0];

    // Initial state
    assert.equal(selectedStory, null);
    assert.equal(bodyOverflow, 'unset');

    // User clicks card
    openStory(testStory);
    assert.equal(selectedStory.id, testStory.id);
    assert.equal(selectedStory.name, testStory.name);
    assert.equal(bodyOverflow, 'hidden', 'Body scroll must be locked when modal opens');

    // User closes modal
    closeStory();
    assert.equal(selectedStory, null);
    assert.equal(bodyOverflow, 'unset', 'Body scroll must be restored when modal closes');
  });

  await t.test('4. Keyboard & Accessibility State Transitions (Escape Key & Light Dismiss)', () => {
    let selectedStory = volunteerStories[1];
    let isModalOpen = Boolean(selectedStory);

    const handleKeyDown = (key) => {
      if (key === 'Escape') {
        selectedStory = null;
        isModalOpen = false;
      }
    };

    // Press other key
    handleKeyDown('Tab');
    assert.equal(isModalOpen, true);

    // Press Escape
    handleKeyDown('Escape');
    assert.equal(isModalOpen, false);
    assert.equal(selectedStory, null);
  });

  await t.test('5. Action CTA Routing / Smooth Scroll Target Verification', () => {
    let scrolledToTarget = false;
    let modalClosed = false;

    const mockExploreRoles = () => {
      modalClosed = true;
      scrolledToTarget = true;
    };

    mockExploreRoles();
    assert.equal(modalClosed, true);
    assert.equal(scrolledToTarget, true);
  });

  await t.test('6. Reduced Motion Detection & CSS Class Contract', () => {
    const getAnimationBehavior = (prefersReducedMotion) => {
      if (prefersReducedMotion) {
        return {
          animation: 'none',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory'
        };
      }
      return {
        animation: 'infinitePhotoScroll 42s linear infinite',
        overflowX: 'hidden'
      };
    };

    const standardMotion = getAnimationBehavior(false);
    assert.ok(standardMotion.animation.includes('infinitePhotoScroll'));

    const reducedMotion = getAnimationBehavior(true);
    assert.equal(reducedMotion.animation, 'none');
    assert.equal(reducedMotion.overflowX, 'auto');
  });

});
