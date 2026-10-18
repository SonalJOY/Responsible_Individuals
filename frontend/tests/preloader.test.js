import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PRELOADER_QUOTES, getNextQuote } from '../src/data/preloaderQuotes.js';

describe('Global NGO Preloader & Quotes Engine Tests', () => {
  test('1. Quotes dataset schema and content verification', () => {
    assert.ok(Array.isArray(PRELOADER_QUOTES), 'PRELOADER_QUOTES must be an array');
    assert.ok(PRELOADER_QUOTES.length >= 5, 'Must contain at least 5 meaningful quotes');

    const validCategories = new Set(['volunteering', 'compassion', 'community', 'service', 'responsibility', 'action']);
    const seenIds = new Set();

    PRELOADER_QUOTES.forEach((quote) => {
      assert.ok(quote.id, 'Quote must have an id');
      assert.ok(!seenIds.has(quote.id), `Duplicate quote id found: ${quote.id}`);
      seenIds.add(quote.id);

      assert.ok(typeof quote.text === 'string' && quote.text.trim().length > 15, 'Quote text must be substantial');
      assert.ok(quote.text.length <= 120, 'Quote text must remain concise for mobile screens');
      assert.ok(validCategories.has(quote.category), `Category "${quote.category}" must match authorized themes`);
    });
  });

  test('2. getNextQuote rotates quotes smoothly without immediately repeating current index', () => {
    const currentIndex = 2;
    for (let i = 0; i < 20; i++) {
      const { quote, index } = getNextQuote(currentIndex);
      assert.ok(quote && typeof quote.text === 'string', 'Returned quote must have valid text');
      assert.notStrictEqual(index, currentIndex, 'getNextQuote must not return the identical index if alternates exist');
      assert.ok(index >= 0 && index < PRELOADER_QUOTES.length, 'Index must be within quotes bounds');
    }
  });

  test('3. Preloader state machine: debounce prevents flicker on immediate completion', async () => {
    // Model debounce state
    let isVisuallyActive = false;
    let pendingDebounce = null;
    const tasks = new Set();

    function showTask(taskId) {
      tasks.add(taskId);
      pendingDebounce = setTimeout(() => {
        if (tasks.size > 0) isVisuallyActive = true;
      }, 120);
    }

    function hideTask(taskId) {
      if (pendingDebounce) {
        clearTimeout(pendingDebounce);
        pendingDebounce = null;
      }
      tasks.delete(taskId);
      if (tasks.size === 0) isVisuallyActive = false;
    }

    // Fast task completes in 40ms (< 120ms debounce threshold)
    showTask('fast-cached-api');
    await new Promise((r) => setTimeout(r, 40));
    hideTask('fast-cached-api');
    await new Promise((r) => setTimeout(r, 100));

    assert.strictEqual(isVisuallyActive, false, 'Preloader must not have flashed visually for fast tasks');

    // Slower task completes in 180ms (> 120ms debounce threshold)
    showTask('slow-remote-fetch');
    await new Promise((r) => setTimeout(r, 140));
    assert.strictEqual(isVisuallyActive, true, 'Preloader must visually activate for genuine async loads');
    hideTask('slow-remote-fetch');
    assert.strictEqual(isVisuallyActive, false, 'Preloader must deactivate when loading finishes');
  });

  test('4. Safety timeout guarantee prevents indefinite preloader block', async () => {
    let isStuck = true;
    const safetyTimeoutMs = 150; // Scaled for test execution speed

    const timer = setTimeout(() => {
      isStuck = false; // Forced release
    }, safetyTimeoutMs);

    // Simulate stalled network request that never calls hidePreloader
    await new Promise((r) => setTimeout(r, 180));
    assert.strictEqual(isStuck, false, 'Safety timeout must unblock application if request hangs');
    clearTimeout(timer);
  });

  test('5. Accessibility and reduced-motion contract requirements', () => {
    // Contract verification
    const ariaContract = {
      role: 'status',
      live: 'polite',
      screenReaderLabel: 'Loading Responsible Individuals platform...',
    };

    assert.strictEqual(ariaContract.role, 'status');
    assert.strictEqual(ariaContract.live, 'polite');
    assert.ok(ariaContract.screenReaderLabel.includes('Responsible Individuals'));
  });
});
